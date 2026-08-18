/* ============================================================================
   site.js — jacobhenderson.studio
   ----------------------------------------------------------------------------
   Nothing in the hero. The plate registration on the name is pure CSS, so
   there is nothing to wait for before the page is right.

     1  the paper / plate switch, and a system preference changing under it
     2  the drag shared by the wipe and the peel
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

  /* ---- the curios mark: FALLBACK ONLY ------------------------------------
     The mark comes together on the scroll, and that is done in CSS with
     `animation-timeline: view()` (site.css §21) — presentation belongs in the
     stylesheet. This runs only where there is no scroll timeline (Firefox
     today): an observer trips the same keyframes on the clock when the mark
     comes into view. Exactly one of the two ever fires. */

  var scrollTimeline = window.CSS && CSS.supports &&
                       CSS.supports('animation-timeline', 'view()');
  var mark = scrollTimeline ? null : document.querySelector('.curios-mark');
  if (mark && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-registering');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.4 }).observe(mark);
  } else if (mark) {
    mark.classList.add('is-registering');
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
      commit(((event.clientX - box.left) / box.width) * 100);
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
    }
    frame.addEventListener('pointerup', release);
    frame.addEventListener('pointercancel', release);
    frame.addEventListener('lostpointercapture', function () { dragging = false; });

    /* keyboard, on the input, in steps a person can actually use */
    range.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 10 : 2;
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
    'https://lafayette-square.com',
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
     seeds the src. Everything visible is in css/site.css §18 — removing
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
    if (frame && base() !== box.getAttribute('data-embed-base')) frame.src = base();

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
