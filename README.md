# jacobhenderson.studio

A one-page portfolio for Jacob Henderson — creative operations, systems design,
graphics production. Static HTML, CSS and a little JavaScript. No framework, no
build step for the site itself.

Deployed from `main` to GitHub Pages, custom domain in `CNAME`. The rebuild lives
on the `rebuild` branch; `main` still serves the previous site.

```
serve   python3 -m http.server 8787 --bind 127.0.0.1
open    http://127.0.0.1:8787
```

---

## 1. What the site argues

Everything on the page serves one claim, and copy or components that don't
support it should be cut rather than kept.

> **Compositing.** Sources captured separately, under conditions that never
> coincided, made into one thing that reads as though it always was. A studio
> shot and an empty room become a photograph nobody took. Four authoring tools
> and a runtime become a place you can walk around in.

The same structure recurs across fifteen years and four industries: separate
tools, each publishing one canonical artifact, composed by a runtime. Seven
pieces demonstrate it at different scales.

**Title:** *Creative Operations* leads as the practice, *Creative Director*
carries the level. People recognise the second but it reads light, and the point
is substance. Do not swap these.

---

## 2. Files

```
index.html              the whole site
css/tokens.css          every colour, size, family, duration
css/site.css            everything else, in numbered sections
js/site.js              theme switch, drag, pager, disclosure-from-hash
assets/                 committed, served
assets/west-elm/        derivatives built from _source
tools/build-images.py   _source → assets
docs/                   working documents, not served
_source/                originals, gitignored, never served
belle-epoque/           a redirect holding an existing URL
```

---

## 3. Rules

These are enforced by nothing but attention. An audit script for them is in §7.

1. **No colour, size, font family or duration outside `css/tokens.css`.** If you
   are about to type a hex code or a px font-size into `site.css`, add a token.
2. **No inline `style` attributes.** JavaScript may set *custom properties* for
   dynamic state (`--wipe`), which is different from styling in markup.
3. **All CSS in `css/`.** No `<style>` blocks, no CSS-in-JS.
4. **No `!important`.** If specificity is fighting, name the parts better — see
   `.filmstrip-cell`, which exists so a caption need not opt out of a rule meant
   for image cells.
5. **Both themes, always.** Light is the sheet, dark is the plate. Style through
   tokens and both come free. The viewer's toggle must beat the OS preference in
   both directions, which is why every theme block is declared explicitly.
6. **Numbering must carry information.** `Fig. 1`, `01 ArtStart`, `1 / 10` are
   sequences a reader needs. Do not number things for decoration.
7. **Placeholders are labelled and obvious.** Grey slugs saying what belongs
   there. Never a plausible-looking fake.

---

## 4. The visual system

**Press ink on paper.** Light theme is the sheet — uncoated warm stock,
registration black, subtractive `multiply` ink. Dark is the plate, lit from
behind: the same inks switch to additive `screen`, so overlaps brighten the way
transmitted light does instead of muddying toward black. The metaphor inverts;
the colours are not merely flipped.

**Spot inks.** One per piece, hand-chosen, set on the article as `--spot` and
picked up by rank markers, disclosure signs and rules.

**Graph paper** — grey ground, two stroked grids. This is one of Jacob's
recurring motifs and is a system element, not a texture invented here. Use it as
a **ground under a figure, never as a page background**: a full-page grid was
part of what the old site did and read as SaaS wallpaper.

**The name treatment** is four plates — cyan, magenta, yellow and registration
black. They begin badly out of register and pull in on load, stopping *just short
of true*. A press never registers perfectly and the residual fringe is the point.
Reduced motion lands them pre-registered, fringe intact.

---

## 5. Components, and when each is right

Getting this wrong cost several rebuilds. The distinction is worth keeping.

| Component | Use when |
|---|---|
| **`.wipe`** | Two **registered** images of the same frame, where the point is seeing a difference *in place* — a plate against its composite. Not for comparing two unrelated things. |
| **`.reveal`** | A wipe whose artwork is cut so each end opens an empty field, and the copy lives *inside* the clipped layers so the seam uncovers writing as it uncovers picture. |
| **`.states` + `.pill`** | Three or more discrete views of one stack, where one of them is the whole frame at once. A wipe cannot express that: centre-composed and seam-follows-finger are geometrically incompatible. |
| **`.stepper`** | An ordered sequence. Every stage stays visible, nothing auto-advances. |
| **`.pager`** | Many variations of one argument. One at a time, buttons in the margins so paging is never confused with dragging, and a visible count so the extent is known. |
| **`.embed`** | A live product that is DOM rather than WebGL. Preferred over a screenshot: it is the actual thing, and it cannot go stale. |
| **`.more`** | Depth. **Collapsed is a preview, never a closed door** — the picture and the claim stay out, and expanding only adds reading. |

---

## 6. Traps already fallen into

Each of these was a real bug. They are cheap to reintroduce.

- **`summary { display: flex }` breaks `<details>` in Safari.** It toggles fine
  in Chrome, so it passes casual testing. The summary keeps its default display
  and the layout goes on a wrapper inside it.
- **`.pager-slide { display: grid }` beats the UA's `[hidden] { display: none }`.**
  The attribute was set correctly and ignored, so every slide rendered. State it
  explicitly. Check *computed display*, not the attribute.
- **Native range inputs handle pen pointers inconsistently.** A press away from
  the thumb can register as tap-and-jump rather than a drag, which feels sticky
  with a stylus. Dragging is driven by Pointer Events on the frame; the input
  stays for keyboard and screen readers with `pointer-events: none`.
- **`will-change: clip-path` made dragging worse,** not better — it promotes a
  layer and forces re-rasterisation on every change.
- **A copy block inside an unclipped layer must carry no `z-index`,** or it lifts
  out of the stack and stays visible when the layer above should cover it.
- **Verify with the disclosure closed.** Every early check rendered `open`, which
  is exactly why the Safari bug survived so long.

---

## 7. Working on it

**Build image derivatives** after adding to `_source/`:

```
python3 tools/build-images.py
```

1600px wide, quality 80. It forces each pair's two images to identical
dimensions — some sources differ by a pixel, and rounding would carry that into
the wipe — and reports whether every pair registered.

**Audit conformance.** Run this before committing structural CSS changes; it
catches dead classes, undefined classes and unused tokens:

```
python3 - <<'EOF'
import re
site=open('css/site.css').read(); tokens=open('css/tokens.css').read()
html=open('index.html').read(); js=open('js/site.js').read()
code=re.sub(r'/\*.*?\*/','',site,flags=re.S)
defined=set(re.findall(r'\.([a-z][a-z0-9-]*)',code)); used={'org','w3'}
for c in re.findall(r'class="([^"]*)"',html): used.update(c.split())
used.update(re.findall(r"classList\.(?:add|remove|toggle)\('([^']+)'\)",js))
used.update(re.findall(r"querySelectorAll?\('\.([a-z0-9-]+)",js))
print('unused CSS  :', sorted(defined-used) or 'none')
print('undefined   :', sorted(used-defined) or 'none')
d=set(re.findall(r'^\s*(--[a-z0-9-]+):',tokens,re.M))
r=set(re.findall(r'var\((--[a-z0-9-]+)',site+tokens+js))
print('unused token:', sorted(d-r) or 'none')
EOF
```

`--spot-nordson2` and `--spot-nordson3` are expected to report unused; they are
reserved for Nordson art that has not landed.

**Check narrow widths in an iframe.** Headless Chrome on macOS clamps windows to
500px and `--force-device-scale-factor` does not reduce the CSS viewport. Loading
the page in a fixed-width iframe does give media queries a genuine 390px.

---

## 8. State

| Piece | Component | Art |
|---|---|---|
| 1 West Elm | pager, ten registered pairs | **real** |
| 2 Nordson | Cordis reveal, filmstrip | placeholder |
| 3 Ascend | five-step stepper | **real** interfaces |
| 4 QR engine | live Codedesk embed | **live** |
| 5 The Ward | three-state pill | placeholder |
| 6 Picture Wrap | live site embed | **live** |
| Origin Provincetown | — | not built |

**Outstanding, needing Jacob:**

- Two Cordis images, 2000 × 1334, identical dimensions, machine cut at exactly
  x = 1000 — photograph carrying the left half with background running right,
  drawing carrying the right half with background running left. About 60 words
  per side, backgrounds quiet enough for type in both themes.
- How many photograph/illustration pairs exist for the Nordson filmstrip.
- Three Ward renders from one camera: slab only, composed, Ward only.
- Codedesk's startup preset pointing at `okqral.com` with an emoji-styled code —
  currently it boots a plain black-and-white one.
- Provincetown: flat scans of the guides, member map and Pride poster.

**Known and accepted:** collapsing to one page cost per-piece link previews. Any
share shows the site-level card. Thin share-only pages redirecting into anchors
would restore it if it matters.

**All copy is provisional** and expected to be rewritten.
