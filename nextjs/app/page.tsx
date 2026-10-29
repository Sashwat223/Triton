'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ScrollyCanvas from '../components/ScrollyCanvas';

export default function Home() {
  const [isPreorderOpen, setIsPreorderOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      <Navbar onOpenPreorder={() => setIsPreorderOpen(true)} />
      
      {/* 420vh Sticky Canvas Scrollytelling Sequence */}
      <ScrollyCanvas />

      {/* Audio Lab & Synthesizer Section */}
      <section id="sound" className="py-32 px-6 bg-[#0A0A0C] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-mono tracking-[0.2em] text-[#00D6FF] uppercase mb-3 inline-block">Interactive Acoustic Lab</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Sound sculpted with mathematical precision.</h2>
            <p className="text-base text-white/60 mt-4 leading-relaxed">
              Binaural 3D spatial audio, active noise isolation, and natural transparency powered by TRITON’s custom acoustic engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
              <h3 className="text-xl font-semibold mb-2">3D Spatial Immersion</h3>
              <p className="text-sm text-white/60">Binaural rendering maps individual audio instruments in 360-degree space with dynamic head tracking.</p>
            </div>
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
              <h3 className="text-xl font-semibold mb-2">Active Isolation (-48dB)</h3>
              <p className="text-sm text-white/60">Dual high-SNR microphones sample external pressure 48,000 times per second for silence on demand.</p>
            </div>
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
              <h3 className="text-xl font-semibold mb-2">Smart Transparency</h3>
              <p className="text-sm text-white/60">Ultra-low latency audio passthrough allows conversations and transit announcements to sound completely natural.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Specs Bento Grid */}
      <section id="specs" className="py-32 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-mono tracking-[0.2em] text-[#00D6FF] uppercase mb-3 inline-block">Technical Specifications</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Every dimension considered.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-10 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
              <span className="text-xs font-mono tracking-widest text-[#00D6FF]">ENDURANCE ARCHITECTURE</span>
              <div className="text-6xl font-extrabold my-2 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                36<span className="text-xl text-[#00D6FF] ml-1">HOURS</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">Continuous Playback System</h3>
              <p className="text-sm text-white/60">8 hours in-ear + 28 hours via wireless smart charging case with Qi & USB-C fast charge.</p>
            </div>

            <div className="p-10 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
              <span className="text-xs font-mono tracking-widest text-[#00D6FF]">ACOUSTICS</span>
              <div className="text-6xl font-extrabold my-2 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                11<span className="text-xl text-[#00D6FF] ml-1">MM</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">Titanium Driver</h3>
              <p className="text-sm text-white/60">Custom multi-layer dynamic diaphragm with laser-etched acoustic ports.</p>
            </div>

            <div className="p-10 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
              <span className="text-xs font-mono tracking-widest text-[#00D6FF]">LATENCY</span>
              <div className="text-6xl font-extrabold my-2 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                35<span className="text-xl text-[#00D6FF] ml-1">MS</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">Ultra-Low Sync</h3>
              <p className="text-sm text-white/60">Real-time studio and gaming audio response without lip-sync delay.</p>
            </div>

            <div className="p-10 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
              <span className="text-xs font-mono tracking-widest text-[#00D6FF]">PROTECTION</span>
              <div className="text-6xl font-extrabold my-2 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                IP54
              </div>
              <h3 className="text-lg font-semibold mb-1">Water & Dust Defiance</h3>
              <p className="text-sm text-white/60">Hydrophobic acoustic mesh protection for high-intensity movement.</p>
            </div>

            <div className="p-10 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
              <span className="text-xs font-mono tracking-widest text-[#00D6FF]">WIRELESS</span>
              <div className="text-6xl font-extrabold my-2 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                5.4<span className="text-xl text-[#00D6FF] ml-1">BT</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">Bluetooth LE Audio</h3>
              <p className="text-sm text-white/60">Multi-point intelligent pairing with LC3 and lossless audio transmission.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Purchase CTA */}
      <section className="py-40 px-6 text-center bg-[radial-gradient(circle_at_50%_30%,#080D26_0%,#050505_75%)]">
        <div className="max-w-3xl mx-auto">
          <span className="text-xs font-mono tracking-[0.2em] text-[#00D6FF] uppercase mb-4 inline-block">Flagship Wireless Earbuds</span>
          <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-4">Hear beyond ordinary limits.</h2>
          <p className="text-lg text-white/60 mb-8">Crafted for sound. Designed for life. Complimentary laser engraving included.</p>
          <div className="text-3xl font-bold text-white mb-8">$299 USD</div>
          <button 
            onClick={() => setIsPreorderOpen(true)}
            className="px-10 py-4 rounded-full bg-[#0050FF] hover:bg-[#1a65ff] text-white font-semibold text-base shadow-[0_0_30px_rgba(0,80,255,0.4)] transition-all"
          >
            Experience TRITON
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-[#030303] border-t border-white/5 text-xs text-white/40">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-4">Copyright © 2026 TRITON Audio Technologies Inc. All rights reserved.</p>
          <p>Tuned to perfection. Designed in California.</p>
        </div>
      </footer>
    </div>
  );
}
