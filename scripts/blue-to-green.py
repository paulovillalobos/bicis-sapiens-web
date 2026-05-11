#!/usr/bin/env python3
"""
Replace blue palette with foliage green across src/.

Mapping (one-way):
  #1d4ed8 → #5b8e3a   royal blue   → leaf green (main)
  #003399 → #4a7c2e   EU blue      → deeper leaf
  #1944c0 → #4a7c2e   CTA hover    → deeper leaf
  #002266 → #3d6b22   button hover → forest
  #0000FF → #5b8e3a   bare blue    → leaf
  rgba(29, 78, 216, A)  → rgba(91, 142, 58, A)
  rgba(0, 51, 153, A)   → rgba(74, 124, 46, A)
"""
import re
import sys
from pathlib import Path

ROOT = Path("/Users/baphomet/Downloads/bicis-sapiens-web/src")
TARGETS = list(ROOT.glob("**/*.jsx")) + list(ROOT.glob("**/*.js")) + \
          list(ROOT.glob("**/*.css")) + list(ROOT.glob("**/*.ts")) + \
          list(ROOT.glob("**/*.tsx"))

# Hex replacements (case-insensitive on the hex portion)
HEX_MAP = {
    "#1d4ed8": "#5b8e3a",
    "#1D4ED8": "#5b8e3a",
    "#003399": "#4a7c2e",
    "#1944c0": "#4a7c2e",
    "#1944C0": "#4a7c2e",
    "#002266": "#3d6b22",
    "#0000FF": "#5b8e3a",
    "#0000ff": "#5b8e3a",
}

# rgba — replace the rgb triplet, keep the alpha
RGBA_MAP = [
    # blue (29,78,216) → green (91,142,58)
    (re.compile(r"rgba\(\s*29\s*,\s*78\s*,\s*216\s*,"), "rgba(91, 142, 58,"),
    # EU blue (0,51,153) → deep green (74,124,46)
    (re.compile(r"rgba\(\s*0\s*,\s*51\s*,\s*153\s*,"),  "rgba(74, 124, 46,"),
]


def transform(text: str) -> tuple[str, int]:
    n = 0
    for old, new in HEX_MAP.items():
        c = text.count(old)
        if c:
            text = text.replace(old, new)
            n += c
    for pattern, repl in RGBA_MAP:
        text, c = pattern.subn(repl, text)
        n += c
    return text, n


def main():
    total_files = 0
    total_subs = 0
    for path in TARGETS:
        if "node_modules" in str(path):
            continue
        original = path.read_text()
        new_text, n = transform(original)
        if n == 0:
            continue
        path.write_text(new_text)
        total_files += 1
        total_subs += n
        print(f"  {path.relative_to(ROOT.parent)}  ({n})", file=sys.stderr)
    print(f"\n[done] {total_files} files, {total_subs} substitutions", file=sys.stderr)


if __name__ == "__main__":
    main()
