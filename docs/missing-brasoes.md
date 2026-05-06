# Brasões — pendentes

Estado da coleção dos 68 brasões heráldicos das freguesias do Greater Porto.

**50 de 68 implementados (73%).** 18 pendentes.

| Município | Total | Com brasão | Faltam |
|---|---|---|---|
| Espinho | 5 | 5 | 0 ✓ |
| Gondomar | 7 | 3 | 4 |
| Maia | 10 | 9 | 1 |
| Matosinhos | 10 | 9 | 1 |
| Porto | 7 | 2 | 5 |
| Valongo | 5 | 5 | 0 ✓ |
| Vila Nova de Gaia | 24 | 17 | 7 |
| **Total** | **68** | **50** | **18** |

---

## Brasões em falta (18)

Cada um destes precisa de ser:

1. encontrado em fontes adicionais (junta de freguesia oficial, câmara municipal, ou contacto direto com a junta);
2. transferido para `/public/brasoes/{municipio_slug}/{slug}.{svg|png}`;
3. registado em `/public/data/freguesias-brasoes.json` na entrada do DICOFRE correspondente.

Razão típica para a falha: estas freguesias ou (a) foram absorvidas em uniões em 2013 (Lei 11-A/2013) sem que o brasão original tenha sido digitalizado, ou (b) nunca tiveram brasão heráldico oficialmente aprovado pelo Conselho de Heráldica.

### Porto (5 em falta)

| DICOFRE | Freguesia | Slug esperado | Notas |
|---|---|---|---|
| `131203` | Campanhã | `/brasoes/porto/campanha.svg` | Página pt.wiki existe; sem `imagem_brasao`. Tentar `jf-campanha.pt` ou contactar JF. |
| `131210` | Paranhos | `/brasoes/porto/paranhos.svg` | Página pt.wiki existe (`Paranhos (Porto)`); sem brasão no infobox. |
| `131216` | UF Aldoar, Foz do Douro e Nevogilde | `/brasoes/porto/aldoar-foz-do-douro-e-nevogilde.svg` | UF de 2013. Tentar `uffan.pt` ou similar. |
| `131217` | UF Cedofeita, Santo Ildefonso, Sé, Miragaia, São Nicolau e Vitória | `/brasoes/porto/cedofeita-santo-ildefonso-se-miragaia-sao-nicolau-e-vitoria.svg` | Mega-UF de 6 freguesias do centro histórico. |
| `131218` | UF Lordelo do Ouro e Massarelos | `/brasoes/porto/lordelo-do-ouro-e-massarelos.svg` | UF de 2013. |

### Matosinhos (1 em falta)

| DICOFRE | Freguesia | Slug esperado | Notas |
|---|---|---|---|
| `130822` | Santa Cruz do Bispo | `/brasoes/matosinhos/santa-cruz-do-bispo.svg` | Falsos positivos no Commons (brasão pessoal de bispo). Verificar JF. |

### Vila Nova de Gaia (7 em falta)

| DICOFRE | Freguesia | Slug esperado | Notas |
|---|---|---|---|
| `131702` | Avintes | `/brasoes/vila-nova-de-gaia/avintes.svg` | Site `jfavintes.pt` ativo mas sem brasão localizável. |
| `131733` | Grijó | `/brasoes/vila-nova-de-gaia/grijo.svg` | UF Pedroso e Grijó (`uf-pegrijo.pt` não responde). |
| `131736` | Mafamude | `/brasoes/vila-nova-de-gaia/mafamude.svg` | UF Mafamude e Vilar do Paraíso. |
| `131738` | Pedroso | `/brasoes/vila-nova-de-gaia/pedroso.svg` | UF Pedroso e Seixezelo. |
| `131741` | Santa Marinha | `/brasoes/vila-nova-de-gaia/santa-marinha.svg` | UF Santa Marinha e São Pedro da Afurada. |
| `131742` | São Pedro da Afurada | `/brasoes/vila-nova-de-gaia/sao-pedro-da-afurada.svg` | Mesma UF que Santa Marinha. |
| `131743` | Seixezelo | `/brasoes/vila-nova-de-gaia/seixezelo.svg` | UF Pedroso e Seixezelo. |

### Maia (1 em falta)

| DICOFRE | Freguesia | Slug esperado | Notas |
|---|---|---|---|
| `130619` | Cidade da Maia | `/brasoes/maia/cidade-da-maia.svg` | UF nova (Maia + Vermoim + Gueifães). Verificar `cm-maia.pt`. |

### Gondomar (4 em falta)

| DICOFRE | Freguesia | Slug esperado | Notas |
|---|---|---|---|
| `130413` | UF Fânzeres e São Pedro da Cova | `/brasoes/gondomar/fanzeres-e-sao-pedro-da-cova.svg` | UF de 2013. |
| `130414` | UF Foz do Sousa e Covelo | `/brasoes/gondomar/foz-do-sousa-e-covelo.svg` | UF de 2013. |
| `130415` | UF Gondomar (São Cosme), Valbom e Jovim | `/brasoes/gondomar/gondomar-sao-cosme-valbom-e-jovim.svg` | UF central de Gondomar. |
| `130416` | UF Melres e Medas | `/brasoes/gondomar/melres-e-medas.svg` | UF de 2013. |

---

## Brasões já transferidos (50)

### Porto (2)

- `131202` Bonfim · Wikimedia Commons
- `131211` Ramalde · Wikimedia Commons

### Matosinhos (9)

- `130815` Custóias, `130816` Guifões, `130817` Lavra, `130818` Leça da Palmeira,
  `130819` Leça do Balio, `130820` Matosinhos, `130821` Perafita,
  `130823` São Mamede de Infesta, `130824` Senhora da Hora — todos via Wikimedia Commons.

### Vila Nova de Gaia (17)

- Pré-existentes (8): `131701` Arcozelo · `131703` Canelas · `131704` Canidelo · `131709` Madalena · `131712` Oliveira do Douro · `131717` São Félix da Marinha · `131746` Valadares · `131723` Vilar de Andorinho.
- Novos (9): `131732` Crestuma · `131734` Gulpilhares · `131735` Lever (UF-SOLC logo) · `131737` Olival · `131739` Perosinho · `131740` Sandim (UF-SOLC logo) · `131744` Sermonde · `131745` Serzedo · `131747` Vilar do Paraíso.

### Maia (9)

- Pré-existentes (7): `130601` Águas Santas · `130603` Folgosa · `130608` Milheirós · `130609` Moreira · `130613` São Pedro Fins · `130616` Vila Nova da Telha · `130617` Pedrouços.
- Novos (2): `130618` Castêlo da Maia (pt.wiki) · `130620` Nogueira e Silva Escura (logotipo nse.pt).

### Gondomar (3)

- `130405` Lomba · `130408` Rio Tinto · `130412` Baguim do Monte (Rio Tinto) — todos via Wikimedia Commons.

### Valongo (5) — completo ✓

- `131501` Alfena · `131503` Ermesinde · `131505` Valongo · `131507` Campo · `131508` Sobrado.

### Espinho (5) — completo ✓

- Pré-existentes (2): `010702` Espinho · `010704` Paramos.
- Novos (3): `010705` Silvalde (logotipo jf-silvalde.pt) · `010707` Anta (jf-anta.pt) · `010708` Guetim (Wikimedia Commons).

---

## Notas técnicas

- A app procura `bmap[dicofre].brasao` — se for `null`, mostra fallback (Lucide Shield + DICOFRE).
- Formatos aceites: `.svg` (preferido), `.png`, `.jpg`. Lazy-loaded via `<img loading="lazy">`.
- Brasões obtidos de Wikimedia exigem `Special:FilePath/{filename}?width=480` + `User-Agent` válido + ≥0,8 s de pausa entre pedidos.
- Logotipos institucionais (Sandim, Lever, Nogueira e Silva Escura, Silvalde) são tecnicamente logotipos das uniões de freguesia ou da junta atual, não brasões heráldicos formais. Substituir por brasões oficiais quando disponíveis.

## Fontes recomendadas para os 18 em falta

1. **Sites oficiais das juntas / uniões** — quando ativos. Muitos têm o brasão na página inicial ou rodapé. URL pattern típico: `jf-{slug}.pt` ou `uf-{slug}.pt`.
2. **Câmaras municipais** — páginas que listam freguesias do concelho (`cm-porto.pt`, `cm-gaia.pt`, `cm-maia.pt`, `cm-gondomar.pt`).
3. **Contacto direto com a junta** — pedido por email do brasão em formato vetorial.
4. **Diário da República** — pesquisa por "anúncio de brasão" + nome da freguesia (publicação oficial dos brasões aprovados pelo Conselho de Heráldica).

---

## Scripts deste lote

- `scripts/scrape-brasoes.py` — pase 1: extracção via parâmetro `imagem_brasao` do infobox pt.wiki.
- `scripts/scrape-brasoes-pass2.py` — pase 2: listagem de todas as imagens da página + filtro heurístico (descartado por falsos positivos).
- `scripts/scrape-brasoes-pass3.py` — pase 3: pesquisa direta no Commons + pt.wiki por nomes de ficheiro de brasão.
- `scripts/scrape-brasoes-pass4.py` — pase 4: tentativa em sites oficiais de juntas/uniões.
- `scripts/update-brasoes-json.py` — sincroniza `freguesias-brasoes.json` com os ficheiros realmente presentes em `public/brasoes/`.
