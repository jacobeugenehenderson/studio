# Ascend showcase plan

**From:** Colophon · **Started:** 2026-11-15 · **Status:** draft, while Jacob is away.
**Asked for** (Jacob, relayed by Galley): every app shown as one coordinated interface, "slick,
modern, and easy … aimed at showing with laser focus."

## What the nine manuals established

Read from `ascend/_desk/2026-11-15-report-manual-*` and `ascend/manual/*`. Walt has passed
ArtStart; the other eight are **pending his review**, so every claim below waits on that.

1. **Almost nothing can be shown live.** Every backend is either 403 or unsafe to open: no sign-in
   check on ArtStart's job page (hazard 9), and a shared login token (hazard 4). Only CodeDesk runs
   live with nothing behind it.
2. **The data is Nordson's.** Job titles, emails, clips and card art are client material.
3. **So a live, real-data showcase is ruled out on safety and permission grounds**, not on taste.

## The design: one sample job, through every app

One **clearly labelled demo job**, the Cordis VT trade ad the hero already follows, exists as
shared sample data. Every app can load it **without its backend** (a demo mode, read-only). Each
station shows that app's single strongest moment, **on the same job**.

- **Why it reads as one interface:** the same job, product, dates and copy appear at every
  station. The visitor watches one thing move through the system, not eight unrelated screens.
- **Why it's safe:** no live backend is exposed and no new client data appears. The demo job is
  labelled as a demo on the page, so it isn't a plausible fake (README rule 7).
- **The site's job is to unify:** every station frame shares one chrome. The app's real screen
  sits inside a consistent window on graph paper, so screenshots and recordings from different
  apps look like one family.
- **Laser focus:** one picture or short loop per station, and one line. No explanatory prose.

## Station by station: the strongest moment (first pass)

| # | App | Best moment, from its report | Today |
|---|---|---|---|
| 01 | ArtStart | The job page: the Cordis ad on its canvas, toggled EN ↔ DE | needs demo mode and one real translation (checked by eye: a failed translation saves English silently) |
| 02 | ShowCase | The drawing ↔ photograph wipe (on the site now) | waits on a ShowCase render of the Cordis (the publishing gate) and on Gaffer |
| 03 | CopyDesk | The two-lane editor, then the closed job with its language buttons | needs demo mode, a demo job |
| 04 | CodeDesk | Live, scans to the résumé | **real today** |
| 05 | PrintWorks | Workbook row → finished card front and back; or the QR read-back proof ("12 of 12 reads") | needs the exported PDFs and **Nordson's OK**. No web UI: outputs only |
| 06 | ScreenRoom | The attract loop recorded; or one module in all five layouts | needs a recording run and **Nordson's OK** for the clips. A live demo needs a code change (folder picker) |
| 07 | FlatFile | The register: every app filing into one place | needs a clean sample; the live sheet holds client names |
| 08 | MediaRoom | Opened from ArtStart for the job, Cordis shots selected | **needs work**: the live page calls the backend and the Tags sheet on every load (Walt). A config-only demo copy removes both |
| — | Lobby | The strip itself: one job's card across the lanes | needs demo mode |
| — | Calendar | One day where an ArtStart deadline, a CopyDesk deadline and a trade show meet | needs demo mode; fix the one-day-early deadline bug first |

## Phase 2: perfect screenshots (Jacob, 2026-11-15)

**The method: a sandbox, no production code touched.**

- **Where:** a new local folder, `~/Desktop/dev.nosync/ascend-showcase-sandbox/`, outside every
  repo, never deployed.
- **What:** a copy of each app's front end that is being shown (ArtStart, CopyDesk, MediaRoom,
  the Lobby, Calendar; CodeDesk is already live). Each copy loads the shared sample job through
  the hook its agent named above.
- ⛔ **The safety net:** every sandbox page carries a content-security policy (`default-src
  'self'`, nothing external). A missed hook then **fails visibly in the browser** instead of
  reaching a live Nordson backend or sending an email (hazard 9). The policy is the guarantee; the
  hooks are the method.
- **One shared sample job,** one file every sandbox reads (`sample-job.json`):
  - a "Sample" label visible on every screen;
  - ids prefixed `SAMPLE-` so they can never collide with a real job;
  - dates computed relative to today, so nothing ages out or turns "overdue";
  - obviously sample emails.
- **One capture spec, so the set reads as one family:**
  - the same viewport and zoom, the same theme;
  - no cursor, no hover states;
  - the same crop ratio as the site's stations (3:2);
  - shot by the same browser on the same machine.
- **Who:** each app's manual agent shims its own app. It already knows the hooks, and screenshot
  production isn't verification, so re-using the agent is right here. **Walt agrees the method
  first** (it's his code being copied), then a brief per app.

**Walt's conditions** (`ascend/_desk/2026-11-15-memo-walt-showcase-sandbox.md`). He agrees the
sandbox in principle; it is **throwaway**. Only the sample-job shape and the safety check carry
forward. My first draft of the safety net was not sufficient:

- **The policy:**
  - the meta tag comes first in `<head>`;
  - add `form-action 'none'` and `base-uri 'none'` (ArtStart's long save posts a form to Apps
    Script, and `form-action` doesn't fall back to `default-src`);
  - `script-src` and `style-src` need `'self' 'unsafe-inline'` (every page has inline script);
  - `connect-src`, `img-src` and `form-action` stay locked;
  - **vendor** the esm.sh editor imports and the Google Fonts, or the shots break.
- **Navigation isn't covered by any policy:**
  - wrap `window.open`, because about 15 calls open live URLs **in Jacob's real, signed-in
    Chrome**;
  - the sample data uses only relative `SAMPLE-` URLs.
- **"Fails visibly" was false.** The apps swallow rejections into empty lanes. So: a
  `securitypolicyviolation` listener that **paints a red bar naming the blocked URL**.
- **A fresh port** no portal dev server has used, or a real stored session signs the shots in as
  Jacob.
- **The hooks, corrected:**
  - **CopyDesk:** `sample.js` deferred **after** `copydesk_api_client.js`.
  - **Lobby and ArtStart:** `ascend.js` keeps its renderers private, so both need an **edited
    copy** of `ascend.js`. ArtStart's sample also needs a demo MediaRoom manifest at its
    hard-coded path.
  - **MediaRoom:** config doesn't reach `library.js:2739–2741` or `:5035` (localhost:8081).
  - **Calendar:** all 4 JSONP sites, not 3.
- **The sample job takes its builder's shape,** field by field (e.g. `Ops_Engine.js:892–1077`).
  **A screen is captured only if its manual's check marks it BACKED.**

**What Jacob decides before any capture:**
1. **The sample job's content:** the Cordis ad's real copy (headline, subhead, body) and the
   publication. Inventing marketing copy for a real Nordson product would be a plausible fake.
2. **Rights:** Nordson's OK for card art, clips and product photography; and **Swanky Bolt
   Studios'** terms for the MediaRoom shots.
3. **Labels:** the apps still say "Art Start", "Copydesk", "FileRoom" and "Library". Wait for
   Ascend's label brief to land, or shoot what the product says today.

## Open questions

- **For Jacob:** Nordson's OK for PrintWorks card art and ScreenRoom clips. A **demo mode**
  across the suite is real engineering; is it worth it, versus screenshots taken from one
  signed-in session?
- **For Walt:** is a shared read-only demo mode feasible across the portal apps, and at what cost?
- **For each manual agent:** what exactly its app needs to show its best moment from the one
  sample job (asked 2026-11-15; answers below as they arrive).
- **For Gaffer:** a ShowCase render of the Cordis (`products/feed-center`).

## Walt's review: all eight fleet manuals pass (2026-11-15)

`ascend/_desk/2026-11-15-memo-walt-review-manual-fleet.md`. Four demo labels were wrong, and
they're corrected here:
- **MediaRoom's browse and share page are not backend-free.** `library/index.html:368` and
  `:371` are called on every load; the page renders only because the failures are swallowed.
- **CopyDesk's** "real today, given a backend" is **needs work**.
- **FlatFile #3** needs a screenshot nobody has seen, so it's **needs work**.
- **CodeDesk #5** cites `portal@7627af9e`, not the standalone.

**These hold:**
- the Lobby's phone and per-terminal sign-in, the session-expired screen and the 404;
- CodeDesk #1–3;
- PrintWorks' QR read-back proof.

### Demo mode or a signed-in session: Walt's answer

`ascend/_desk/2026-11-15-memo-walt-demo-mode.md`.
- **A real demo mode is days of work.** It would mean one responder Worker answering recorded
  backend replies, a separate `dist-demo/` build on its own host, and first consolidating about
  60 copied backend URLs (which the cutover needs anyway). **Record the fixtures; don't write
  them by hand**: hand-written data would hide the defects the manuals found.
- **For stills, one signed-in session is cheaper: an afternoon.** It needs:
  - the 403 settled first;
  - the demo job made with **no collaborators** (intake emails them);
  - a "Sample" label, and the job deleted afterwards;
  - a HAR exported, so a demo build can come later from real data.
- **So the sandbox in Phase 2 is the fallback, not the plan.** For the shims that are config-only
  or one file (MediaRoom, CopyDesk) it is still cheap and safe. Jacob chooses.

### Jacob's direction for the Lobby (2026-11-15)

"Ultimately we'll need to add apps to the Lobby, but their functionality will be on the
admin/intake side." Today only ArtStart, CopyDesk, CodeDesk and FlatFile have rows (Vestibule).
ShowCase, PrintWorks, ScreenRoom and Calendar would join as admin and intake functions, which is
also what would let the Lobby eventually stand for the whole suite on the site.

## ⚠ What the answers have already corrected

1. **Not every app is a step of the same job.** ArtStart, CopyDesk, CodeDesk, FlatFile, the
   Lobby, Calendar and MediaRoom genuinely share jobs. **PrintWorks and ScreenRoom are separate
   production lines in the same studio.**
   - PrintWorks makes 5.5×8.5 product cards and a pocket folder, never ads. It has no Cordis row
     (Galley; `populate.jsx:36`).
   - ScreenRoom runs its own shows, though the Cordis is already in every one (Moviola).

   So the sample job runs through the apps that share it, and PrintWorks and ScreenRoom show
   their own outputs, **labelled as the studio's other lines, not as steps of that job.**
2. **The QR thread is planned, not built.** CodeDesk → ArtStart → FlatFile → PrintWorks is not
   one pipeline. ArtStart's "New →" gets nothing back. CodeDesk files to FlatFile with an empty
   owner. PrintWorks makes its own codes (`segno`) and only ports CodeDesk's rules in a comment
   (Guilloche, Galley). Show it only as "planned" (ARCHITECTURE § Decisions, 2026-11-15).
3. **Station 05 on the redesign is untrue today.** It pairs the Cordis trade ad with
   PrintWorks. Its copy says approved copy flows from CopyDesk into InDesign templates for ads.
   **No CopyDesk link exists in the pipeline** (Walt; Galley), and PrintWorks makes no ads. The
   art and the copy both need replacing before the redesign ships. This is on top of the
   publishing gate on station 02.

## Answers from the group

### CodeDesk: Guilloche

- **Keep the station as it is:** live, scanning to the résumé. Don't show a Cordis code as part
  of a connected chain (see above). If a Cordis code is ever shown, it must encode a permanent
  address, such as a sample-job page on this site.
- **The scanning-margin readout** is the strongest addition, live-safe, embed only. After each
  render, decode the code at about six widths on light and on dark grounds, and show one line:
  "reads at 5/6 sizes on light, 1/6 on dark · smallest 160px". **Compare the decoded text with
  `buildText()`, and show red on a mismatch.** Where the browser has no BarcodeDetector, say
  "can't measure in this browser". It goes in the render engine after the mount
  (`qr_render_engine.js:1018–1031`).
- **A type switcher** is worth it only with the readout, and only with URL, Message and Map.
  Payment, Event and Contact make placeholder or partial codes, and the live pill offers them
  today.
- **Fix first on the live station:**
  - the type pill offers Payment, Event and Contact;
  - "Resistbot — coming soon" is visible;
  - the downloaded PNG's transparent top may not scan on a dark ground;
  - the canonical URL and `og:url` point to a 404;
  - `qr-auth.png` is still served;
  - the emoji picker loads an unpinned CDN version.

### PrintWorks: Galley

- **No Cordis anywhere** in the workbook or snapshot. PrintWorks makes product cards and a
  folder, never ads.
- **Best image: the QR read-back proof.** The wording that holds up: *"PrintWorks checks every
  printed code by reading it back from the artwork, 12 ways, before the card can print"*
  (`qr_decode.py:16–47`).
- **What would mislead:**
  - the proofs date from 19 Oct, and nothing has been built since;
  - 12/12 is zxing's count, not a phone's;
  - the addresses are unverified (behind a 403 wall);
  - they're **live campaign codes**, so publishing a scannable one inflates Nordson's counts.
    Blur it, or rebuild under campaign 999;
  - the caption omits `?c=`;
  - it's client art, so it needs Nordson's OK.

### CopyDesk: Interlinear (overnight result: **stopped on a permission block, for Jacob**)

Interlinear's first write was refused by its own session's permission check ("Unsanctioned
Communication"): the `git archive b3bf35d | tar -x` into the sandbox. It stopped and wrote
nothing, as briefed. **Not routed through another session**: a denial in one session is Jacob's
to lift, not another agent's to work around. Its preparation, ready for whoever builds it:

- **Copy six files** from `b3bf35d` at their portal paths, so `job.html`'s `../../assets` links
  resolve:
  - `copydesk/frontend/job.html`
  - `assets/css/copydesk.css`
  - `assets/js/copydesk_api_client.js`
  - `assets/js/copydesk_job_view.js`
  - `assets/ascend.css`
  - `assets/ascend-apps.css`
- **Vendor Source Sans 3** (`job.html:15–17`); there's no local copy on this machine.
- **Slots:** Headline 0, Subhead 1, Body1 2, Body2 3, a ghost at 4, Body3 5, CTA 6. **Cards:** an
  edit on Body1 at 2; an insert "new:…" at 4 (`ghostSlots [4]`); Delete segment on Body3 at 5.
  **Styles:** Headline, Subheadline, Body, CTA, Bullet, Section divider, Delete segment.
  `isAdmin` false, `dueDate` = `dates.copyCutoff`.
- Two placeholder strings for the cards go in `SAMPLE_JOB.copy.revisions`, not in the shim.

### CopyDesk: Interlinear (its answer)

- **Show the two-lane editor mid-job:** agreed text on the left, proposed changes on the right,
  lined up row by row. One screen shows a reworded paragraph, a paragraph marked for deletion, an
  inserted paragraph, and a section divider. Machine translation is ArtStart's story, so CopyDesk
  would repeat it.
- **Sample data:** one `getJob`-shaped object. It needs 6 segments, 3 cards (an edit, a deletion,
  an insert) and the matching ghost slot, plus the style list (required offline), and a due date
  **relative to today** (a past date makes the page try to close the job).
- **Smallest change:** one deferred `sample.js` between `job.html:194` and `:195`. It overrides
  `copydeskGetJob` with the sample and turns every write into a no-op. **No other file
  changes.**
- **Avoid:**
  - the bin button (it misaligns the lanes);
  - real-looking emails;
  - Push/Close, unless stubbed;
  - the translator page, whose Translators header is always empty.

### Lobby: Vestibule

- **Show the signed-in workspace with the one job in four rows at once:**
  - the ArtStart card with its dates and progress dots;
  - CopyDesk's English job and its DE translation;
  - CodeDesk's working file;
  - the finished QR in the FileRoom row.

  Nothing else in the suite shows the connection on one screen. Only those four apps have rows,
  so the Lobby can't stand in for every app. The phone sign-in is real, but it's a recording,
  not sample data.
- **Sample data:** 7 records: a session, 1 ArtStart job, 2 CopyDesk jobs, 2 FlatFile rows, and
  0–3 templates. The 15 placeholder templates named "One" to "Fifteen" must go.
- **No existing hook**, but the five renderers take plain arrays and make no network calls
  (`ascend.js:2107, 1862, 1034, 1479, 1729`). Smallest change: a sample branch in bootstrap
  (`:2467–2489`) that calls them directly and **never calls `applyLoggedInUI` or
  `startLogin`**. Keep the session in memory.
- **Untrue or broken until fixed:**
  - fixed dates age out, so make them relative;
  - every click and × goes to production, so point them at sample pages or turn them off;
  - the old names on the page ("Art Start", "Copydesk", "Codedesk", "FileRoom", "…Nordson ICS
    Portal");
  - the "required elements" promise;
  - "sold as" never shows;
  - the header reads "for Nordson ICS".

### ShowCase: Gaffer (overnight result: **a ChromaBox pair, for Jacob to judge**)

- **The Cordis can't be rendered** until Jacob supplies a current Feed Center STEP; the only files
  on hand are a 2024 concept round, which Gaffer won't present as the Cordis. Intake after that is
  about an hour. The Cordis's interior lights aren't built yet, so its first renders would show
  them unlit.
- **Delivered:** `_source/showcase/` (private).
  - `chromabox-photo.png`: Lab render, 3/4 view, 2000×1334.
  - `chromabox-blueprint.png`: white line on the blueprint's own gradient (#052B45 → #05173D),
    2000×1334, registered with the render.
  - `README.md`: the setup, camera, look and how to reproduce it.
- **Weaker than it should be:**
  - no PSD (Photoshop's scripting step errored);
  - the filter cartridges show only as seams in the drawing;
  - no graph paper behind the drawing, unlike the Cordis blueprint;
  - an open booth in 3/4, not a front view.
- **Honest only if station 02 names ChromaBox.** It would also tie two stations: ChromaBox is one
  of the four PrintWorks cards on station 05.
- **Jacob's ruling (2026-11-15, morning):** the ChromaBox will be **replaced by updated renderings
  of the Cordis Feed Center**, so station 02 stays Cordis.
- **Jacob's correction (same morning):** **the filters are permanent parts of the ChromaBox, not
  separate items.** Stop treating them as separate from the model. Ghosted or missing filters are
  nonsensical. (Colophon had first recorded this as "every drawing must show the filters". That
  was wrong: the point is what the model *is*, not a drawing rule.) Gaffer's README says the render
  "includes the six generated primary filters", so today they're added as a separate generated
  step, and that's the thing to change.
- **Jacob (same morning):** "the fix goes into ShowCase's ChromaBox model, and the different
  models of the CB get different numbers of filters." Today the stage counts filters from the
  geometry (one per upright 1614353, so 3 on the 3K and 6 on the 8K). Gaffer has been asked to
  plan the model change, with no code until Jacob agrees.
- **Jacob:** the site's current Cordis images (station 02's drawing and photograph) will be
  **replaced** by new Cordis images.

### Bucket's challenge of the site's Ascend claims (overnight, 2026-11-15)

Five files in `ascend/_challenges/2026-11-15-site-*.md`, committed by Colophon (Ascend). **Four fell;
the rest survived.**

**Fixed overnight (Colophon's own construction, station 05's image):**
- the die rounds **one** corner, the front's top-right (`build_master.jsx:416–423`). The site had
  rounded all four. Now top-right only, at 1 in + 1 px;
- the die's magenta line was baked into the images. Re-rendered 1 px inside the trim, with the
  corner clip 1 px inside the arc. Checked by eye in the browser: no magenta;
- MediaRoom's alt text promised a finished-work source that's empty. It now describes the
  picture.

**For Jacob (his own lines; not reworded):**
- **01 ArtStart, "team assignments":** there's a list of collaborator emails; nobody is assigned
  anything.
- **05 PrintWorks, "every QR code" and "packaging":** every *card* code is read back. The pocket
  folder's four codes are never read, and the folder's art is placed by hand, not built from the
  workbook.
- **07 FlatFile, "Every station can file its work" and "their QR codes":** three apps file
  (ArtStart only through the Lobby). No QR row is tied to its job: the job key is always sent
  blank.

**Survived:** the hero, the credit, the halves, the labels, stations 02 / 03 / 04 / 06 / 08, and
the closer. "Eight markets" means eight languages, and the translator is optional.

### ⚠ Overnight: the build lanes stopped at their sessions' own permission checks

The agents re-engaged for the sandbox were started by Jacob for **read-only** manual briefs. Their
sessions' permission checks refused the first write ("Unsanctioned Communication" for Interlinear,
"Destructive or Unwanted Actions" for Scrimshaw). Each stopped and wrote nothing, as briefed. **A
peer's message can't widen what Jacob authorised, and no other session was used to route
around it.** To build, Jacob either allows it in those sessions, or opens fresh sessions with a
build brief and a baton. Every agent's preparation is recorded here, so the build is quick either
way.

**Colophon's error, recorded:** I briefed agents Jacob had started **read-only** to do write
work. Their mandate should have been checked before dispatch, not discovered at the first write.
Three agents caught it for me: two through permission checks, and Vestibule through its own
reading of Jacob's instruction. **Build work goes to fresh sessions with a build brief and a
baton, or waits for Jacob to widen an existing one.**

### Lobby: Vestibule (overnight result: **stopped by its own reading of its mandate**)

No check blocked it. Jacob's instruction to the session was "read-only", and a peer brief can't
widen that. It made three additive edits to `_shared/sample-job.js` before catching itself, then
reverted them. **Colophon verified the revert:** the file is 3,010 bytes and loads with its
original keys.

Ready to build:
- **Files from `b3bf35d`:**
  - `index.html`;
  - `assets/ascend.css`, `calendar.css`, `ascend.js`, `calendar.js`, `DVD_ROM.svg`,
    `vendor/qrcode.min.js`;
  - `codedesk/qr_templates.json`.

  Nothing to vendor.
- **`index.html`:** the CSP, then the guard, then `sample-job.js`, then `lobby-sample.js`, all
  before the existing scripts.
- **`ascend.js`: only `bootstrap()` changes.** The new body:
  - throws without `window.LOBBY_SAMPLE` (no fallback);
  - sets the logged-in state and the user chip;
  - calls the five renderers with the sample arrays.

  It **never** calls `applyLoggedInUI`, `startLogin`, `initLogoutButton`, `initPhoneLogin` or
  ⚠ **`initSessionWatch`** (`ascend.js:917`: on a tab switch-back it would end the session and
  poll the real sign-in service). The session lives in memory only.
- **The one moment:**
  - the ArtStart card (2 dots, "Materials Due D · Publish D+21");
  - CopyDesk's English and DE cards;
  - CodeDesk's working file plus **the 15 shipped placeholder templates**, kept, because removing
    them would picture a Lobby that doesn't exist;
  - the strip: the QR card only.

  Click nothing.
- **Fields `sample-job.js` needs, under Jacob's yes:**
  - `dates.touchpoint`: real jobs always show 2 dots. ArtStart's rule: 20% of the weekdays from
    today to the due date, or today if 2 or fewer;
  - `translation.lang = 'DE'`, shared with CopyDesk.

### MediaRoom: Scrimshaw (overnight result: **stopped on a permission block, for Jacob**)

Ready to build, with nothing left to decide:
- **Copy from `b3bf35d`** into `mediaroom/`:
  - `library/index.html`, `library.js`, `library.css`;
  - `assets/ascend.css`, `assets/ascend-apps.css`.

  The page is `/mediaroom/library/index.html?addToJob=ARTSTART:ASC-SAMPLE-0001`. No stylesheet
  pulls anything external.
- **12 assets with real ids,** with their thumb pairs:
  - hero: `381c2f68165f`, `ac5f1a331fe2`, `7395b442f003`, `514e86d9e554`;
  - detail: `cfba36dd7a15`, `82d188ff81d5`, `bb645fd63a5f`, `0d21075a45f8`;
  - lifestyle: `f17bef217baf`, `7a0ac06d98cf`, `ada7232ade1a`, `9ae79fcb2c9a`.

  The names are rewritten ("Cordis VT hero 1"), so neither "Swanky Bolt" nor the Nordson tree
  appears.
- **Config:**
  - the manifest pointed at `demo-manifest.json`;
  - `libraryApiUrl` and `taxonomySheetId` deleted;
  - `assetMetaUrl` pointed at `demo-assets.json`;
  - the drive paths blanked;
  - the CSP first and the guard second.

  `library.js:2739–2741` and `:5035` point only at same-origin `SAMPLE-` paths. Neither runs in
  this moment.
- **A static check:** with no API base URL, every API call rejects before it's sent
  (`library.js:25–26`).

### MediaRoom: Scrimshaw (its answer)

- **Show MediaRoom opened from ArtStart for the sample job,** with Cordis VT hero shots selected
  and the bar reading *"3 selected · Add to ARTSTART #…"*. It's the only MediaRoom screen that is
  about a job, and **the Cordis is already in the library: 119 assets**, all with thumbnails.
  Stop before the click: with no backend, the add fails loudly.
- **Curated demo manifest:** about 12 assets in Hero, Detail and Lifestyle, JPG and PNG only,
  with the real ids (they're the thumbnail filenames). Leave out `sources`, which holds the
  drive's paths.
- **Loading: no JavaScript change.** A demo copy of `library/index.html` with its config edited:
  - the manifest pointed at the demo file;
  - the API URL and the Sheet ID removed (no Google calls);
  - the drive paths blanked;
  - served from a different origin.
- **Avoid:**
  - Tags mode and the asset window's tag area (they look empty without the taxonomy);
  - "Admin" in the header;
  - the empty "Fileroom" source;
  - "+ Add to Job" outside the pop-up.
- ⚠ **Rights:** the files are credited to **Swanky Bolt Studios**, a third-party photographer.
  Check usage rights before anything public, and rename the files in the demo.

### Calendar: Almanac (overnight result: **no capture, by design**)

Unpatched, the week view puts the sample's show deadline **a day early** (Monday, while the
ArtStart and CopyDesk items sit on Tuesday D). `parseDate` reads a date-only string as UTC midnight
(`calendar.js:344–347`); checked with plain node on this machine (UTC−6). That splits the "three
on one day" moment the shot exists to show. Almanac declined a workaround: writing the date
"11/24/2026", which `parseDate` reads correctly, would hide the defect through the data. **The
Calendar moment waits for the real `parseDate` fix**; the shim plan stands for after it.

### Calendar: Almanac (its answer)

- **Show the week view**, with the A, C and S items stacked on one day beside the show's bar.
  It's the only view that prints names on screen. The S item names the show.
- **Sample data:** the ArtStart job's due date, CopyDesk's cutoff and a show deadline all on day
  D, with the show overlapping that week. Put D early in the week.
- **Smallest change:** in sample mode, call each fetcher's `window[callbackName](sample)` instead
  of adding the script tag (three small edits). The sample then runs through the real parsers.
  Also: a visible **"Sample data" badge**, open on D's week, hide + Add Show, and point the job
  links at sample pages.
- **Fix first:**
  - deadlines show a day early (`parseDate` reads dates as UTC, `calendar.js:339–348`);
  - CopyDesk's stage never moves (`"copydeadline"` typo, `:780`);
  - stages follow the real clock, so D must stay in the future.

### FlatFile: Interleaf

- **Show the Lobby's Output strip:** three cards for the same job, from ArtStart, CopyDesk and
  CodeDesk, each lettered A / C / Q. It's the only existing screen that shows every app filing
  into one place. FlatFile has no screen, and MediaRoom's FlatFile source is an empty TODO.
- **Sample data:** three rows in the renderer's shape. Smallest feed: call
  `window.ascendFileRoomOutputCallback` with them (`ascend.js:2274–2286`), in place of the
  request. It needs a labelled sample session, card clicks pointed at sample pages, and × and ↩
  disabled (they call the live trash API).
- **Untrue until fixed:**
  - #46: the live Lobby files ArtStart jobs with no `kind`, so they never show. Fix it with one
    field;
  - #49: the live list doesn't return publication details;
  - the screen still says "FileRoom".

### ScreenRoom: Moviola

- **Show:** the attract loop, recorded, about 20–25 s: Cordis hero Centered → cut → the Cordis
  pair in Even → cut → back. It's the only thing a visitor at the stand actually sees, and the
  only motion in the set. A still of one module in all five layouts can sit beside it.
- **Already Cordis:** both Cordis entries are in every show (`config/playlists/PaintExpo
  2026*.json:28–37`).
- **Needs:** the clips `Cordis_product`, `Cordis_text` and `Cordis_hero`, which are **only on
  the drive copy**. The player takes video only; stills won't do. Plus a three-entry playlist
  built fresh, with names checked against the files.
- **Smallest demo mode:** don't touch the player; fake the folder handle. A read-only shim,
  about 40 lines, fed by a `manifest.json`. `?demo` in `tryRestore` (`app.js:119–130`) boots
  from it. Writes are refused, and the staff area and Escape are disabled in demo. A code change,
  so Walt's call.
- **Avoid first:**
  - the Cordis halves are 10 s and 15 s long, so one side freezes for about 5 s (trim them, or
    record only the first 10 s);
  - a clip name with a stray ™ is skipped silently, and if every clip is missing the screen goes
    black with no message;
  - record on a machine with a GPU (otherwise it falls back to plain fades), with no cursor and
    no controls showing;
  - label it a sample, because the clips are Nordson's.

— Colophon

### Station 02 as a stack (Jacob, 2026-11-15, morning; discussion, nothing built)

- **The idea:** the wipe becomes a seven-image stack of one machine. The page opens on the photo in the centre. Left: Marketing illo, Engineering illo, Engineering drawing (dimensions TBC). Right: Product rendering (Lab), Design rendering (Blackglass), Design drawing (white on navy, grid TBC).
- **Transitions:** no motion. The slider cross-fades in place between neighbours (Colophon's proposal: a plain proportional fade first; linework-lingers only if that looks flat).
- **Machine:** ChromaBox for now, swapped later for a CB photo or the Cordis model. It depends on Gaffer's filter fix, which is waiting for Jacob's yes.
- **The centre:** the machine in a warehouse, not a stand-in duplicate. The source is a stock Cinema 4D model Jacob bought for its interior: `/Volumes/Today/Nordson/LIBRARY/STOCK/3D/Warehouse/c4d_physical.zip` (331 MB; `Full_Warehouse.c4d`, Physical renderer, ~100 textures). Licence: the purchase is what we have. Jacob: the warehouse should not be *recognisable* as the stock model anyway, so it gets worked up, not used as-is. Route: copy it off the unreliable drive, export FBX/glTF from C4D, rebuild the materials in the stage, and install it as a ShowCase look.
- **Decided (Jacob, same morning):** the warehouse becomes a ShowCase environment named **Hangar** (`looks/hangar/`: README, `source/` as bought, `scene/Hangar.blend`, `set-list.csv`, look code). It's an environment, not CAD: no STEP conversion. "Go ahead": Gaffer briefed on the filter fix first, then Hangar; the stack renders come after. The fade slider waits for Jacob's word.
- **Jacob's rulings (same morning):** commit the filter work; **no shading** of curved surfaces ("No shading unless it's shaded; flat looking is what it is"); the camera is **centred, symmetrical, low, heroic** (Gaffer is rendering one test at it); he doesn't remember the warehouse's store, so Hangar is still held.
- **The fade, built (Colophon, uncommitted on `ascend-hero`):** station 02's wipe is replaced by `.fade`, a stack of registered layers that cross-fade in place as you drag, and settle on the nearest stop on release. Arrow keys step a whole stop. Each layer's `data-label` feeds a named scale under the frame (on a phone, ticks plus the current name only). `data-follow` keeps the Structure/Expression copy tracking, and `data-start` sets the opening stop. It shares `bindDrag` with the wipe (two new options, `step` and `onRelease`), and West Elm's wipe is unchanged. Today it holds the two Cordis images, opening on the photograph. The seven-image stack drops in as more layers, with `data-start="3"`. Checked in Chrome: opening state, mid-drag blend, release, keys, scale clicks, 390 px. Audit clean.
- **Hangar built (Gaffer, directed live by Jacob; uncommitted):** the stock markings are gone. Nordson colours, with a doors gradient of #007AC9 → #0039AC, and the blue roof and steel kept. Warm, realistic light. A CC0 scanned-concrete floor (Poly Haven, Jacob approved). Three setups: Moody, Natural light and Day studio. Colour, sun, haze, skylights, fluorescents and studio lights are all knobs, each source its own light layer. Previews: `ascend-studio-stage/looks/hangar/scene/survey/setups-moody-natural-daystudio.jpg`. Open: the product reads flat white in all three; final-sample haze; DoF; a full-size render; the commit.
- **Jacob:** the ChromaBox is station 02's hero "for the time being", to get the rendering looks and the captions right. The Cordis comes back once its STEP is in.
  - **Copy:** while the ChromaBox stands in, the Structure/Expression lines (which are about the Cordis) come off, in the same change that loads the stack. "One engineering model, many creative outputs…" stays. They come back with the Cordis.
  - **The stack's names and lines (Jacob's, verbatim; they go in as data-label and data-note):**
    1. Engineering Drawing: For engineers and technical reviewers. Precise geometry and clearly defined components support technical evaluation without visual interpretation.
    2. Engineering Illustration: For operators, technicians, and technical documentation. Simplified forms make complex assemblies easier to identify, understand, and explain.
    3. Marketing Illustration: For brochures, presentations, and product literature. Technical accuracy meets visual clarity, making complex equipment accessible to a broader audience.
    4. In the Hall: For customers who need to understand the machine in context. An industrial setting communicates scale, installation, and the equipment’s place in a working environment.
    5. Product Rendering: For catalogues, sales materials, and product comparisons. Neutral presentation puts the equipment itself first, with consistent lighting and minimal distraction.
    6. Design Rendering: For campaigns, launches, and brand storytelling. Dramatic lighting and composition turn industrial equipment into compelling hero imagery.
    7. Design Drawing: For conceptual presentations and visual storytelling. The familiar language of blueprints communicates engineering intent, precision, and technical sophistication.
  - **Superseded: Jacob chose Colophon's trimmed version (same day).** These are the lines that go in:
    1. Engineering Drawing: For engineers and technical reviewers. Precise geometry, clearly defined components.
    2. Engineering Illustration: For operators, technicians, and documentation. Simplified forms make assemblies easy to identify and explain.
    3. Marketing Illustration: For brochures, presentations, and product literature. Technical accuracy with visual clarity.
    4. In the Hall: For customers who need the machine in context: scale, installation, a working floor.
    5. Product Rendering: For catalogues and product comparisons. The equipment first, nothing to distract.
    6. Design Rendering: For campaigns, launches, and brand storytelling.
    7. Design Drawing: For conceptual presentations. The language of blueprints: engineering intent, made visible.
- **Station 02 loaded with the ChromaBox stack (Colophon, uncommitted):** `assets/nordson/chromabox/1…7-*.jpg` at 2000 and 1200 px, from Gaffer's registered 3000×2000 PNGs (`_source/showcase/stack/`). Opens on #4, In the Hall, with Jacob's trimmed names and lines. One alt, on #4. The Structure/Expression pair is `hidden` (a CSS fix was needed: `.prose` beats `[hidden]`). On a phone the scale is ticks only, and the name leads the line. Checked in Chrome at desktop and 390 px. Pending: Gaffer's redelivery of 1, 2, 3 and 7 with the motor outline; then regenerate those JPGs.
- **Overnight, 15–16 Nov (Jacob asked for the comps to be logically correct; "black plexi is supposed to be a whole black look with reflections"):** Gaffer audited every look's compositing; Colophon checked the redeliveries and committed them (`ff38373`, not pushed).
  - **#6 Design Rendering:** now Blackglass in its own environment, with the plexi reflection meeting the base at the contact line, plus glow and smoke. The earlier export had set it on a plain black library background, which hid all of that. The renders already had it, so nothing was re-rendered.
  - **#4 In the Hall:** the Product layer was ~9% brighter than the product in the render, because the cutout pass hid the hall's haze. The Product is now the picture cut by the matte (ShowCase knob `product_from_picture`).
  - **#5 Product Rendering:** passed as it stood.
  - **Lab on a library background** printed the cyc's falloff as a grey floor band. Gaffer fixed it in ShowCase.
  - **Still open:**
    - The motor outline (1, 2, 3, 7). The cause is understood: the motor is a surface model, OCCT gives the dome no outline, and the seams sit on the outline. A new surface tracer is right but too slow (over 37 minutes on the 8K), so it's opt-in only. The current drawings stay until it's clean.
    - All of Gaffer's ShowCase code is uncommitted, awaiting Jacob's OK in Gaffer's session.
  - **Questions for Jacob (Gaffer's, nothing changed):**
    1. Keep a contact shadow on library backgrounds by default? Gaffer and the auditor recommend it.
    2. If so, Hangar needs a plate and a shadow pass (a build item).
    3. Should an export refuse or flag stale layers? Whiteglass's pair setup would export a mis-scaled depth drawing today.
    4. Clear light groups left over from a previous look out of the Layers list? (A small fix.)
    5. `jobs/_test-hangar.json` stays until Hangar tuning is done.
