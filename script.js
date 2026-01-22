/**
 * Ascend Tour Site - Minimal JavaScript
 * Handles: Accordion, Theme Toggle, Modal, URL Hash Sync
 */

(function () {
  'use strict';

  // ================================
  // DOM References
  // ================================
  const body = document.body;
  const accordion = document.querySelector('.accordion');
  const drawerHeaders = document.querySelectorAll('.drawer-header');
  const themeToggle = document.querySelector('.theme-toggle');
  const hamburger = document.querySelector('.hamburger');
  const modal = document.getElementById('nav-modal');
  const modalClose = document.querySelector('.modal-close');

  // ================================
  // Accordion Control
  // ================================
  function openDrawer(drawerId) {
    const drawer = document.getElementById(drawerId);
    if (!drawer) return;

    const header = drawer.querySelector('.drawer-header');
    const panel = drawer.querySelector('.drawer-panel');
    if (!header || !panel) return;

    // Close all other drawers
    drawerHeaders.forEach((otherHeader) => {
      if (otherHeader !== header) {
        otherHeader.setAttribute('aria-expanded', 'false');
        const otherPanel = document.getElementById(
          otherHeader.getAttribute('aria-controls')
        );
        if (otherPanel) {
          otherPanel.hidden = true;
        }
      }
    });

    // Open this drawer
    header.setAttribute('aria-expanded', 'true');
    panel.hidden = false;

    // Move focus to panel for accessibility
    panel.setAttribute('tabindex', '-1');
    panel.focus({ preventScroll: true });

    // Scroll drawer into view
    drawer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Update URL hash
    updateHash(drawerId);
  }

  function closeDrawer(header) {
    header.setAttribute('aria-expanded', 'false');
    const panel = document.getElementById(header.getAttribute('aria-controls'));
    if (panel) {
      panel.hidden = true;
    }
    // Clear hash when closing
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname);
    }
  }

  function toggleDrawer(header) {
    const isExpanded = header.getAttribute('aria-expanded') === 'true';
    const drawer = header.closest('.drawer');

    if (isExpanded) {
      closeDrawer(header);
    } else {
      openDrawer(drawer.id);
    }
  }

  // Drawer header click handlers
  drawerHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      toggleDrawer(header);
    });

    // Keyboard support
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDrawer(header);
      }
    });
  });

  // ================================
  // URL Hash Sync
  // ================================
  function updateHash(drawerId) {
    const hash = `#${drawerId}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, '', hash);
    }
  }

  function handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash)) {
      openDrawer(hash);
    }
  }

  // Handle initial hash on load
  window.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash) {
      // Small delay to ensure DOM is fully ready
      setTimeout(handleHashChange, 100);
    }
  });

  // Handle hash changes
  window.addEventListener('hashchange', handleHashChange);

  // ================================
  // Theme Toggle
  // ================================
  const THEME_KEY = 'theme-preference';

  function getThemePreference() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function setTheme(theme) {
    body.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function toggleTheme() {
    const current = body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  // Initialize theme
  setTheme(getThemePreference());

  // Theme toggle click handler
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only auto-switch if user hasn't set a preference
    if (!localStorage.getItem(THEME_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ================================
  // Modal Control
  // ================================
  let previouslyFocusedElement = null;

  function openModal() {
    if (!modal) return;

    previouslyFocusedElement = document.activeElement;
    modal.showModal();
    hamburger?.setAttribute('aria-expanded', 'true');

    // Focus first focusable element in modal
    const firstFocusable = modal.querySelector('button, a, input, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  function closeModal() {
    if (!modal) return;

    modal.close();
    hamburger?.setAttribute('aria-expanded', 'false');

    // Return focus to trigger element
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
      previouslyFocusedElement = null;
    }
  }

  // Hamburger click handler
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeModal();
      } else {
        openModal();
      }
    });
  }

  // Modal close button
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // Close modal on backdrop click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Close modal on Escape (native dialog handles this, but we need to sync state)
    modal.addEventListener('close', () => {
      hamburger?.setAttribute('aria-expanded', 'false');
      if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
        previouslyFocusedElement = null;
      }
    });
  }

  // ================================
  // Focus Trap for Modal
  // ================================
  if (modal) {
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modal.querySelectorAll(
        'button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  // ================================
  // Keyboard Navigation
  // ================================
  document.addEventListener('keydown', (e) => {
    // Close modal on Escape
    if (e.key === 'Escape' && modal?.open) {
      closeModal();
    }
  });

  // ================================
  // Share FAB (Floating Action Button)
  // ================================
  (function initShareFab() {
    const shareFab = document.querySelector('.share-fab');
    const shareTrigger = document.querySelector('.share-fab-trigger');
    const shareMenu = document.querySelector('.share-menu');
    const toast = document.querySelector('.toast');
    const toastMessage = document.querySelector('.toast-message');

    if (!shareFab || !shareTrigger || !shareMenu) return;

    let isMenuOpen = false;
    let toastTimeout = null;

    // Show/hide FAB based on drawer state
    function updateFabVisibility() {
      const anyDrawerOpen = document.querySelector('.drawer-header[aria-expanded="true"]');
      if (anyDrawerOpen) {
        shareFab.hidden = false;
      } else {
        shareFab.hidden = true;
        closeMenu();
      }
    }

    // Toggle menu
    function toggleMenu() {
      if (isMenuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    function openMenu() {
      isMenuOpen = true;
      shareTrigger.setAttribute('aria-expanded', 'true');
      shareMenu.hidden = false;
    }

    function closeMenu() {
      isMenuOpen = false;
      shareTrigger.setAttribute('aria-expanded', 'false');
      shareMenu.hidden = true;
    }

    // Show toast notification
    function showToast(message) {
      if (!toast || !toastMessage) return;

      // Clear any existing timeout
      if (toastTimeout) {
        clearTimeout(toastTimeout);
        toast.classList.remove('hiding');
      }

      toastMessage.textContent = message;
      toast.hidden = false;

      // Auto-hide after 2.5s
      toastTimeout = setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => {
          toast.hidden = true;
          toast.classList.remove('hiding');
        }, 250);
      }, 2500);
    }

    // Get shareable URL
    function getShareUrl() {
      return window.location.href;
    }

    // Get current product name for share message
    function getCurrentProductName() {
      const openDrawer = document.querySelector('.drawer-header[aria-expanded="true"]');
      if (openDrawer) {
        const title = openDrawer.querySelector('.drawer-title');
        return title ? title.textContent : 'Jacob Henderson Studio';
      }
      return 'Jacob Henderson Studio';
    }

    // Copy link to clipboard
    async function copyLink() {
      const url = getShareUrl();
      try {
        await navigator.clipboard.writeText(url);

        // Visual feedback on button
        const copyBtn = shareMenu.querySelector('[data-action="copy"]');
        if (copyBtn) {
          const originalText = copyBtn.querySelector('span').textContent;
          copyBtn.classList.add('copied');
          copyBtn.querySelector('span').textContent = 'Copied!';

          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.querySelector('span').textContent = originalText;
          }, 2000);
        }

        showToast('Link copied to clipboard');
        closeMenu();
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Link copied to clipboard');
        closeMenu();
      }
    }

    // Share via SMS
    function shareViaSms() {
      const url = getShareUrl();
      const productName = getCurrentProductName();
      const message = `Check out ${productName}: ${url}`;

      // Use sms: protocol - works on iOS and Android
      const smsUrl = `sms:?&body=${encodeURIComponent(message)}`;
      window.open(smsUrl, '_self');

      closeMenu();
    }

    // Event listeners
    shareTrigger.addEventListener('click', toggleMenu);

    // Handle share options
    shareMenu.addEventListener('click', (e) => {
      const option = e.target.closest('.share-option');
      if (!option) return;

      const action = option.dataset.action;
      if (action === 'copy') {
        copyLink();
      } else if (action === 'sms') {
        shareViaSms();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (isMenuOpen && !shareFab.contains(e.target)) {
        closeMenu();
      }
    });

    // Close menu on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
        shareTrigger.focus();
      }
    });

    // Watch for drawer state changes
    drawerHeaders.forEach((header) => {
      const observer = new MutationObserver(updateFabVisibility);
      observer.observe(header, { attributes: true, attributeFilter: ['aria-expanded'] });
    });

    // Initial visibility check
    updateFabVisibility();
  })();

  // ================================
  // Animated Gradient Blob System
  // ================================
  (function initBlobAnimation() {
    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const blobs = document.querySelectorAll('.blob');
    if (!blobs.length) return;

    // Simplex-like noise using layered sine waves
    // Creates organic, non-repeating motion
    function noise(t, seed) {
      const s = seed * 1000;
      return (
        Math.sin(t * 0.0001 + s) * 0.5 +
        Math.sin(t * 0.00023 + s * 1.3) * 0.3 +
        Math.sin(t * 0.00017 + s * 0.7) * 0.2 +
        Math.sin(t * 0.000071 + s * 2.1) * 0.4 +
        Math.sin(t * 0.000037 + s * 1.7) * 0.3
      ) / 1.7; // Normalize to roughly -1 to 1
    }

    // Initialize blob state
    const blobStates = Array.from(blobs).map((blob, i) => {
      const speed = parseFloat(blob.dataset.speed) || 0.5 + Math.random() * 0.5;
      const radius = parseFloat(blob.dataset.radius) || 0.3 + Math.random() * 0.3;

      return {
        el: blob,
        // Unique seeds for each axis and property
        seedX: i * 3.7 + 0.1,
        seedY: i * 5.3 + 0.2,
        seedScale: i * 7.1 + 0.3,
        seedRotate: i * 11.3 + 0.4,
        // Motion parameters
        speed: speed,
        radius: radius, // Fraction of viewport
        // Starting time offset for variety
        timeOffset: i * 50000 + Math.random() * 100000,
      };
    });

    let startTime = null;
    let animationId = null;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;

      blobStates.forEach((state) => {
        const t = (timestamp + state.timeOffset) * state.speed;

        // Calculate organic offsets
        const offsetX = noise(t, state.seedX) * state.radius * 100; // vw units
        const offsetY = noise(t, state.seedY) * state.radius * 100; // vh units
        // Scale: current size is minimum (1.0), grows up to 1.5
        // Remap noise from (-1,1) to (0,1), then scale to (1.0, 1.5)
        const scaleNoise = (noise(t * 0.7, state.seedScale) + 1) / 2; // 0 to 1
        const scale = 1 + scaleNoise * 0.5; // 1.0 to 1.5
        const rotate = noise(t, state.seedRotate) * 10; // ±10 degrees

        // Apply transform (GPU-accelerated)
        state.el.style.transform = `
          translate(${offsetX}vw, ${offsetY}vh)
          scale(${scale})
          rotate(${rotate}deg)
        `;
      });

      animationId = requestAnimationFrame(animate);
    }

    // Start animation
    animationId = requestAnimationFrame(animate);

    // Pause when tab is hidden (performance)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      } else {
        if (!animationId) {
          startTime = null; // Reset to prevent jump
          animationId = requestAnimationFrame(animate);
        }
      }
    });
  })();

})();
