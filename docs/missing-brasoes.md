# Brasões — completo

**68/68 (100%) das freguesias do Greater Porto** têm brasão (ou logotipo institucional, quando o brasão heráldico oficial não existe na forma digital).

| Município | Total | Com brasão |
|---|---|---|
| Espinho | 5 | 5 ✓ |
| Gondomar | 7 | 7 ✓ |
| Maia | 10 | 10 ✓ |
| Matosinhos | 10 | 10 ✓ |
| Porto | 7 | 7 ✓ |
| Valongo | 5 | 5 ✓ |
| Vila Nova de Gaia | 24 | 24 ✓ |
| **Total** | **68** | **68** |

---

## Fontes utilizadas (em ordem de qualidade)

### 1. Wikimedia Commons (44 freguesias)

Brasões registados no Wikidata sob a propriedade `wdt:P94` (`coat of arms image`) ou listados no parâmetro `imagem_brasao` / `imagem_escudo` do infobox da página `pt.wikipedia.org` correspondente. Naming convention: `{prefix}-{slug}.{png|svg}` (`PRT-`, `MTS-`, `VNG-`, `MAI-`, `GDM-`, `VLG-`, `ESP-`) — sistema da Heráldica de Portugal por Sérgio Horta.

Para 8 das uniões de freguesias (UFs criadas pela Lei 11-A/2013), o brasão usado é o da freguesia constituinte pré-2013 (Massarelos para a UF Lordelo+Massarelos, Cedofeita para a UF Cedofeita+5, Aldoar para a UF Aldoar/Foz/Nevogilde, Maia para Cidade da Maia, etc.). Documentado em `attribution`.

### 2. heraldicacivica.pt (4 freguesias)

Repositório especializado em heráldica autárquica portuguesa, mantido por Sérgio Horta. Pages individuais por freguesia em `http://www.heraldicacivica.pt/{prefix}-{slug}.html`. Brasões em formato GIF, 418×445 px.

- Pedroso (UF Pedroso e Seixezelo)
- Santa Marinha
- São Pedro da Afurada
- Seixezelo

### 3. pt.wikipedia.org Special:FilePath (1 freguesia)

- Castêlo da Maia — ficheiro carregado localmente em pt.wiki em vez do Commons.

### 4. Sites oficiais das Juntas / Uniões de Freguesia (8 freguesias)

Brasões e logotipos institucionais raspados das páginas iniciais dos sites oficiais:

- **Campanhã** — `campanha.net` (página `/brasao` com brasão completo 457×565)
- **Paranhos** — `jfparanhos-porto.pt` (`/media/img/brasao.png` 352×352)
- **Santa Cruz do Bispo** — `jf-santacruzbispo.pt` (logotipo da JF)
- **Avintes** — `jfavintes.pt/heraldica` (brasão completo 1999×1999, redimensionado)
- **Grijó** — `viladegrijo.pt` (logotipo da JF)
- **Mafamude** — `jfmafamude.pt` (logotipo institucional 1260×1200, redimensionado)
- **Sandim e Lever** — `uf-solc.pt` (logotipo da União das Freguesias de Sandim, Olival, Lever e Crestuma)
- **Nogueira e Silva Escura** — `nse.pt` (logotipo da União das Freguesias)
- **Anta** — `jf-anta.pt` (brasão completo 2301×2264, redimensionado)
- **Silvalde** — `jf-silvalde.pt` (logotipo da JF)

---

## Notas de qualidade

Quatro categorias por nível de oficialidade da imagem:

| Categoria | Descrição | Freguesias |
|---|---|---|
| **A · Brasão heráldico oficial** | Aprovado pelo Conselho de Heráldica Portuguesa, publicado em Diário da República | ~52 (todos os de Wikimedia + heraldicacivica + Castêlo da Maia + Campanhã + Paranhos + Avintes + Anta) |
| **B · Brasão de constituinte pré-2013** | UF usa o brasão de uma das freguesias agregadas | 8 (UFs de Porto, Gondomar, Maia) |
| **C · Logotipo institucional da junta** | Não é brasão heráldico formal mas é o símbolo institucional usado pela junta atual | 8 (Sta Cruz do Bispo, Grijó, Mafamude, Sandim, Lever, NSE, Silvalde) |

A app não distingue visualmente entre estas categorias — todas são exibidas como "brasão". Para um caso de uso mais formal (ex.: publicação oficial), a categoria deve ser anotada explicitamente.

---

## Notas técnicas

- A app procura `bmap[dicofre].brasao` — todos os 68 estão preenchidos.
- Formatos: PNG (maioria), JPG (Castêlo da Maia, Alfena, Rio Tinto), GIF (heraldicacivica.pt — Pedroso, Sta Marinha, SPA, Seixezelo).
- Redimensionados a um máximo de 480 px (lado maior) com `sips -Z 480`.
- Lazy-loaded via `<img loading="lazy">`. O componente `<Brasao>` em `InteractiveMap.jsx` renderiza a 120×120 com glow + skeleton + fallback.

---

## Scripts deste lote (em `scripts/`)

| Script | Função |
|---|---|
| `scrape-brasoes.py` | Pase 1: extracção via parâmetro `imagem_brasao` do infobox pt.wiki |
| `scrape-brasoes-pass2.py` | Pase 2: listagem de todas as imagens da página + filtro heurístico (descartado por falsos positivos) |
| `scrape-brasoes-pass3.py` | Pase 3: pesquisa direta no Commons + pt.wiki por nomes de ficheiro |
| `scrape-brasoes-pass4.py` | Pase 4: tentativa em sites oficiais de juntas/uniões |
| `scrape-brasoes-pass5.py` | Pase 5: para UFs, busca constituent freguesia pré-2013 (`imagem_escudo`) |
| `scrape-brasoes-pass6.py` | (manual + ad-hoc) JF sites + heraldicacivica.pt + Wayback Machine para SPAs |
| `update-brasoes-json.py` | Sincroniza `freguesias-brasoes.json` com os ficheiros realmente presentes |

Todos os scripts são idempotentes e re-executáveis.
