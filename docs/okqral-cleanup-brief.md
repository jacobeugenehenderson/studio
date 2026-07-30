# Work order — okQRal vestigial pass

**Repo:** `/Volumes/Today/okQRal` · deploys to `okqral.com` (GitHub Pages, `CNAME`)
**Task type:** behaviour-preserving deletion. Not a refactor. Not a redesign.

**Before you start: name yourself.** Choose a call name, state it up front, and
use it in `CLEANUP-REPORT.md` and in every commit message. Project convention —
several agents work across this site and its three products, and "who did this"
should never be guesswork.

---

## 1. What this is

okQRal is a static QR generator — no build step, no framework, no backend. Four files matter:

| File | Size | Role |
|---|---|---|
| `qr_app.js` | 2,884 lines · 118 function definitions · 16 `window` globals | the entire application |
| `index.html` | 784 lines | markup and control surface |
| `qr_type_manifest.json` | 19.6 KB · keys `types`, `fields`, `presets` | the QR type vocabulary |
| `styles/theme.css` | — | all styling |
| `vendor/qrcode.min.js` | — | third-party encoder. **Do not touch.** |

The app has been extended by accretion. The author's own comments name it:

```
qr_app.js:105   // Keep legacy/top-bar select alive and in sync (add-only)
qr_app.js:106   function wireECCLegacySelect(){
qr_app.js:499   // legacy single-field (no-ops if missing)
qr_app.js:2217  // legacy single-field (safe no-ops if missing)
```

New wiring was added alongside old wiring rather than replacing it. The old paths are
still live — they run, they no-op, they sync state nobody reads.

## 2. The goal

**Remove the defunct wiring. Change nothing a user can see or do.**

The functionality and the appearance are correct. They are the specification. If the
cleaned build behaves or looks even slightly different, the pass has failed — regardless
of how much dead code it removed.

### Why grep will not find it

Only 5 `console.*` calls and 3 commented-out blocks exist in the whole file. The dead
code here is not dead *text*, it is dead *paths*: functions that are called but whose
effects are discarded, listeners bound to elements that no longer exist, state kept in
sync for readers that were deleted, and duplicate helpers where one has quietly won.

Finding these requires reachability and effect analysis, not pattern matching. Budget for
reading the whole file before deleting a single line of it.

## 3. Hard constraints

1. **Delete, do not comment out.** No `// removed` tombstones, no `if (false)`, no dead
   files left in place. `git` is the archive.
2. **No behaviour change.** Same inputs produce the same PNG, byte for byte where the
   encoder is deterministic.
3. **No visual change.** Same layout, same type, same colours, same spacing, same
   interaction states, at every breakpoint.
4. **No new dependencies.** No bundler, no TypeScript, no framework, no npm scripts. It
   stays a static site that deploys by pushing files.
5. **No reformatting-only churn.** Do not reindent, rename, or reorder surviving code.
   Every diff hunk must be a removal or a directly required consequence of one. A diff
   full of cosmetic noise cannot be reviewed for safety.
6. **Do not touch `vendor/`.**

### Do NOT port Codedesk's engines over this

There is a cleaner sibling of this app at `/Volumes/Today/ascend-portal/codedesk`, split
into five named modules (`qr_app-bootstrapper`, `qr_render_engine`, `qr_state_engine`,
`qr_sync_pipeline`, `qr_ui_toolkit`). **Copying it over okQRal would be a regression.**
Codedesk's `qr_type_manifest.json` is 5.9 KB against okQRal's 19.6 KB — it carries only
the QR types one internal deployment needs. Overwriting would silently delete most of the
public type vocabulary, which is okQRal's whole reason to exist.

Codedesk is useful only as a *reference for module boundaries* if a later split is wanted.
This pass does not split anything.

## 4. Method

Work in this order. Do not begin deleting before step 2 exists.

### Step 1 — Read
Read `qr_app.js` end to end and `index.html` end to end. Build a written map: every
function, what calls it, what reads its effects. Note the 16 `window` globals
(`$`, `val`, `render`, `preview`, `manifest`, `typeSel`, `colorHex`, `currentECC`,
`emojiTarget`, `getPresets`, `getTypeFields`, `reflowStepper`, `refreshBackground`,
`closeEmoji`, `__okqr_park_handler__`, `__okqral_sid`) and identify which are genuine
cross-module contracts versus leftovers from an earlier structure.

### Step 2 — Baseline, before touching anything
Deletion without a baseline is guesswork. Build a harness that captures current
behaviour:

- Enumerate every entry in `qr_type_manifest.json` → `types`.
- For each type, fill its fields from a **fixed** fixture (no random values, no
  timestamps, no `Date.now()`), render, and save the output PNG.
- Capture a DOM snapshot and a screenshot per type, plus every distinct UI state you can
  reach: each preset, emoji picker open and closed, transparent background on and off,
  each ECC level, each breakpoint.
- Commit these artifacts to a scratch directory outside the deploy path.

If any output proves non-deterministic across two baseline runs, find the source of the
nondeterminism and record it as a known exclusion **before** proceeding. Do not "fix" it
as part of this pass.

### Step 3 — Delete, in small commits
One coherent removal per commit, each with a message naming what was removed and the
evidence it was unreachable. Re-run the harness after each commit and diff against the
baseline. A commit that changes any output gets reverted, not debugged into submission.

Likely categories, in rough order of confidence:
- the `wireECCLegacySelect` path and the top-bar select it syncs, if the current control
  supersedes it
- the two "legacy single-field" no-op paths at 499 and 2217
- listeners bound to elements absent from `index.html`
- `window` globals nothing reads, and the code that maintains them
- duplicate helpers where one variant is never reached
- manifest `fields` or `presets` entries no `type` references
- CSS rules in `theme.css` matching no selector in the markup — verify against the live
  DOM, not just the static HTML, since classes may be applied at runtime

### Step 4 — Verify
Final harness run, full diff against baseline: zero differences outside recorded
exclusions. Then manual pass on a real browser, desktop and mobile viewport, exercising
every control. Confirm the deployed artifact still works when opened from `file://` and
from a served path, since GitHub Pages serves it as static files.

## 5. Deliverables

1. Cleaned `qr_app.js`, `index.html`, `styles/theme.css`, `qr_type_manifest.json`.
2. `CLEANUP-REPORT.md` — what was removed, line counts before and after, the evidence of
   unreachability for each removal, and anything suspected dead but **left in place**
   because it could not be proven so. That last list matters more than the removals.
3. The baseline harness and its fixtures, committed. The next pass needs it.

## 6. Explicit non-goals

Do not: restyle, rename anything user-visible, add features, add QR types, change
defaults, split into modules, add tests beyond the harness, "improve" the architecture,
introduce a build step, or fix unrelated bugs found along the way. **Log** those instead
at the end of the report.

Two known issues are deliberately out of scope for this pass — record them, do not fix:

- quiet zone is `size * 0.08`, roughly 8%, where the QR spec wants four modules clear
  (nearer 16% on a small code)
- inverted (light-on-dark) codes are not reliably read by all in-app scanners

## 6b. Findings from a first look — read before starting

Recorded 29 Jul 2026, from serving the app locally and reading the source. None of
this is instruction to change anything; it is what the next person should not have
to rediscover.

**The "welcome ceremony" is a preset, not a gate.** `qr_app.js` runs a block
guarded by `if (!typeSel.value)` which applies the `WELCOME` preset from
`qr_type_manifest.json`. As shipped that preset is `name: "Hi Shugg"`, body
`"Click the 💖 to get started"` — so a first-time visitor is greeted by name, with
someone else's name. There is a hardcoded offline fallback at `qr_app.js:433`
whose headline is the more neutral `"WELCOME"`; the manifest overrides it.

**The 💖 is the type picker.** `index.html:84` —
`<option value="" disabled selected hidden>💖</option>`. The product's primary
action is an unlabelled emoji in the top-right corner, and the caption exists to
tell you to go and find it.

**Rotation was intended but never wired.** The startup path always calls
`applyPreset('WELCOME', 0)`, so further WELCOME presets could never appear. The
original intent was for the landing code to vary over time. Any fix should pick by
date rather than at random — a refresh that reshuffles reads as a glitch.

**A real scope problem, and a likely source of dead wiring.** `renderTypeForm` is
declared inside a closure (`qr_app.js:603`, writing into `#detailsPanel`) that the
startup block at the end of the file cannot reach. An attempt to build the URL form
on load failed silently for exactly that reason. Worth mapping deliberately: where
else does the startup path reach for functions it cannot see?

**okQRal has no templates.** Codedesk carries `qr_templates.json`; okQRal does not.
That is part of what diverged between the two, and it means "port Codedesk over"
would import a system this deployment has never had.

**Sequencing.** Streamlining the landing state is a design change, and this brief
forbids behaviour and visual changes. It should be decided and implemented FIRST —
cleaning code that is about to be deleted is wasted work, and a careful agent will
otherwise prove the welcome path live and preserve it.


## 7. Definition of done

The app is byte-identical in output and pixel-identical in appearance, measurably smaller,
and every surviving line can be traced to something that runs. If you are unsure whether
a path is live, it stays — and goes in the report's uncertain list.
