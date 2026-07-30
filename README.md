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

`COLOPHON.md` records how the thing was made and indexes every other document.

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
COLOPHON.md             how it was made; index of every document
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
| **`.embed`** | Any live product. Preferred over a screenshot: it is the actual thing, and it cannot go stale. **Three embeds exist today** — Codedesk, Picture Wrap and The Ward. This row has now been wrong three times: first claiming renders-plus-a-link, then claiming all three embedded while only two were, then claiming the iframe count was 2 because a launcher injected The Ward's frame — true for about an hour, until the launcher was removed. **Count, do not trust:** `grep -c "iframe src=" index.html` → 3, `grep -c 'class="embed[ "]' index.html` → 3. Line numbers are deliberately not given here; they move. |
| **`.pill` driving an `.embed`** | When a piece both switches views *and* embeds the product, one control must do both, or the diagram contradicts the thing beside it. On The Ward the pill chooses which **payload** the running product shows. See *An embed can be more than one payload* below. |
| **`.more`** | Depth. **Collapsed is a preview, never a closed door** — the picture and the claim stay out, and expanding only adds reading. |

---

### An embedded product is allowed to be a different product

An embed is seen by someone who did not come for the tool, has not signed in,
and will give it ten seconds. Codedesk framed is the worked example: no header,
no setup step, one content drawer open on a finished code. Its normal build
still opens on a filename prompt with every drawer locked, because there it is
about to write a file to Drive and the name matters.

The distinction that keeps this honest is **hide, do not strip**. Every QR type
is still there, the tracking parameters are one disclosure away, and nothing is
deleted — so the claim above the frame ("Change anything") stays true. A cut-down
build would make the page lie.

Do it in the product, behind its own flag, not from the embedding page. The
site cannot reach into a frame, and should not want to: the product knows what
it looks like with nothing to save.

### An embed can be more than one payload

The Ward is the deepest of the three, and the pattern generalises: **when a
product is built out of separable parts, embed the parts, not the front door.**

The first version framed `lafayette-square.com` — the composed thing — under a
pill that claimed the slab and the commons come apart. It asserted the
separation instead of showing it, which is the same fault as Codedesk's emoji
claim: the one thing a piece argues is the one thing the visitor cannot watch
happen. It was rebuilt.

Now the pill *is* the frame's switcher, and each state loads a different
payload from the product's own address:

| State | URL | What it is |
|---|---|---|
| Slab | `?layer=slab` | the baked environment — ground, buildings, trees, lamps, sky. No Player. |
| Composite | *(no param)* | both, exactly as the public gets it |
| Ward | `?layer=player` | the commons — ticker, Almanac, Bulletin, Society — on a sheet, no slab |

`SLAB-CONTRACT.md` in that repo has always said the slab and the reader are
separate payloads that never import each other. Embedding them separately is
the first time anything outside that repo has taken the claim at its word.

**Four rules this piece paid for:**

1. **One demo area.** A wireframe of three stacked layers stood above the frame
   while this was being specified. Once the live thing existed the diagram could
   only disagree with it, so it went. Never a placeholder beside the working
   version of the same thing.
2. **Switch by message, never by reloading.** Changing the frame's `src` rebuilds
   the product's WebGL context and resets its camera, and then three layers are
   three unrelated pictures rather than one stack having its ground taken away.
   `js/site.js` posts to the running app and it swaps in place.
3. **Use the product's own loading screen.** The Ward has one — a radial horizon
   with stars. An invented placeholder card is one more thing to keep true, and
   it is not what the product looks like.
4. **The sheet is always there.** `.graph` was originally put on the frame so the
   slab covered it and removing the slab revealed it. That reading was right and
   the mechanism was wrong — see §6 — so the sheet now lives inside the product,
   which is also what lets it follow this page's Paper/Plate switch. The
   argument survived; the implementation did not.

**Previewing it.** `data-embed-base` carries the deployed origin;
`data-embed-base-local` is used instead when this page is served from
localhost, so a change to the product can be seen here without deploying it
first. Same carve-out, for the same reason, that `trustedOrigin` makes for
height messages — and equally impossible in production, where the hostname test
fails. It needs the product's dev server running; if it is not, the frame fails
to load, which beats silently showing a stale deploy.

## 5b. Embedded products size themselves

An iframe has a fixed height; these apps do not — action up top, menus folding
out below. Any height chosen from the embedding page is wrong twice: dead space
when collapsed, clipped or nested-scrolling when expanded. Only the app knows how
tall it currently is, so the app says so.

**Product side.** `docs/embed-height.js`, pasted verbatim into each product and
loaded last. It does nothing when the page is not framed, so it is safe to ship
unconditionally. It reports `document.documentElement.scrollHeight` on a
`ResizeObserver`, coalesced into one animation frame, and ignores changes under
two pixels so jitter cannot ping the parent forever.

**Site side.** A `message` listener in `js/site.js`. It trusts only known
origins — otherwise any framed page could resize itself at will — and clamps the
result between 420 and 1200px, because a product reporting 20,000px would
otherwise take over the page. Until a message arrives the frame keeps its CSS
aspect ratio, so a product that has not adopted the snippet still looks
deliberate.

Do not fork the snippet. It is the same file in every product.

| Product | Snippet |
|---|---|
| Codedesk (`~/Desktop/dev.nosync/codedesk`) | **live** — committed, deployed, and confirmed reporting height from the deployed URL |
| Picture Wrap (`~/Desktop/dev.nosync/picture-wrap`) | **added, untracked, not deployed.** Loaded at its `index.html:85` and byte-identical to canonical, but `picture-wrap.com` serves no copy of it — so the site's frame still falls back to its CSS aspect ratio. Commit and deploy. |
| The Ward | **not needed, deliberately.** Embedded from `lafayette-square.com` and carrying no snippet. Self-sizing is for apps whose height is content; The Ward is a landscape you look *across*, so a fixed aspect is the right frame and a reported height would only stretch the horizon. The frame keeps its CSS ratio — 16/10, and 4/3 on a phone so the horizon survives. |

The embeds point at live URLs, not local copies, so a product is only as current
as its last deploy. Codedesk publishes from
`github.com/jacobeugenehenderson/codedesk`; Picture Wrap still needs deploying.

**Caching will lie to you.** The embedded scripts carry `?v=` strings, so a
browser holding an old copy keeps showing the previous build long after the
deploy has landed. Hard-reload before believing a regression — one was reported
today that had already been fixed and shipped.

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
- **Never make a live canvas invisible — hiding it costs seconds to undo.**
  The Ward's embed shows the commons without the slab. Every obvious way to do
  that — `visibility: hidden`, `display: none`, `opacity: 0`, even a fully
  opaque cover over it — makes Chrome drop the WebGL surface, and restoring
  context, shaders and textures lands as **one blocked frame of 5–12 seconds**.
  Jacob reported it as "it feels like it's crashing," and it is not a dev-build
  artifact: production stalled 8.2s. A *fully occluded* canvas is culled exactly
  like a hidden one, which is the part that surprises. The fix is to leave it
  rendering and cover it at `opacity: 0.95` — the last 5% is what keeps it
  composited. The general rule: **an expensive live thing must keep costing what
  it costs, or you pay the whole start-up again.** Full measurements in that
  repo's `ls/ARCHITECTURE.md §7`.
- **A `background` shorthand later in the file silently disarms a utility
  class.** `.graph` (§11) paints its grid with `background-image`; `.embed` (§18)
  sets `background:` as a *shorthand*, which resets `background-image` to `none`.
  Put both on one element and the grid vanishes with no error, no override
  warning, and nothing wrong-looking in either rule — the later shorthand simply
  ate a longhand it never mentions. This is the same shape as the undefined-token
  trap: the losing declaration is invisible at the point of failure. Utilities
  and components must not both touch `background`; the graph paper now goes on
  the launcher *inside* the frame for exactly this reason.

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
n=[int(m.group(1)) for m in re.finditer(r'^/\* (\d+) ── ',site,re.M)]
print('sections    :', 'ok' if n==list(range(1,len(n)+1)) else f'DRIFT {n}')
EOF
```

The section check matters because the numbering *did* drift once: inserting
components mid-file produced `7g2`, `7i2` and two sections both numbered `7i`,
in the one file meant to be navigable. Sections are now a flat sequence and the
contents block at the top is generated from the headers rather than maintained
by hand — if you add a section, renumber and regenerate rather than appending a
letter.

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
| 5 The Ward | three-state pill **+ live embed** | pill art still placeholder; the embed is **live** |
| 6 Picture Wrap | live site embed | **live**, but not yet self-sizing — snippet undeployed |
| Origin Provincetown | rail + claim, no interaction | placeholder — `article#pbg` at `index.html:914`, one labelled 4×3 slug awaiting scans |

**Outstanding, needing Jacob:**

- Two Cordis images, 2000 × 1334, identical dimensions, machine cut at exactly
  x = 1000 — photograph carrying the left half with background running right,
  drawing carrying the right half with background running left. About 60 words
  per side, backgrounds quiet enough for type in both themes.
- How many photograph/illustration pairs exist for the Nordson filmstrip.
- The Ward's pill art. The embed is live now, so the wireframe placeholder sits
  directly above a real render of the same neighbourhood, and the comparison is
  unkind to it. Two ways out: stills captured from the live Ward so the diagram
  is made of the thing itself, or the original intent — slab / composed /
  Ward-on-graph-paper as states you switch between *inside* the live product,
  which is Ward-side work. Jacob's call.
- Codedesk's startup code is emoji-styled. It encodes `www.okQRal.com` and is
  captioned, but the modules are still plain black-and-white squares, so the
  claim above the frame — *pick an emoji and it becomes the code's palette* — is
  the one thing on that piece a visitor cannot see happening. **Next session.**
- Provincetown: flat scans of the guides, member map and Pride poster.

**Known and accepted:** collapsing to one page cost per-piece link previews. Any
share shows the site-level card. Thin share-only pages redirecting into anchors
would restore it if it matters.

**All copy is provisional** and expected to be rewritten.
