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
# EVERY declaration, not just the first on its line: the spacing scale is
# declared several per line, and an anchored regex saw one of each four.
tok=re.sub(r'/\*.*?\*/','',tokens,flags=re.S)
d=set(re.findall(r'(--[a-z0-9-]+)\s*:',tok))
r=set(re.findall(r'var\((--[a-z0-9-]+)',site+tokens+js))
print('unused token:', sorted(d-r) or 'none')
# The other half, and the expensive half — a token REACHED and never declared.
# An undefined custom property does not fall through; it wins on specificity and
# then evaporates at computed-value time, so the rule that beat everything paints
# nothing. No error, nothing wrong-looking in either rule. It rendered every
# control in Codedesk square. A var() WITH a fallback is safe by construction.
seeded=set(re.findall(r"setProperty\('(--[a-z0-9-]+)",js))
local=set(re.findall(r'(--[a-z0-9-]+)\s*:',code))
bare=set(re.findall(r'var\((--[a-z0-9-]+)\s*\)',site+tokens))
print('undef token :', sorted(bare-d-local-seeded) or 'none')
n=[int(m.group(1)) for m in re.finditer(r'^/\* (\d+) ── ',site,re.M)]
print('sections    :', 'ok' if n==list(range(1,len(n)+1)) else f'DRIFT {n}')
o,c=html.count('<!--'),html.count('-->')
print('comments    :', 'ok' if o==c else f'UNBALANCED {o} open / {c} close')
body=re.sub(r'<!--.*?-->','',html,flags=re.S)
VOID={'img','input','br','hr','meta','link','source','area','base','col'}
stack=[];bad=[]
for m in re.finditer(r'<(/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(/?)>',body):
    cl,nm,sf=m.group(1),m.group(2).lower(),m.group(3)
    if nm in VOID or sf: continue
    if not cl: stack.append(nm)
    elif stack and stack[-1]==nm: stack.pop()
    else: bad.append(nm)
print('tags        :', 'ok' if not stack and not bad else f'UNCLOSED {stack[:4]} MISMATCH {bad[:4]}')
EOF
```

Expected: `none`, `none`, **the six reserved tokens** (README §7 lists them and
why each is kept), `none`, `ok`, `ok`, `ok`.

⚠ This line said *"the two reserved Nordson inks"* until 2026-08-23, by which
point there were six and one of the inks had become ShowDesk's. An expectation
is a claim like any other: it goes stale, and it is the one nobody re-checks
because a passing audit *looks* like agreement. Read what it printed, not what
this line predicted.

**If a document contradicts the code, the code is right.** Several documents
here have now been corrected for confidently stating something untrue. Fix the
note; do not follow it.

The best of these is worth knowing by name, and it has now been wrong **four
times in a row** about the same fact. `README.md` §5 first claimed
renders-plus-a-link. Then it claimed all three products embed — correcting the
earlier draft, which is what made it convincing — when only two did. Then a
session wrote **"`grep -c "iframe src="` returns 2, and that is correct,"** with
the verification command right there beside it; it was true when written and
false one commit later, because removing a launcher put the frame back in the
markup. It said 3 here until 23 Aug 2026, when it had been **4** for a week —
so this passage, whose whole subject is a number that will not stay true, was
itself carrying the stale number. Run it: `grep -c "iframe src=" index.html`.

So: **check the count, and distrust the check itself.** A note that tells you
how to verify it can go stale in exactly the way the claim did. Re-derive what
the right question is, not just the answer.

A cheap habit that catches most of this: when a document states a number, a
path, or a status, check it as you read. `grep -c "iframe src=" index.html`,
`git status` in the product repo, `curl` the deployed URL. A to-do list is only
useful if every line is still true, and the ones that quietly go stale are the
ones nobody re-checks because they *sound* settled.

**Your own notes go stale fastest.** The four corrections above were each
written by someone who had just done the work. Within one session a handoff
here claimed Scene was "hidden by CSS" (hiding was the bug), described an
`!important` for a rule that had been deleted, and gave a percentage that had
changed. Re-read what you wrote before you commit it, not just what you found.

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

  **Working on a product and this page together?** Serve both, and the frame
  will use the local product: `data-embed-base-local` is honoured only when
  this page is on localhost. Otherwise the embed shows the last *deploy*, which
  is how a whole session went by looking at the right page and the wrong Ward.

  ⚠ **One git repository is not one job.** `lafayette-square.nosync` holds
  several separate codebases — the LS runtime, cartograph, arborist,
  meteorologist — and Jacob runs them as **separate jobs that must not
  overlap**, sharing a repo only for convenience. A branch is therefore *not* a
  single arc of work, and "push the trunk" can ship somebody else's job.

  On 30 July 2026 the trunk was **152 commits ahead of `origin`**: eight were
  the embed work, the other 144 were an unrelated extent / trees / intake /
  Łódź arc. Pushing would have deployed that other job to staging as a side
  effect of shipping this one.

  So, before any push: `git log origin/<branch>..HEAD --oneline | wc -l`, then
  check whether the work is even entangled —
  `git diff --name-only <first-of-yours>^..HEAD` against
  `git log origin/<branch>..<first-of-yours>^ -- <those files>`. The embed work
  overlapped the other 144 on **zero files**, so it could be lifted onto its own
  branch cleanly. Establish that separation *before* proposing a deploy, not
  after Jacob stops you.

  **The Ward deploys through Preview's Publish panel, not through git.** Bake →
  commit the slab → staging → promote. Slab *data* goes straight to prod; *code*
  is staging-first (`cartograph/PREVIEW.md` §0.2). `promote` fast-forwards
  `main` from the trunk, so it carries everything on it. Jacob's call, never an
  agent's.
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

**Performance is measured, never reasoned about — and measure the control.**
Asked why switching a live embed felt like a crash, I blamed four mechanisms in
turn and was wrong every time: the hiding method, `display:none` specifically,
the render-pause, and "it must be a dev-build artifact." The actual cause only
appeared once I ran the control — *sit still and change nothing* — which never
stalled at all. Isolate one variable per run, and run the do-nothing case first.

**Hiding an expensive live thing is not free.** Chrome drops a WebGL surface the
moment its canvas stops being visibly composited, and restoring context, shaders
and textures lands as ONE blocked frame of five to twelve seconds. Every route
does it: `visibility: hidden`, `display: none`, `opacity: 0`, a fully opaque
cover over it, or pausing its render loop. A *fully occluded* canvas is culled
exactly like a hidden one — that is the half nobody expects. Production stalled
8.2s, so it is not a dev artifact. The fix is to let it keep rendering and cover
it at `opacity: 0.95`; the last five percent is what keeps it composited. General
form: **an expensive live thing must keep costing what it costs, or you pay the
whole start-up again.** Full measurements in The Ward's `ls/ARCHITECTURE.md §7`.

**Embed the parts, not the front door.** When a product is built out of
separable pieces, framing the composed thing asserts the separation; framing the
pieces shows it. The Ward's slab and player are separate payloads by contract,
so the page mounts them separately and switches between them — by `postMessage`,
never by changing the frame's `src`, because a reload rebuilds the product's
WebGL context and resets its camera, and then three layers are three unrelated
pictures. See README §5.

**Do not invent a placeholder for a live embed.** The product already has a
loading screen. An invented card is one more thing to keep true, and it is not
what the product looks like.

**Never put a diagram beside the working version of the same thing.** A
wireframe can specify a demo; once the demo exists the wireframe can only
disagree with it. One demo area.

**The copy is provisional.** All of it will be rewritten. Do not let it decide
anything.

**`/Volumes/Today` unmounts mid-write.** Nothing the site needs depends on it.
Keep it that way.

**Any agent that is not Colophon names itself before starting**, and uses that
name in its report and its commits. Jacob's convention, for bookkeeping. Put the
instruction in the brief rather than hoping the agent volunteers it — see the
first section of `docs/okqral-cleanup-brief.md` for the wording.
