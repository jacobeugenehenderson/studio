#!/usr/bin/env python3
"""
Stamp each local stylesheet and script in index.html with a hash of its own
contents: css/site.css?v=8f3a1c2b.

⭐ WHY THIS EXISTS. jacobhenderson.studio sits behind Cloudflare, which caches
index.html as DYNAMIC (max-age 600, effectively always fresh) but caches CSS and
JS at the edge for max-age=14400 — four hours. A deploy therefore ships new HTML
against a stale stylesheet, and the page renders with markup the CSS has never
heard of. On 2026-08-31 that shipped a live site whose captions were unstyled:
the HTML had `.figure-note`, the four-hour-old CSS did not, and every check
passed because the origin was correct and only the edge copy was old.

The version is derived from the file's CONTENT, so it changes exactly when the
file changes and never otherwise — a cache hit stays a cache hit for an unchanged
asset, and a changed asset is a URL the edge has never seen.

⛔ Run this before every push that touches css/ or js/. `--check` exits non-zero
if a stamp is missing or stale, which is the form to call from an audit.
"""
import hashlib, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
HTML = ROOT / "index.html"
PATTERN = re.compile(r'((?:href|src)=")((?:css|js)/[\w.-]+\.(?:css|js))(?:\?v=[0-9a-f]+)?(")')

def digest(rel):
    return hashlib.md5((ROOT / rel).read_bytes()).hexdigest()[:8]

def main(check=False):
    src = HTML.read_text()
    seen = []
    def sub(m):
        rel = m.group(2); v = digest(rel); seen.append((rel, v))
        return f'{m.group(1)}{rel}?v={v}{m.group(3)}'
    out = PATTERN.sub(sub, src)
    if not seen:
        print("stamp: no local css/js links found", file=sys.stderr); return 1
    if check:
        if out != src:
            print("stamp: STALE — run tools/stamp.py", file=sys.stderr)
            for rel, v in seen: print(f"   {rel}?v={v}", file=sys.stderr)
            return 1
        print("stamp: ok"); return 0
    if out != src:
        HTML.write_text(out)
    for rel, v in seen:
        print(f"  {rel}?v={v}")
    return 0

if __name__ == "__main__":
    sys.exit(main(check="--check" in sys.argv))
