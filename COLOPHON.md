# Colophon

A colophon is the note at the back of a book recording how the thing was made —
the press, the paper, the faces, the hands. This is that, for
**jacobhenderson.studio**, plus a map of where every other record lives.

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

**Built from** static HTML, CSS and about 250 lines of JavaScript. No framework,
no build step, nothing shipped that it didn't write. The only offline tool is an
image pipeline that turns `_source/` originals into served derivatives.

**The masthead** is four printing plates — cyan, magenta, yellow, registration
black — that begin badly out of register and pull in on load, stopping *just
short of true*. A press never registers perfectly, and the residual fringe is the
point.

---

## Where the record lives

| Document | What it holds |
|---|---|
| `README.md` | The argument the site makes, the seven rules, which component is right for which job, six traps already fallen into, the audit script, current state. **Start here.** |
| `docs/handoff.md` | The short baton. Where things are, what not to do, what's outstanding. |
| `docs/okqral-cleanup-brief.md` | A behaviour-preserving vestigial pass on okQRal, plus findings from a first look and the sequencing that matters. |
| `docs/embed-height.js` | The snippet each embedded product carries so it can report its own height. Same file in all three — do not fork it. |
| `docs/rebuild-plan.html` | The original plan. Superseded in places by what actually got built; kept because the reasoning still holds. |
| `tools/build-images.py` | `_source/` → `assets/`. Forces each pair to identical dimensions and reports whether every pair registered. |
| Commit messages | Where the *why* of each decision is written, including the ones that were wrong first. |

Longer-lived context — Jacob's positioning, the naming of The Ward, the graph
paper motif, and a recurring factual error about Arborist — is kept as memory
outside this repo, at
`~/.claude/projects/-Volumes-Today-jacobhenderson-studio/memory/`.

---

## Method

The site argues one thing: **compositing** — sources captured separately, under
conditions that never coincided, made into one thing that reads as though it
always was. Seven pieces demonstrate it at different scales.

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

*Rebuilt July 2026.*
