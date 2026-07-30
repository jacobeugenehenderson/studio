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
  ascend-portal-codedesk/  sparse partial clone of ascend-portal — only
                           codedesk/ materialised, 5.8 MB instead of 4.4 GB,
                           git lineage intact. The folder is renamed; the
                           GitHub repo is still ascend-portal, and must stay
                           that way — the live embed and Codedesk's own CSS
                           links both resolve through /ascend-portal/.
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
2. **Codedesk** — snippet added, uncommitted, in the sparse clone. Still needs
   its startup preset set to an emoji-styled code encoding `okqral.com`; it
   currently boots plain black-and-white, which contradicts the claim above it.
3. **Deploy** Codedesk and Picture Wrap — the snippet does nothing until live.
4. **Provincetown** section — not built. Meant to be the quiet one: flat scans,
   no interaction.
5. **From Jacob:** the Cordis pair (spec in README §8), and how many
   photograph/illustration pairs exist for the Nordson filmstrip.

## Parked, with notes already written

`docs/okqral-cleanup-brief.md` — a behaviour-preserving vestigial pass on okQRal,
including findings from a first look. Sequencing matters: the landing state is a
design decision and must be settled *before* the cleanup, or a careful agent will
prove the welcome path live and preserve code that is about to be deleted.
