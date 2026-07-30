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
   happening. Make the startup code emoji-styled — and look at `presets` in
   `qr_type_manifest.json` while you are there: the key exists with an empty
   array for every type, so the mechanism was planned and never filled in. That
   is likely where a landing preset belongs, rather than values being seeded
   from `qr_sync_pipeline.js` as they are now.
2. **Picture Wrap — commit the snippet, then deploy.** `embed-height.js` is in
   the repo root, byte-identical to `docs/embed-height.js`, loaded at its
   `index.html:85` — but **untracked**, and `picture-wrap.com` serves no copy of
   it, so the site's frame still falls back to its CSS aspect ratio.
   Check: `git status` in `~/Desktop/dev.nosync/picture-wrap`, and
   `curl -s https://picture-wrap.com | grep -c embed-height` — `0` means
   undeployed.
3. **The Ward — not embedded yet.** Despite the intent recorded in README §5,
   `index.html` contains exactly two iframes, Codedesk and Picture Wrap; The
   Ward is still a three-state pill on placeholder art. Embedding it means
   adding `docs/embed-height.js` there too. It lives at
   `~/Desktop/lafayette-square.nosync`, a 184 GB working tree on branch
   `curb-offset-draw`, with **active in-flight work** — uncommitted
   `design.json` changes and a stack of `BRIEF-*.md` files, the latest commit
   retracting an earlier conclusion. Read `_handoffs/` and the open briefs
   first. Do not copy it.
   Check: `grep -c "iframe src=" index.html` — 2 today, 3 when this is done.
4. **Provincetown** — not built; no section exists in `index.html`. Meant to be
   the quiet one: flat scans, no interaction.
5. **From Jacob:** the Cordis pair (spec in README §8), and how many
   photograph/illustration pairs exist for the Nordson filmstrip.

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
