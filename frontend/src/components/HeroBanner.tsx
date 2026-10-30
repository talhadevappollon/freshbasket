'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

/**
 * Home page slider. Every slide is one banner image, so its height is fixed by the picture:
 * the shape never jumps between slides, and phones simply show the whole banner smaller.
 *
 * To add a banner: export it at 2496 x 1200 px, save a 2496-wide and a 1248-wide WebP in public/banners,
 * and add a line below.
 */
interface BannerSlide {
  id: string;
  alt: string;
  /** 1248 px wide (phones, standard screens) */
  small: string;
  /** 2496 px wide (large and high-density screens) */
  large: string;
}

const BANNER_WIDTH = 2496;
const BANNER_HEIGHT = 1200;

const BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'coming-soon-bag',
    alt: 'Fresh House is coming soon: a paper bag overflowing with fresh vegetables and fruit.',
    small: '/banners/coming-soon-bag-1248.webp',
    large: '/banners/coming-soon-bag-2496.webp',
  },
  {
    id: 'coming-soon-karachi',
    alt: 'Fresh House, the house of freshness, is coming soon to Karachi. Fresher choices closer to you.',
    small: '/banners/coming-soon-karachi-1248.webp',
    large: '/banners/coming-soon-karachi-2496.webp',
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true); // safe default until we know
  const touchStartX = useRef<number | null>(null);
  const count = BANNER_SLIDES.length;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // The progress bar's CSS animation *is* the timer: when it ends, advance (see onAnimationEnd below).
  // This keeps the bar and the slide change perfectly in sync and makes pausing trivial.
  const autoplay = !reduceMotion && !userPaused && count > 1;

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % count);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + count) % count);

  // Swipe on touch screens
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();
    touchStartX.current = null;
  };

  const arrow =
    'hidden sm:flex absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/30 hover:bg-black/55 active:scale-95 text-white items-center justify-center backdrop-blur-md border border-white/30 transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100';

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6 pb-2">
      <div
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-fresh-50 shadow-lg sm:shadow-2xl group"
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured banners"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* All slides share one grid cell, so the box is as tall as the picture and the slides cross-fade in place */}
        <div className="grid" aria-live={autoplay && !isPaused ? 'off' : 'polite'}>
          {BANNER_SLIDES.map((s, i) => {
            const active = i === currentSlide;
            return (
              <div
                key={s.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={!active}
                className={`col-start-1 row-start-1 transition-opacity duration-700 ease-out ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                <img
                  src={s.small}
                  srcSet={`${s.small} 1248w, ${s.large} 2496w`}
                  sizes="(min-width: 1344px) 1248px, calc(100vw - 32px)"
                  width={BANNER_WIDTH}
                  height={BANNER_HEIGHT}
                  alt={s.alt}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding="async"
                  draggable={false}
                  className="block w-full h-auto select-none"
                />
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <>
            <button type="button" onClick={prevSlide} aria-label="Previous banner" className={`${arrow} left-3 sm:left-4`}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button type="button" onClick={nextSlide} aria-label="Next banner" className={`${arrow} right-3 sm:right-4`}>
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Slide dots + pause, tucked into the bottom edge so they never hide the artwork text */}
            <div className="absolute bottom-1.5 right-2 sm:right-auto sm:bottom-3 sm:left-1/2 sm:-translate-x-1/2 flex items-center gap-0.5 sm:gap-1 rounded-full bg-black/35 backdrop-blur-md px-1.5 py-0.5 sm:px-2.5 sm:py-1">
              {BANNER_SLIDES.map((s, idx) => {
                const isActive = currentSlide === idx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to banner ${idx + 1}`}
                    aria-current={isActive ? 'true' : undefined}
                    className="relative h-6 min-w-5 sm:h-7 sm:min-w-6 flex items-center justify-center cursor-pointer group/dot"
                  >
                    <span
                      className={`relative block h-1.5 rounded-full overflow-hidden transition-all duration-300 ${
                        isActive ? 'w-7 sm:w-9 bg-white/35' : 'w-1.5 sm:w-2 bg-white/70 group-hover/dot:bg-white'
                      }`}
                    >
                      {isActive && (
                        <span
                          key={`${s.id}-${autoplay}`}
                          className={`absolute inset-0 origin-left rounded-full bg-white ${autoplay ? 'animate-slide-progress' : ''}`}
                          style={{
                            animationPlayState: isPaused ? 'paused' : 'running',
                            transform: autoplay ? undefined : 'scaleX(1)',
                          }}
                          onAnimationEnd={() => autoplay && nextSlide()}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
              {!reduceMotion && (
                <button
                  type="button"
                  onClick={() => setUserPaused(p => !p)}
                  aria-label={userPaused ? 'Play banners' : 'Pause banners'}
                  className="ml-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full text-white hover:bg-white/25 active:scale-95 flex items-center justify-center transition-colors cursor-pointer"
                >
                  {userPaused ? <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
