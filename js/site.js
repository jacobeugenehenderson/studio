/* ============================================================================
   site.js — jacobhenderson.studio
   ----------------------------------------------------------------------------
   Nothing in the hero. The plate registration on the name is pure CSS, so
   there is nothing to wait for before the page is right.

     1  the paper / plate switch, and a system preference changing under it
     2  the drag shared by the wipe, the fade and the peel
     3  the pager, and deep links into it
     4  opening a disclosure that the hash points inside
     5  embedded products reporting their own height
     6  the embed that waits to be asked before it loads

   The initial theme is stamped by a tiny inline script in <head>, before first
   paint, because doing it here would flash the wrong ground first.
   ========================================================================= */

(function () {
  'use strict';

  var root = document.documentElement;
  var STORE = 'jhs-stock';

  /* current ground, accounting for OS preference when the viewer has not
     chosen one explicitly */
  function current() {
    var chosen = root.getAttribute('data-theme');
    if (chosen === 'dark' || chosen === 'light') return chosen;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function describe(button, ground) {
    button.setAttribute(
      'aria-label',
      ground === 'dark' ? 'Switch to the light ground' : 'Switch to the dark ground'
    );
  }

  function wire(button) {
    describe(button, current());

    button.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      describe(button, next);
      try {
        window.localStorage.setItem(STORE, next);
      } catch (e) {
        /* private browsing — the switch still works for this page view */
      }
    });
  }

  var stock = document.querySelector('.stock');
  if (stock) wire(stock);

  /* ---- previewing a product without deploying it -------------------------
     Any framed product can carry data-src-local, and it is used INSTEAD of src
     when this page is itself served from localhost. The Ward already had this
     via data-embed-base-local; the others did not, so checking a change to
     Codedesk meant pushing it to Pages first and reading the result off the
     live site. That is a bad loop for a two-line CSS fix.

     Impossible in production, where the hostname test fails. If the local
     product is not running the frame fails to load, which is the correct and
     obvious signal — better than silently showing a stale deploy. Height
     messages already work: trustedOrigin accepts any localhost port while this
     page is local. */

  (function () {
    var here = window.location.hostname;
    if (here !== '127.0.0.1' && here !== 'localhost') return;
    Array.prototype.forEach.call(
      document.querySelectorAll('iframe[data-src-local]'),
      function (frame) { frame.setAttribute('data-src', frame.getAttribute('data-src-local')); }
    );
  }());

  /* ---- The Ward shows a different town each visit -------------------------
     Jacob, 2026-11-16. The towns are a hidden list in the markup
     ([data-ward-towns]), so adding one is markup only. Each visit takes the town
     AFTER the one this visitor last saw, so a returning visitor works through
     them all; a first visit starts at a random one. The choice is a per-viewer
     convenience in localStorage, and a browser that refuses storage simply gets
     a random town each time.

     It writes the town into the frame's data-src (the loader below gives it its
     src) and into the embed's data-embed-base, which the layer switch reads
     each time it posts, so the switch always targets the town actually showing.
     It runs BEFORE the loader and before The Ward's own block, which on
     localhost swaps in the local product over the top of whatever this chose. */

  (function () {
    var list = document.querySelector('[data-ward-towns]');
    var box = document.querySelector('.embed--ward');
    var frame = box && box.querySelector('iframe[data-src]');
    if (!list || !frame) return;
    var towns = Array.prototype.map.call(list.querySelectorAll('li[data-url]'), function (li) {
      return { url: li.getAttribute('data-url'), name: li.getAttribute('data-name'), place: li.textContent };
    });
    if (towns.length < 2) return;

    var KEY = 'ward-town';
    var last = null;
    try { last = window.localStorage.getItem(KEY); } catch (e) { /* no storage */ }
    var at = -1;
    for (var i = 0; i < towns.length; i++) if (towns[i].url === last) at = i;
    var pick = at >= 0 ? (at + 1) % towns.length : Math.floor(Math.random() * towns.length);
    var town = towns[pick];
    try { window.localStorage.setItem(KEY, town.url); } catch (e) { /* fine */ }

    box.setAttribute('data-embed-base', town.url);
    frame.setAttribute('data-src', town.url);
    frame.title = 'The Ward — ' + town.name + ', running';

    var piece = box.closest('.piece') || document;
    var where = piece.querySelector('[data-ward-town]');
    var name = piece.querySelector('[data-ward-name]');
    var visit = piece.querySelector('[data-ward-visit]');
    if (where) where.textContent = town.place;
    if (name) name.textContent = town.name;
    if (visit) visit.href = town.url;
  }());

  /* ---- the frames load in order, or as you approach them ------------------
     Jacob, 2026-11-16: "load things in order ~or~ as they approach the
     viewfinder." Four live products are framed on this page, and The Ward is
     a WebGL town. With `loading="lazy"` all four started within seconds of
     arriving, because lazy only waits until a frame is NEAR the screen, and
     on a fast line that's almost at once. The Ward then booted behind
     Ascend's stations, taking the processor and the GPU from the page being
     read. So no frame carries a src in the markup; it carries data-src, and
     two rules give it one:

     1. APPROACH: a frame within a screen of the viewport starts at once.
        Somebody who lands on #scale gets Scale Machine without queueing
        behind The Ward.
     2. IDLE, IN ORDER: once the page has loaded and gone quiet, the frames
        still waiting start in page order, ONE at a time, each after the last
        has loaded, pausing while the tab is hidden. Stay on Ascend and The
        Ward is already warming up by the time you reach it.

     A frame inside a clipped stepper panel doesn't intersect until its
     station is chosen, because ancestor clipping counts, so CodeDesk waits
     for station 03 or its turn. */

  (function () {
    var frames = Array.prototype.slice.call(document.querySelectorAll('iframe[data-src]'));
    if (!frames.length) return;

    function start(frame) {
      if (frame.getAttribute('src')) return;
      frame.src = frame.getAttribute('data-src');
    }

    if (!('IntersectionObserver' in window)) { frames.forEach(start); return; }

    var near = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        start(entry.target);
        near.unobserve(entry.target);
      });
    }, { rootMargin: '100% 0px' });
    frames.forEach(function (frame) { near.observe(frame); });

    var whenIdle = window.requestIdleCallback ||
                   function (cb) { return window.setTimeout(cb, 300); };

    function next() {
      if (document.hidden) {
        document.addEventListener('visibilitychange', function again() {
          if (document.hidden) return;
          document.removeEventListener('visibilitychange', again);
          next();
        });
        return;
      }
      var waiting = null;
      for (var i = 0; i < frames.length; i++) {
        if (!frames[i].getAttribute('src')) { waiting = frames[i]; break; }
      }
      if (!waiting) return;
      waiting.addEventListener('load', function () {
        window.setTimeout(function () { whenIdle(next, { timeout: 4000 }); }, 1500);
      }, { once: true });
      start(waiting);
    }

    function begin() {
      window.setTimeout(function () { whenIdle(next, { timeout: 4000 }); }, 1500);
    }
    if (document.readyState === 'complete') begin();
    else window.addEventListener('load', begin, { once: true });
  }());

  /* ---- the section marks: FALLBACK ONLY -----------------------------------
     The mark comes together on the scroll, and that is done in CSS with
     `animation-timeline: view()` (site.css §18, sections) — presentation belongs in the
     stylesheet. This runs only where there is no scroll timeline (Firefox
     today): an observer trips the same keyframes on the clock when the mark
     comes into view. Exactly one of the two ever fires. */

  var scrollTimeline = window.CSS && CSS.supports &&
                       CSS.supports('animation-timeline', 'view()');
  var marks = scrollTimeline ? [] : document.querySelectorAll('.group-mark');
  if (marks.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-registering');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(marks, function (m) { io.observe(m); });
  } else {
    Array.prototype.forEach.call(marks, function (m) { m.classList.add('is-registering'); });
  }

  /* ---- the registered wipe ---------------------------------------------
     The range input owns the value; this only mirrors it onto --wipe so the
     clip and the divider can follow. Authored CSS all lives in css/, and this
     custom property is dynamic state rather than styling.                  */

  /*
    Dragging is driven by Pointer Events on the frame, not by the range input.

    Native range inputs handle `pen` pointers inconsistently — a press that does
    not land on the thumb can register as tap-and-jump instead of a continuous
    drag, which feels sticky with a stylus. Pointer Events with
    setPointerCapture behave identically for mouse, touch and pen, and give
    sub-pixel positions.

    The range input remains the accessibility surface: focusable, announced as a
    slider, carrying a real value. It has pointer-events: none in CSS, so it
    never competes for the gesture.

    Position is written on the next animation frame, so a fast drag cannot queue
    more style writes than the compositor can draw.
  */

  /* Shared by .wipe and .peel: the drag mechanics are identical, only what the
     value means differs. `apply` receives 0–100 and writes whatever custom
     properties its component needs. */

  function bindDrag(frame, range, apply, opts) {
    var pending = null;
    var snapAt = opts && opts.snapAt;
    /* 20, not 7. Jacob asked for it to return to centre from "anywhere near"
       it — a seven-percent band is a nudge you have to aim for. Twenty means
       roughly the middle fifth of the frame lets go and settles. Shared with
       West Elm's ten pairs, which want the same thing. */
    var snapWithin = (opts && opts.snapWithin) || 20;

    function commit(value) {
      var v = Math.min(100, Math.max(0, value));
      range.value = v;
      if (pending !== null) return;
      pending = requestAnimationFrame(function () {
        pending = null;
        apply(parseFloat(range.value));
      });
    }

    function fromPointer(event) {
      var box = frame.getBoundingClientRect();
      if (!box.width) return;
      var f = (event.clientX - box.left) / box.width;
      commit(opts && opts.fromFraction ? opts.fromFraction(f) : f * 100);
    }

    /* A local flag is the source of truth for "is a drag in progress". Capture
       is attempted on top of it so the pointer keeps reporting outside the
       frame, but a browser that refuses capture still drags correctly. */
    var dragging = false;

    frame.addEventListener('pointerdown', function (e) {
      /* ignore secondary buttons so right-click does not yank the divider */
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true;
      try { frame.setPointerCapture(e.pointerId); } catch (err) { /* fine */ }
      fromPointer(e);
      e.preventDefault();
    });

    frame.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      fromPointer(e);
    });

    /* Let go near the middle and it eases back to it, rather than leaving the
       seam a percent or two off true. Pointer only — arrow keys should stay
       exact, and a keyboard user aiming for 48 means 48. */
    function snapHome() {
      if (snapAt == null) return;
      if (Math.abs(parseFloat(range.value) - snapAt) > snapWithin) return;

      frame.classList.add('is-snapping');
      commit(snapAt);
      window.setTimeout(function () {
        frame.classList.remove('is-snapping');
      }, 340);
    }

    function release(e) {
      if (!dragging) return;
      dragging = false;
      try { frame.releasePointerCapture(e.pointerId); } catch (err) { /* fine */ }
      snapHome();
      if (opts && opts.onRelease) opts.onRelease();
    }
    frame.addEventListener('pointerup', release);
    frame.addEventListener('pointercancel', release);
    frame.addEventListener('lostpointercapture', function () { dragging = false; });

    /* keyboard, on the input, in steps a person can actually use */
    range.addEventListener('keydown', function (e) {
      /* A component with stops (the fade) moves one whole stop per key. */
      var step = (opts && opts.step) || (e.shiftKey ? 10 : 2);
      var handled = true;
      var v = parseFloat(range.value);

      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') commit(v - step);
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') commit(v + step);
      else if (e.key === 'PageDown') commit(v - 20);
      else if (e.key === 'PageUp') commit(v + 20);
      else if (e.key === 'Home') commit(0);
      else if (e.key === 'End') commit(100);
      else handled = false;

      if (handled) e.preventDefault();
    });

    commit(parseFloat(range.value));
    return commit;
  }

  /* ---- the wipe: one value, one clip ------------------------------------ */

  Array.prototype.forEach.call(document.querySelectorAll('.wipe'), function (frame) {
    var range = frame.querySelector('.wipe-range');
    if (!range) return;
    /* Kept on the element so the pager can recentre a pair when it comes into
       view, without reaching into bindDrag's internals. */
    /* A wrapper marked data-wipe-follow also gets the value UNITLESS, so copy
       below the frame can lean toward whichever end is being uncovered. Only
       Nordson opts in; West Elm's ten pairs are unaffected. */
    var follow = frame.parentElement &&
                 frame.parentElement.closest('[data-wipe-follow]');

    frame.setWipe = bindDrag(frame, range, function (v) {
      frame.style.setProperty('--wipe', v + '%');
      if (follow) follow.style.setProperty('--wipe-n', v);
    }, { snapAt: 50 });
  });

  /* ---- the fade: one machine, several outputs, nothing moves -------------
     The drag value 0–100 runs along the layers in source order. Between two
     stops the upper layer's opacity is the fraction of the way across, so the
     picture cross-fades in place. On release it settles on the nearest stop.
     Labels and their one-line notes come from each layer's data-label and
     data-note, so the scale cannot drift from the art; data-tone="dark" flips
     the bar's ink on that layer; data-follow feeds the Structure/Expression copy
     below (100 = the drawing), interpolated like the opacity. */

  Array.prototype.forEach.call(document.querySelectorAll('.fade'), function (frame) {
    var range = frame.querySelector('.wipe-range');
    var layers = frame.querySelectorAll('.fade-layer');
    var n = layers.length;
    if (!range || n < 2) return;

    var span = 100 / (n - 1);
    var figure = frame.parentElement;
    var scale = frame.querySelector('.fade-scale');
    var bar = frame.querySelector('.fade-bar');
    var label = frame.querySelector('.fade-label');
    var follow = frame.parentElement && frame.parentElement.closest('[data-wipe-follow]');
    var note = figure && figure.querySelector('.fade-note');
    var labels = [], follows = [], notes = [], tones = [], ticks = [];

    Array.prototype.forEach.call(layers, function (layer, i) {
      labels.push(layer.getAttribute('data-label') || String(i + 1));
      follows.push(parseFloat(layer.getAttribute('data-follow')) || 0);
      notes.push(layer.getAttribute('data-note') || '');
      tones.push(layer.getAttribute('data-tone') === 'dark');
    });

    /* The bar sits on the picture, and the frame reads any press on itself as
       the start of a drag (as with the ALT badge), so presses on the bar stay
       on the bar. */
    if (bar) bar.addEventListener('pointerdown', function (e) { e.stopPropagation(); });

    /* Every note is written once and stacked in one grid cell (css/site.css),
       only the showing one visible, so the box is always as tall as the
       longest note and the copy below never moves. */
    var noteLines = [];
    if (note) {
      notes.forEach(function (text) {
        var line = document.createElement('span');
        line.textContent = text;
        note.appendChild(line);
        noteLines.push(line);
      });
    }

    /* the showing stop's number and name, in the bar's corner */
    var labelN, labelName;
    if (label) {
      labelN = document.createElement('span');
      labelName = document.createElement('span');
      labelN.classList.add('fade-n');
      label.appendChild(labelN);
      label.appendChild(labelName);
    }

    var commit;
    function settle(i) {
      frame.classList.add('is-settling');
      commit(i * span);
      window.setTimeout(function () { frame.classList.remove('is-settling'); }, 340);
    }

    if (scale) {
      labels.forEach(function (name, i) {
        /* one segment per stop; its name on hover */
        var li = document.createElement('li');
        li.title = name;
        li.addEventListener('click', function () { settle(i); });
        scale.appendChild(li);
        ticks.push(li);
      });
    }

    function apply(v) {
      var x = v / span;                            /* 0 … n-1 */
      var lo = Math.min(n - 2, Math.floor(x));
      var t = x - lo;                              /* 0 … 1 into the next layer */
      Array.prototype.forEach.call(layers, function (layer, i) {
        layer.style.opacity = i < lo ? 0 : i === lo ? 1 : i === lo + 1 ? t : 0;
      });
      var on = Math.round(x);
      ticks.forEach(function (li, i) {
        if (i === on) li.classList.add('is-on'); else li.classList.remove('is-on');
      });
      range.setAttribute('aria-valuetext', notes[on] ? labels[on] + '. ' + notes[on] : labels[on]);
      noteLines.forEach(function (line, i) {
        if (i === on) line.classList.add('is-on'); else line.classList.remove('is-on');
      });
      if (labelName && labelName.textContent !== labels[on]) {
        labelN.textContent = (on + 1 < 10 ? '0' : '') + (on + 1);
        labelName.textContent = labels[on];
      }
      if (tones[on]) frame.classList.add('is-dark'); else frame.classList.remove('is-dark');
      if (follow) {
        follow.style.setProperty('--wipe-n', follows[lo] + (follows[lo + 1] - follows[lo]) * t);
      }
    }

    var start = Math.min(n - 1, Math.max(0, parseInt(frame.getAttribute('data-start'), 10) || 0));
    range.value = start * span;
    commit = bindDrag(frame, range, apply, {
      step: span,
      /* Every stop gets an equal 1/n of the width, the same stretch as its
         segment underneath. Mapped straight across, the middle stops got a
         whole slot each and the two ENDS half a slot, a thin strip at each
         edge (Jacob, 2026-11-16: "make sure it's easy to reach the end
         states"). Inset by half a slot each side, the ends are as wide as the
         rest, and pointing at a segment lands on its stop. */
      fromFraction: function (f) { return ((f * n - 0.5) / (n - 1)) * 100; },
      onRelease: function () { settle(Math.round(parseFloat(range.value) / span)); }
    });

    /* Keys jump a whole stop; let that cross-fade too, rather than cut. This runs
       after bindDrag's own keydown, before the frame it scheduled. */
    range.addEventListener('keydown', function () {
      frame.classList.add('is-settling');
      window.setTimeout(function () { frame.classList.remove('is-settling'); }, 340);
    });

    /* Ready before it's asked for (Jacob, 2026-11-16: the views "don't
       immediately show or appear with the use of the slider"). Lazy layers
       fetch late, and even a fetched picture is decoded on first show, which
       is the stutter. So once the opening view is in, the others are fetched
       AND decoded, nearest stop first, one at a time, so a drag in either
       direction meets a picture that's ready. decode() is the browser
       preparing the bitmap off the main thread; a browser without it simply
       loads them. */
    var order = Array.prototype.slice.call(layers).map(function (layer, i) {
      return { img: layer.querySelector('img'), d: Math.abs(i - start) };
    }).filter(function (o) { return o.img; })
      .sort(function (a, b) { return a.d - b.d; });

    function warm(k) {
      if (k >= order.length) return;
      var img = order[k].img;
      img.loading = 'eager';
      var ready = img.decode ? img.decode() : Promise.resolve();
      ready.catch(function () { /* a failed decode still moves the queue on */ })
           .then(function () { warm(k + 1); });
    }
    function warmWhenOpen() {
      var first = order[0] && order[0].img;
      if (!first || first.complete) { warm(0); return; }
      first.addEventListener('load', function () { warm(0); }, { once: true });
      first.addEventListener('error', function () { warm(1); }, { once: true });
    }
    if (document.readyState === 'complete') warmWhenOpen();
    else window.addEventListener('load', warmWhenOpen, { once: true });
  });

  /* ---- the ALT badge -----------------------------------------------------
     The description lives in the image's own alt attribute and nowhere else.
     This copies it into the panel on demand, so the written text and the
     accessible text are the same string and cannot drift. Nothing is created
     if a frame has no described image.

     stopPropagation on pointerdown because the badge sits inside the wipe, and
     the frame treats any press on itself as the beginning of a drag. */

  Array.prototype.forEach.call(document.querySelectorAll('.alt-badge'), function (badge) {
    var frame = badge.closest('.wipe');
    var slide = badge.closest('.pager-slide') || frame.parentElement;
    var panel = slide && slide.querySelector('.alt-text');
    var img = frame && frame.querySelector('.wipe-after img');
    if (!panel || !img || !img.alt) { badge.remove(); return; }

    badge.addEventListener('pointerdown', function (e) { e.stopPropagation(); });

    badge.addEventListener('click', function () {
      var open = badge.getAttribute('aria-expanded') === 'true';
      if (!open && !panel.textContent) panel.textContent = img.alt;
      badge.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });

  /* ---- the pager --------------------------------------------------------
     One slide visible at a time, paged from the margins. Every slide stays in
     the DOM so the content is findable and printable; only visibility changes.

     Arrow keys are not bound globally — the buttons are focusable, so arrows act
     on whichever control has focus. That keeps them from fighting the wipe's own
     arrow-key handling on the same frame.                                    */

  Array.prototype.forEach.call(document.querySelectorAll('.pager'), function (pager) {
    var slides = pager.querySelectorAll('.pager-slide');
    var prev = pager.querySelector('.pager-btn--prev');
    var next = pager.querySelector('.pager-btn--next');
    var count = pager.querySelector('.pager-count');
    if (!slides.length) return;

    var at = 0;

    function show(i, moveFocus) {
      at = Math.min(slides.length - 1, Math.max(0, i));

      Array.prototype.forEach.call(slides, function (slide, n) {
        var isCurrent = n === at;
        slide.hidden = !isCurrent;

        /* Recentre the incoming pair so each one is met the same way. */
        if (isCurrent) {
          var frame = slide.querySelector('.wipe');
          if (frame && frame.setWipe) frame.setWipe(50);
        }
      });

      if (count) count.textContent = (at + 1) + ' / ' + slides.length;
      if (prev) prev.disabled = at === 0;
      if (next) next.disabled = at === slides.length - 1;

      /* Only pull focus when a jump link brought us here, never on a click —
         stealing focus mid-click is disorienting. */
      if (moveFocus) {
        var heading = slides[at].querySelector('.figure-cap');
        if (heading) heading.scrollIntoView({ block: 'nearest' });
      }
    }

    if (prev) prev.addEventListener('click', function () { show(at - 1); });
    if (next) next.addEventListener('click', function () { show(at + 1); });

    /* Deep links: #pair-8 from the prose pages straight to that pair, so an
       annotation in the copy can actually be followed. */
    function fromHash() {
      var m = /^#pair-(\d+)$/.exec(window.location.hash);
      if (m) show(parseInt(m[1], 10) - 1, true);
    }
    window.addEventListener('hashchange', fromHash);

    show(0);
    fromHash();
  });

  /* ---- links into collapsed content -------------------------------------
     A link is worthless if its target is inside a shut <details>, so anything
     addressed by the hash gets its ancestors opened first. Nested-safe, though
     nothing nests today.                                                      */

  function openForHash() {
    var id = window.location.hash.slice(1);
    if (!id) return;

    var el = document.getElementById(id);
    if (!el || !el.closest) return;

    var box = el.closest('details');
    while (box) {
      box.open = true;
      box = box.parentElement ? box.parentElement.closest('details') : null;
    }
  }

  window.addEventListener('hashchange', openForHash);
  openForHash();

  /* ---- embedded products sizing themselves ------------------------------
     An iframe has a fixed height; these apps do not — action up top, menus
     folding out below. Any height chosen from out here is wrong twice: dead
     space when collapsed, clipped or nested-scrolling when expanded.

     So the embedded product reports its own height and the frame follows. Until
     a message arrives the frame keeps its CSS aspect-ratio, so a product that
     has not adopted the snippet still looks deliberate.

     Two safeguards. Only known origins are trusted, or any framed page could
     resize itself at will. And the height is clamped, because a product
     reporting 20,000px would otherwise take over the page.                   */

  var EMBED_ORIGINS = [
    'https://jacobeugenehenderson.github.io',
    'https://picture-wrap.com',
    'https://lafayettesquare.online',
    'https://okqral.com'
  ];
  var EMBED_MIN = 420;
  var EMBED_MAX = 1200;

  /* When the SITE itself is being served from localhost, also trust locally
     served products — otherwise previewing an embed before deploying it is
     impossible, because every height message is rejected. This can never widen
     anything in production: on jacobhenderson.studio the hostname test fails. */
  function trustedOrigin(origin) {
    if (EMBED_ORIGINS.indexOf(origin) !== -1) return true;
    var here = window.location.hostname;
    var local = (here === '127.0.0.1' || here === 'localhost');
    return local && /^https?:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin);
  }

  window.addEventListener('message', function (e) {
    if (!trustedOrigin(e.origin)) return;

    var msg = e.data;
    if (!msg || msg.type !== 'embed-height' || typeof msg.height !== 'number') return;

    var frames = document.querySelectorAll('.embed iframe');
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow !== e.source) continue;
      var box = frames[i].parentElement;
      /* A frame marked data-fixed keeps its ratio and the product scrolls
         inside it. CodeDesk (Jacob, 2026-11-16): a station that grows every
         time a drawer opens shoves the whole page about. */
      if (box.hasAttribute('data-fixed')) break;
      var h = Math.min(EMBED_MAX, Math.max(EMBED_MIN, Math.ceil(msg.height)));
      box.style.setProperty('--embed-h', h + 'px');
      box.classList.add('is-sized');
      break;
    }
  });

  /* ---- an embed that waits to be asked ----------------------------------
     The Ward is a WebGL neighbourhood: several seconds to boot, and a GPU held
     for as long as it is on screen. `loading="lazy"` only defers until the
     frame nears the viewport, so it would start itself while the visitor is
     still reading two pieces up the page. This one loads when it is asked for.

     The script does only what CSS cannot: it swaps one node for another and
     seeds the src. Everything visible is in css/site.css §15, the shot — removing
     .embed--waiting is what hands the frame back to the ordinary embed rules.

     Focus follows the frame in. The button that had it is about to be removed,
     and letting focus fall back to <body> would drop a keyboard visitor at the
     top of the document having just asked to go somewhere. */

  /* The pill's three states, in the product's own vocabulary. `composite` is
     its front door — no param, exactly what the public gets. The other two are
     the anchors added to The Ward so the slab and the Player can be mounted
     separately (SLAB-CONTRACT.md §0). */
  var WARD_LAYERS = { slab: 'slab', composite: null, ward: 'player' };

  Array.prototype.forEach.call(document.querySelectorAll('.embed--ward'), function (box) {
    var piece = box.closest('.piece');
    var radios = piece ? piece.querySelectorAll('input[name="ward-view"]') : [];
    if (!radios.length || !box.getAttribute('data-embed-base')) return;

    function wanted() {
      for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) return WARD_LAYERS[radios[i].value] || null;
      }
      return null;
    }

    /* Where the product is served from. When THIS page is on localhost and the
       frame offers a local address, take it: otherwise the only way to see a
       change to the product from here is to deploy it first, which is how a
       whole session went by with the embed quietly showing the last staging
       build. Same carve-out, and the same reasoning, as trustedOrigin above —
       and equally impossible in production, where the hostname test fails.

       If the local product is not running the frame will fail to load, which
       is the correct and obvious signal. */
    function base() {
      var here = window.location.hostname;
      var local = (here === '127.0.0.1' || here === 'localhost');
      return (local && box.getAttribute('data-embed-base-local')) ||
             box.getAttribute('data-embed-base');
    }

    /* Switching layers must NOT reload the frame. A reload rebuilds the
       product's WebGL context and resets its camera, and then the three states
       are three separate pictures rather than one stack with its ground taken
       away. So the running app is told, and it swaps in place — the commons
       holds still while the slab goes out from under it.

       Targeted at the embed's own origin rather than '*', so the message is not
       readable by any other document that happens to be framed. The origin is
       read from the attribute each time, so the frame can be repointed
       (staging → prod, or a local build) without touching this file. */
    function tell() {
      var frame = box.querySelector('iframe');
      if (!frame || !frame.contentWindow) return;
      try {
        frame.contentWindow.postMessage(
          /* `ground` so the sheet the commons stands on is this page's own —
             the product cannot read our Paper/Plate switch from inside a
             cross-origin frame, so it is told. */
          { type: 'ward-layer', layer: wanted(), ground: current() === 'dark' ? 'plate' : 'paper' },
          new URL(base(), window.location.href).origin
        );
      } catch (e) { /* malformed base — nothing to talk to */ }
    }

    /* Point the frame at the local product when there is one. Seeding a src is
       the sort of thing script may do; the markup still carries the deployed
       URL, so view-source and production are unchanged. */
    var frame = box.querySelector('iframe');
    if (frame && base() !== box.getAttribute('data-embed-base')) frame.setAttribute('data-src', base());

    /* The frame starts later now (the loader, above), so a choice made on the
       pill or the theme before it was up would be lost. Say it again once it
       is. */
    if (frame) frame.addEventListener('load', function () { window.setTimeout(tell, 400); });

    /* ── This page's half of the frame budget ─────────────────────────────
       The Ward is a WebGL scene that keeps rendering for as long as it is
       mounted, and on this page it is one piece of ten — so it spends frames
       the whole time somebody is reading about West Elm two screens down.

       It cannot fix that by itself. A framed document's IntersectionObserver
       measures against its OWN viewport, and cross-origin it can see nothing
       of ours, so the Ward has no way to know where it sits here. This page
       watches and reports; the product decides what to do about it. That
       division is deliberate — the throttle lives in `src/lib/framedPresence.js`
       so every installation inherits it, not just this page. An embed must not
       fork the thing it embeds.

       ⛔ IDLE IS A LOWER FRAME RATE, NEVER A PAUSE. Going quiet is exactly what
       makes Chrome drop the WebGL surface, and getting it back is one blocked
       frame of 5–12 seconds — the same trap as hiding the canvas (README §6),
       reached from the other direction. Nothing here may ever send a stop.

       Half visibility is the line: mostly on screen is worth full rate, mostly
       gone is not. Silence means full rate, so a browser without the observer
       simply gets the product at its own speed. */
    var presence = null;
    function report(next) {
      if (next === presence) return;
      presence = next;
      var f = box.querySelector('iframe');
      if (!f || !f.contentWindow) return;
      try {
        f.contentWindow.postMessage(
          { type: 'ward-perf', presence: next },
          new URL(base(), window.location.href).origin
        );
      } catch (e) { /* malformed base, or the product is not up yet */ }
    }

    if (frame && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        report(entries[0].intersectionRatio >= 0.5 ? 'active' : 'idle');
      }, { threshold: [0, 0.5, 1] }).observe(frame);
    }

    /* The frame is lazy and the product mounts before it can listen, so the
       first report almost always lands on nothing. Re-send once it is up —
       clearing the cache first, because `report` refuses to repeat itself.
       If no observer ever ran there is nothing to say, and saying nothing is
       the safe answer. */
    if (frame) {
      frame.addEventListener('load', function () {
        if (presence === null) return;
        var last = presence;
        window.setTimeout(function () { presence = null; report(last); }, 400);
      });
    }

    Array.prototype.forEach.call(radios, function (radio) {
      radio.addEventListener('change', tell);
    });

    /* The sheet is this page's graph paper, so it has to follow this page's
       ground. Watching the attribute rather than hooking the switch keeps the
       two independent — the OS-preference path changes it too. */
    new MutationObserver(tell).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  });

  /* If the viewer never chose, follow the OS when it changes under us. */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    var stored = null;
    try {
      stored = window.localStorage.getItem(STORE);
    } catch (e) { /* ignore */ }
    if (!stored && stock) describe(stock, current());
  });
}());
