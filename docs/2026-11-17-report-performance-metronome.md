# Performance, overnight 2026-11-16/17

*Metronome*

## In plain English

**The page is already fast.** Lighthouse scores the live site **100** in all four
configurations: desktop and mobile, each with default throttling and unthrottled.
On a simulated slow-4G phone with a 4x slower CPU, the first paint (FCP, which is
also the largest paint here) lands at **1.4 s**. On a desktop line it lands at
0.63 s, and unthrottled at 0.29 s. Nothing shifts (CLS 0) and nothing blocks
input (TBT 0).

**The 5–6 s cold first paint was not real.** The test tab was opened *hidden*,
and Chrome does not paint a hidden tab. Details at the end.

**One real fix.** The tab icon (`assets/CD_ROM.svg`) was 342 KB, 253 KB over the
wire. That is **29% of everything a first visit downloaded**, for a picture
drawn at 16 px. It is now 29 KB and looks the same.

**Playback is smooth.** The station 02 drag and the station strip hold 60 fps at
desktop width and at 390 px with the CPU slowed 4x. The remaining hitches all
come from The Ward booting in its own frame, not from this page.

Everything is committed locally on `ascend-hero`. Nothing is pushed.

## Before and after

Lighthouse 13.6.0, headless Chrome, fresh profile each run, medians of 5.

**Live (8e1fa16), the baseline:**

| | FCP | LCP | CLS | TBT | Speed Index | Bytes | Requests | Main thread |
|---|---|---|---|---|---|---|---|---|
| desktop, default | 634 ms | 634 ms | 0 | 0 | 634 ms | 860 KB | 42 | 165 ms |
| desktop, unthrottled | 292 ms | 292 ms | 0 | 0 | 409 ms | 2488 KB* | 94 | 176 ms |
| mobile, default | 1403 ms | 1403 ms | 0 | 0 | 1403 ms | 860 KB | 42 | 651 ms |
| mobile, unthrottled | 292 ms | 292 ms | 0 | 0 | 352 ms | 2488 KB* | 94 | 198 ms |

\*Unthrottled runs last long enough for all four embeds to boot: The Ward
(about 0.9 MB), Picture Wrap and Scale Machine. Default runs end once CodeDesk
has loaded. Of the 860 KB, about 350 KB is CodeDesk's frame and **253 KB was the
favicon**.

**After (local preview, b9a2006 against 5671328):**

| | FCP | Bytes (uncompressed, local) |
|---|---|---|
| desktop, default | 404 → 408 ms | 1389 → **1082 KB** |
| mobile, default | 1814 → 1831 ms | 1388 → **1082 KB** |

FCP was unchanged, as expected: the favicon is fetched after first paint. What
changes is bandwidth. On a phone it no longer competes with the station 02 views
and CodeDesk. Projected for live once it's published: **860 KB → about 630 KB**
on a first visit, with 21 KB compressed in place of 253.

⚠ The local preview's mobile TBT (276–419 ms) is **not the site**. On localhost
the CodeDesk frame takes its `data-src-local` (127.0.0.1:8788). That address is
the same *site* as the page, so CodeDesk shares the page's process and main
thread. On live, CodeDesk is cross-site and runs in its own process. Compare
local runs only with other local runs.

## Commits

1. **`b9a2006` The tab icon weighs 29 KB, not 342.** The Illustrator SVG
   embedded its iridescent disc as a 758 px base64 PNG. Same SVG, same rings,
   with the disc resampled to 128 px (4x the largest size a tab draws it). I
   rendered both in Chrome at 32, 64 and 256 px: the mean difference is under
   1.3 levels, and what remains is on the rim's antialiasing. It ships under a
   new filename (`assets/CD_ROM-128.svg`) so the edge can't pair it with the old
   file. The original is in `_source/favicon/`. **Effect:** −313 KB on disk,
   −232 KB over the wire, 29% of a first visit's bytes.
2. **`3a2d9e0` Read-in: three reserved tokens, not six.** The audit prints three,
   README §7 lists three, and the read-in said six. The code was right, so I
   fixed the note.

The audit was clean after each commit, and `stamp.py --check` was ok. Neither
commit touched `css/` or `js/`.

**Tried and reverted:** making the opening station 02 view `loading="lazy"`.
It's 1464 px down, so it's never above the fold, and it is fetched alongside
`site.css`. The theory was that deferring it would free bandwidth for the
stylesheet. Measured, FCP was no better (desktop 408 → 449, mobile 1831 → 1985,
both noise), so it was not committed.

## Playback (headless Chrome, a real mouse drag, frame intervals from rAF)

| | frames | over 20 ms | over 34 ms | p95 |
|---|---|---|---|---|
| fade drag, 1280 px, live | ~400 | 0–1 | 0 | 16.7 ms |
| fade drag, 390 px, CPU 4x, live (9 runs) | ~400 | 0–3 | 0 (one 366 ms frame in 1 of 9) | 16.7 ms |
| strip, all 8 stations twice, 1280 px, live | ~435 | 1–2 | 0–1 | 16.8 ms |
| strip, 390 px, CPU 4x, live | ~440 | 0–1 | 0–1 | 16.7 ms |
| scroll whole page, 390 px, CPU 4x, live (8 runs) | ~450 | 1–6 | 0–2 | 16.7 ms |

- Each drag frame does a style pass of about 0.7 ms and a layout pass of about
  0.4 ms at 4x CPU, well inside a 16 ms frame. Nothing is worth changing.
- **The grain is exonerated.** It is a fixed, full-screen `mix-blend-mode:
  overlay` layer, so it was the prime suspect for scroll cost. With it removed,
  long frames occurred in exactly as many runs (4 of 8 each way).
- The long frames that do occur fall about a second after The Ward's frame
  starts, while it boots its WebGL scene.
- One strip run locally hit a 950 ms frame. That was the same-site local
  CodeDesk sharing the page's main thread (see above), and it doesn't happen on
  live.

## Needs Jacob's call

**On this site (Cloudflare dashboard, not the repo):**
1. **Cloudflare Web Analytics beacon.** Cloudflare injects
   `static.cloudflareinsights.com/beacon.min.js` plus a `/cdn-cgi/rum` call. It
   costs 10 KB and about 4 ms of main thread, and it heads Lighthouse's longest
   request chain. It is an external network call the site itself never made. Keep
   it if you use the analytics; otherwise turn it off in the dashboard.
2. **Email Obfuscation.** Cloudflare rewrites the footer's `mailto` and adds
   `email-decode.min.js` as a synchronous script before `site.js`. It's tiny
   (1 KB). It is also the one script on the page you didn't write.
3. **Browser cache for stamped assets.** `css/` and `js/` carry content hashes,
   so they could be cached for a year (`immutable`) instead of 4 h. That needs a
   Cloudflare Cache Rule on `/css/*` and `/js/*`. It helps repeat visits only.
4. **Inlining the critical CSS** would cut one round-trip, about 300 ms off the
   1.4 s slow-4G paint. It breaks README rule 3 (no `<style>` blocks), so I
   didn't do it.

**In other repos (written up here, nothing touched):**
5. **CodeDesk** (`~/Desktop/dev.nosync/codedesk`) loads the **Tailwind Play CDN**
   (`cdn.tailwindcss.com`, 124 KB). That is a runtime compiler that rebuilds the
   CSS in the browser on every load, and Tailwind says not to use it in
   production. It also loads Google Fonts (Work Sans, 49 KB) and
   emoji-picker-element from jsDelivr, which fetches 54 KB of emoji data at boot.
   A built Tailwind stylesheet and a self-hosted font would cut most of CodeDesk's
   350 KB and its boot time. It's also the heaviest thing a first visit loads.
6. **Scale Machine** loads `vexflow/3.0.9/vexflow-debug.js` (229 KB) from
   cdnjs. The minified `vexflow-min.js` is the production build.
7. **The Ward** calls `api.weather.gov` from the embed (the `WeatherPoller`).
   That is a live external call from inside the site. It's the product's own
   design (the Almanac temperature) and predates tonight, but it sits against
   "everything embedded is a disconnected demo", so it's flagged.

## The cold-paint question, answered

**It was an artefact of the tab, not the page.** Chrome records whether a page
began hidden (`performance.getEntriesByType('visibility-state')`). I opened live
in a new tab the same way as the earlier test:

| tab | visibility | load finished | first paint |
|---|---|---|---|
| opened by the browser tools | **hidden at 0, visible at 527 ms** | 487 ms | 960 ms |
| same tab, navigated while showing | visible at 0 | 105 ms | **224 ms** |

The page finished loading before the tab was ever shown, and its first paint
waited for the tab to become visible. A hidden tab isn't painted, so "first
paint" in such a tab measures when it was brought forward. With a longer wait
before it's shown, that gives the 5–6 s. A truly cold load in a fresh profile
(Lighthouse, empty cache) paints at **0.29 s** unthrottled, 0.63 s on desktop
throttling and 1.40 s on slow-4G mobile. The cached 0.36 s reload was the
honest number all along.

**How to measure it in future:** check `visibility-state` first. If the first
entry is `hidden`, discard the paint timings.

Raw reports are in the session scratchpad (`lh/live-base`, `lh/local-base`,
`lh/local-fix1`, `lh/local-fix2`, `drag/`). They aren't committed.

*Metronome*
