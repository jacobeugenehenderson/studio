/* ============================================================================
   site.js — jacobhenderson.studio
   ----------------------------------------------------------------------------
   Two jobs only. The plate registration on the name is pure CSS, so there is
   no JavaScript in the hero and nothing to wait for.

     1  the paper / plate switch
     2  respecting a system preference change while the page is open

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
      ground === 'dark' ? 'Switch to paper — the light ground' : 'Switch to plate — the dark ground'
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

  function bindDrag(frame, range, apply) {
    var pending = null;

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

    function release(e) {
      dragging = false;
      try { frame.releasePointerCapture(e.pointerId); } catch (err) { /* fine */ }
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
  }

  /* ---- the wipe: one value, one clip ------------------------------------ */

  Array.prototype.forEach.call(document.querySelectorAll('.wipe'), function (frame) {
    var range = frame.querySelector('.wipe-range');
    if (!range) return;
    /* If the frame sits inside a .layers wrapper, publish the value there too as
       a 0–1 number, so sibling captions can dim toward whichever side is out of
       view. The frame alone cannot carry it — the captions are its siblings. */
    var host = frame.closest('.layers');

    bindDrag(frame, range, function (v) {
      frame.style.setProperty('--wipe', v + '%');
      if (host) host.style.setProperty('--wipe-n', v / 100);
    });
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
