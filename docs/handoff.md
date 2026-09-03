# Handoff

Picking up the rebuild of **jacobhenderson.studio** — a one-page portfolio.
Static HTML/CSS/JS, no framework, no bundler — but `tools/stamp.py` must run
before any push touching `css/` or `js/`. See README §7.

```
repo     ~/Desktop/dev.nosync/jacobhenderson-studio   (branch: rebuild)
         10 Aug 2026: the rebuild IS public. origin/main and origin/rebuild
         are the same commit, and jacobhenderson.studio serves it.
         The warning that stood here — "19 commits ahead, nothing public" —
         was true on 1 Aug and false by the 2nd; it survived a week because
         nobody re-ran its own check. Local `main` still sits behind at
         9eae70c; it is a strict ancestor and has simply never been fetched,
         which is bookkeeping, not a deploy problem.
         Check: curl the domain for `iframe src=` — 4 today, 0 would mean
         the rebuild has not landed.
serve    python3 -m http.server 8787 --bind 127.0.0.1
```

Everything the site needs now lives on internal disk:

```
~/Desktop/dev.nosync/
  jacobhenderson-studio/   the site
  codedesk/                Codedesk, extracted from ascend-portal with its
                           304 commits. Standalone: the portal's two
                           stylesheets are vendored, so nothing reaches for
                           /ascend-portal/ any more. 2.9 MB.
  ascend-portal-codedesk/  the old sparse clone it came out of. Superseded —
                           keep only until Codedesk is deployed from its new
                           home, then delete.
  picture-wrap/            whole product
  okQRal/                  whole product
~/Desktop/lafayette-square.nosync/    The Ward — 184 GB, do not copy
```

`docs/read-in.md` is the ten-minute start-of-session procedure — follow it first.
`COLOPHON.md` indexes every document in the project, including this one.

**Read `README.md` first.** It carries the argument the site makes, the rules, a
table of which component is right for which job, every bug already fallen into
with why each survived testing, and an audit script. Most of it exists because
getting it wrong cost a rebuild.

## Before you touch anything

- **`/Volumes/Today` is an exFAT external that unmounts mid-write**, three times
  in one session. Nothing the site needs depends on it any more, and it should
  stay that way. It still holds the Nordson library, the WordPress archive, and
  backups. **Copy off it before editing; never edit in place.**
- **All copy is provisional** and will be rewritten. Don't let it drive a
  decision.
- **Don't swap the title order.** *Creative Operations* leads as the practice,
  *Creative Director* carries the level. Deliberate.
- **Every piece is title → claim → artifact, then everything else.** Established
  31 Aug across all ten. Do not put prose above the artifact.
- **Stamp before pushing CSS or JS.** `python3 tools/stamp.py`. The edge caches
  assets for four hours and the HTML for ten minutes; skipping it has already
  published a page whose stylesheet did not know about its markup.
- **Fewer notes.** Jacob has asked twice for less annotation. Report a finding in
  the reply; commit it to a comment only if a future reader would otherwise
  repeat the mistake. Delete a stale note rather than appending a corrected one.

## Outstanding

0. **Curios has no cover, deliberately — do not put the video back.** The old
   site's loop was placed and cut within one session. Four reasons, in README
   §8; the one that settles it is that the *source* is 1080p at 3 Mbps, so it
   cannot be made sharp at any weight this page can carry. The four extracted
   covers stay in `_source/curios/` so `/Volumes/Today` need not be read again.
   Check: `grep -c '<video' index.html` — 0.


Every line below was checked against the code on 30 July 2026, not carried
forward from a previous note. Where a claim is checkable, how to check it is
written next to it. **Re-verify before trusting; do not just re-copy.**

1. **Codedesk presets — next session, and the agreed next task.** The embed
   opens on a code that is correct but plain: black-and-white squares. The claim
   printed above the frame is *pick an emoji and it becomes the code's palette*,
   and that is the one thing on the piece a visitor cannot currently see
   happening.

   **Do not build this from scratch.** okQRal already has the presets, the
   `applyPreset()` machinery and a `WELCOME` landing preset, and 20 of its 21
   control IDs match Codedesk's. See *"The QR engine's missing pieces live in
   okQRal"* below for line numbers. The right move is to port that, and to let
   the landing state come from `presets` rather than being seeded by hand from
   `qr_sync_pipeline.js` as it is now.

   While in there: the emoji picker works but renders dark on a light app, and
   Codedesk wires it twice. Both noted below.
2. **The Ward — embedded as three layers, 30 July 2026. Live on the site since
   2 Aug, pointing at PRODUCTION since 31 Aug.** The heading here read
   "NOT YET LIVE" until 10 Aug, which stopped being true the moment the rebuild
   published; what is not live is the *prod* Ward, not the embed.

   **One demo area.** The wireframe that stood above the embed is gone — it was
   the spec for the demo, and once the demo existed it could only disagree with
   it. The pill is now the embed's switcher.

   **It switches by `postMessage`, never by reloading.** Changing `src` rebuilt
   the product's WebGL context and reset its camera, which makes the three
   states three separate pictures instead of one stack having its ground taken
   away. Jacob caught this. `Scene` therefore stays MOUNTED for every layer —
   and, per the table below, is never hidden either. That also keeps
   `WeatherPoller` alive, so the Player's Almanac has a temperature.

   **The Ward state stands on graph paper — drawn INSIDE the product.** The
   sheet is `.embed-sheet` in the Ward's `src/index.css`, laid over the slab.
   The motif therefore now exists in two codebases; the Ward's copy carries
   Jacob's token values and follows the site's Paper/Plate switch, which the
   site sends as `ground` in the layer message (a cross-origin frame cannot
   read it).

   ⚠⚠ **Never hide the slab, and never fully cover it.** This cost most of a
   session. Measured on the dev build *and on production*:

   | What | While showing | Switching back |
   |---|---|---|
   | `visibility:hidden` / `display:none` / `opacity:0` | idle | **5–12s frozen frame** |
   | fully opaque cover | idle (occlusion-culled) | **5.6s** |
   | cover at `opacity: 0.95` (shipped) | renders normally | **~185ms — none** |
   | control: never switch | — | no stall ever |

   Chrome drops the WebGL surface the moment the canvas stops being visibly
   composited — hidden or *fully occluded*, it makes no difference — and
   restoring context, shaders and textures is one blocked frame of many
   seconds. Leaving a little of it composited is what keeps the switch instant.
   It ships at **0.95** — 0.98 also cleared the culling, but 5% is where the
   ghost reads as intent rather than a smudge. **Do not round
   `.embed-sheet`'s opacity up to 1**, and do not reintroduce
   `data-scene-pause` for this layer: pausing also idles it, and measured 4.4s.
   The slab costs what the composite costs, and that is the correct price.

   **Ward anchors** — `69dfaad2`, `c702fee4`, `e2b0ece0`, `7c10baee` on
   `curb-offset-draw`, in `src/App.jsx` and `src/index.css`, and lifted onto
   the `embed-layers` branch for deploy. **Framed-only, params and messages
   alike** — unframed, `?layer=` is ignored outright, so the public URL can
   never show half an app. The param seeds the initial layer; a `message`
   listener switches it live and carries `ground`. Absent a frame, nothing
   changes.

   ⚠ **Deliberately not `?ground`.** `Scene.jsx`'s `IS_GROUND` reads the URL
   independently and strips trees, buildings, lamps, arch and post-FX to leave
   bare ground. `?ground` is a ground-only diagnostic, **not the slab**. Do not
   merge the two, and do not "simplify" `layer=slab` into it.

   ⚠ **The Ward's repo holds more than one job.** `lafayette-square.nosync` is
   a single git repository containing several separate codebases — the LS
   runtime, cartograph, arborist, meteorologist — worked as **separate jobs
   that must not overlap**. On 30 July 2026 its trunk was 152 commits ahead of
   `origin`: 8 the embed work, 144 an unrelated extent / trees / intake / Łódź
   arc. A plain `git push origin curb-offset-draw` would have deployed that
   other job to staging as a side effect of shipping this one. **Do not.**

   The two do not touch: the embed commits change `src/App.jsx`,
   `src/index.css`, `src/components/SidePanel.jsx`, `src/hooks/useCamera.js`,
   `ls/ARCHITECTURE.md` and `ls/FEATURES.md`, and the other 144 touch **none**
   of those files. So the embed work lifts onto a branch of its own cleanly —
   which is how it should travel.

   **Live on staging; NOT on prod, deliberately.** The branch is
   `embed-layers` (`7600cb5a`, 9 commits, six files), deployed to staging by
   `workflow_dispatch` — `staging.yml` only auto-triggers on `curb-offset-draw`,
   so a side branch must be dispatched by hand. All three layers verified there.

   WARNING **Do not promote the embed on its own, and do not press Preview's
   Promote button for it.** Three things, all checked on 30 July 2026:

   - Promote fast-forwards `main` from the repo's **current branch** — which is
     whatever Jacob is working on, not the embed. Pressing it ships the other
     job to lafayette-square.com. Checked 1 Aug 2026: the checked-out branch
     there is now **`land-use-derivation`**, not `curb-offset-draw`. The
     specific branch name in this row goes stale constantly; read
     `git branch --show-current` in that repo rather than trusting it.
   - `main` is **1749 commits behind** the trunk as of 1 Aug 2026 — it was 358
     on 30 July, so the gap is *widening*, not closing. `embed-layers:main`
     remains a clean fast-forward, but it would now carry ~1758 commits to
     prod, all but 9 of them the other job.
   - Cherry-picking just the 9 onto `main` was tried and abandoned: prod's
     `App.jsx` has no `FeatureBoundary`, so the render block these commits edit
     is structurally different there. It is a hand-merge into a stale base
     producing a `main` in a shape neither branch has ever been — too much risk
     for a portfolio embed.

   **The embed rode along, and this is DONE as of 31 Aug 2026.** The extent /
   trees / intake work was promoted, `origin/main` and the trunk are the same
   commit, and prod's bundle carries the whole protocol — `ward-layer`,
   `ward-time`, `ward-perf`, `ward-place`, `embed-sheet`. The gate the old note
   named now passes: `git show origin/main:src/App.jsx | grep -c 'layer=slab'`
   → **2**, not 0.

   Both sites moved: `data-embed-base` in this repo's `index.html`, and
   `EMBED_URL` in `theward-online/js/site.js`. ⛔ Re-run that gate before ever
   pointing either back at staging.

   **`grep -c "iframe src=" index.html` → 4**, and `grep -c 'class="embed[ "]'
   index.html` → 4 with it. Both were run on 23 Aug 2026, not carried forward.

   ⚠ **This row said 3 and had said 3 since Scale Machine landed** — the count
   was right when written and wrong a commit later, for the fourth time. The
   README's §5 row was corrected to 4 and this one was not, so the two documents
   disagreed for a week with the check command printed in both. **Do not read
   the number; run the command.** And when you correct a count, grep the repo
   for the old one — a number lives in more places than you remember writing it.

   Jacob's in-flight work is untouched: the commit was scoped to one file and
   `BRIEF-polygon-asks-the-stamp.md`, both `design.json`s and the `.pre-reset`
   are all still dirty and unstaged, exactly as they were.

   ⭐ **THE PIECE WAS REWRITTEN 2026-08-31, and it is the one Jacob asked for.**
   The old body described the product's ARCHITECTURE — "two authoring tools pour
   into a slab", sections labelled *The slab* / *The Ward*, five `.more` panels of
   pipeline detail. It was the only piece on the page organised by its own parts
   rather than by a reader's questions, and the reader here is someone who hires
   or introduces creative directors. It now opens on a CREDIT — what Jacob
   conceived, designed, built, wrote and branded — which is what that reader needs
   and what Nordson's rail has always done with its `Scope` list.

   546 words → about 330; the piece was 19% of the page and is now nearer 11%.

   Order inside the demo block, and it moved five times before it settled:
   **frame → credit line → headline → pill → paragraph.** The pill was briefly
   between two paragraphs and stopped reading as a control on the frame; under a
   heading it reads as part of the block the heading names. The neighbourhood
   detail is behind a `.more` disclosure. ⛔ The constituent-tools table stays
   OUT of it — the sentence above ends in a colon aimed at the table, so hiding
   one without the other leaves the colon pointing at nothing.

   What went with it: `.layer-legend` and CSS **§12**, which only this piece used,
   with eleven sections renumbered behind it. The two-column legend was static
   under a three-way control, so it described two of three states and never the
   one a visitor lands on.


   ▶ Still open, all Jacob's: the table says **Surveyor**, but the code calls that
   surface *Survey* and it lives inside **Cartograph**, which the table omits while
   listing four of Cartograph's other rooms; "Universal Player" appears in no
   product doc; and the rail still reads `Role: Self-directed` and spells the
   neighbourhood "Highpointe Demun" where the product has `Hi-Pointe–DeMun`.
3. **The copy pass, 2026-08-31.** Jacob rewrote every piece from The Ward down in one sitting; the
   text is his, the structure follows the site's existing grammar. The pattern
   that emerged and should be kept: **claim → one visible paragraph → the picture
   or the live thing → a `.more` disclosure for the depth → a short closer.**

   | Piece | words before | after |
   |---|---|---|
   | The Ward | 546 | 332 |
   | Picture Wrap | 393 | 362 |
   | WLVX | 168 | 298 |
   | Provincetown | 99 | 228 |
   | West Elm | 409 | 195 |
   | Scale Machine | 451 | 215 |

   The subject changed, not just the prose. Every rewritten piece now opens on
   what Jacob did or what the thing is *for*, rather than on how it is built —
   the reader is someone who hires or introduces creative directors. Nordson's
   rail had always done this with its `Scope` credit list; the rest of the page
   had not.

   ⚠️ **The recurrence argument is now absent from the page.** Provincetown's
   "four years before anyone paid me to think this way", WLVX's "the tool-building
   did not start at Nordson", West Elm's "a photograph nobody took" and the Curios
   intro's "not secondhand" all went in this pass. Each cut was right on its own;
   together they retire an argument README §8 still describes as the page's
   biggest unclosed gap. Either the page should make it again or §8 should stop
   claiming it does.

4. **Scale Machine — added as piece 7, 10 Aug 2026.** Live embed of
   `scalemachine.app`, spot ink cyan (`--spot-scale`, from the app's own
   `--accent: #22d3ee`, deepened to a press ink so it does not collide with
   `--process-c` or Nordson blue). Article order is now
   `westelm > nordson > ascend > code > ward > picture > scale > pbg` — **stale
   as of 16 Aug 2026**, see README §8 for the current order and why it changed.
   Provincetown ranks `00` — it was `Origin` until 16 Aug 2026, see README §8. `index.html`'s thesis line went "six scales" → "seven".

   **The frame carries `?tuning=bb` and must keep it.** Without it the embed
   opens on a *Select Tuning* modal and a visitor sees no notation at all.
   That is the product's own documented parameter — `scales.app.js` §"Precedence:
   URL > localStorage > tuning overlay" — not the page reaching into the frame.
   It does write through to the product's `localStorage`; see README §5.

   Outstanding, both product-side: no `embed-height.js` in that repo, and its
   `LEDGER.md` job 6 calls the mobile layout "already too cramped to read."
4. **Provincetown — the shelf is in, 10 Aug 2026. The art was never missing.**

   Three previous notes recorded this as "waiting on flat scans." The scans
   existed the whole time, inside the 601 MB All-in-One WP Migration `.wpress`
   of the **old** jacobhenderson.studio WordPress site, at
   `/Volumes/Today/Jacob/wordpress-archive/`. `_source/archive/wpress.py` reads
   it; `list` walks headers only, and one `get` pass pulled everything, so the
   flaky drive was read once and never again. Originals now live in
   `_source/pbg` (gitignored).

   Eight covers in `assets/pbg` (1.4 MB), each linking to the publication in
   `assets/pbg/full/` — seven PDFs through Ghostscript `/ebook`, 150 MB → **60
   MB with real text kept**, plus the Pride poster as a JPG since a poster has
   no pages. **That 60 MB is committed and permanent in git history**; the page
   itself only loads the covers, so it is opt-in weight for a visitor.

   ⚠ **The filenames lie, and both were caught by rendering page 1.**
   `2020_Carnival_Cover.jpg` is the **2019** cover — 41st Carnival, August 2019
   — and there appears to have been no 2020 Carnival.
   `PBG_2019_Summer_Guide_Download.pdf` duplicates `PBG_Summer_Guide_2019.pdf`
   and was dropped. Anything else pulled from this archive: render it, do not
   trust what it is called.

   **This reverses a recorded decision** — the note here said "the quiet one by
   design — no interaction, and none wanted." A shelf of links keeps the spirit
   (nothing drags, animates or holds state), but it is a reversal rather than
   an oversight.

   Still open: the piece has **no `.more` case**, so it is now all *what it
   does* and none of *what it is* — the database that produced all eight. That
   is the obvious next thing and it needs Jacob, because nothing on disk
   describes how that database worked.
   Check: `grep -c '<article class="piece' index.html` — eight now, not seven.
5. **From Jacob:** how many photograph/illustration pairs exist for the Nordson
   filmstrip. The Cordis pair landed 1 Aug 2026 and is built — see below.

### The QR engine's missing pieces live in okQRal — stop hunting

Checked 30 July 2026 across Codedesk, okQRal and the ascend lineage. This has
cost time more than once, so it is written down with line numbers.

**`~/Desktop/dev.nosync/okQRal`** is the same engine with the data and the
polish that Codedesk shipped without.

**Presets.** Codedesk's `qr_type_manifest.json` has a `presets` key with an
empty array per type. That is not an unfinished feature — it is a stripped one.
Checked the earliest manifest in Codedesk's history: empty there too, so the
data was never in this lineage. okQRal has **18 presets** (`qr_type_manifest.json:321`),
and the machinery in `qr_app.js`:

| Piece | Line |
|---|---|
| `applyPreset(type, index)` — preset keys → control IDs, fires events, then `refreshModulesMode()` / `refreshCenter()` / `render()` | `qr_app.js:664` |
| `getPresets(type)` — case-insensitive lookup | `:548` |
| `setCaptionFromPreset()` — headline/body, falls back to the type name | `:738` |
| Preset cycling — per-type index, `preset_change` event | `:767–804` |

**20 of the 21 control IDs it writes to already exist in Codedesk.** The gap is
`bgTransparent`, and okQRal writes it *inverted*
(`setValAndFire('bgTransparent', !p.bgTransparent)`) — read that line, do not
copy it.

**`presets.WELCOME` is the landing state**, and it is deliberately *not* a type,
so it never appears in the type menu: caption "WELCOME" / "Click the 💖 to get
started", `modulesMode: Emoji` with 🟫, centre 🐿️ at scale 1.5. This is the
data-driven version of the welcome ceremony removed from Codedesk's embed, and
it is what `docs/okqral-cleanup-brief.md` meant by "the landing state must be
settled first". **That brief and the preset work are the same decision, not
two.**

**The emoji picker exists in Codedesk and works.** Verified against the deployed
embed: set Module Fill to Emoji, press *Pick…*, the modal opens and the CDN
`emoji-picker-element` appears. Both apps use the same shape — a hand-rolled
modal shell (`#emojiModal` / `#emojiGrid` / `#emojiSearch` / `#emojiClose`) with
a curated `EMOJI_BIG` catalog as the scaffold, which the CDN element then
*replaces* at runtime (`grid.replaceWith(picker)`). Codedesk has all of it:
shell in `index.html`, catalog and wiring in `qr_ui_toolkit.js:375`, plus a
second copy of the wiring in `index.html:449` — **two implementations of the
same thing, worth reconciling before editing either.**

**Its one real bug:** the picker renders dark on a light app. Both apps set
`picker.setAttribute('theme', …)`, and `theme` is **not** part of
`emoji-picker-element`'s API — it honours `prefers-color-scheme` unless you put
a `light` / `dark` **class** on the element or set its CSS custom properties.
Confirmed live: attribute reads `light`, OS prefers dark, picker renders dark.
The attribute is written and ignored. Fix it in both, or in the shared snippet
if one gets made.

**okQRal has uncommitted work** — `assets/love.html`, `love.jpg`, `love.png`
deleted and `styles/theme.css` modified, all unstaged. Codedesk still references
`assets/love.html`. Resolve that before working in okQRal.

### Done, so you do not go looking

- **The stepper no longer sets the width of the whole page.** Fixed 2 Aug 2026.
  Ascend's five panels are `flex: 0 0 100%` and could not shrink, so each
  contributed its own content width and the track's min-content was all five
  side by side — **738px**. `overflow: hidden` hid that on screen without
  changing the number, and because `main.pieces` sizes its column from the
  widest item's min-content, that one piece set the width of all seven: every
  piece overflowed a 390px viewport, the document measuring 761. It had been
  live.

  `.stepper-viewport` now carries `contain: inline-size`. Document 761 → 390,
  the grid column 738 → 342, Ascend's min-content 738 → 166; the other six were
  128–266 all along and are untouched. Desktop geometry is identical to the
  commit before — nav, viewport, panel and shot all measured the same on both.

  **`min-width: 0` on the panels does not fix this**, and was tried first: with
  `flex-shrink: 0` an item contributes its flex base size no matter what its
  floor is. It was removed again rather than left in looking useful.
  Check: measure `article.piece` at `width: min-content` in a 390px iframe.
- **The Cordis hero is a plain wipe, and the `.reveal` component is gone.**
  17 Aug 2026. Jacob replaced the art with a **whole photograph and a whole
  drawing** of the Cordis VT — same framing, both stamped from one PSD at 2x, so
  they register by construction. Drag to either end and you get one complete
  machine; the ends are captioned **Creative Direction** and **Creative
  Operations**, which is the piece's argument.

  ⚠ **Do not try to verify the registration by measuring edges.** It was tried
  and reported the machine 20px narrower in the drawing — because flat colour
  against blue gives a softer gradient than a photograph against grey. That
  measured edge CONTRAST, not position, and it was wrong.

  The pair builds at **2000px, not the file-wide 1600** (`NORDSON_W`): the source
  is a deliberate 2x stamp and the column tops out near 1000 CSS px.

  ⚠ This said "240 KB served" until 3 Sep 2026, describing what the builder
  *produces* rather than what was *committed*. Two of the three derivatives had
  been built before the cap and never regenerated, so the blueprint shipped at
  4000px / 2003 KB — the whole above-the-fold weight of the page, on the one
  image a visitor sees first. Rebuilt: 3534 KB → 515 KB, registration still
  dx +0 dy +0. **A derivative can be stale in a way nothing checks; the source
  and the builder both being right does not mean the committed file is.**

  What went with it: `.reveal`, `.reveal-copy` and site.css §13, plus eleven
  section renumbers. The old art (`Cordis-Spread-1/2`) held half a drawing and
  half a photograph in each file so the reveal had an empty half to write into.
  Whole pictures have no empty half, so the copy moved below the frame.

- **Picture Wrap self-sizes.** Confirmed 1 Aug 2026: `embed-height.js` is
  tracked in `~/Desktop/dev.nosync/picture-wrap`, byte-identical to
  `docs/embed-height.js`, and `picture-wrap.com` serves it at its
  `index.html:85`. This was outstanding for one session as "untracked, not
  deployed" and is now simply done.
  Check: `curl -s https://picture-wrap.com | grep -c embed-height` — `1`.
- **Codedesk is extracted, standalone and live.** Own public repo
  (`github.com/jacobeugenehenderson/codedesk`), Pages at
  `jacobeugenehenderson.github.io/codedesk/`, embedded at `index.html:630`.
  Framed it is a different product from the same code: no header, no filename
  ceremony, three rows — **Code** (URL + caption, UTM folded into *Advanced*),
  Design, Download PNG — opening on a code encoding `www.okQRal.com` captioned
  "Scan me". Normal use is untouched and still runs the ceremony.
- **Two app-wide Codedesk bugs**, neither embed-specific nor caused by the
  extraction: three `--shape-corner-*` tokens referenced but never declared, so
  every control rendered square; and a fixed control height that clipped the
  bottom of its own text. See Codedesk's README — the token one generalises.
- `~/Desktop/dev.nosync/ascend-portal-codedesk`, the old sparse clone, is
  superseded and can be deleted whenever.
- The portal's own copy of Codedesk is still live and now stale. **That is fine
  and deliberate** — ascend is a separate concern and nothing here points at it.

## Parked, with notes already written

`docs/okqral-cleanup-brief.md` — a behaviour-preserving vestigial pass on okQRal,
including findings from a first look. Sequencing matters: the landing state is a
design decision and must be settled *before* the cleanup, or a careful agent will
prove the welcome path live and preserve code that is about to be deleted.

**Partly settled now**, for Codedesk: the embed skips the filename ceremony and
lands on a finished code. But the ceremony is only *bypassed* there, not removed
— normal use still runs it, so none of that code is dead yet and the cleanup
cannot treat it as such. okQRal is a separate app and its own landing state is
still undecided.
