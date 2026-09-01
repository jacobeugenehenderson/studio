# jacobhenderson.studio

A one-page portfolio for Jacob Henderson — creative operations, systems design,
graphics production. Static HTML, CSS and a little JavaScript. No framework and
no bundler — but **one required step**: `tools/stamp.py` versions the stylesheet
and script links. See §7. Skipping it ships new markup against an old
stylesheet, which has already happened once.

Deployed from `main` to GitHub Pages (legacy source, branch + root), custom
domain in `CNAME`. Work happens on `rebuild`; `main` is fast-forwarded from it
to publish, so the two are the same commit whenever the site is current.

**The rebuild went live 1 Aug 2026.** Every placeholder is now gone — the last
was Nordson's filmstrip, removed with the piece's rebuild on 31 Aug. The site
still frames The Ward from that product's *staging* build; see `docs/handoff.md`
for why that is deliberate and what has to happen before it points at prod.

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
tools, each publishing one canonical artifact, composed by a runtime. Ten
pieces demonstrate it at different scales — **eight numbered, two in Curios**.
▶ `grep -c '<article class="piece' index.html`.

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
assets/pbg/             Provincetown covers, likewise
assets/pbg/full/        the publications themselves — 7 PDFs + the poster, 60 MB
tools/build-images.py   _source → assets
tools/stamp.py          content-hashes the css/js links — run before every push
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
4. **No `!important`.** If specificity is fighting, name the parts better.
5. **Both themes, always.** Light is the sheet, dark is the plate. Style through
   tokens and both come free. The viewer's toggle must beat the OS preference in
   both directions, which is why every theme block is declared explicitly.
6. **Numbering must carry information.** `Fig. 1`, `01 ArtStart`, `1 / 10` are
   sequences a reader needs. Do not number things for decoration.
7. **Placeholders are labelled and obvious.** Grey slugs saying what belongs
   there. Never a plausible-looking fake. There are none on the page today.
8. **Above the artifact: a title and a one-sentence claim. Nothing else.** Then
   the thing itself, then the visit link where there is one, then everything
   else below. All ten pieces obey this. Prose above the artifact delays the
   only thing that proves the claim.
9. **A figure note carries a link or it does not exist.** `.figure-note` does one
   job — *where this lives* — and three qualify: the Ward to Lafayette Square,
   Picture Wrap to its site and Bluesky, Scale Machine to its app. Notes that
   merely described the picture were tried under ShowDesk, the QR engine and the
   West Elm pager and all three were cut: the prose above already said it, so the
   caption was a second, quieter voice repeating it. If the note you are about to
   write has no `href`, it is a sentence and belongs in the prose.

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
| **`.wipe`** | Two **registered** images of the same frame, where the point is seeing a difference *in place* — a plate against its composite, a machine photographed against the same machine drawn. Not for comparing two unrelated things. |
| **`.states` + `.pill`** | Three or more discrete views of one stack, where one of them is the whole frame at once. A wipe cannot express that: centre-composed and seam-follows-finger are geometrically incompatible. |
| **`.stepper`** | An ordered sequence. Every stage stays visible, nothing auto-advances. |
| **`.pager`** | Many variations of one argument. One at a time, buttons in the margins so paging is never confused with dragging, and a visible count so the extent is known. |
| **`.shelf`** | A **body of work**, where the extent is the argument — Provincetown's eight publications out of one database. All of it visible at once, which is exactly what `.pager` destroys by showing one at a time, and it is not a `.stepper` because it is not a sequence. Sized to a common **height**, so formats that differ come out narrower or wider rather than cropped. |
| **`.embed`** | Any live product. Preferred over a screenshot: it is the actual thing, and it cannot go stale. **Four embeds exist today** — Codedesk, Picture Wrap, The Ward and Scale Machine. This row has now been wrong three times and revised a fourth: first claiming renders-plus-a-link, then claiming all three embedded while only two were, then claiming the iframe count was 2 because a launcher injected The Ward's frame — true for about an hour, until the launcher was removed; then it was 3 for a week, until Scale Machine landed. **Count, do not trust:** `grep -c "iframe src=" index.html` → 4, `grep -c 'class="embed[ "]' index.html` → 4. Both were run, not assumed. Line numbers are deliberately not given here; they move. |
| **`.pill` driving an `.embed`** | When a piece both switches views *and* embeds the product, one control must do both, or the diagram contradicts the thing beside it. On The Ward the pill chooses which **payload** the running product shows. See *An embed can be more than one payload* below. |
| **`.shot`** | A still of a product, when the product **cannot be framed**. ShowDesk runs off a USB stick against a folder of a client's video, so there is nothing to point an iframe at. Always second-best to `.embed`, which cannot go stale — reach for it only when there is no URL. Must **not** be combined with `.graph`: it sets `background` as a shorthand and would eat the grid, exactly as `.embed` did (§6). |
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

**A deep-link parameter is the product's front door, not reaching in.** Scale
Machine framed opens on a *Select Tuning* modal — the whole app behind a
dropdown, no notation visible, which is Codedesk's setup ceremony in a different
costume. The fix was not to touch the frame but to use the parameter the product
already publishes: `scales.app.js` states its own precedence as **URL >
localStorage > tuning overlay**, so `?tuning=bb` lands on B♭ with the grid
engraved. Codedesk's `?mode=embed` is the same move. The test for whether this is
legitimate: would a link someone pasted in a chat do the same thing? If yes it is
the product's API; if it needs the page to script the frame, it is not.

⚠ **It writes through.** `?tuning=` also sets the product's `localStorage`, so a
visitor who only ever met Scale Machine here has B♭ chosen for them on their next
real visit and never sees its onboarding. Harmless but not free, and the clean fix
is product-side — don't persist the param when framed.

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

### The Ward is told where it sits on this page

A framed document's `IntersectionObserver` measures against its **own** viewport,
and cross-origin it can see nothing of ours — so The Ward cannot tell that it is
two screens below whatever is being read. It renders at full rate the whole time
regardless, and on a page of ten pieces with four live embeds that is most of the
visit.

So this page watches and reports, and the product decides:

```js
{ type: 'ward-perf', presence: 'active' | 'idle' }   // at half visibility
```

The throttle itself lives in the product (`src/lib/framedPresence.js`,
`ls/FEATURES.md §Embedded`) so **every** installation inherits it rather than
just this page. An embed must not fork the thing it embeds. theward.online sends
the same message from its own hero frame; the contract is the product's, and
neither site owns it.

⛔ **Idle is a lower frame rate and never a pause.** Going quiet is precisely
what makes Chrome drop the WebGL surface, which is the 5–12 second stall in §6
arrived at from the other direction. Nothing here may ever send a stop.

**Silence means full rate.** A browser with no observer sends nothing and gets
the product at its own speed, which is the safe way round.

Verified 23 Aug 2026 by scrolling the real page: `idle → active → idle`, three
transitions, no chatter. ⚠ **An `IntersectionObserver` does not deliver in a tab
that is not being painted** — the first run of that test recorded nothing at all,
and a freshly-attached probe observer recorded nothing either, which is what
proved it was the tab rather than the code. Force a paint before believing an
observer never fired.

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
| Picture Wrap (`~/Desktop/dev.nosync/picture-wrap`) | **live** — tracked, deployed, byte-identical to canonical, and served from `picture-wrap.com` at its `index.html:85`. Was untracked and undeployed for one session; confirmed done 1 Aug 2026 with `curl -s https://picture-wrap.com \| grep -c embed-height` → `1`. |
| Scale Machine (`~/Desktop/dev.nosync/scalemachine`) | **needed, not yet done.** The grid grows — twelve staves, a listen panel that opens, a song field — so a fixed frame is wrong here in the way it is right for The Ward. Until the snippet lands the frame keeps its CSS ratio, which is the documented fallback and looks deliberate. Check: `curl -s https://scalemachine.app \| grep -c embed-height` → `0` today. |
| The Ward | **not needed, deliberately.** Embedded from `lafayette-square.com` and carrying no snippet. Self-sizing is for apps whose height is content; The Ward is a landscape you look *across*, so a fixed aspect is the right frame and a reported height would only stretch the horizon. The frame keeps its CSS ratio — 16/10, and 4/3 on a phone so the horizon survives. |

The embeds point at live URLs, not local copies, so a product is only as current
as its last deploy. Codedesk publishes from
`github.com/jacobeugenehenderson/codedesk`; Picture Wrap from `picture-wrap.com`;
The Ward, for now, from its staging Pages build rather than prod — see the
handoff for why that is deliberate.

**Caching will lie to you.** The embedded scripts carry `?v=` strings, so a
browser holding an old copy keeps showing the previous build long after the
deploy has landed. Hard-reload before believing a regression — one was reported
today that had already been fixed and shipped.

---

## 6. Traps already fallen into

Each of these was a real bug, and each is **cheap to reintroduce and invisible
when it happens** — that is the bar, not "it went wrong once."

A bug you caught by looking at the page does not belong here; it belongs in a
comment at the line where someone would make it again. This list is read in full
at the start of every session, so a weak entry costs every future session a
little and makes the strong ones harder to find. Two were added on 10 Aug and
removed the same day for exactly that reason. **Prefer deleting an entry to
adding one.**

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
- **A clipped carousel still reports its full width, and one piece can size the
  whole page.** Ascend's stepper is five panels at `flex: 0 0 100%`. They cannot
  shrink, so each contributes its own content width and the track's min-content
  was all five side by side — 738px. `overflow: hidden` hid that on screen
  without changing the number. `main.pieces` sizes its column from the widest
  item's min-content, so that one piece set the width of all seven and every
  piece overflowed a phone; the document measured 761 in a 390 viewport, and it
  shipped that way. The fix is `contain: inline-size` on the clipping viewport —
  the honest statement that this box's width does not depend on its contents.
  **`min-width: 0` on the panels does not work**: with `flex-shrink: 0` an item
  contributes its flex base size whatever its floor is. Two lessons, and the
  second is the general one: **`overflow: hidden` hides the symptom, not the
  measurement**, and in a grid of siblings the worst-behaved one silently sets
  the terms for the rest. Measure `article.piece` at `width: min-content`, not
  the layout you can see.
- **Type over fixed art cannot use `var(--ink)`.** Every colour here flips with
  the theme because it sits on the page. A photograph does not flip, so on the
  plate the Nordson copy put pale ink on the artwork's pale field and the
  writing vanished — while reading perfectly in Paper, which is how it would
  have shipped. Type over art uses `--ink-on-art` / `--ink-on-art-soft`,
  declared once in `:root` and deliberately absent from both theme blocks. The
  general form: **if the thing behind it does not know the theme changed, the
  ink in front of it must not either.** Check a piece in *both* grounds the
  moment real art lands on it.
- **Art can move the writing space out from under the copy.** The Cordis art
  arrived centred, spanning 28.4%–71.4% of the frame and 3%–97% of its height —
  where the wireframe it replaced had filled one whole half and left the other
  clear. Wide, that was free: the copy narrowed from 38% to 22% and sits in the
  real clear field. Narrow, the copy is a band across the foot, and there is no
  longer any foot to sit in, so it needs `--paper-on-art` behind it. Measure the
  art before trusting a layout written against its placeholder.
- **A `background` shorthand later in the file silently disarms a utility
  class.** `.graph` (§10, graph paper) paints its grid with `background-image`;
  `.embed` (§14, the shot) sets `background:` as a *shorthand*, which resets
  `background-image` to `none`.
  Put both on one element and the grid vanishes with no error, no override
  warning, and nothing wrong-looking in either rule — the later shorthand simply
  ate a longhand it never mentions. This is the same shape as the undefined-token
  trap: the losing declaration is invisible at the point of failure. Utilities
  and components must not both touch `background`; the graph paper now goes on
  the launcher *inside* the frame for exactly this reason.
- **Deleting a CSS section takes live rules out with it, and the class audit
  cannot see it.** Removing §10 (the credit line) on 31 Aug also removed
  `.figure-note`'s style block, which happened to sit inside it. The audit passed
  anyway: a class counts as *defined* while its name survives in **any** other
  selector, and `.figure-note` still appeared in two. The page rendered the
  caption unstyled — `text-align: start`, upright, at prose size — and nothing
  reported anything. Only measuring computed style caught it. After deleting a
  section, measure something it used to style.
- **Renumbering sections breaks references that nothing checks.** The same
  deletion shifted every heading from 10 up by one and left six citations
  pointing at the wrong section: graph paper cited as §11 twice, the shelf as
  §20, curios as §21. Two more pointed nowhere even before that. References now
  carry the section **name** as well as the number, so the next renumbering
  leaves a citation that is merely redundant rather than false, and the audit
  walks every `§N` in `site.css` and fails on one past the section count.
- **A positional anchor into a whole document is the wrong instrument when the
  same phrase appears twice.** `s.index('<p class="credit">Live at <strong>')`
  matched Picture Wrap's credit line instead of the intended one, and the
  replacement deleted everything to the end of the file — two whole pieces.
  Recovered with `git checkout`. Edit by extracting the article first, or with a
  tokenizer that walks top-level children; never `.index()` into the whole page.
- **A QR code cannot be reviewed by looking at it.** Decode it before publishing.
  Chrome has `BarcodeDetector` built in, which is enough:
  `new BarcodeDetector({formats:['qr_code']}).detect(await createImageBitmap(blob))`.
  Ink contrast is worth measuring too — a second colour at 4.3:1 against the
  ground narrowed one code's readable range from 78–960px to 104–312px.

---

## 7. Working on it

⚠ **Screenshots go through `_source/`, not straight into `assets/`.** The five
Ascend interface stills are committed as full-size PNGs — **15 MB between them**
— because they predate the tool. ShowDesk's does not: 3.1 MB source, 123 KB
served, indistinguishable at the size it renders (checked by zooming the clip
list 2x — no artefacts on UI text at 1600/q80). The five legacy PNGs should come
through `build_showdesk()`'s path eventually.

**Stamp the assets before every push that touches `css/` or `js/`:**

```
python3 tools/stamp.py            # rewrites the links with a content hash
python3 tools/stamp.py --check    # exits non-zero if a stamp is stale
```

⛔ **This is not optional and nothing else catches it.** jacobhenderson.studio
sits behind Cloudflare, which caches `index.html` as DYNAMIC at max-age 600 —
effectively always fresh — while caching `css/` and `js/` at the edge for
**max-age 14400, four hours**. A push therefore ships new markup against the
*previous* stylesheet, and any rule introduced alongside its markup does not
exist for that window. On 31 Aug the site went live with unstyled captions:
`.figure-note` was in the HTML and absent from the CSS the browser received.
Every check passed, because the origin was correct the whole time and only the
edge copy was old.

The version is a hash of the file's own contents, so it changes exactly when the
file changes and never otherwise — an unchanged asset keeps its cache hit, a
changed one is a URL the edge has never seen.

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
# EVERY declaration, not just the first on its line: the spacing scale is
# declared several per line, and an anchored regex saw one of each four.
tok=re.sub(r'/\*.*?\*/','',tokens,flags=re.S)
d=set(re.findall(r'(--[a-z0-9-]+)\s*:',tok))
r=set(re.findall(r'var\((--[a-z0-9-]+)',site+tokens+js))
print('unused token:', sorted(d-r) or 'none')
# The other half, and the expensive half — a token REACHED and never declared.
# An undefined custom property does not fall through; it wins on specificity and
# then evaporates at computed-value time, so the rule that beat everything paints
# nothing. No error, nothing wrong-looking in either rule. It rendered every
# control in Codedesk square. A var() WITH a fallback is safe by construction.
seeded=set(re.findall(r"setProperty\('(--[a-z0-9-]+)",js))
local=set(re.findall(r'(--[a-z0-9-]+)\s*:',code))
bare=set(re.findall(r'var\((--[a-z0-9-]+)\s*\)',site+tokens))
print('undef token :', sorted(bare-d-local-seeded) or 'none')
n=[int(m.group(1)) for m in re.finditer(r'^/\* (\d+) ── ',site,re.M)]
print('sections    :', 'ok' if n==list(range(1,len(n)+1)) else f'DRIFT {n}')
o,c=html.count('<!--'),html.count('-->')
print('comments    :', 'ok' if o==c else f'UNBALANCED {o} open / {c} close')
body=re.sub(r'<!--.*?-->','',html,flags=re.S)
VOID={'img','input','br','hr','meta','link','source','area','base','col'}
stack=[];bad=[]
for m in re.finditer(r'<(/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(/?)>',body):
    cl,nm,sf=m.group(1),m.group(2).lower(),m.group(3)
    if nm in VOID or sf: continue
    if not cl: stack.append(nm)
    elif stack and stack[-1]==nm: stack.pop()
    else: bad.append(nm)
print('tags        :', 'ok' if not stack and not bad else f'UNCLOSED {stack[:4]} MISMATCH {bad[:4]}')
EOF
```

The section check matters because the numbering *did* drift once: inserting
components mid-file produced `7g2`, `7i2` and two sections both numbered `7i`,
in the one file meant to be navigable. Sections are now a flat sequence and the
contents block at the top is generated from the headers rather than maintained
by hand — if you add a section, renumber and regenerate rather than appending a
letter.

**Tokens expected to report unused**, and why each is kept rather than deleted:

| Token | Why |
|---|---|
| `--spot-nordson3` | Reserved Nordson gold, for art that has not landed. `--spot-nordson2` was reserved the same way and is now ShowDesk's ink. |
| `--ink-on-art`, `--ink-on-art-soft`, `--paper-on-art` | These went unused when `.reveal` was deleted on 17 Aug 2026, and they are the *fix for a documented trap* (§6: type over fixed art cannot use `var(--ink)`). Piece 1's incoming line drawing is fixed art; the first caption laid on it needs these. Deleting them would delete the fix and keep only the warning. |
| `--s1`, `--s10` | The two ends of the spacing scale. A scale is a system, and a scale with a hole in it is worse than an unused step. |

Anything else reporting unused is drift, not a reservation.

⚠ **`--s10` only started reporting on 23 Aug 2026, and it had been unused all
along.** The declared-token regex was anchored to the start of a line, and the
spacing scale is declared four to a line — so it saw `--s1`, `--s5` and `--s9`
and was blind to the other seven. A check that silently covers less than it
claims is worse than no check, because its silence is read as a pass. **When a
check reports clean, ask what it can see** — here, `len(d)` was 61 against 68
tokens actually declared.

⚠ **`undef token` was added 23 Aug 2026, and it is the more expensive half of
the token check.** `unused token` finds a token declared and never reached —
untidiness. This finds one **reached and never declared**, which is a silent
bug: an undefined custom property does not fall through, it wins on
specificity and then evaporates at computed-value time, so the declaration
that beat everything paints nothing. No error, nothing wrong-looking in
either rule. It rendered every control in Codedesk square, and it caught
`--vig-rim-accent` on theward.online while that audit reported clean. A
`var()` **with** a fallback is safe by construction and is deliberately not
flagged — the fallback is the author saying what happens when the token is
absent. The same check is `undefined token` in `theward-online/tools/audit.py`.

⚠ **The markup checks were added 17 Aug 2026, after a broken page passed the
audit clean.** An edit dropped one `-->`, so the rest of the document was
swallowed into a comment and the div nesting came apart — the page rendered
without its header. Nothing reported it: the audit read classes and tokens, both
of which were still perfectly consistent. A structural break is invisible to a
semantic check, so both are run now. Expected: `ok` and `ok`.

**Check narrow widths in an iframe.** Headless Chrome on macOS clamps windows to
500px and `--force-device-scale-factor` does not reduce the CSS viewport. Loading
the page in a fixed-width iframe does give media queries a genuine 390px.

---

## 8. State

| Piece | Component | Art |
|---|---|---|
| 1 Ascend Visualization Studio | Cordis **wipe** + follow copy, `.more` for the Studio | **real** — whole photograph against whole drawing; the trade advertisement sits beside the Studio text in `.shot-aside` |
| 2 Ascend Toolkit | five-step stepper | **real** interfaces |
| 3 ShowDesk | **`.shot`** of the Show Builder | **real** — 1600px derivative, 123 KB |
| 4 The QR Engine | live Codedesk embed | **live** |
| 5 The Ward | three-state pill **+ live embed**, `.more` for the neighbourhood | **live**, all real |
| 6 WLVX | `.shot` of the product cover, `.more` for how it worked | **real** — 2021 marketing cover, 177 KB. Copy is Jacob's own. ⛔ The 19-page pitch deck on `/Volumes/2021` is NOT a source — fundraising material, and he called it filler. **Check Vimeo**: if the demo videos survive, this becomes a live embed. |
| 7 West Elm | pager, ten registered pairs, `.more` for the on-set account | **real**. Per-pair captions are gone — the pager already counts `1 / 10` beneath itself, so `Pair 1 · 01` was the same fact twice. Alt text is unaffected and still reachable from the `Alt` badge. |
| 8 Provincetown | rail + claim + **the shelf** + `.more` | **real** — eight covers, 2018–2020, each linking to the publication itself. Titled **Provincetown**; the Guild is named in the rail. |
| Curio Picture Wrap | live site embed, `.more` for methods and sources | **live**, and self-sizing — snippet deployed |
| Curio Scale Machine | live app embed, `.more` for what is coming | **live**, framed at `?tuning=bb`; not self-sizing yet |

**Piece 1 became Ascend Visualization Studio on 31 Aug 2026.** It was titled
after the client and claimed nothing about the work — *"A global industrial
manufacturer with dozens of product lines and brands."* It now names the thing
Jacob built. The full name is what ShowDesk's own footer reads, and that footer
is legible in the screenshot two pieces down, so the page and the product had
been disagreeing about the name in a way a reader could catch.

**Ascend is the Studio plus the Toolkit.** The Studio is the canonical library;
the Toolkit is the tools around it — ArtStart, CopyDesk, CodeDesk, FileRoom, The
Portal. The Toolkit moved from 3 to 2 on 31 Aug because ShowDesk and the QR
Engine are both tools *in* it and both appeared before it: the page was
introducing an instance ahead of the thing it instantiates. Bare "Ascend" inside
piece 2 now reads as the umbrella over the pair, which is what those sentences
mean.

⚠ **The Toolkit is 2025–2026, inside the Studio's 2022–present.** It read
`2022–present` — the Studio's span, inherited from when this piece was the whole
Nordson engagement — while its own contents are dated 2026 and 2025–2026. A
parent cannot predate its children.

⛔ **The layer pill is deliberately not named the way theward.online names it.**
Same three payloads, two vocabularies: here **Slab · Composite · Ward**, there
**Place · Both · People**. Plain English serves a neighbour deciding whether they
want one; the architecture serves a portfolio reader, because naming the parts
and separating them by contract is most of what that control demonstrates.
Checked 31 Aug against every other Ward claim on both sites — nothing else
diverges. Do not "fix" this.

**Provincetown is 8, since 31 Aug 2026.** It ranked `00` on the theory that it
sat *before* the numbered sequence. The client work is one unbroken run, 1 to 8,
with the curios outside it. The comment that justified the `00` was doubly wrong
— it said the spine ran "00 to 6" when the page had shown 1 to 7 for some time.
Do not reintroduce a rank that is not a number.

**Order is an argument, reordered 16 Aug 2026.** It used to open on West Elm,
because the old thesis was *compositing* and West Elm is the most literal
illustration of it. That paragraph is gone. West Elm is also the only piece here
where Jacob was hired hands — *Retoucher, compositor, booked through Industrial
Color* — so it opened a creative leader's portfolio on a work-for-hire credit.
It now sits at 7.

**Curios, added 16 Aug 2026.** Picture Wrap and Scale Machine left the numbered
sequence. Both were justified by the OLD thesis — Scale Machine's disclosure
still opens *"transposition is compositing"* — and when that paragraph went,
a film-credits database and a trumpet app stopped arguing anything the new
thesis claims. They are not cut: they are two of the four live embeds, and they
are evidence the tools claim is not secondhand. `CURIOS` is Jacob's own repo
(*"web projects and experiments"*) and Scale Machine already lived in it, so
the section reflects how the work is filed rather than tidying after the fact.
They rank **Curio**, which is a category rather than a position: the numbered
spine is client work 1–8 and the curios sit outside it.

**`.reveal` was deleted 17 Aug 2026**, with §13 of `site.css` and eleven
sections renumbered behind it. It existed for one piece of art: a Cordis pair
cut at x=1000 so each file held half a drawing and half a photograph, differing
only in which side the pale ground fell on — which gave each wipe layer an empty
half to write copy into. Jacob replaced that art with **whole** pictures, so
there is no empty half, and copy inside the layers could only land on the
machine. The copy moved below the frame and the component had nothing left to
do. If the mechanism is ever wanted again it is in this commit's history; do not
rebuild it from the description.

**Curios sits after Provincetown**, as an appendix — the numbered spine ends at
Provincetown and these are the odds and ends.

⚠ **There is no video on this site, and one was tried.** The old WordPress
site's `Curios_Cover_Video.mp4` was placed as the section cover for one session
and cut, for four reasons worth not rediscovering. It is **soft at any weight
the page can afford** — and not because of the encode: the SOURCE is 1080p at
3 Mbps, so 1280w/CRF 28 is 728 KB and *sharp* starts at 3 MB, which is four
times the rest of the page for decoration. The wordmark is burned in **in the
old site's typeface**, not Helvetica Neue. It **does not loop** — frame 300
differs from frame 0 by ~5% mean with the word mid-drift. And it is tonally
severe against uncoated stock. All four extracted covers (Curios, Work,
Interactive Media, Project Management) are kept in `_source/curios/` because
getting them again means reading `/Volumes/Today`. Placing one back means
`build_curios()` in `tools/build-images.py`, which was removed with it — it is
in the git history of this commit.

Pieces **1–4 are all Nordson Industrial Coating Solutions** and that is
deliberate: the library, the tools around it, and two of those tools given their
own entries. Half the client work is one client, and until 31 Aug the page never
said what that client was — every occurrence of the word was a repeated `<dd>` in
a metadata rail or a sentence behind a closed disclosure. *"Nordson makes complex
engineered products for markets around the world"* now opens piece 1's visible
prose. ⚠ Still unsaid: that these are **one four-year Fortune 500 engagement**
rather than four separate credits, which is the strongest fact on the site.

**Outstanding, needing Jacob:**

- Codedesk's startup code is emoji-styled. It encodes `www.okQRal.com` and is
  captioned, but the modules are still plain black-and-white squares, so the
  claim above the frame — *pick an emoji and it becomes the code's palette* — is
  the one thing on that piece a visitor cannot see happening. **Next session.**
- Scale Machine, two things, both product-side and neither blocking the piece:
  `docs/embed-height.js` is not in that repo, so the frame is a fixed ratio while
  the grid grows; and its own `LEDGER.md` job 6 calls the mobile layout *"already
  too cramped to read"* with `overflow-x` now on each `.staff-row`, so on a phone
  the frame scrolls sideways inside itself. The page survives this — the piece's
  min-content is 128px, tied narrowest — but it is the weakest thing about the
  embed.
- Provincetown's `.more` (*In print*) now says the listings became the spine of
  the publications, but the member-and-asset database that produced all eight is
  still undescribed anywhere on disk. Needs Jacob rather than a session.
- Two open judgement calls from 31 Aug, both deliberate, neither wrong:
  "Ascend Toolkit" is named nowhere in piece 1, so the Studio → Toolkit relation
  rests on adjacency and the claim's *"and the tools"*; and
  `[data-wipe-follow] > .prose` carries a top hairline, now the only ruled
  `.prose` on the page — right when Nordson was the only piece with copy under
  its picture, ambiguous since seven pieces gained that arrangement.

**Known and accepted:** collapsing to one page cost per-piece link previews. Any
share shows the site-level card. Thin share-only pages redirecting into anchors
would restore it if it matters.

**All copy is provisional** and expected to be rewritten.
