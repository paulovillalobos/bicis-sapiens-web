#!/usr/bin/env python3
"""
Scrape brasões from pt.wikipedia.org for freguesias missing in freguesias-brasoes.json.
For each missing entry, finds the page, extracts the infobox brasão filename,
downloads via Wikimedia thumbnail, saves under public/brasoes/<municipio_slug>/<slug>.<ext>.
Reports JSON with results to /tmp/brasoes-results.json.
"""
import json
import os
import re
import sys
import time
from urllib.parse import quote

import requests

ROOT = "/Users/baphomet/Downloads/bicis-sapiens-web"
JSON_PATH = f"{ROOT}/public/data/freguesias-brasoes.json"
PUBLIC_DIR = f"{ROOT}/public"

UA = "BicisSapiensBrasoesBot/1.0 (https://bicis-sapiens-web.vercel.app; contact: paulo) requests/2"
HEADERS = {"User-Agent": UA}
WIKI_API = "https://pt.wikipedia.org/w/api.php"

BRASAO_PARAMS = [
    "imagem_brasao",
    "brasão",
    "brasao",
    "image_shield",
    "imagem_escudo",
]

def get_json(url):
    r = requests.get(url, headers=HEADERS, timeout=20)
    r.raise_for_status()
    return r.json()

def page_exists(title):
    url = f"{WIKI_API}?action=query&format=json&prop=info&titles={quote(title)}&redirects=1"
    data = get_json(url)
    pages = data.get("query", {}).get("pages", {})
    for pid, page in pages.items():
        if pid != "-1" and "missing" not in page:
            return page.get("title")
    return None

def search_page(query):
    url = f"{WIKI_API}?action=query&format=json&list=search&srsearch={quote(query)}&srlimit=5"
    data = get_json(url)
    hits = data.get("query", {}).get("search", [])
    return [h["title"] for h in hits]

def find_page(name, municipio):
    raw = name.replace("União das freguesias de ", "").strip()
    candidates = [
        f"{raw} ({municipio})",
        f"{raw} (freguesia)",
        raw,
        # Full original name
        name,
    ]
    if "(Rio Tinto)" in raw:
        candidates.append(raw.replace(" (Rio Tinto)", ""))
    seen = set()
    for c in candidates:
        if c in seen:
            continue
        seen.add(c)
        try:
            t = page_exists(c)
        except Exception:
            t = None
        time.sleep(0.4)
        if t:
            return t, "exact"
    # Fallback: search
    try:
        hits = search_page(f"{raw} {municipio} freguesia")
    except Exception:
        hits = []
    time.sleep(0.4)
    # Prefer hits that contain municipio or "freguesia"
    for h in hits:
        if municipio.lower() in h.lower() or "freguesia" in h.lower():
            return h, "search"
    if hits:
        return hits[0], "search"
    return None, None

def get_wikitext(title):
    url = f"{WIKI_API}?action=query&format=json&prop=revisions&rvprop=content&rvslots=main&titles={quote(title)}&redirects=1"
    data = get_json(url)
    pages = data.get("query", {}).get("pages", {})
    for pid, page in pages.items():
        revs = page.get("revisions", [])
        if revs:
            slot = revs[0].get("slots", {}).get("main", {})
            return slot.get("*") or slot.get("content") or ""
    return ""

def extract_brasao(wikitext):
    if not wikitext:
        return None
    text = wikitext[:12000]
    for param in BRASAO_PARAMS:
        # Match `param = filename` capturing until newline or pipe before next param
        pattern = rf"\|\s*{re.escape(param)}\s*=\s*([^\n|]+?)(?:\s*\||\n)"
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            fn = m.group(1).strip()
            fn = fn.lstrip("[").rstrip("]").strip()
            fn = fn.split("|")[0].strip()
            if fn and len(fn) > 3:
                if "." in fn and fn.split(".")[-1].lower() in ("png", "svg", "jpg", "jpeg", "gif"):
                    return fn
    return None

def download_image(filename, dest_path):
    base = f"https://commons.wikimedia.org/wiki/Special:FilePath/{quote(filename)}"
    for url in [f"{base}?width=480", base]:
        try:
            r = requests.get(url, headers=HEADERS, timeout=30, allow_redirects=True)
        except Exception as e:
            time.sleep(2.0)
            continue
        if r.status_code == 200 and len(r.content) > 1500:
            ctype = r.headers.get("Content-Type", "")
            if "image" in ctype or "svg" in ctype:
                with open(dest_path, "wb") as f:
                    f.write(r.content)
                return True, len(r.content)
        if r.status_code == 429:
            time.sleep(5.0)
    return False, 0

def main():
    with open(JSON_PATH) as f:
        bmap = json.load(f)

    missing = [(k, v) for k, v in bmap.items() if v.get("brasao") is None]
    print(f"[scrape] missing: {len(missing)}", file=sys.stderr)

    results = []
    for i, (dicofre, entry) in enumerate(missing, 1):
        name = entry["name"]
        municipio = entry["municipio"]
        expected = entry["expected"]  # "/brasoes/<mun>/<slug>.svg"

        print(f"[{i}/{len(missing)}] {dicofre} {name}", file=sys.stderr)
        title, how = find_page(name, municipio)
        if not title:
            results.append({"dicofre": dicofre, "name": name, "status": "no_page"})
            continue

        try:
            wikitext = get_wikitext(title)
        except Exception as e:
            results.append({"dicofre": dicofre, "name": name, "status": "fetch_error", "error": str(e), "title": title})
            time.sleep(1.5)
            continue
        time.sleep(0.8)

        fn = extract_brasao(wikitext)
        if not fn:
            results.append({"dicofre": dicofre, "name": name, "status": "no_brasao_in_infobox", "title": title, "via": how})
            continue

        ext = fn.split(".")[-1].lower()
        if ext == "jpeg":
            ext = "jpg"
        rel = expected.rsplit(".", 1)[0] + "." + ext  # /brasoes/<mun>/<slug>.<ext>
        dest = f"{PUBLIC_DIR}{rel}"
        os.makedirs(os.path.dirname(dest), exist_ok=True)

        ok, size = download_image(fn, dest)
        time.sleep(1.2)
        if ok:
            results.append({
                "dicofre": dicofre,
                "name": name,
                "status": "downloaded",
                "title": title,
                "filename": fn,
                "size": size,
                "brasao_path": rel,
                "via": how,
            })
            print(f"   OK  {fn} ({size//1024}KB) → {rel}", file=sys.stderr)
        else:
            results.append({"dicofre": dicofre, "name": name, "status": "download_failed", "filename": fn, "title": title, "via": how})
            print(f"   FAIL  {fn}", file=sys.stderr)

    with open("/tmp/brasoes-results.json", "w") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    summary = {}
    for r in results:
        summary[r["status"]] = summary.get(r["status"], 0) + 1
    print("\n[summary]", json.dumps(summary, indent=2), file=sys.stderr)
    print(f"[scrape] full results in /tmp/brasoes-results.json", file=sys.stderr)

if __name__ == "__main__":
    main()
