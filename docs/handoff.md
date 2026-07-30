# Handoff

Picking up the rebuild of **jacobhenderson.studio** — a one-page portfolio.
Static HTML/CSS/JS, no framework, no build step.

```
repo     ~/Desktop/dev.nosync/jacobhenderson-studio   (branch: rebuild, pushed)
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

**Read `README.md` first.** It carries the argument the site makes, seven rules,
a table of which component is right for which job, six bugs already fallen into
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

## Outstanding

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
2. **Picture Wrap — commit the snippet, then deploy.** `embed-height.js` is in
   the repo root, byte-identical to `docs/embed-height.js`, loaded at its
   `index.html:85` — but **untracked**, and `picture-wrap.com` serves no copy of
   it, so the site's frame still falls back to its CSS aspect ratio.
   Check: `git status` in `~/Desktop/dev.nosync/picture-wrap`, and
   `curl -s https://picture-wrap.com | grep -c embed-height` — `0` means
   undeployed.
3. **The Ward — embedded as three layers, 30 July 2026. NOT YET LIVE.**

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
   `curb-offset-draw`, in `src/App.jsx` and `src/index.css`. URL params set the
   initial layer and serve direct links; a `message` listener switches it live,
   carrying `ground`, and only when framed. Absent, nothing changes.

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

   **What is still needed to go live**, in order:
   a. Lift the 8 embed commits onto a branch off `origin/curb-offset-draw` and
      push **that** — never the whole trunk, per the warning above. Code
      changes are staging-first per `cartograph/PREVIEW.md` §0.2 (only *slab
      data* goes straight to prod). Note `staging.yml` triggers on pushes to
      `curb-offset-draw`, so a side branch needs `workflow_dispatch` or a
      merge; settle that with Jacob rather than guessing.
   b. Verify all three layers on the staging URL.
   c. Promote via **Preview's Publish panel**, not a manual push — that is the
      canon path (bake → commit → staging → promote). Note `promote`
      fast-forwards `main` from the trunk, so it carries everything else on
      `curb-offset-draw` with it. Jacob's call, not an agent's.
   d. Flip `data-embed-base` in `index.html` from the staging URL to
      `https://lafayette-square.com/`. One line, the only one.

   **`grep -c "iframe src=" index.html` → 3**, and it is honest again. It read
   2 for part of this session, while a launcher injected The Ward's frame on
   click; that went when the launcher did, and the iframe is back in the markup
   with the product's own loading screen covering its boot. `grep -c
   'class="embed[ "]' index.html` also gives 3. Both were checked, not assumed —
   this row has now been wrong three times.

   Jacob's in-flight work is untouched: the commit was scoped to one file and
   `BRIEF-polygon-asks-the-stamp.md`, both `design.json`s and the `.pre-reset`
   are all still dirty and unstaged, exactly as they were.

   Still open: the pill's wireframe art is placeholder, now sitting above a
   live render of the same neighbourhood. See README §8.
4. **Provincetown — built, waiting on art.** Two previous notes said no section
   existed; `article#pbg` has been in `index.html` all along, at line 914, with
   rail, meta, claim and one labelled 4×3 slug. It is the quiet one by design —
   no interaction, and none wanted. What is missing is only the flat scans of
   the guides, member map and Pride poster.
   Check: `grep -c '<article class="piece' index.html` — seven, as COLOPHON says.
5. **From Jacob:** the Cordis pair (spec in README §8), and how many
   photograph/illustration pairs exist for the Nordson filmstrip.

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
