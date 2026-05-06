#!/usr/bin/env python3
"""
Second pass: for entries where the infobox-param search failed, list ALL images
on the Wikipedia page and find brasão-like names heuristically. Also retry
the two specific failures (Lever external URL, Castêlo da Maia spaces).
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
PASS1_RESULTS = "/tmp/brasoes-results.json"

UA = "BicisSapiensBrasoesBot/1.0 (https://bicis-sapiens-web.vercel.app; contact: paulo) requests/2"
HEADERS = {"User-Agent": UA}
WIKI_API = "https://pt.wikipedia.org/w/api.php"

# Heuristics: filenames that strongly suggest a coat of arms.
BRASAO_RE = re.compile(
    r"(brasa[oõ]|brasão|coat[\s_]?of[\s_]?arms|^PRT-|^MTS-|^VNG-|^MAI-|^GDM-|^ESP-|^VLG-|^GAI-|^PRT_|^MTS_|^VNG_|^MAI_|^GDM_|^ESP_|^VLG_|escudo|heraldica)",
    re.IGNORECASE,
)
# Things to never pick (flags, generic photos)
NEGATIVE_RE = re.compile(
    r"(bandeira|flag\s|locator|location|map|mapa|location|wikipedia|aerial|view|fotografia|igreja|church|panor[âa]mica)",
    re.IGNORECASE,
)


def get_json(url):
    r = requests.get(url, headers=HEADERS, timeout=20)
    r.raise_for_status()
    return r.json()


def list_images(title):
    """Use action=parse&prop=images to get all images on the rendered page."""
    url = f"{WIKI_API}?action=parse&format=json&page={quote(title)}&prop=images&redirects=1"
    data = get_json(url)
    return data.get("parse", {}).get("images", []) or []


def pick_brasao(images):
    """Pick the most likely brasão filename from a list."""
    candidates = []
    for fn in images:
        if NEGATIVE_RE.search(fn):
            continue
        if BRASAO_RE.search(fn):
            candidates.append(fn)
    if not candidates:
        return None
    # Prefer SVG, then PNG, then JPG
    def rank(fn):
        ext = fn.lower().rsplit(".", 1)[-1] if "." in fn else ""
        order = {"svg": 0, "png": 1, "jpg": 2, "jpeg": 2, "gif": 3}
        return order.get(ext, 9)
    candidates.sort(key=rank)
    return candidates[0]


def download_image(filename, dest_path):
    base = f"https://commons.wikimedia.org/wiki/Special:FilePath/{quote(filename)}"
    for url in [f"{base}?width=480", base]:
        try:
            r = requests.get(url, headers=HEADERS, timeout=30, allow_redirects=True)
        except Exception:
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


def download_external(url, dest_path):
    try:
        r = requests.get(url, headers=HEADERS, timeout=30, allow_redirects=True)
    except Exception:
        return False, 0
    if r.status_code == 200 and len(r.content) > 1500:
        with open(dest_path, "wb") as f:
            f.write(r.content)
        return True, len(r.content)
    return False, 0


def main():
    with open(JSON_PATH) as f:
        bmap = json.load(f)
    pass1 = json.load(open(PASS1_RESULTS))
    by_dicofre = {x["dicofre"]: x for x in pass1}

    # Targets: entries that still have brasao=null AND we have a title from pass1
    targets = []
    for dicofre, entry in bmap.items():
        if entry.get("brasao") is not None:
            continue
        p1 = by_dicofre.get(dicofre, {})
        targets.append((dicofre, entry, p1))

    print(f"[pass2] retrying {len(targets)} entries", file=sys.stderr)

    out = []
    for i, (dicofre, entry, p1) in enumerate(targets, 1):
        name = entry["name"]
        title = p1.get("title")
        expected = entry["expected"]

        print(f"[{i}/{len(targets)}] {dicofre} {name} (title={title})", file=sys.stderr)

        # Special case: Lever — pass1 found external URL
        if dicofre == "131735" and p1.get("filename", "").startswith("http"):
            ext_url = p1["filename"]
            ext = ext_url.rsplit(".", 1)[-1].lower()
            if ext == "jpeg":
                ext = "jpg"
            rel = expected.rsplit(".", 1)[0] + "." + ext
            dest = f"{PUBLIC_DIR}{rel}"
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            ok, size = download_external(ext_url, dest)
            time.sleep(1.0)
            if ok:
                out.append({"dicofre": dicofre, "name": name, "status": "downloaded",
                            "filename": ext_url, "brasao_path": rel, "size": size,
                            "source": "junta_freguesia"})
                print(f"   OK (ext) {ext_url} ({size//1024}KB) → {rel}", file=sys.stderr)
            else:
                out.append({"dicofre": dicofre, "name": name, "status": "ext_failed", "filename": ext_url})
                print(f"   FAIL ext", file=sys.stderr)
            continue

        # Special case: Castêlo da Maia — has spaces in filename (jpg)
        if dicofre == "130618" and p1.get("filename"):
            fn = p1["filename"]
            ext = fn.rsplit(".", 1)[-1].lower()
            if ext == "jpeg":
                ext = "jpg"
            rel = expected.rsplit(".", 1)[0] + "." + ext
            dest = f"{PUBLIC_DIR}{rel}"
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            ok, size = download_image(fn, dest)
            time.sleep(1.0)
            if ok:
                out.append({"dicofre": dicofre, "name": name, "status": "downloaded",
                            "filename": fn, "brasao_path": rel, "size": size, "via": "retry"})
                print(f"   OK (retry) {fn} ({size//1024}KB) → {rel}", file=sys.stderr)
                continue

        # Default: list all images on the page, find a brasão
        if not title:
            out.append({"dicofre": dicofre, "name": name, "status": "no_title"})
            continue

        try:
            images = list_images(title)
        except Exception as e:
            out.append({"dicofre": dicofre, "name": name, "status": "list_error", "error": str(e), "title": title})
            time.sleep(1.5)
            continue
        time.sleep(0.7)

        fn = pick_brasao(images)
        if not fn:
            out.append({"dicofre": dicofre, "name": name, "status": "no_brasao_match",
                        "title": title, "images_found": images[:8]})
            continue

        ext = fn.rsplit(".", 1)[-1].lower()
        if ext == "jpeg":
            ext = "jpg"
        rel = expected.rsplit(".", 1)[0] + "." + ext
        dest = f"{PUBLIC_DIR}{rel}"
        os.makedirs(os.path.dirname(dest), exist_ok=True)

        ok, size = download_image(fn, dest)
        time.sleep(1.2)
        if ok:
            out.append({"dicofre": dicofre, "name": name, "status": "downloaded",
                        "title": title, "filename": fn, "brasao_path": rel, "size": size,
                        "via": "all_images_filter"})
            print(f"   OK  {fn} ({size//1024}KB) → {rel}", file=sys.stderr)
        else:
            out.append({"dicofre": dicofre, "name": name, "status": "download_failed",
                        "filename": fn, "title": title})
            print(f"   FAIL  {fn}", file=sys.stderr)

    with open("/tmp/brasoes-results-pass2.json", "w") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    summary = {}
    for r in out:
        summary[r["status"]] = summary.get(r["status"], 0) + 1
    print("\n[pass2 summary]", json.dumps(summary, indent=2), file=sys.stderr)


if __name__ == "__main__":
    main()
