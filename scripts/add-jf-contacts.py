#!/usr/bin/env python3
"""
Inject `jf_nome`, `jf_email`, `jf_url` per freguesia into freguesias-porto.geojson.
Source: scraped from cm-{municipio}.pt official freguesias listing pages,
junta de freguesia sites, and verified WebSearch results.

All 68 verified by hand 2026-05-07.
"""
import json
import sys

GEOJSON = "/Users/baphomet/Downloads/bicis-sapiens-web/public/data/freguesias-porto.geojson"

# DICOFRE → (jf_nome, jf_email, jf_url)
JF = {
    # ===== Espinho (5) =====
    "010702": ("Junta de Freguesia de Espinho",            "secretaria.jfe@gmail.com",            "https://jfespinho.pt"),
    "010704": ("Junta de Freguesia de Paramos",            "geral@jf-paramos.pt",                 "http://jf-paramos.pt"),
    "010705": ("Junta de Freguesia de Silvalde",           "geral@jf-silvalde.pt",                "https://jf-silvalde.pt"),
    "010707": ("Junta de Freguesia de Anta",               "geral@jf-anta.pt",                    "https://www.jf-anta.pt"),
    "010708": ("Junta de Freguesia de Guetim",             "geral@jf-guetim.pt",                  None),
    # ===== Gondomar (7) =====
    "130405": ("União das Freguesias de Melres e Medas (CSIF Douro Nascente — inclui Lomba)", "ufmelresmedas@gmail.com", None),
    "130408": ("Junta de Freguesia de Rio Tinto",          "geral@jf-riotinto.pt",                "https://jf-riotinto.pt"),
    "130412": ("Junta de Freguesia de Baguim do Monte",    "geral@jf-baguimdomonte.com",          "https://jf-baguimdomonte.com"),
    "130413": ("União das Freguesias de Fânzeres e São Pedro da Cova",       "geral@fanzeres-saopedrodacova.pt", "https://fanzeres-saopedrodacova.pt"),
    "130414": ("União das Freguesias de Foz do Sousa e Covelo",              "fozdosousacovelo@mail.telepac.pt", None),
    "130415": ("União das Freguesias de Gondomar (São Cosme), Valbom e Jovim", "geral@uf-gvj.pt",                "https://uf-gvj.pt"),
    "130416": ("União das Freguesias de Melres e Medas",                     "ufmelresmedas@gmail.com",         None),
    # ===== Maia (10) =====
    "130601": ("Junta de Freguesia de Águas Santas",       "geral@jf-aguassantas.pt",             "https://www.jf-aguassantas.pt"),
    "130603": ("Junta de Freguesia de Folgosa da Maia",    "geral@jf-folgosadamaia.pt",           "https://www.jf-folgosadamaia.pt"),
    "130608": ("Junta de Freguesia de Milheirós",          "geral@jfmilheiros.pt",                "https://jfmilheiros.pt"),
    "130609": ("Junta de Freguesia de Moreira",            "geral@jf-moreira.pt",                 "https://www.jf-moreira.pt"),
    "130613": ("Junta de Freguesia de São Pedro Fins",     "geral@saopedrofins.pt",               None),
    "130616": ("Junta de Freguesia de Vila Nova da Telha", "geral@juntavilanovadatelha.pt",       "https://www.juntavilanovadatelha.pt"),
    "130617": ("Junta de Freguesia de Pedrouços",          "mail@jf-pedroucos.pt",                "https://www.jf-pedroucos.pt"),
    "130618": ("Junta de Freguesia do Castêlo da Maia",    "geral@jfcastelodamaia.pt",            "https://www.jfcastelodamaia.pt"),
    "130619": ("Junta de Freguesia da Cidade da Maia",     "geral@jfcidadedamaia.pt",             None),
    "130620": ("União das Freguesias de Nogueira e Silva Escura", "jfnogueira@sapo.pt",           "https://nse.pt"),
    # ===== Matosinhos (10) =====
    "130815": ("Junta de Freguesia de Custóias",           "geral@jf-custoias.pt",                "http://jf-custoias.pt"),
    "130816": ("Junta de Freguesia de Guifões",            "geral@jf-guifoes.pt",                 "http://www.jf-guifoes.pt"),
    "130817": ("Junta de Freguesia de Lavra",              "geral@jf-lavra.pt",                   "http://www.jf-lavra.pt"),
    "130818": ("Junta de Freguesia de Leça da Palmeira",   "geral@jf-lecadapalmeira.pt",          "https://www.jf-lecadapalmeira.pt"),
    "130819": ("Junta de Freguesia de Leça do Balio",      "geral@jf-lecabalio.pt",               "http://www.jf-lecabalio.pt"),
    "130820": ("Junta de Freguesia de Matosinhos",         "geral@jf-matosinhos.pt",              "https://www.jf-matosinhos.pt"),
    "130821": ("Junta de Freguesia de Perafita",           "geral@jfperafita.pt",                 "http://www.jfperafita.pt"),
    "130822": ("Junta de Freguesia de Santa Cruz do Bispo","geral@jf-santacruzbispo.pt",          "https://jf-santacruzbispo.pt"),
    "130823": ("Junta de Freguesia de São Mamede de Infesta","geral@jf-saomamedeinfesta.pt",      "https://www.jf-saomamedeinfesta.pt"),
    "130824": ("Junta de Freguesia da Senhora da Hora",    "geral@jf-senhoradahora.pt",           "https://www.jf-senhoradahora.pt"),
    # ===== Porto (7) =====
    "131202": ("Junta de Freguesia do Bonfim",             "geral@jfbonfim.pt",                   "https://jfbonfim.pt"),
    "131203": ("Junta de Freguesia de Campanhã",           "geral@campanha.net",                  "https://www.campanha.net"),
    "131210": ("Junta de Freguesia de Paranhos",           "geral@jfparanhos.pt",                 "https://www.jfparanhos-porto.pt"),
    "131211": ("Junta de Freguesia de Ramalde",            "geral@jf-ramalde.pt",                 "https://www.jf-ramalde.pt"),
    "131216": ("União das Freguesias de Aldoar, Foz do Douro e Nevogilde",   "geral@uf-aldoarfoznevogilde.pt",  "https://aldoarfoznevogilde.pt"),
    "131217": ("União das Freguesias do Centro Histórico do Porto",          "geral@uf-centrohistoricodoporto.pt","https://www.uf-centrohistoricodoporto.pt"),
    "131218": ("União das Freguesias de Lordelo do Ouro e Massarelos",       "geral@uflom.pt",                  "https://www.uf-lordeloouromassarelos.pt"),
    # ===== Valongo (5) =====
    "131501": ("Junta de Freguesia de Alfena",             "geral@jf-alfena.pt",                  "https://www.jf-alfena.pt"),
    "131503": ("Junta de Freguesia de Ermesinde",          "geral@jf-ermesinde.pt",               "https://www.jf-ermesinde.pt"),
    "131505": ("Junta de Freguesia de Valongo",            "junta.freguesia.valongo@jf-valongo.pt","https://www.jf-valongo.pt"),
    "131507": ("União das Freguesias de Campo e Sobrado",  "campo@jf-campoesobrado.pt",           "https://jf-campoesobrado.pt"),
    "131508": ("União das Freguesias de Campo e Sobrado",  "sobrado@jf-campoesobrado.pt",         "https://jf-campoesobrado.pt"),
    # ===== Vila Nova de Gaia (24) =====
    "131701": ("Junta de Freguesia de Arcozelo",           "secretaria@jf-arcozelo.pt",           "https://jf-arcozelo.pt"),
    "131702": ("Junta de Freguesia de Avintes",            "geral@jfavintes.pt",                  "https://www.jfavintes.pt"),
    "131703": ("Junta de Freguesia de Canelas",            "geral@jfcanelas.pt",                  "https://jfcanelas.pt"),
    "131704": ("Junta de Freguesia de Canidelo",           "geral@canidelo.net",                  "https://canidelo.net"),
    "131709": ("Junta de Freguesia da Madalena",           "geral@jf-madalena.pt",                "https://jf-madalena.pt"),
    "131712": ("Junta de Freguesia de Oliveira do Douro",  "geral@jfodouro.com",                  "https://jfodouro.com"),
    "131717": ("Junta de Freguesia de São Félix da Marinha","geral.felixmarinha@gmail.com",       None),
    "131723": ("Junta de Freguesia de Vilar de Andorinho", "geral@jf-vilardeandorinho.pt",        "https://jf-vilardeandorinho.pt"),
    "131732": ("Junta de Freguesia de Crestuma",           "geral@jf-crestuma.pt",                "https://jf-crestuma.pt"),
    "131733": ("União das Freguesias de Grijó e Sermonde", "geral@viladegrijo.pt",                "https://www.viladegrijo.pt"),
    "131734": ("Junta de Freguesia de Gulpilhares",        "geral@jf-gulpilhares.pt",             "https://jf-gulpilhares.pt"),
    "131735": ("União das Freguesias de Sandim, Olival, Lever e Crestuma — Lever",  "geral@jf-lever.pt",  "https://uf-solc.pt"),
    "131736": ("União das Freguesias de Mafamude e Vilar do Paraíso",        "geral@jfmafamude.pt",       "https://jfmafamude.pt"),
    "131737": ("Junta de Freguesia de Olival",             "geral@jfolival.pt",                   "https://jfolival.pt"),
    "131738": ("União das Freguesias de Pedroso e Seixezelo — Pedroso",      "geral@jfpedroso.pt",        "https://jfpedroso.pt"),
    "131739": ("Junta de Freguesia de Perosinho",          "jfperosinho@sapo.pt",                 None),
    "131740": ("União das Freguesias de Sandim, Olival, Lever e Crestuma — Sandim", "geral@jf-sandim.pt", "https://uf-solc.pt"),
    "131741": ("União das Freguesias de Santa Marinha e São Pedro da Afurada — Santa Marinha", "geral@santamarinha-gaia.pt", "https://santamarinhaeafurada.pt"),
    "131742": ("União das Freguesias de Santa Marinha e São Pedro da Afurada — Afurada", "geral@jf-afurada.pt", "https://santamarinhaeafurada.pt"),
    "131743": ("União das Freguesias de Pedroso e Seixezelo — Seixezelo",    "geral@jf-seixezelo.pt",     "https://jfpedroso.pt"),
    "131744": ("União das Freguesias de Grijó e Sermonde — Sermonde",        "geral@jf-sermonde.pt",      "https://jf-sermonde.pt"),
    "131745": ("Junta de Freguesia de Serzedo",            "geral@jf-serzedo.pt",                 "https://jf-serzedo.pt"),
    "131746": ("Junta de Freguesia de Valadares",          "presidente@jf-valadares.pt",          "https://jf-valadares.pt"),
    "131747": ("União das Freguesias de Mafamude e Vilar do Paraíso — Vilar do Paraíso", "secretaria@jfvilarparaiso.pt", "https://jfmafamude.pt"),
}


def main():
    with open(GEOJSON) as f:
        g = json.load(f)

    n_set = 0
    n_seen = 0
    missing = []
    for f in g["features"]:
        p = f["properties"]
        d = p.get("dicofre")
        n_seen += 1
        if d in JF:
            jf_nome, jf_email, jf_url = JF[d]
            p["jf_nome"] = jf_nome
            p["jf_email"] = jf_email
            p["jf_url"] = jf_url
            n_set += 1
            # Strip the now-redundant _todo entry "Add escudo_url" and similar — leave to existing
        else:
            missing.append((d, p.get("nome")))

    with open(GEOJSON, "w") as f:
        json.dump(g, f, ensure_ascii=False, separators=(",", ":"))

    print(f"set={n_set}/{n_seen}", file=sys.stderr)
    if missing:
        print(f"MISSING JF entries:", file=sys.stderr)
        for d,n in missing:
            print(f"  {d} {n}", file=sys.stderr)


if __name__ == "__main__":
    main()
