#!/usr/bin/env python3
"""
Color system v3 — leaf green → vibrant lime.
Bumps all hard-coded greens AND tightens the bone whites to pure.
Run once; idempotent.

Mapping:
  #5b8e3a → #B8E835   main leaf → vibrant lime          (brand accent)
  #4a7c2e → #A0CC20   darker leaf → darker lime         (hover)
  #3d6b22 → #8AB418   forest → deeper lime              (active/pressed)
  #7faa50 → #C7F23F   light leaf → light lime           (depth highlight)
  rgba(91,142,58,A)  → rgba(184,232,53,A)
  rgba(74,124,46,A)  → rgba(160,204,32,A)
  rgba(61,107,34,A)  → rgba(138,180,24,A)
  #FAFAF7 → #FFFFFF   bone → pure white
  rgba(250,250,247,A) → rgba(255,255,255,A)
"""
import re
import sys
from pathlib import Path

ROOT = Path("/Users/baphomet/Downloads/bicis-sapiens-web/src")
TARGETS = list(ROOT.glob("**/*.jsx")) + list(ROOT.glob("**/*.js")) + \
          list(ROOT.glob("**/*.css")) + list(ROOT.glob("**/*.ts")) + \
          list(ROOT.glob("**/*.tsx"))

# Order: longest/most-specific first. Case-insensitive hex matching done by
# adding both casings.
HEX_MAP = {
    "#5b8e3a": "#B8E835",
    "#5B8E3A": "#B8E835",
    "#4a7c2e": "#A0CC20",
    "#4A7C2E": "#A0CC20",
    "#3d6b22": "#8AB418",
    "#3D6B22": "#8AB418",
    "#7faa50": "#C7F23F",
    "#7FAA50": "#C7F23F",
    "#FAFAF7": "#FFFFFF",
    "#fafaf7": "#FFFFFF",
}

RGBA_MAP = [
    (re.compile(r"rgba\(\s*91\s*,\s*142\s*,\s*58\s*,"),  "rgba(184, 232, 53,"),
    (re.compile(r"rgba\(\s*74\s*,\s*124\s*,\s*46\s*,"),  "rgba(160, 204, 32,"),
    (re.compile(r"rgba\(\s*61\s*,\s*107\s*,\s*34\s*,"),  "rgba(138, 180, 24,"),
    (re.compile(r"rgba\(\s*250\s*,\s*250\s*,\s*247\s*,"), "rgba(255, 255, 255,"),
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
