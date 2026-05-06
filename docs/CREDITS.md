# Bicis Sapiens — Créditos

Fontes de dados, imagens e bibliotecas usados no projeto.

---

## Brasões heráldicos das freguesias

Os 68 brasões das freguesias do Greater Porto são propriedade dos respetivos detentores (juntas de freguesia, câmaras municipais, ou domínio público).

**29 brasões** atualmente integrados nesta versão, com origem em **Wikimedia Commons** (licenças variadas — maioritariamente CC BY-SA ou domínio público para heráldica histórica).

A obtenção foi feita via:
1. Consulta SPARQL ao **Wikidata** filtrando freguesias portuguesas (`wdt:P31 wd:Q1131296`) com brasão (`wdt:P94`).
2. Transferência através de **Wikimedia Commons** (`Special:FilePath/{filename}?width=240`) com `User-Agent` identificado e taxa de pedido respeitada (≥1 s entre pedidos).

Detalhes por freguesia em [`/docs/missing-brasoes.md`](./missing-brasoes.md).

> Brasões heráldicos cortesia de Wikipedia / Wikimedia Commons, Heráldica de Portugal e juntas de freguesia respetivas. Direitos dos respetivos detentores.

---

## Geometria geográfica

- **CAOP** (Carta Administrativa Oficial de Portugal) via [GeoAPI.pt](https://geoapi.pt) — endpoint `/municipios/{slug}/freguesias`. Polígonos das 68 freguesias do Greater Porto.

## Dados estatísticos

- **INE Portugal** — Censos 2021 (BGRI). População e densidade por freguesia.
- **CMP**, **STCP** — autocarros e mobilidade do Porto.
- **CBS, GVB** (Amsterdam), **INSEE, RATP** (Paris), **DST, DOT** (Copenhagen) — dados comparativos.

---

## Bibliotecas

- React 18 + Vite
- Leaflet + react-leaflet (mapa)
- Tailwind CSS
- CARTO Dark Matter (tile provider)
- Lucide React (icons)
- framer-motion (animações em algumas secções)
- @base44/sdk (formulários de subscrição)

---

## Tipografia

- **Playfair Display** (Black) — display headings
- **Fraunces** — editorial serif (números, headlines)
- **Inter** — body
- **JetBrains Mono** — eyebrows, labels, mono UI
Todas as fontes via Google Fonts.
