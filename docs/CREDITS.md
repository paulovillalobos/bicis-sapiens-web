# Bicis Sapiens — Créditos

Fontes de dados, imagens e bibliotecas usados no projeto.

---

## Brasões heráldicos das freguesias

Os 68 brasões das freguesias do Greater Porto são propriedade dos respetivos detentores (juntas de freguesia, câmaras municipais, ou domínio público).

**68 de 68 brasões** integrados (100%), com origem em quatro tipos de fontes:

- **Wikimedia Commons** (44) — licenças maioritariamente CC BY-SA ou domínio público para heráldica histórica. Obtidos via:
  1. Consulta SPARQL ao **Wikidata** com `wdt:P31 wd:Q1131296` (freguesia portuguesa) + `wdt:P94` (coat of arms image).
  2. Parsing do parâmetro `imagem_brasao` ou `imagem_escudo` do infobox da página `pt.wikipedia.org` correspondente.
  3. Para uniões de freguesias (UFs criadas pela Lei 11-A/2013), uso do brasão da freguesia constituinte pré-2013 (Massarelos pela UF Lordelo+Massarelos, Cedofeita pela UF Cedofeita+5, Aldoar pela UF Aldoar/Foz/Nevogilde, etc.).
  4. Pesquisa direta no Commons por nomes de ficheiro convencionais (`MTS-`, `VNG-`, `PRT-`, etc., convenção da Heráldica de Portugal por Sérgio Horta).
- **heraldicacivica.pt** (4) — repositório especializado de heráldica autárquica (Sérgio Horta), URLs `http://www.heraldicacivica.pt/{prefix}-{slug}.html`. Usado para Pedroso, Santa Marinha, São Pedro da Afurada, Seixezelo.
- **pt.wikipedia.org Special:FilePath** (1) — para `Castêlo da Maia`, ficheiro carregado localmente em pt.wiki em vez do Commons.
- **Sites oficiais das Juntas/Uniões de Freguesia** (10):
  - **Campanhã** — `campanha.net/index.php/brasao` (brasão completo 457×565).
  - **Paranhos** — `jfparanhos-porto.pt/media/img/brasao.png` (352×352).
  - **Avintes** — `jfavintes.pt/heraldica` (brasão original 1999×1999, redimensionado).
  - **Anta** — `jf-anta.pt/wp-content/uploads/.../BrasaoAntag.png` (2301×2264, redimensionado).
  - **Mafamude** — `jfmafamude.pt` (`Logotipo_Mafamude_Freguesiade_site.png`, 1260×1200 redimensionado).
  - **Santa Cruz do Bispo** — `jf-santacruzbispo.pt/wp-content/uploads/2025/11/logo-jf-scbispo.png` (logotipo).
  - **Grijó** — `viladegrijo.pt/frontend/images/logo.png` (logotipo).
  - **Sandim e Lever** — `uf-solc.pt` (logotipo da União das Freguesias de Sandim, Olival, Lever e Crestuma).
  - **Nogueira e Silva Escura** — `nse.pt` (logotipo institucional).
  - **Silvalde** — `jf-silvalde.pt` (logotipo institucional).

Transferências automatizadas com `User-Agent` identificado e ≥0,8 s de pausa entre pedidos para respeitar a infraestrutura do Wikimedia/CDN.

---

## Categoria de cada brasão

Quatro níveis de oficialidade — ver tabela completa em [`/docs/missing-brasoes.md`](./missing-brasoes.md):

- **A** · Brasão heráldico oficial aprovado pelo Conselho de Heráldica Portuguesa (~52 freguesias)
- **B** · Brasão de freguesia constituinte pré-2013 usado pela UF atual (8 freguesias)
- **C** · Logotipo institucional da junta (não heráldico formal — 8 freguesias)

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
