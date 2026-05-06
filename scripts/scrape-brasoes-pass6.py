#!/usr/bin/env python3
"""
Pass 6: aggressive sourcing for the 10 singletons that Wikipedia had
empty for. Used a mix of:
- WebSearch to find each official JF/UF site
- Direct image scraping from JF homepages and dedicated /brasao or /heraldica pages
- heraldicacivica.pt for VNG entries (vng-pedroso_seixezelo, vng-santamarinha,
  vng-spedroafurada, vng-seixezelo)
- Wayback Machine for SPA sites where curl returns the JS shell only
  (jfavintes.pt — found brasão at globaluserfiles.com/media/135169_*.png)

This is documented as ad-hoc — sources don't follow a single repeatable
pattern and required interactive search per entry.

See docs/missing-brasoes.md for the per-entry source.
"""
print("Manual pass — see docs/missing-brasoes.md and CREDITS.md for sources.")
