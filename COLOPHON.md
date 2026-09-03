# Colophon

A colophon is the note at the back of a book recording how the thing was made —
the press, the paper, the faces, the hands. This is that, for
**jacobhenderson.studio**, plus a map of where every other record lives.

> **Starting a session?** Follow `docs/read-in.md` — an ordered ten-minute
> procedure for getting accurate context rather than merely a lot of it.

---

## Materials

**Set in** Helvetica Neue for display, Charter for reading, SF Mono for labels
and data. System stacks, deliberately: a linked webfont would fail silently
against a strict CSP, and a face embedded as a data URI would cost more than it
returns. Helvetica Neue is the press face anyway.

**Palette** is press ink on paper. Light is the sheet — uncoated warm stock,
registration black, subtractive `multiply` ink. Dark is the plate, lit from
behind: the same inks switch to additive `screen`, so overlaps brighten the way
transmitted light does rather than muddying toward black. The metaphor inverts;
the colours are not merely flipped.

**The graph paper** — grey ground, two stroked grids — is Jacob's own recurring
motif, not a texture invented here. Two of the spot inks (treelawn green, lot
plum) come literally from `looks/lafayette-square/design.json` in The Ward.

**Built from** static HTML, CSS and about 300 lines of JavaScript (406 with its comments, which are half the point). No framework
and no bundler, nothing shipped that it didn't write. Three offline tools: an image
pipeline turning `_source/` originals into served derivatives, a stamper that
content-hashes the stylesheet and script links so a deploy cannot pair new markup
with a cached stylesheet, and a generator that draws the share card from the same
tokens the page uses.

**The live pieces are the products themselves**, framed from their own public
addresses — not screenshots, and not copies hosted here. Four of the ten run
that way. The Ward goes furthest: its slab and its player are separate payloads
by contract, so the page mounts them separately and lets you switch between
them, which is the site's whole argument demonstrated by the one piece that can
prove it rather than illustrate it.

**The masthead** is four printing plates — cyan, magenta, yellow, registration
black — that begin badly out of register and pull in on load, stopping *just
short of true*. A press never registers perfectly, and the residual fringe is the
point.

---

## Where the record lives

| Document | What it holds |
|---|---|
| `CLAUDE.md` | Binding instructions for a session: you are Colophon, follow the read-in first, the non-negotiables. Loaded as instruction rather than background, which memory is not. |
| `README.md` | The argument the site makes, the seven rules, which component is right for which job, every trap already fallen into, the audit script, current state. **Start here.** (It said "six traps" until 10 Aug, when there were thirteen. A count in a sentence nobody re-counts is a note that goes stale on its own — the traps are numbered nowhere, so do not number them here.) |
| `docs/read-in.md` | **Start-of-session procedure.** What to read, in what order, what to skip, how to verify the docs before trusting them, and the working posture. |
| `docs/handoff.md` | The short baton. Where things are, what not to do, what's outstanding. |
| `docs/okqral-cleanup-brief.md` | A behaviour-preserving vestigial pass on okQRal, plus findings from a first look and the sequencing that matters. |
| `docs/embed-height.js` | The snippet an embedded product carries so it can report its own height. Byte-identical wherever it appears — do not fork it. In Codedesk and Picture Wrap; wanted in Scale Machine; deliberately not in The Ward. |
| `docs/rebuild-plan.html` | The original plan. Superseded in places by what actually got built; kept because the reasoning still holds. |
| `tools/build-images.py` | `_source/` → `assets/`. Forces each pair to identical dimensions and reports whether every pair registered. Writes every body-column figure at two widths for the srcset — see README §10, which explains why the small one is 1200 and not 1000. |
| `tools/build-og.py` | The share card, `assets/og-card.png`. Reads the palette out of `css/tokens.css` at build time rather than copying it, so the card cannot drift from the page. Re-run after a palette change. |
| `sitemap.xml` | The page and the résumé. There is deliberately no `robots.txt` — Cloudflare serves a managed one that blocks the AI crawlers, and a repo copy risks overriding it. README §9. |
| `tools/stamp.py` | Content-hashes the `css/` and `js/` links in `index.html`. **Run before every push that touches either.** Cloudflare caches those assets for four hours but not the HTML, so an unstamped push ships new markup against the previous stylesheet. `--check` exits non-zero when a stamp is stale. |
| Commit messages | Where the *why* of each decision is written, including the ones that were wrong first. |

The products keep their own records, and for The Ward the relevant ones are
`SLAB-CONTRACT.md` (the slab/player boundary this site's embed exercises),
`ls/ARCHITECTURE.md` §7 (what the embed does, and the measurements behind why
it must never hide the canvas) and `cartograph/PREVIEW.md` §0.2 (the publish
gate — slab data goes straight to prod, code goes staging-first).

Longer-lived context — Jacob's positioning, the naming of The Ward, the graph
paper motif, and a recurring factual error about Arborist — is kept as memory
outside this repo, at
`~/.claude/projects/-Users-jacobhenderson-Desktop-dev-nosync-jacobhenderson-studio/memory/`.

---

## Method

The site argues one thing: **compositing** — sources captured separately, under
conditions that never coincided, made into one thing that reads as though it
always was. Ten pieces demonstrate it at different scales.

Much of what is written down exists because it was got wrong first. A wipe was
built three times before it was understood that centre-composed and
seam-follows-finger are geometrically incompatible. A stylus found a drag that a
mouse could not. Safari found a disclosure that Chrome could not. Each of those
is recorded with the reason it survived testing, which is usually more useful
than the fix.

Two documents in this repo have already been corrected for stating a decision
that had been overturned. A handoff note that is confidently wrong is worse than
no note, so if you find one here that contradicts the code, the code is right and
the note should be fixed rather than followed.

---

## Hands

**Jacob Henderson** — everything the site is about, and every decision that
mattered. The plate-and-composite reading of West Elm, the machine cut on one
axis, the three-position pill, the wipe that exposes its own copy, the graph
paper, The Ward.

**Colophon** — project adviser and chief librarian. Building, and keeping this
record straight.

**Dispatched agents** name themselves before starting and sign their work, so
this section can stay accurate as more hands touch the project. A colophon
records the hands; every hand needs a name.

*Rebuilt July 2026.*
