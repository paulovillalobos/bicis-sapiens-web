#!/usr/bin/env python3
"""
Pass 4: try official Junta de Freguesia / União de Freguesia sites for the 22
entries still missing. For each, try a list of plausible URL patterns and
parse the homepage HTML for an img tag whose src/alt matches "brasao", "logo",
"escudo", "armas".
"""
import json
import os
import re
import sys
import time
from urllib.parse import quote, urljoin
import unicodedata

import requests

ROOT = "/Users/baphomet/Downloads/bicis-sapiens-web"
JSON_PATH = f"{ROOT}/public/data/freguesias-brasoes.json"
PUBLIC_DIR = f"{ROOT}/public"

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15"
HEADERS = {"User-Agent": UA, "Accept": "text/html,*/*", "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.7"}

# Curated URL hints per dicofre — best-known JF/UF sites
URL_HINTS = {
    # Porto
    "131203": ["https://www.jf-campanha.pt/", "https://jf-campanha.pt/"],
    "131210": ["https://www.jfparanhos.pt/", "https://jf-paranhos.pt/", "https://www.jf-paranhos.pt/"],
    "131216": ["https://www.uf-afn.pt/", "https://uffan.pt/", "https://www.uffan.pt/"],
    "131217": ["https://www.uf-cedofeita.pt/", "https://www.cedofeita.pt/", "https://www.ufcsmsmnv.pt/"],
    "131218": ["https://www.uflordeloemassarelos.pt/", "https://uflm.pt/", "https://www.uflm.pt/"],
    # Matosinhos
    "130822": ["https://www.jf-stacruzbispo.pt/", "https://jf-santacruzdobispo.pt/", "https://uf-pscb.pt/"],
    # Vila Nova de Gaia
    "131702": ["https://www.jf-avintes.pt/", "https://jfavintes.pt/"],
    "131733": ["https://www.uf-pegrijo.pt/", "https://www.jf-grijoeermesinde.pt/", "https://ufgrijoperosinho.pt/", "https://www.ufgrijo-perosinho.pt/", "https://www.ugfp.pt/"],
    "131736": ["https://www.uf-mafamudevilardeandorinho.pt/", "https://ufma.pt/", "https://www.ufma.pt/", "https://www.uf-mva.pt/"],
    "131738": ["https://www.uf-pedrososeixezelo.pt/", "https://ufps.pt/", "https://www.ufps.pt/"],
    "131740": ["https://uf-solc.pt/", "https://www.uf-solc.pt/"],
    "131741": ["https://www.uf-stmsa.pt/", "https://www.santamarinha.pt/", "https://www.jf-stamarinha.pt/", "https://uf-smarinhasapfa.pt/"],
    "131742": ["https://www.uf-stmsa.pt/", "https://www.afurada.pt/"],
    "131743": ["https://www.uf-pedrososeixezelo.pt/", "https://ufps.pt/"],
    # Maia
    "130619": ["https://www.uf-cidadedamaia.pt/", "https://www.cm-maia.pt/pt/freguesias/cidade-da-maia"],
    "130620": ["https://www.uf-nse.pt/", "https://nse.pt/", "https://www.uf-nogueiraesilvaescura.pt/"],
    # Gondomar
    "130413": ["https://www.uf-fanzeresespcova.pt/", "https://uffspc.pt/", "https://www.uffspc.pt/"],
    "130414": ["https://www.uf-fozdosousaecovelo.pt/", "https://uffsc.pt/", "https://www.uffsc.pt/"],
    "130415": ["https://www.uf-gondomarvalbomjovim.pt/", "https://ufgvj.pt/", "https://www.ufgvj.pt/"],
    "130416": ["https://www.uf-melresemedas.pt/", "https://ufmm.pt/", "https://www.ufmm.pt/"],
    # Espinho
    "010707": ["https://www.uf-antaeguetim.pt/", "https://jf-anta.pt/", "https://www.uffanta.pt/"],
    "010705": ["https://www.jf-silvalde.pt/", "https://jfsilvalde.pt/"],
}

IMG_PATTERNS = [
    re.compile(r'<img[^>]*src=["\']([^"\']+)["\'][^>]*alt=["\']([^"\']*)["\']', re.IGNORECASE),
    re.compile(r'<img[^>]*alt=["\']([^"\']*)["\'][^>]*src=["\']([^"\']+)["\']', re.IGNORECASE),
]


def slug_keyword(name):
    s = unicodedata.normalize("NFD", name)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").lower()
    s = re.sub(r"[^a-z0-9]+", "", s)
    return s


def fetch(url, timeout=15, **kw):
    return requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True, **kw)


def find_brasao_img(url, html, name_keyword):
    """Look in HTML for img tags whose src/alt suggest a brasão / logo."""
    candidates = set()
    # Pattern 1: src+alt
    for m in re.finditer(r'<img\b([^>]*)>', html, re.IGNORECASE):
        attrs = m.group(1)
        src_m = re.search(r'src=["\']([^"\']+)["\']', attrs, re.IGNORECASE)
        alt_m = re.search(r'alt=["\']([^"\']*)["\']', attrs, re.IGNORECASE)
        if not src_m:
            continue
        src = src_m.group(1)
        alt = (alt_m.group(1) if alt_m else "").lower()
        src_l = src.lower()
        score = 0
        for kw in ["brasao", "brasão", "escudo", "armas", "coat", "heraldica"]:
            if kw in alt or kw in src_l:
                score += 3
        for kw in ["logo", "logotipo", "freguesia", "junta"]:
            if kw in alt or kw in src_l:
                score += 1
        if name_keyword and (name_keyword in alt or name_keyword in src_l):
            score += 2
        if "favicon" in src_l or "icon" in src_l:
            score -= 5
        if score >= 1:
            full = urljoin(url, src)
            candidates.add((score, full))
    if not candidates:
        return None
    sorted_c = sorted(candidates, key=lambda x: -x[0])
    return sorted_c[0][1]


def download(url, dest_path):
    try:
        r = fetch(url, timeout=30)
    except Exception:
        return False, 0, "fetch_error"
    if r.status_code != 200:
        return False, 0, f"http_{r.status_code}"
    if len(r.content) < 1000:
        return False, len(r.content), "too_small"
    ctype = r.headers.get("Content-Type", "")
    if "image" not in ctype and "svg" not in ctype:
        return False, len(r.content), f"not_image_{ctype}"
    with open(dest_path, "wb") as f:
        f.write(r.content)
    return True, len(r.content), "ok"


def main():
    with open(JSON_PATH) as f:
        bmap = json.load(f)
    targets = [(k, v) for k, v in bmap.items() if v.get("brasao") is None]
    print(f"[pass4] trying JF sites for {len(targets)} entries", file=sys.stderr)

    out = []
    for i, (dicofre, entry) in enumerate(targets, 1):
        name = entry["name"]
        municipio = entry["municipio"]
        expected = entry["expected"]
        urls_to_try = URL_HINTS.get(dicofre, [])
        if not urls_to_try:
            out.append({"dicofre": dicofre, "name": name, "status": "no_urls"})
            continue

        keyword = slug_keyword(name.replace("União das freguesias de ", "").split()[0])

        print(f"[{i}/{len(targets)}] {dicofre} {name}", file=sys.stderr)
        found_img = None
        for u in urls_to_try:
            try:
                r = fetch(u, timeout=10)
            except Exception as e:
                print(f"    {u} ✗ ({type(e).__name__})", file=sys.stderr)
                time.sleep(0.5)
                continue
            if r.status_code != 200:
                print(f"    {u} ✗ http {r.status_code}", file=sys.stderr)
                time.sleep(0.5)
                continue
            html = r.text
            img_url = find_brasao_img(u, html, keyword)
            if img_url:
                print(f"    {u} → candidate: {img_url}", file=sys.stderr)
                found_img = (img_url, u)
                break
            else:
                print(f"    {u} ✓ but no brasão img", file=sys.stderr)
            time.sleep(0.6)

        if not found_img:
            out.append({"dicofre": dicofre, "name": name, "status": "no_img_found"})
            continue

        img_url, src_url = found_img
        ext = img_url.rsplit(".", 1)[-1].lower().split("?")[0]
        if ext not in ("png", "svg", "jpg", "jpeg", "gif", "webp"):
            ext = "png"
        if ext == "jpeg":
            ext = "jpg"
        rel = expected.rsplit(".", 1)[0] + "." + ext
        dest = f"{PUBLIC_DIR}{rel}"
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        ok, size, why = download(img_url, dest)
        time.sleep(0.8)
        if ok:
            out.append({"dicofre": dicofre, "name": name, "status": "downloaded",
                        "url": img_url, "site": src_url, "brasao_path": rel, "size": size})
            print(f"   OK  {size//1024}KB → {rel}", file=sys.stderr)
        else:
            out.append({"dicofre": dicofre, "name": name, "status": "download_failed",
                        "url": img_url, "why": why})
            print(f"   FAIL {why}", file=sys.stderr)

    with open("/tmp/brasoes-results-pass4.json", "w") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    summary = {}
    for r in out:
        summary[r["status"]] = summary.get(r["status"], 0) + 1
    print("\n[pass4 summary]", json.dumps(summary, indent=2), file=sys.stderr)


if __name__ == "__main__":
    main()
