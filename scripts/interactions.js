/**
 * TRITON — Interactions, UI & Configurator Engine
 * 
 * Manages:
 * - Glassmorphic Apple-style Navbar behavior
 * - Colorway / Finish selector with dynamic lighting shifts
 * - Interactive Pre-Order Drawer with live engraving preview
 * - Hotspot detail triggers
 * - Smooth scroll navigation
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Apple-Style Navbar Scroll Behavior
  // --------------------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  function handleNavScroll() {
    if (!navbar) return;
    if (window.scrollY > 45) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // Mobile Menu Toggle
  const mobileBtn = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-nav-drawer');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  // --------------------------------------------------------------------------
  // 2. Interactive Colorway / Finish Switcher (Authentic Renders & Global Sync)
  // --------------------------------------------------------------------------
  const colorBtns = document.querySelectorAll('.color-swatch-btn');
  const stageImg = document.getElementById('color-stage-img');
  const colorNameLabel = document.getElementById('selected-color-name');
  const colorDescLabel = document.getElementById('selected-color-desc');

  const COLOR_DATA = {
    white: {
      name: 'Ceramic White',
      desc: 'Signature ceramic composite with liquid-clear reflections and microscopic acoustic vent accents.',
      image: 'assets/ceramic-white.jpg'
    },
    navy: {
      name: 'Glossy Navy',
      desc: 'Deep oceanic gloss finish reflecting ambient studio light with subtle navy-cyan gradients.',
      image: 'assets/glossy-navy.png'
    },
    graphite: {
      name: 'Graphite',
      desc: 'Aerospace-grade titanium slate with refined micro-texture and laser-cut venting.',
      image: 'assets/graphite.png'
    },
    black: {
      name: 'Obsidian Black',
      desc: 'Deep vapor-deposited stealth black with dark chrome highlights and acoustic mesh.',
      image: 'assets/obsidian-black.png'
    }
  };

  window.syncTritonGlobalColor = function (colorKey) {
    const data = COLOR_DATA[colorKey];
    if (!data) return;

    // 1. Update Design Section Image & Text
    if (stageImg && stageImg.src.indexOf(data.image) === -1) {
      stageImg.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      stageImg.style.opacity = '0.2';
      stageImg.style.transform = 'scale(0.97)';
      setTimeout(() => {
        stageImg.src = data.image;
        stageImg.alt = `TRITON ${data.name} Finish Preview`;
        stageImg.style.opacity = '1';
        stageImg.style.transform = 'scale(1)';
      }, 180);
    }

    if (colorNameLabel) colorNameLabel.textContent = data.name;
    if (colorDescLabel) colorDescLabel.textContent = data.desc;

    // 2. Update Design Section Swatches
    colorBtns.forEach(btn => {
      const dot = btn.querySelector('.color-dot');
      if (btn.dataset.color === colorKey) {
        if (dot) dot.classList.add('active');
      } else {
        if (dot) dot.classList.remove('active');
      }
    });

    // 3. Update Pre-Order Drawer Swatches
    document.querySelectorAll('.hero-swatch-btn-drawer').forEach(btn => {
      if (btn.dataset.color === colorKey) {
        btn.style.borderColor = 'var(--accent-cyan)';
        btn.style.color = '#FFFFFF';
        btn.style.boxShadow = '0 0 15px rgba(0, 214, 255, 0.35)';
      } else {
        btn.style.borderColor = 'var(--border-subtle)';
        btn.style.color = 'var(--text-secondary)';
        btn.style.boxShadow = 'none';
      }
    });

    // 4. Update Hero Canvas Swatches & Color Filter
    if (typeof window.applyTritonCanvasColor === 'function') {
      window.applyTritonCanvasColor(colorKey);
    }
  };

  // Swatch click in Finishes Section
  colorBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const colorKey = btn.dataset.color;
      if (colorKey) window.syncTritonGlobalColor(colorKey);
    });
  });

  // Drawer swatch click
  document.querySelectorAll('.hero-swatch-btn-drawer').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const colorKey = btn.dataset.color;
      if (colorKey) window.syncTritonGlobalColor(colorKey);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Pre-Order & Configurator Drawer
  // --------------------------------------------------------------------------
  const preOrderModal = document.getElementById('preorder-modal');
  const openModalBtns = document.querySelectorAll('.trigger-preorder');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const engraveInput = document.getElementById('engrave-input');
  const engravePreview = document.getElementById('engrave-preview-text');

  function openModal() {
    if (preOrderModal) {
      preOrderModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (preOrderModal) {
      preOrderModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (preOrderModal) {
    preOrderModal.addEventListener('click', (e) => {
      if (e.target === preOrderModal) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Live Engraving Preview
  if (engraveInput && engravePreview) {
    engraveInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      engravePreview.textContent = val.length > 0 ? `“${val.toUpperCase()}”` : '“NO ENGRAVING”';
    });
  }

  // --------------------------------------------------------------------------
  // 4. Hotspot Click Interactions
  // --------------------------------------------------------------------------
  const hotspots = document.querySelectorAll('.hotspot-pin');
  hotspots.forEach(pin => {
    pin.addEventListener('click', () => {
      const card = pin.querySelector('.hotspot-card');
      if (card) {
        const isShown = card.style.opacity === '1';
        card.style.opacity = isShown ? '0' : '1';
        card.style.pointerEvents = isShown ? 'none' : 'auto';
      }
    });
  });

  // --------------------------------------------------------------------------
  // 5. Smooth Anchor Scroll
  // --------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
        if (mobileMenu && mobileMenu.classList.contains('open')) {
          mobileMenu.classList.remove('open');
        }
      }
    });
  });

})();
