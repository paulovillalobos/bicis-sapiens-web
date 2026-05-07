#!/usr/bin/env python3
"""
Second pass: inline styles in landing components. Bump fontSize one step,
tighten letterSpacing, ensure tracked uppercase has font-weight 500.

Only touches `style={{ ... }}` literals; never touches className strings
(those were handled in pass 1). Conservative: only well-formed numeric
patterns get rewritten.
"""
import re
import sys
from pathlib import Path

ROOT = Path("/Users/baphomet/Downloads/bicis-sapiens-web/src")
TARGETS = list((ROOT / "components/landing").glob("*.jsx")) + \
          list((ROOT / "pages").glob("*.jsx"))

# fontSize: N → bumped one editorial step.
# Anything ≥ 16 left alone (those are body / display-size, brief says don't grow headlines).
FONT_SIZE_MAP = {
    9: 11,
    10: 12,
    11: 13,
    12: 13,
    13: 14,
    14: 15,
    15: 16,
}

# letterSpacing: 'Nem' → tightened for confident type.
# Mapping by string match — JSX inline style is always single-quoted ASCII.
LETTER_SPACING_MAP = {
    "0.4em":  "0.18em",
    "0.35em": "0.18em",
    "0.3em":  "0.18em",
    "0.28em": "0.18em",
    "0.25em": "0.16em",
    "0.22em": "0.16em",
    "0.2em":  "0.16em",
    # 0.15em and below already tight — leave them.
}


def transform(text: str) -> tuple[str, list[tuple[str, int]]]:
    hits = []

    # fontSize: N — only when N is a bare integer (don't touch clamp(), strings, or vars).
    def fs_repl(m):
        n = int(m.group(1))
        if n in FONT_SIZE_MAP:
            return f"fontSize: {FONT_SIZE_MAP[n]}"
        return m.group(0)
    new_text, n_fs = re.subn(r"fontSize:\s*(\d+)(?=[,\s\}])", fs_repl, text)
    if n_fs:
        hits.append(("fontSize bump", n_fs))
    text = new_text

    # letterSpacing: 'Xem'
    for old, new in LETTER_SPACING_MAP.items():
        n = text.count(f"letterSpacing: '{old}'")
        if n:
            text = text.replace(f"letterSpacing: '{old}'", f"letterSpacing: '{new}'")
            hits.append((f"ls {old}→{new}", n))
        # also handle bare string rebuild like `letterSpacing: '0.3em',`
        n2 = text.count(f"letterSpacing:'{old}'")
        if n2:
            text = text.replace(f"letterSpacing:'{old}'", f"letterSpacing:'{new}'")
            hits.append((f"ls(no-sp) {old}→{new}", n2))

    return text, hits


def main():
    total_files = 0
    total_subs = 0
    for path in TARGETS:
        original = path.read_text()
        new_text, hits = transform(original)
        if not hits:
            continue
        path.write_text(new_text)
        total_files += 1
        n = sum(c for _, c in hits)
        total_subs += n
        print(f"  {path.relative_to(ROOT.parent)}  ({n})", file=sys.stderr)
        for label, c in hits:
            print(f"      {c:>3}× {label}", file=sys.stderr)
    print(f"\n[done] {total_files} files, {total_subs} substitutions", file=sys.stderr)


if __name__ == "__main__":
    main()
