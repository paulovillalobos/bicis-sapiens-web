# Bicis Sapiens — Créditos

Fontes de dados, imagens e bibliotecas usados no projeto.

---

## Brasões heráldicos das freguesias

Os 68 brasões das freguesias do Greater Porto são propriedade dos respetivos detentores (juntas de freguesia, câmaras municipais, ou domínio público).

**50 de 68 brasões** atualmente integrados (73%), com origem em três tipos de fontes:

- **Wikimedia Commons** (44) — licenças maioritariamente CC BY-SA ou domínio público para heráldica histórica. Obtidos via:
  1. Consulta SPARQL ao **Wikidata** com `wdt:P31 wd:Q1131296` (freguesia portuguesa) + `wdt:P94` (coat of arms image).
  2. Parsing do parâmetro `imagem_brasao` do infobox da página `pt.wikipedia.org` correspondente.
  3. Pesquisa direta no Commons por nomes de ficheiro (`MTS-`, `VNG-`, `PRT-`, etc., convenção da Heráldica de Portugal por Sérgio Horta).
- **pt.wikipedia.org Special:FilePath** (1) — para `Castêlo da Maia`, ficheiro carregado localmente em pt.wiki em vez do Commons.
- **Sites oficiais das Juntas/Uniões de Freguesia** (5):
  - **União das Freguesias de Sandim, Olival, Lever e Crestuma** (`uf-solc.pt`) — usado para `Sandim` e `Lever`, ambas membros da UF (logotipo da união, dado que estas freguesias deixaram de ter brasão próprio post-2013).
  - **União das Freguesias de Nogueira e Silva Escura** (`nse.pt`) — logotipo institucional.
  - **Junta de Freguesia de Anta** (`jf-anta.pt`) — brasão original da freguesia, redimensionado para 480 px de largura.
  - **Junta de Freguesia de Silvalde** (`jf-silvalde.pt`) — logotipo institucional.

Transferências automatizadas com `User-Agent` identificado e ≥0,8 s de pausa entre pedidos para respeitar a infraestrutura do Wikimedia/CDN.

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
