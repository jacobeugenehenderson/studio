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

**If a document contradicts the code, the code is right.** Two documents here
have already been corrected for confidently stating a decision that had been
overturned. Fix the note; do not follow it.

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
