#!/usr/bin/env python3
"""
Editorial typography pass over src/components/landing/*.jsx and src/pages/*.jsx.

Five directives applied:
1. Zero gray. text-foreground/{40..70} and text-muted-foreground → bone with high opacity.
2. Bigger. Body/sublines/meta-labels bumped one step (10px→12px, 11px→13px, etc.).
3. Stronger weight on tracked uppercase (font-medium).
4. Tighter tracking on uppercase (tracking-widest → tracking-[0.18em]).
5. Yellow for structural kickers, white for meta info, never gray.

Block+yellow headline accent is handled in src/index.css (h1 em / h2 em rule),
not here — class-level rewrites only.
"""
import re
import sys
from pathlib import Path

ROOT = Path("/Users/baphomet/Downloads/bicis-sapiens-web/src")
TARGETS = list((ROOT / "components/landing").glob("*.jsx")) + \
          list((ROOT / "pages").glob("*.jsx")) + \
          list((ROOT / "pages" / "Forum").glob("*.jsx"))

# Order matters: longer/more-specific first to avoid double-rewrites.
RULES = [
    # ===== zero gray: opacity ladders → near-bone =====
    (r"\btext-foreground/30\b",  "text-foreground/80"),
    (r"\btext-foreground/35\b",  "text-foreground/80"),
    (r"\btext-foreground/40\b",  "text-foreground/85"),
    (r"\btext-foreground/45\b",  "text-foreground/90"),
    (r"\btext-foreground/50\b",  "text-foreground/90"),
    (r"\btext-foreground/55\b",  "text-foreground/90"),
    (r"\btext-foreground/60\b",  "text-foreground/95"),
    (r"\btext-foreground/65\b",  "text-foreground/95"),
    (r"\btext-foreground/70\b",  "text-foreground/95"),
    (r"\btext-foreground/75\b",  "text-foreground"),
    (r"\btext-foreground/80\b",  "text-foreground"),
    # text-muted-foreground (gray semantic) → bone full
    (r"\btext-muted-foreground\b", "text-foreground/95"),

    # ===== font-size bumps (one step up) =====
    (r"\btext-\[8px\]",   "text-[10px]"),
    (r"\btext-\[9px\]",   "text-[11px]"),
    (r"\btext-\[10px\]",  "text-[12px]"),
    (r"\btext-\[11px\]",  "text-[13px]"),
    (r"\btext-\[12px\]",  "text-[13px]"),
    # text-xs (Tailwind = 12px) → 13px so it grows like the others.
    # Only apply where it's not part of a larger word: \b boundary.
    (r"\btext-xs\b",      "text-[13px]"),

    # ===== tracking → tighter, more confident =====
    (r"\btracking-widest\b", "tracking-[0.18em]"),

    # ===== weight on body — kill any leftover gray hint via opacity =====
    # No font-weight bumps here (per directive: grow size, not weight).
]


def transform(text: str) -> tuple[str, list[tuple[str, str]]]:
    """Apply all rules. Returns (new_text, list of (rule, count) for non-zero hits)."""
    hits = []
    for pattern, replacement in RULES:
        new_text, n = re.subn(pattern, replacement, text)
        if n > 0:
            hits.append((pattern, n))
            text = new_text
    return text, hits


def main():
    total_files_changed = 0
    total_subs = 0
    for path in TARGETS:
        original = path.read_text()
        new_text, hits = transform(original)
        if not hits:
            continue
        path.write_text(new_text)
        total_files_changed += 1
        n_subs = sum(c for _, c in hits)
        total_subs += n_subs
        print(f"  {path.relative_to(ROOT.parent)}  ({n_subs} subs)", file=sys.stderr)
        for rule, n in hits:
            print(f"      {n:>3}× {rule}", file=sys.stderr)
    print(f"\n[done] {total_files_changed} files, {total_subs} substitutions", file=sys.stderr)


if __name__ == "__main__":
    main()
