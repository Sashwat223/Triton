'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar({ onOpenPreorder }: { onOpenPreorder: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full h-16 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#050505]/75 backdrop-blur-xl border-b border-white/10 shadow-2xl' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        <Link href="#overview" className="flex items-center gap-2.5 font-bold text-lg tracking-[0.25em] text-white">
          <svg className="w-5 h-5 text-[#00D6FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M5 7v10M19 7v10M8 4.5v15M16 4.5v15M2 9.5v5M22 9.5v5" />
          </svg>
          TRITON
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {['Overview', 'Technology', 'Sound', 'Design', 'Specs'].map((item) => (
            <Link 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>

        <button 
          onClick={onOpenPreorder}
          className="relative px-5 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(0,80,255,0.3)] transition-all"
        >
          Experience TRITON
        </button>
      </div>
    </header>
  );
}
