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

  Array.prototype.forEach.call(document.querySelectorAll('.wipe'), function (frame) {
    var range = frame.querySelector('.wipe-range');
    if (!range) return;

    function paint() {
      frame.style.setProperty('--wipe', range.value + '%');
    }

    range.addEventListener('input', paint);
    paint();
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
