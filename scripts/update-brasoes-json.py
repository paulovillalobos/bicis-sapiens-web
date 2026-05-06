#!/usr/bin/env python3
"""
Walk public/brasoes/, then update public/data/freguesias-brasoes.json so that
every entry whose file actually exists on disk has its `brasao` field pointing
to the right path with the right extension. Updates `attribution`
contextually based on source notes from /tmp/brasoes-results-*.json.
"""
import json
import os
import sys

ROOT = "/Users/baphomet/Downloads/bicis-sapiens-web"
JSON_PATH = f"{ROOT}/public/data/freguesias-brasoes.json"
PUBLIC_DIR = f"{ROOT}/public"

# Source attributions for the new entries (collated across all passes)
ATTRIBUTIONS = {
    # Pass-1 — Wikipedia infobox imagem_brasao (heráldica-portugal style files on Commons)
    "130815": "Wikimedia Commons · CC BY-SA",
    "130816": "Wikimedia Commons · CC BY-SA",
    "130817": "Wikimedia Commons · CC BY-SA",
    "130819": "Wikimedia Commons · CC BY-SA",
    "130820": "Wikimedia Commons · CC BY-SA",
    "130821": "Wikimedia Commons · CC BY-SA",
    "130823": "Wikimedia Commons · CC BY-SA",
    "131732": "Wikimedia Commons · CC BY-SA",
    "131737": "Wikimedia Commons · CC BY-SA",
    "131739": "Wikimedia Commons · CC BY-SA",
    "131744": "Wikimedia Commons · CC BY-SA",
    "131745": "Wikimedia Commons · CC BY-SA",
    "131747": "Wikimedia Commons · CC BY-SA",
    "010708": "Wikimedia Commons · CC BY-SA",
    # Pass-3 — extra Commons / pt.wiki finds
    "130618": "pt.wikipedia.org · Novo brasão Castelo da Maia",
    "131734": "Wikimedia Commons · Brasão de Armas da Freguesia de Gulpilhares",
    # Pass-4 — junta de freguesia / união oficial
    "131735": "União das Freguesias de Sandim, Olival, Lever e Crestuma · uf-solc.pt",
    "131740": "União das Freguesias de Sandim, Olival, Lever e Crestuma · uf-solc.pt",
    "130620": "Junta da União das Freguesias de Nogueira e Silva Escura · nse.pt (logotipo)",
    "010707": "Junta de Freguesia de Anta · jf-anta.pt",
    "010705": "Junta de Freguesia de Silvalde · jf-silvalde.pt (logotipo)",
    # Pass-5 — constituent freguesias pre-2013 (Wikimedia Commons via pt.wiki imagem_escudo)
    "131216": "Wikimedia Commons · brasão da freguesia constituente de Aldoar (pré-2013)",
    "131217": "Wikimedia Commons · brasão da freguesia constituente de Cedofeita (pré-2013)",
    "131218": "Wikimedia Commons · brasão da freguesia constituente de Massarelos (pré-2013)",
    "130619": "Wikimedia Commons · brasão da freguesia constituente da Maia (pré-2013)",
    "130413": "Wikimedia Commons · brasão da freguesia constituente de Fânzeres (pré-2013)",
    "130414": "Wikimedia Commons · brasão da freguesia constituente do Covelo (pré-2013)",
    "130415": "Wikimedia Commons · brasão da freguesia constituente de Valbom (pré-2013)",
    "130416": "Wikimedia Commons · brasão da freguesia constituente de Melres (pré-2013)",
    # Pass-6 — JF/UF official sites + heraldicacivica.pt
    "131203": "Junta de Freguesia de Campanhã · campanha.net",
    "131210": "Junta de Freguesia de Paranhos · jfparanhos-porto.pt",
    "130822": "Junta de Freguesia de Santa Cruz do Bispo · jf-santacruzbispo.pt (logotipo)",
    "131702": "Junta de Freguesia de Avintes · jfavintes.pt (heráldica)",
    "131733": "Junta de Freguesia de Grijó · viladegrijo.pt (logotipo)",
    "131736": "Junta de Freguesia de Mafamude · jfmafamude.pt (logotipo)",
    "131738": "heraldicacivica.pt · UF Pedroso e Seixezelo",
    "131741": "heraldicacivica.pt · antiga freguesia de Santa Marinha",
    "131742": "heraldicacivica.pt · antiga freguesia de São Pedro da Afurada",
    "131743": "heraldicacivica.pt · antiga freguesia de Seixezelo",
}


def main():
    with open(JSON_PATH) as f:
        bmap = json.load(f)

    updated = 0
    cleared = 0
    for dicofre, entry in bmap.items():
        expected = entry["expected"]  # /brasoes/<mun>/<slug>.svg
        slug = entry["slug"]
        municipio_dir = expected.split("/")[2]
        # Look for any extension actually on disk
        found_ext = None
        for ext in ("svg", "png", "jpg", "jpeg", "gif", "webp"):
            p = f"{PUBLIC_DIR}/brasoes/{municipio_dir}/{slug}.{ext}"
            if os.path.exists(p):
                found_ext = ext if ext != "jpeg" else "jpg"
                break
        if found_ext:
            new_path = f"/brasoes/{municipio_dir}/{slug}.{found_ext}"
            if entry.get("brasao") != new_path:
                entry["brasao"] = new_path
                updated += 1
            if entry.get("attribution") is None:
                entry["attribution"] = ATTRIBUTIONS.get(dicofre, "Wikimedia Commons · CC BY-SA")
        else:
            if entry.get("brasao") is not None:
                entry["brasao"] = None
                entry["attribution"] = None
                cleared += 1

    with open(JSON_PATH, "w") as f:
        json.dump(bmap, f, ensure_ascii=False, indent=2)

    have = sum(1 for v in bmap.values() if v.get("brasao") is not None)
    miss = sum(1 for v in bmap.values() if v.get("brasao") is None)
    print(f"updated={updated}, cleared={cleared}", file=sys.stderr)
    print(f"with_brasao={have}/68 ({have*100//68}%), missing={miss}", file=sys.stderr)

    # Summary by municipio
    by_mun = {}
    for v in bmap.values():
        m = v["municipio"]
        if m not in by_mun:
            by_mun[m] = {"have": 0, "total": 0}
        by_mun[m]["total"] += 1
        if v.get("brasao") is not None:
            by_mun[m]["have"] += 1
    print("\n=== by municipio ===", file=sys.stderr)
    for m, c in sorted(by_mun.items()):
        print(f"  {m:<20} {c['have']:>2}/{c['total']:>2}", file=sys.stderr)


if __name__ == "__main__":
    main()
