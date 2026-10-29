'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

const TOTAL_FRAMES = 299;
const FRAME_PATH = (idx: number) => `/Gifimages/ezgif-frame-${String(idx).padStart(3, '0')}.jpg`;

export default function ScrollyCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES + 1).fill(null));
  
  const [loadPct, setLoadPct] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeBeat, setActiveBeat] = useState<'hero' | 'design' | 'engineering' | 'sound' | 'cta'>('hero');

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Render a specific frame on canvas with aspect contain & black background
  const drawFrame = (frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let img = imagesRef.current[frameIdx];
    if (!img) {
      // Find nearest loaded frame
      for (let offset = 1; offset <= 20; offset++) {
        if (imagesRef.current[frameIdx - offset]) {
          img = imagesRef.current[frameIdx - offset];
          break;
        }
        if (imagesRef.current[frameIdx + offset]) {
          img = imagesRef.current[frameIdx + offset];
          break;
        }
      }
    }
    if (!img) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const sw = img.naturalWidth || 1920;
    const sh = img.naturalHeight || 1080;
    const imgAspect = sw / sh;
    const canvasAspect = cw / ch;

    let dw: number, dh: number, dx: number, dy: number;
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

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, sw, sh, dx, dy, dw, dh);
  };

  // Preload sequence
  useEffect(() => {
    let loadedCount = 0;

    const updateDpr = () => {
      if (!canvasRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasRef.current.width = window.innerWidth * dpr;
      canvasRef.current.height = window.innerHeight * dpr;
      drawFrame(1);
    };
    window.addEventListener('resize', updateDpr);

    const loadSingle = (i: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = FRAME_PATH(i);
        img.onload = () => {
          imagesRef.current[i] = img;
          loadedCount++;
          setLoadPct(Math.round((loadedCount / TOTAL_FRAMES) * 100));
          if (i === 1) updateDpr();
          resolve();
        };
        img.onerror = () => resolve();
      });
    };

    // Load first frame immediately
    loadSingle(1).then(async () => {
      // Stream keyframes
      const keyframes: number[] = [];
      for (let i = 1; i <= TOTAL_FRAMES; i += 10) {
        if (i !== 1) keyframes.push(i);
      }
      await Promise.all(keyframes.map(loadSingle));

      // Stream rest
      const remaining: number[] = [];
      for (let i = 2; i <= TOTAL_FRAMES; i++) {
        if (!imagesRef.current[i]) remaining.push(i);
      }
      
      const BATCH = 8;
      const workers = Array.from({ length: BATCH }, async () => {
        while (remaining.length > 0) {
          const next = remaining.shift();
          if (next) await loadSingle(next);
        }
      });
      await Promise.all(workers);
      setIsLoaded(true);
    });

    return () => window.removeEventListener('resize', updateDpr);
  }, []);

  // Sync scroll to frame index
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    // 0 -> 0.68: Forward exploded
    // 0.68 -> 1.00: Reassembly
    let frameIdx: number;
    const PEAK = 0.68;
    if (latest <= PEAK) {
      frameIdx = Math.round(1 + (latest / PEAK) * (TOTAL_FRAMES - 1));
    } else {
      const returnRatio = (latest - PEAK) / (1 - PEAK);
      frameIdx = Math.round(TOTAL_FRAMES - returnRatio * (TOTAL_FRAMES - 1));
    }
    frameIdx = Math.max(1, Math.min(TOTAL_FRAMES, frameIdx));
    drawFrame(frameIdx);

    // Active beat
    if (latest < 0.16) setActiveBeat('hero');
    else if (latest < 0.39) setActiveBeat('design');
    else if (latest < 0.63) setActiveBeat('engineering');
    else if (latest < 0.83) setActiveBeat('sound');
    else setActiveBeat('cta');
  });

  return (
    <section ref={containerRef} className="relative w-full h-[420vh] bg-[#050505]">
      <div className="sticky top-0 left-0 w-screen h-screen overflow-hidden flex items-center justify-center bg-[radial-gradient(circle_at_50%_50%,#060919_0%,#050505_75%)]">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] max-w-[900px] max-h-[600px] bg-[radial-gradient(ellipse,rgba(0,80,255,0.12)_0%,rgba(0,214,255,0.04)_40%,transparent_70%)] blur-[60px] pointer-events-none" />

        {/* Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-10" />

        {/* Loading Pill */}
        {!isLoaded && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#0a0a0e]/80 border border-white/10 rounded-full px-5 py-2 backdrop-blur-md flex items-center gap-3 text-xs font-mono text-white/60">
            <span>LOADING 3D SEQUENCE</span>
            <div className="w-20 h-1 bg-white/10 rounded overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#0050FF] to-[#00D6FF]" style={{ width: `${loadPct}%` }} />
            </div>
            <span>{loadPct}%</span>
          </div>
        )}

        {/* 5 Story Beats Overlays */}
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          {/* Beat 1: Hero */}
          <div className={`transition-all duration-700 max-w-2xl px-6 text-center ${activeBeat === 'hero' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8'}`}>
            <span className="text-xs font-mono tracking-[0.2em] text-[#00D6FF] uppercase mb-4 inline-block">Flagship Wireless Audio</span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-white via-white/90 to-[#00D6FF]/70 bg-clip-text text-transparent">Hear Beyond.</h1>
            <p className="text-xl md:text-2xl font-medium text-white/70 mt-3">Sound, without compromise.</p>
            <p className="text-base text-white/60 mt-4 max-w-lg mx-auto">Precision-crafted wireless audio. Designed for every moment.</p>
          </div>

          {/* Beat 2: Design */}
          <div className={`absolute left-8 md:left-24 max-w-md px-6 transition-all duration-700 ${activeBeat === 'design' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8'}`}>
            <span className="text-xs font-mono tracking-[0.2em] text-[#00D6FF] uppercase mb-3 inline-block">Ergonomics & Craft</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">Precision in every curve.</h2>
            <p className="text-base text-white/70 mt-4 leading-relaxed">Every contour is shaped for a refined fit and effortless everyday wear.</p>
            <p className="text-sm text-white/50 mt-3">From the acoustic openings to the charging case, every detail serves a purpose.</p>
          </div>

          {/* Beat 3: Exploded Engineering */}
          <div className={`absolute right-8 md:right-24 max-w-md px-6 transition-all duration-700 ${activeBeat === 'engineering' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8'}`}>
            <span className="text-xs font-mono tracking-[0.2em] text-[#00D6FF] uppercase mb-3 inline-block">Internal Architecture</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">Focus on what matters.</h2>
            <p className="text-base text-white/70 mt-4 leading-relaxed">Designed to bring your audio closer with intuitive low-latency control.</p>
            <p className="text-sm text-white/50 mt-3">A refined acoustic design for immersive everyday listening, powered by an 11mm titanium dynamic driver.</p>
          </div>

          {/* Beat 4: Acoustic Craft */}
          <div className={`absolute left-8 md:left-24 max-w-md px-6 transition-all duration-700 ${activeBeat === 'sound' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8'}`}>
            <span className="text-xs font-mono tracking-[0.2em] text-[#00D6FF] uppercase mb-3 inline-block">Acoustic Fidelity</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">Every note. Every detail.</h2>
            <p className="text-base text-white/70 mt-4 leading-relaxed">Designed to bring clarity, depth, and presence to your listening experience.</p>
            <p className="text-sm text-white/50 mt-3">A considered balance of comfort, design, and sound for everyday moments.</p>
          </div>

          {/* Beat 5: Reassembly & Final CTA */}
          <div className={`transition-all duration-700 max-w-xl px-6 text-center ${activeBeat === 'cta' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8'}`}>
            <span className="text-xs font-mono tracking-[0.2em] text-[#00D6FF] uppercase mb-3 inline-block">Flagship Reassembly</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white">Hear beyond the ordinary.</h2>
            <p className="text-lg md:text-xl font-medium text-white/70 mt-2">TRITON. Crafted for sound. Designed for life.</p>
            <p className="text-sm text-white/40 mt-1">Minimal design. Maximum presence.</p>
            <div className="flex gap-4 justify-center mt-8">
              <button className="px-8 py-3.5 rounded-full bg-[#0050FF] hover:bg-[#1a65ff] text-white font-semibold text-sm shadow-[0_0_25px_rgba(0,80,255,0.4)] transition-all">
                Experience TRITON
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
