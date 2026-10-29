'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/** Thin reading-progress bar pinned to the top + a back-to-top button that appears after one screen. */
export default function ScrollUI() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      setShowTop(window.scrollY > window.innerHeight * 0.9);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none"
      >
        <div
          className="h-full origin-left bg-gradient-to-r from-fresh-400 via-emerald-400 to-brand-400"
          style={{ transform: `scaleX(${progress})`, transition: 'transform 80ms linear' }}
        />
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className={`fixed right-4 sm:right-auto sm:left-6 bottom-20 sm:bottom-6 z-40 w-11 h-11 rounded-full bg-slate-900/90 hover:bg-fresh-600 text-white backdrop-blur-md shadow-xl flex items-center justify-center transition-all duration-300 ease-out-expo cursor-pointer ${
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-4.5 h-4.5" />
      </button>
    </>
  );
}
