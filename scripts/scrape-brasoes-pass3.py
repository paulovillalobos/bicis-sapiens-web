#!/usr/bin/env python3
"""
Pass 3: aggressive search.
- Save Castêlo da Maia from pt.wiki Special:FilePath
- Save Lever using UF-SOLC logo (already at /tmp/uf-solc-logo.png)
- For remaining missing entries: search Commons directly for files matching
  patterns like 'PRT-<freguesia>', 'MTS-<freguesia>', 'VNG-<freguesia>',
  'Brasão de <name>'.
- Fallback: search pt.wikipedia (local file uploads).
"""
import json
import os
import re
import shutil
import sys
import time
from urllib.parse import quote
import unicodedata

import requests

ROOT = "/Users/baphomet/Downloads/bicis-sapiens-web"
JSON_PATH = f"{ROOT}/public/data/freguesias-brasoes.json"
PUBLIC_DIR = f"{ROOT}/public"

UA = "BicisSapiensBrasoesBot/1.0 (https://bicis-sapiens-web.vercel.app) requests/2"
HEADERS = {"User-Agent": UA}
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
PTWIKI_API = "https://pt.wikipedia.org/w/api.php"

NEGATIVE_RE = re.compile(r"(bandeira|flag|locator|location|map|mapa|wikipedia|aerial|view|panor[âa]m|igreja|church|fotografia)", re.IGNORECASE)


def strip_accents(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def slug_for(name):
    s = strip_accents(name).lower()
    s = re.sub(r"[^a-z0-9]+", "", s)
    return s


def get_json(url, timeout=20):
    r = requests.get(url, headers=HEADERS, timeout=timeout)
    r.raise_for_status()
    return r.json()


def municipio_prefix(municipio):
    return {
        "Porto": "PRT",
        "Matosinhos": "MTS",
        "Vila Nova de Gaia": "VNG",
        "Maia": "MAI",
        "Gondomar": "GDM",
        "Valongo": "VLG",
        "Espinho": "ESP",
    }.get(municipio, "")


def search_commons_files(query, limit=8):
    url = f"{COMMONS_API}?action=query&format=json&list=search&srsearch={quote(query)}&srnamespace=6&srlimit={limit}"
    data = get_json(url)
    return [x["title"].replace("File:", "", 1) for x in data.get("query", {}).get("search", [])]


def search_ptwiki_files(query, limit=8):
    url = f"{PTWIKI_API}?action=query&format=json&list=search&srsearch={quote(query)}&srnamespace=6&srlimit={limit}"
    data = get_json(url)
    return [x["title"].replace("Ficheiro:", "", 1).replace("File:", "", 1) for x in data.get("query", {}).get("search", [])]


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


def find_brasao_in_results(results, name):
    """Filter Commons results to brasão-likely files."""
    name_norm = strip_accents(name).lower()
    parts = re.split(r"\s+", name_norm)
    candidates = []
    for fn in results:
        if NEGATIVE_RE.search(fn):
            continue
        fn_norm = strip_accents(fn).lower()
        # Strong signals: "brasao", or starts with municipio prefix
        is_brasao = ("brasao" in fn_norm or "brasão" in fn.lower()
                     or "coat" in fn_norm or "armas" in fn_norm or "escudo" in fn_norm
                     or re.match(r"^(prt|mts|vng|mai|gdm|vlg|esp)-", fn_norm))
        if not is_brasao:
            continue
        # Bonus: contains the freguesia name (or part)
        score = 0
        for p in parts:
            if len(p) >= 3 and p in fn_norm:
                score += 1
        candidates.append((score, fn))
    if not candidates:
        return None
    candidates.sort(key=lambda x: (-x[0], x[1]))
    # Need at least one matching name part to be reasonably confident
    best_score, best_fn = candidates[0]
    if best_score == 0:
        return None
    return best_fn


def main():
    with open(JSON_PATH) as f:
        bmap = json.load(f)

    out = []

    # ---- Special-case 1: Castêlo da Maia (pt.wiki, has spaces) ----
    e = bmap["130618"]
    rel = e["expected"].rsplit(".", 1)[0] + ".jpg"
    dest = f"{PUBLIC_DIR}{rel}"
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    ok, size = download_thumb("Novo brasão Castelo da Maia.jpg", dest, source="ptwiki")
    if ok:
        out.append({"dicofre": "130618", "name": e["name"], "status": "downloaded",
                    "filename": "Novo brasão Castelo da Maia.jpg", "brasao_path": rel,
                    "size": size, "source": "ptwiki"})
        print(f"[OK] Castêlo da Maia → {rel} ({size//1024}KB)", file=sys.stderr)
    else:
        out.append({"dicofre": "130618", "name": e["name"], "status": "ptwiki_failed"})
    time.sleep(1.0)

    # ---- Special-case 2: Lever (use UF-SOLC logo) ----
    e = bmap["131735"]
    rel = e["expected"].rsplit(".", 1)[0] + ".png"
    dest = f"{PUBLIC_DIR}{rel}"
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if os.path.exists("/tmp/uf-solc-logo.png"):
        shutil.copyfile("/tmp/uf-solc-logo.png", dest)
        out.append({"dicofre": "131735", "name": e["name"], "status": "downloaded",
                    "filename": "uf-solc-logo.png", "brasao_path": rel,
                    "size": os.path.getsize(dest),
                    "source": "uf-solc.pt", "note": "União de Freguesias logo"})
        print(f"[OK] Lever → {rel} ({os.path.getsize(dest)//1024}KB) (UF-SOLC logo)", file=sys.stderr)

    # ---- Generic pass: search Commons + pt.wiki for remaining missing ----
    skip = {"130618", "131735"}
    missing = [(k, v) for k, v in bmap.items() if v.get("brasao") is None and k not in skip]

    print(f"[pass3] searching for {len(missing)} entries", file=sys.stderr)

    for i, (dicofre, entry) in enumerate(missing, 1):
        name = entry["name"]
        municipio = entry["municipio"]
        expected = entry["expected"]
        prefix = municipio_prefix(municipio)

        # Build search queries — try the most specific first
        raw_name = name.replace("União das freguesias de ", "").strip()
        queries = []
        if prefix:
            queries.append(f"{prefix}-{slug_for(raw_name)}")
            queries.append(f"{prefix}-{raw_name}")
        queries.append(f"Brasão {raw_name}")
        queries.append(f"Brasão de {raw_name} {municipio}")
        queries.append(f"Coat of arms {raw_name}")
        queries.append(raw_name)

        print(f"[{i}/{len(missing)}] {dicofre} {name}", file=sys.stderr)
        chosen_fn = None
        chosen_source = None
        for q in queries:
            try:
                results = search_commons_files(q, limit=10)
            except Exception:
                results = []
            time.sleep(0.6)
            fn = find_brasao_in_results(results, raw_name)
            if fn:
                chosen_fn = fn
                chosen_source = "commons"
                break

        # Fallback: try pt.wikipedia file uploads
        if not chosen_fn:
            try:
                results = search_ptwiki_files(f"Brasão {raw_name}", limit=10)
            except Exception:
                results = []
            time.sleep(0.6)
            fn = find_brasao_in_results(results, raw_name)
            if fn:
                chosen_fn = fn
                chosen_source = "ptwiki"

        if not chosen_fn:
            out.append({"dicofre": dicofre, "name": name, "status": "no_match"})
            print(f"   no match", file=sys.stderr)
            continue

        ext = chosen_fn.rsplit(".", 1)[-1].lower()
        if ext == "jpeg":
            ext = "jpg"
        rel = expected.rsplit(".", 1)[0] + "." + ext
        dest = f"{PUBLIC_DIR}{rel}"
        os.makedirs(os.path.dirname(dest), exist_ok=True)

        ok, size = download_thumb(chosen_fn, dest, source=chosen_source)
        time.sleep(1.0)
        if ok:
            out.append({"dicofre": dicofre, "name": name, "status": "downloaded",
                        "filename": chosen_fn, "brasao_path": rel, "size": size,
                        "source": chosen_source})
            print(f"   OK [{chosen_source}] {chosen_fn} ({size//1024}KB) → {rel}", file=sys.stderr)
        else:
            out.append({"dicofre": dicofre, "name": name, "status": "download_failed",
                        "filename": chosen_fn, "source": chosen_source})

    with open("/tmp/brasoes-results-pass3.json", "w") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    summary = {}
    for r in out:
        summary[r["status"]] = summary.get(r["status"], 0) + 1
    print("\n[pass3 summary]", json.dumps(summary, indent=2), file=sys.stderr)


if __name__ == "__main__":
    main()
