#!/usr/bin/env python3
"""
Pass 5: for UF entries, query the constituent (extinct) freguesias on
pt.wikipedia.org and pull `imagem_escudo` from their `Antiga freguesia` infobox.
Pre-2013 freguesias keep their historical brasão there.
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

UA = "BicisSapiensBrasoesBot/1.0 (https://bicis-sapiens-web.vercel.app) requests/2"
HEADERS = {"User-Agent": UA}
WIKI_API = "https://pt.wikipedia.org/w/api.php"

# Map UF (and post-2013 entries) → list of constituent / candidate Wikipedia titles
# in priority order. Picks the first one with a non-empty brasão / escudo.
CONSTITUENTS = {
    # Porto UFs
    "131216": ["Aldoar", "Foz do Douro", "Nevogilde (Porto)", "Nevogilde"],
    "131217": ["Cedofeita", "Santo Ildefonso (Porto)", "Sé (Porto)", "Miragaia",
               "São Nicolau (Porto)", "Vitória (Porto)"],
    "131218": ["Massarelos", "Lordelo do Ouro"],
    # Gondomar UFs
    "130413": ["Fânzeres", "São Pedro da Cova"],
    "130414": ["Foz do Sousa", "Covelo (Gondomar)"],
    "130415": ["Gondomar (São Cosme)", "Valbom (Gondomar)", "Jovim"],
    "130416": ["Melres", "Medas (Gondomar)", "Medas"],
    # Maia (Cidade da Maia is post-2013 UF of Maia + Vermoim + Gueifães)
    "130619": ["Maia (freguesia)", "Vermoim (Maia)", "Vermoim", "Gueifães"],
}

PARAMS_RE = re.compile(
    r"\|\s*(imagem_brasao|imagem_escudo|brasao|brasão|image_shield|escudo)"
    r"\s*=\s*([^\n|}]+)",
    re.IGNORECASE,
)


def get_json(url, timeout=20):
    r = requests.get(url, headers=HEADERS, timeout=timeout)
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


def get_wikitext(title):
    url = (f"{WIKI_API}?action=query&format=json&prop=revisions&rvprop=content"
           f"&rvslots=main&titles={quote(title)}&redirects=1")
    data = get_json(url)
    pages = data.get("query", {}).get("pages", {})
    for pid, page in pages.items():
        revs = page.get("revisions", [])
        if revs:
            return revs[0]["slots"]["main"].get("*", "")
    return ""


def extract_brasao(wikitext):
    if not wikitext:
        return None
    text = wikitext[:12000]
    found = {}
    for m in PARAMS_RE.finditer(text):
        param = m.group(1).lower()
        val = m.group(2).strip()
        # Strip wiki-link braces and spaces
        val = val.lstrip("[").rstrip("]").split("|")[0].strip()
        if val and "." in val and val.split(".")[-1].lower() in ("png", "svg", "jpg", "jpeg", "gif"):
            # Skip non-brasão filenames (locator maps, photos, etc.)
            low = val.lower()
            if any(neg in low for neg in ("locator", "localfreg", "loc-", "mapa-", "_loc", "panor",
                                           "casa", "igreja", "church", "praia", "vista")):
                continue
            found[param] = val
    # Prefer escudo/brasao explicit keys
    for key in ("imagem_brasao", "imagem_escudo", "brasao", "brasão", "image_shield", "escudo"):
        if key in found:
            return found[key]
    return None


def download_thumb(filename, dest_path, source="commons"):
    domain = "commons.wikimedia.org" if source == "commons" else "pt.wikipedia.org"
    base = f"https://{domain}/wiki/Special:FilePath/{quote(filename)}"
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


def main():
    with open(JSON_PATH) as f:
        bmap = json.load(f)
    targets = [(k, v) for k, v in bmap.items() if v.get("brasao") is None and k in CONSTITUENTS]
    print(f"[pass5] {len(targets)} UF/UF-like targets", file=sys.stderr)

    out = []
    for i, (dicofre, entry) in enumerate(targets, 1):
        name = entry["name"]
        municipio = entry["municipio"]
        expected = entry["expected"]
        print(f"[{i}/{len(targets)}] {dicofre} {name}", file=sys.stderr)

        chosen_fn = None
        chosen_via = None
        for cand in CONSTITUENTS[dicofre]:
            try:
                title = page_exists(cand)
            except Exception:
                title = None
            time.sleep(0.5)
            if not title:
                print(f"    {cand}: page missing", file=sys.stderr)
                continue
            try:
                wt = get_wikitext(title)
            except Exception:
                wt = ""
            time.sleep(0.6)
            fn = extract_brasao(wt)
            if fn:
                chosen_fn = fn
                chosen_via = title
                print(f"    ✓ {title} → {fn}", file=sys.stderr)
                break
            else:
                print(f"    {title}: no brasão", file=sys.stderr)

        if not chosen_fn:
            out.append({"dicofre": dicofre, "name": name, "status": "no_constituent_brasao"})
            continue

        ext = chosen_fn.rsplit(".", 1)[-1].lower()
        if ext == "jpeg":
            ext = "jpg"
        rel = expected.rsplit(".", 1)[0] + "." + ext
        dest = f"{PUBLIC_DIR}{rel}"
        os.makedirs(os.path.dirname(dest), exist_ok=True)

        ok, size = download_thumb(chosen_fn, dest)
        time.sleep(1.0)
        if ok:
            out.append({"dicofre": dicofre, "name": name, "status": "downloaded",
                        "constituent": chosen_via, "filename": chosen_fn,
                        "brasao_path": rel, "size": size})
            print(f"    OK {chosen_fn} ({size//1024}KB) → {rel}", file=sys.stderr)
        else:
            out.append({"dicofre": dicofre, "name": name, "status": "download_failed",
                        "constituent": chosen_via, "filename": chosen_fn})
            print(f"    FAIL {chosen_fn}", file=sys.stderr)

    with open("/tmp/brasoes-results-pass5.json", "w") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    summary = {}
    for r in out:
        summary[r["status"]] = summary.get(r["status"], 0) + 1
    print(f"\n[pass5 summary]", json.dumps(summary, indent=2), file=sys.stderr)


if __name__ == "__main__":
    main()
