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

1. **The Ward** — embed it like Codedesk and Picture Wrap, and add
   `docs/embed-height.js`. It lives at `~/Desktop/lafayette-square.nosync`, a
   full 184 GB working tree on branch `curb-offset-draw`. **It has active
   in-flight work** — uncommitted `design.json` changes and a stack of
   `BRIEF-*.md` files, the latest commit retracting an earlier conclusion. Read
   `_handoffs/` and the open briefs before touching anything. Do not copy it.
2. **Codedesk** — extracted and standalone at `~/Desktop/dev.nosync/codedesk`,
   snippet committed. The embed now opens on a finished code encoding
   `www.okQRal.com`, with Caption open and no filename ceremony, so the credit
   line under the embed is true. **Still black-and-white**: the emoji palette
   half of that outstanding item is not done, and the claim *"pick an emoji and
   it becomes the code's palette"* is still only demonstrable by hand. Landing
   state changed in embed mode only — normal use keeps the ceremony, because
   that flow names a working file before writing it to Drive.
3. **Deploy** Codedesk and Picture Wrap — the snippet does nothing until live.
   Codedesk now needs a decision it did not need before: the site still embeds
   `jacobeugenehenderson.github.io/ascend-portal/codedesk/` (`index.html:625`),
   which is served from the *old* repo and will not receive anything committed
   to the new one. Either deploy the standalone repo and repoint the embed, or
   keep publishing through the portal. Do not leave it half-done — the failure
   mode is editing the extracted repo and wondering why the site never changes.
4. **Provincetown** section — not built. Meant to be the quiet one: flat scans,
   no interaction.
5. **From Jacob:** the Cordis pair (spec in README §8), and how many
   photograph/illustration pairs exist for the Nordson filmstrip.

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
