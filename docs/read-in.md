# Read-in

For the next Colophon. The aim is a clean start in about ten minutes, with
context that is *accurate* rather than merely large.

**Triggered by "hey colophon."** Jacob uses that as a standing instruction to run
this procedure before doing anything else. It is also recorded in memory, so a
session that has never seen this repo still knows to come here first.

Read in this order. Stop at each checkpoint and confirm before continuing — the
point is to catch a document that has gone stale, not to absorb everything.

---

## 1 · Orient (2 min)

```bash
cd ~/Desktop/dev.nosync/jacobhenderson-studio
git log --oneline -12
git status --short
```

Commit messages are where the *reasoning* lives, including for decisions that
were wrong first. Twelve is usually enough to see what the last session was
actually doing.

## 2 · The map (2 min)

Read **`COLOPHON.md`**. It is short, it says how the thing was made, and it
indexes every other document. You will know from it what you do *not* need to
read.

## 3 · The rules (4 min)

Read **`README.md`** in full. Sections 3 (Rules), 5 (which component is right for
which job) and 6 (Traps) are the ones that prevent rework. Most of that file
exists because something was got wrong first.

## 4 · What is live right now (1 min)

Read **`docs/handoff.md`**. Shorter than the README and more perishable — it is
the one most likely to be out of date.

## 5 · Verify before you trust any of it (1 min)

```bash
# does the code still match its own rules?
python3 - <<'EOF'
import re
site=open('css/site.css').read(); tokens=open('css/tokens.css').read()
html=open('index.html').read(); js=open('js/site.js').read()
code=re.sub(r'/\*.*?\*/','',site,flags=re.S)
defined=set(re.findall(r'\.([a-z][a-z0-9-]*)',code)); used={'org','w3'}
for c in re.findall(r'class="([^"]*)"',html): used.update(c.split())
used.update(re.findall(r"classList\.(?:add|remove|toggle)\('([^']+)'\)",js))
used.update(re.findall(r"querySelectorAll?\('\.([a-z0-9-]+)",js))
print('unused CSS  :', sorted(defined-used) or 'none')
print('undefined   :', sorted(used-defined) or 'none')
d=set(re.findall(r'^\s*(--[a-z0-9-]+):',tokens,re.M))
r=set(re.findall(r'var\((--[a-z0-9-]+)',site+tokens+js))
print('unused token:', sorted(d-r) or 'none')
n=[int(m.group(1)) for m in re.finditer(r'^/\* (\d+) ── ',site,re.M)]
print('sections    :', 'ok' if n==list(range(1,len(n)+1)) else f'DRIFT {n}')
EOF
```

Expected: `none`, `none`, the two reserved Nordson inks, `ok`.

**If a document contradicts the code, the code is right.** Several documents
here have now been corrected for confidently stating something untrue. Fix the
note; do not follow it.

The best of these is worth knowing by name. `README.md` §5 claimed **"All three
products embed"** — and made a point of correcting an earlier draft that had
said otherwise. `index.html` has contained exactly two iframes the whole time.
The row had been wrong in both directions, and the confident correction is what
made the second version convincing. **Count the iframes.**

A cheap habit that catches most of this: when a document states a number, a
path, or a status, check it as you read. `grep -c "iframe src=" index.html`,
`git status` in the product repo, `curl` the deployed URL. A to-do list is only
useful if every line is still true, and the ones that quietly go stale are the
ones nobody re-checks because they *sound* settled.

## 6 · Look at it (2 min)

```bash
python3 -m http.server 8787 --bind 127.0.0.1
```

Open <http://127.0.0.1:8787>, hard-reload to see the masthead register, drag a
wipe, open a disclosure, switch Paper/Plate. Ten seconds of this beats ten
minutes of reading CSS.

---

## Skip unless the task needs it

- `docs/rebuild-plan.html` — the original plan, superseded in places. The
  reasoning holds; the structure does not.
- The product repos — Codedesk, Picture Wrap, The Ward. Open one only when
  working on it, and read its own handoff first.
- `_source/` — originals for the image pipeline. Never edited by hand.

---

## Posture

Hard-won, and worth more than any of the above.

**Jacob's corrections are usually right.** When he pushes back, re-derive from
scratch rather than defending the previous answer. Several times this project
improved because a defence collapsed — the wipe, the accordion, the QR section
were all rebuilt after pushback and all ended better.

**Never build on an inference.** If you have filled a gap in what he asked for,
say which gap and what you assumed *before* writing code. Guessing and building
cost three rejected attempts in one session.

**Check computed state, not attributes.** A `hidden` attribute that is correctly
set can still be overridden by a class selector. Ask the browser what it
computed.

**An undefined custom property does not fall through — it wins, then
evaporates.** `border-radius: var(--shape-corner-md)` with no fallback outranks
`.rounded-md` on specificity; only *afterwards* does the undefined var make the
declaration invalid at computed-value time, resetting the property to its
initial value. So the rule that beat everything paints nothing, and the utility
class never gets its turn. Every control in Codedesk rendered square for this
reason. When a value is inexplicably `0` or `none`, check whether the token it
references was ever declared. `grep -- '--token-name\s*:'` is the whole test.

**Verify against the thing that ships, at the URL that ships it.** A fix was
deployed, confirmed present in the served file, and the site still showed the
old behaviour — because the browser held a cached copy of a `?v=`-stamped
script. That produced a false regression and a wasted round of debugging.
Hard-reload, or fetch the deployed asset and grep it, before believing a bug.

**A programmatic `.click()` is not a click.** Driving the Codedesk accordion
with `element.click()` produced states a real pointer never produces — closing
every drawer instead of opening one. Use real pointer events to verify
interaction; keep `.click()` for code that ships, where it runs in the app's own
sequence.

**If you need a before/after proof, put both under one origin.** Computed-style
diffing across two ports fails silently: `localStorage` is per-origin, so the
baseline never reaches the comparison. Serve both trees from one server as
`/before/` and `/after/`. Element *counts* also drift on their own in a live
app, so key the comparison by a stable path rather than by index — 851 shared
elements with zero differences is a proof; a matching total is not.

**Set state once and something else will unset it.** The embed's opening drawer
kept closing because `codedeskSetLocked()` shuts every drawer as part of its
job, and the filename gate calls it while wiring — order depending on boot
timing. A single click was a coin toss. If you must impose a state at load,
assert it briefly and idempotently rather than firing once, and only when it is
not already true, so it can never fight the visitor.

**Presentation belongs in the stylesheet.** Setting `.style.display` from
JavaScript is an inline style by another name: invisible to anyone reading the
CSS, and unreachable by the audit script. Jacob asked for this explicitly.
Script should do only what CSS cannot express — moving nodes between parents,
and seeding values.

**An embed may be a different product from the same code.** Codedesk framed
drops its header and setup ceremony and opens on a finished code; its normal
build still opens on a filename prompt with every drawer locked, because there
it is about to write a file to Drive. The rule that keeps it honest is **hide,
do not strip** — nothing is deleted, so the claim above the frame ("Change
anything") stays true. Do it in the product behind its own flag, never from the
embedding page.

**Test the state that ships.** A disclosure bug survived several checks because
every check rendered it `open`. If a thing has a default state, verify *that*.

**Verify in a browser, not by reasoning.** Every real bug this session was found
by rendering and looking. None were found by reading CSS.

**The copy is provisional.** All of it will be rewritten. Do not let it decide
anything.

**`/Volumes/Today` unmounts mid-write.** Nothing the site needs depends on it.
Keep it that way.

**Any agent that is not Colophon names itself before starting**, and uses that
name in its report and its commits. Jacob's convention, for bookkeeping. Put the
instruction in the brief rather than hoping the agent volunteers it — see the
first section of `docs/okqral-cleanup-brief.md` for the wording.
