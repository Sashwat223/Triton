/**
 * TRITON — High-Performance Canvas Scrollytelling Engine
 * 
 * Drives 299-frame photorealistic 3D image sequence with:
 * - Instant first-frame rendering (zero delay)
 * - Bulletproof scroll-pinned scrollytelling (100vh locked inside 400vh container)
 * - Priority-based progressive preloading (keyframes first)
 * - Damped physics / Lerp scroll scrubbing
 * - Dynamic color filter shifts (Pearl White, Obsidian Black, Graphite, Midnight Blue)
 * - High-DPI / Retina canvas auto-scaling
 * - Bidirectional exploded-view & reassembly animation
 */

(function () {
  'use strict';

  const TOTAL_FRAMES = 299;
  const FRAME_PATH = (idx) => `Gifimages/ezgif-frame-${String(idx).padStart(3, '0')}.jpg`;

  // DOM Elements
  const container = document.getElementById('scrolly-section');
  const stickyViewport = container ? container.querySelector('.sticky-viewport') : null;
  const canvas = document.getElementById('product-canvas');
  if (!canvas || !container) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  const loaderPill = document.getElementById('loader-pill');
  const loaderBar = document.getElementById('loader-bar-fill');
  const loaderText = document.getElementById('loader-text');

  // Story Beats elements
  const beatHero = document.getElementById('beat-hero');
  const beatDesign = document.getElementById('beat-design');
  const beatEngineering = document.getElementById('beat-engineering');
  const beatSound = document.getElementById('beat-sound');
  const beatCta = document.getElementById('beat-cta');
  const hotspotGroup = document.getElementById('hotspots-engineering');

  // State
  const images = new Array(TOTAL_FRAMES + 1);
  const loadedFlags = new Array(TOTAL_FRAMES + 1).fill(false);
  let loadedCount = 0;
  let targetProgress = 0;
  let currentProgress = 0;
  let renderedFrame = -1;
  let isLoopRunning = false;
  let activeMode = 'film'; // 'film' | '3d'

  // DPR & Sizing
  let canvasWidth = 0;
  let canvasHeight = 0;
  let dpr = 1;

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Force redraw current frame or frame 1
    const frameToDraw = renderedFrame > 0 ? renderedFrame : 1;
    if (images[frameToDraw]) {
      drawFrame(frameToDraw);
    }
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });

  // --------------------------------------------------------------------------
  // Frame Preloader
  // --------------------------------------------------------------------------
  function preloadImage(idx) {
    return new Promise((resolve) => {
      if (images[idx]) {
        resolve(images[idx]);
        return;
      }
      const img = new Image();
      img.onload = () => {
        images[idx] = img;
        loadedFlags[idx] = true;
        loadedCount++;
        updateProgress();
        resolve(img);
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = FRAME_PATH(idx);
    });
  }

  function updateProgress() {
    const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
    if (loaderBar) loaderBar.style.width = `${pct}%`;
    if (loaderText) loaderText.textContent = `${pct}%`;

    if (loadedCount >= TOTAL_FRAMES && loaderPill) {
      setTimeout(() => {
        loaderPill.classList.add('hidden');
      }, 500);
    }
  }

  async function initPreloader() {
    // 1. Immediately load frame 1 for instant display
    resizeCanvas();
    const firstImg = await preloadImage(1);
    if (firstImg) {
      drawFrame(1);
    }

    // 2. Load keyframes (every 10th frame) for rapid responsiveness
    const keyframeIndices = [];
    for (let i = 1; i <= TOTAL_FRAMES; i += 10) {
      if (i !== 1) keyframeIndices.push(i);
    }
    await Promise.all(keyframeIndices.map(preloadImage));

    // 3. Concurrently stream all remaining frames in batches of 8
    const remaining = [];
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      if (!loadedFlags[i]) remaining.push(i);
    }

    const CONCURRENCY = 8;
    async function worker() {
      while (remaining.length > 0) {
        const nextIdx = remaining.shift();
        await preloadImage(nextIdx);
      }
    }
    const workers = Array.from({ length: CONCURRENCY }, () => worker());
    await Promise.all(workers);
  }

  // --------------------------------------------------------------------------
  // Canvas Rendering with Aspect Ratio & Deep Black Blending
  // --------------------------------------------------------------------------
  function drawFrame(frameIdx) {
    // Find closest loaded frame if this frame isn't loaded yet
    let activeImg = images[frameIdx];
    if (!activeImg) {
      for (let offset = 1; offset <= 20; offset++) {
        if (frameIdx - offset >= 1 && images[frameIdx - offset]) {
          activeImg = images[frameIdx - offset];
          break;
        }
        if (frameIdx + offset <= TOTAL_FRAMES && images[frameIdx + offset]) {
          activeImg = images[frameIdx + offset];
          break;
        }
      }
    }
    if (!activeImg) return;

    // Source dimensions (1920 x 1080)
    const sw = activeImg.naturalWidth || 1920;
    const sh = activeImg.naturalHeight || 1080;
    const imgAspect = sw / sh;

    const cw = canvas.width;
    const ch = canvas.height;
    if (cw === 0 || ch === 0) return;
    const canvasAspect = cw / ch;

    let dw, dh, dx, dy;

    // Contain scaling (Apple style)
    if (canvasAspect > imgAspect) {
      dh = ch;
      dw = ch * imgAspect;
      dx = (cw - dw) / 2;
      dy = 0;
    } else {
      dw = cw;
      dh = cw / imgAspect;
      dx = 0;
      dy = (ch - dh) / 2;
    }

    // Clear with deep pure black to ensure 100% seamless blend with page
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, cw, ch);

    // Draw the image
    ctx.drawImage(activeImg, 0, 0, sw, sh, dx, dy, dw, dh);
    renderedFrame = frameIdx;
  }

  // --------------------------------------------------------------------------
  // Scroll & Story Progress Mapping with Bulletproof Pinning
  // --------------------------------------------------------------------------
  function updateScrollProgress() {
    const rect = container.getBoundingClientRect();
    const totalScroll = container.offsetHeight - window.innerHeight;
    if (totalScroll <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / totalScroll));
    targetProgress = progress;

    // Bulletproof Hardware-Accelerated Pinning
    if (stickyViewport) {
      if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
        // Firmly pinned while scrolling through the 400vh sequence
        stickyViewport.style.position = 'fixed';
        stickyViewport.style.top = '0px';
        stickyViewport.style.bottom = 'auto';
      } else if (rect.bottom < window.innerHeight) {
        // Scrolled completely past the 400vh sequence
        stickyViewport.style.position = 'absolute';
        stickyViewport.style.top = totalScroll + 'px';
        stickyViewport.style.bottom = 'auto';
      } else {
        // Scrolled above the sequence
        stickyViewport.style.position = 'absolute';
        stickyViewport.style.top = '0px';
        stickyViewport.style.bottom = 'auto';
      }
    }

    if (!isLoopRunning) {
      isLoopRunning = true;
      requestAnimationFrame(renderLoop);
    }
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  // --------------------------------------------------------------------------
  // Animation Loop with Smooth Damping (Lerp)
  // --------------------------------------------------------------------------
  function renderLoop() {
    const diff = targetProgress - currentProgress;
    currentProgress += diff * 0.085;

    if (Math.abs(diff) < 0.0005) {
      currentProgress = targetProgress;
    }

    // Map progress to frame index [1 .. 299]
    // 0.00 -> 0.68: Forward from Frame 1 to 299 (Earbuds rise & explode to technical peak)
    // 0.68 -> 1.00: Reverse from Frame 299 back to 1 (Reassembly into final hero composition)
    let frameIdx;
    const PEAK_PROGRESS = 0.68;

    if (currentProgress <= PEAK_PROGRESS) {
      const ratio = currentProgress / PEAK_PROGRESS;
      frameIdx = Math.round(1 + ratio * (TOTAL_FRAMES - 1));
    } else {
      const returnRatio = (currentProgress - PEAK_PROGRESS) / (1 - PEAK_PROGRESS);
      frameIdx = Math.round(TOTAL_FRAMES - returnRatio * (TOTAL_FRAMES - 1));
    }

    frameIdx = Math.max(1, Math.min(TOTAL_FRAMES, frameIdx));

    if (frameIdx !== renderedFrame) {
      drawFrame(frameIdx);
    }

    updateStoryBeats(currentProgress);

    if (Math.abs(targetProgress - currentProgress) > 0.0005) {
      requestAnimationFrame(renderLoop);
    } else {
      isLoopRunning = false;
    }
  }

  // --------------------------------------------------------------------------
  // 5 Storytelling Beats Controller
  // --------------------------------------------------------------------------
  function updateStoryBeats(p) {
    // Fade out scroll indicator on scroll
    const scrollInd = document.getElementById('hero-scroll-indicator');
    if (scrollInd) {
      scrollInd.style.opacity = p > 0.05 ? '0' : '1';
      scrollInd.style.pointerEvents = p > 0.05 ? 'none' : 'auto';
    }

    // Beat 1: Intro Hero (0% - 15%)
    setBeatActive(beatHero, p >= 0 && p < 0.15);

    // Beat 2: Design & Engineering Reveal (15% - 38%)
    setBeatActive(beatDesign, p >= 0.16 && p < 0.38);

    // Beat 3: Smart Audio & Exploded Technical Showcase (39% - 62%)
    setBeatActive(beatEngineering, p >= 0.39 && p < 0.62);

    // Hotspot callouts during exploded peak
    if (hotspotGroup) {
      if (p >= 0.44 && p < 0.64) {
        hotspotGroup.classList.add('active');
      } else {
        hotspotGroup.classList.remove('active');
      }
    }

    // Beat 4: Sound & Acoustic Craft (63% - 82%)
    setBeatActive(beatSound, p >= 0.63 && p < 0.82);

    // Beat 5: Reassembly & Final CTA (83% - 100%)
    setBeatActive(beatCta, p >= 0.83);
  }

  function setBeatActive(el, isActive) {
    if (!el) return;
    if (isActive) {
      if (!el.classList.contains('active')) el.classList.add('active');
    } else {
      if (el.classList.contains('active')) el.classList.remove('active');
    }
  }

  // --------------------------------------------------------------------------
  // Dynamic Color Filter on Canvas
  // --------------------------------------------------------------------------
  const COLOR_FILTERS = {
    white: {
      name: 'CERAMIC WHITE',
      filter: 'none'
    },
    black: {
      name: 'OBSIDIAN BLACK',
      filter: 'brightness(0.30) contrast(1.35) saturate(0.12) drop-shadow(0 20px 40px rgba(0,0,0,0.95))'
    },
    graphite: {
      name: 'GRAPHITE',
      filter: 'brightness(0.62) contrast(1.10) saturate(0.22) drop-shadow(0 20px 40px rgba(0,0,0,0.85))'
    },
    navy: {
      name: 'GLOSSY NAVY',
      filter: 'hue-rotate(205deg) saturate(2.4) brightness(0.55) contrast(1.15) drop-shadow(0 20px 40px rgba(7,19,43,0.8))'
    }
  };

  window.applyTritonCanvasColor = function (colorKey) {
    const cfg = COLOR_FILTERS[colorKey];
    if (!cfg || !canvas) return;

    canvas.style.filter = cfg.filter;

    // Update hero label
    const label = document.getElementById('hero-color-name');
    if (label) label.textContent = cfg.name;

    // Update hero swatches active state
    document.querySelectorAll('.hero-swatch-btn').forEach((btn) => {
      if (btn.dataset.color === colorKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  // Color Swatch Click Listeners
  document.querySelectorAll('.hero-swatch-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const c = btn.dataset.color;
      if (c) {
        window.applyTritonCanvasColor(c);
        if (typeof window.syncTritonGlobalColor === 'function') {
          window.syncTritonGlobalColor(c);
        }
      }
    });
  });

  // Initialize
  initPreloader();
  updateScrollProgress();

  window.addEventListener('load', () => {
    resizeCanvas();
    drawFrame(1);
    updateScrollProgress();
  });

})();
