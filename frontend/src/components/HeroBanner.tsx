'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Truck,
  ShieldCheck,
  Banknote,
  Sparkles,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  Flame,
  ArrowRight,
  Gift,
  Tag,
  Clock,
  ShoppingBag,
  Leaf,
  Percent,
  Croissant,
  Pause,
  Play,
} from 'lucide-react';

interface BannerSlide {
  id: string;
  badgeIcon: any;
  badgeText: string;
  badgeColor: string;
  title: string;
  highlightText: string;
  description: string;
  bgGradient: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryPill1Icon: any;
  secondaryPill1Text: string;
  secondaryPill2Icon: any;
  secondaryPill2Text: string;
  visualType: 'produce' | 'flash' | 'bakery' | 'perq';
}

const BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'slide-1',
    badgeIcon: Sparkles,
    badgeText: 'Farm-Fresh Supermarket Delivered',
    badgeColor: 'bg-fresh-500/20 text-fresh-300 border-fresh-400/30',
    title: 'Freshness You Can Taste.',
    highlightText: 'Delivered To Your Door.',
    description:
      'Karachi\'s favorite destination for handpicked organic fruits, farm-fresh vegetables, pure dairy, imported bakery, and premium household essentials.',
    bgGradient: 'from-[#0b1a0b] via-[#173416] to-[#0a1709]',
    primaryBtnText: 'Shop Fresh Aisles',
    primaryBtnLink: '#products-section',
    secondaryPill1Icon: Banknote,
    secondaryPill1Text: 'Cash on Delivery (COD)',
    secondaryPill2Icon: Truck,
    secondaryPill2Text: 'Express 2-Hour Karachi Slot',
    visualType: 'produce',
  },
  {
    id: 'slide-2',
    badgeIcon: Flame,
    badgeText: 'Weekend Flash Deals & Gourmet',
    badgeColor: 'bg-rose-500/25 text-rose-300 border-rose-400/40',
    title: 'Imported Cheeses & Gourmet Treats.',
    highlightText: 'Up to 40% OFF Selected Items.',
    description:
      'Indulge in artisanal Yayycheese cheddar, Belgian chocolates, organic pure honey, and imported pantry delicacies at exclusive warehouse prices.',
    bgGradient: 'from-[#3b1110] via-[#411716] to-[#1c0807]',
    primaryBtnText: 'Explore Flash Deals',
    primaryBtnLink: '#products-section',
    secondaryPill1Icon: Tag,
    secondaryPill1Text: 'Use Code FRESH10 (10% OFF)',
    secondaryPill2Icon: Clock,
    secondaryPill2Text: 'Limited Daily Stock',
    visualType: 'flash',
  },
  {
    id: 'slide-3',
    badgeIcon: Sparkles,
    badgeText: 'Daily 8:00 AM Fresh Oven',
    badgeColor: 'bg-amber-500/25 text-amber-300 border-amber-400/40',
    title: 'Golden Artisan Breads & Tortillas.',
    highlightText: 'Breakfast Made Exceptional.',
    description:
      'Freshly baked European baguettes, wholemeal tortillas, crisp waffles, and farm-fresh organic dairy delivered warm to your breakfast table.',
    bgGradient: 'from-[#3a0907] via-[#2c0a09] to-[#150504]',
    primaryBtnText: 'Browse Bakery Aisle',
    primaryBtnLink: '#products-section',
    secondaryPill1Icon: ShoppingBag,
    secondaryPill1Text: '100% Oven Fresh Guarantee',
    secondaryPill2Icon: Truck,
    secondaryPill2Text: 'Same-Day Morning Delivery',
    visualType: 'bakery',
  },
  {
    id: 'slide-4',
    badgeIcon: Gift,
    badgeText: 'Fresh Basket PERQ Rewards',
    badgeColor: 'bg-emerald-400/25 text-emerald-300 border-emerald-400/40',
    title: 'Your Groceries Can Give Back.',
    highlightText: 'Free Delivery Over PKR 2,500.',
    description:
      'Join our PERQ loyalty program to collect points on every grocery order in Karachi, unlock first-order cash bonuses, and redeem points at checkout.',
    bgGradient: 'from-[#0c1b0b] via-[#183917] to-[#071007]',
    primaryBtnText: 'Join PERQ & Save Now',
    primaryBtnLink: '#products-section',
    secondaryPill1Icon: ShieldCheck,
    secondaryPill1Text: 'Free Delivery Threshold: PKR 2,500',
    secondaryPill2Icon: Banknote,
    secondaryPill2Text: 'Instant Savings at Doorstep',
    visualType: 'perq',
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true); // safe default until we know
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // The progress bar's CSS animation *is* the timer: when it ends, advance (see onAnimationEnd below).
  // This keeps the bar and the slide change perfectly in sync and makes pausing trivial.
  const autoplay = !reduceMotion && !userPaused;

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % BANNER_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  };

  // Mobile Touch Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      nextSlide(); // Swiped left -> next slide
    } else if (diff < -50) {
      prevSlide(); // Swiped right -> prev slide
    }
    touchStartX.current = null;
  };

  const slide = BANNER_SLIDES[currentSlide];
  const BadgeIcon = slide.badgeIcon;
  const Sec1Icon = slide.secondaryPill1Icon;
  const Sec2Icon = slide.secondaryPill2Icon;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6 pb-2">
      {/* Main Interactive Carousel Banner */}
      <div
        className={`relative rounded-3xl overflow-hidden bg-gradient-to-r ${slide.bgGradient} text-white shadow-2xl p-6 sm:p-12 transition-all duration-700 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between group`}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured offers"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Dynamic Glow Shapes */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-fresh-500/20 blur-3xl pointer-events-none transition-all duration-700"></div>
        <div className="absolute left-1/3 -top-20 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none transition-all duration-700"></div>

        {/* Carousel Content */}
        <div key={slide.id} className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1" aria-live={autoplay && !isPaused ? 'off' : 'polite'}>
          {/* Left Text & Actions (7 Cols) */}
          <div className="lg:col-span-8 max-w-2xl space-y-3 sm:space-y-4 [&>*]:animate-fade-in-up [&>*:nth-child(2)]:[animation-delay:80ms] [&>*:nth-child(3)]:[animation-delay:160ms] [&>*:nth-child(4)]:[animation-delay:240ms]">
            {/* Top Pill Badge */}
            <div
              className={`inline-flex items-center space-x-1.5 sm:space-x-2 border px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm transition-all duration-300 ${slide.badgeColor}`}
            >
              <BadgeIcon className="w-3.5 h-3.5" />
              <span>{slide.badgeText}</span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {slide.title}{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fresh-400 via-emerald-200 to-brand-300">
                {slide.highlightText}
              </span>
            </h1>

            {/* Description */}
            <p className="text-emerald-50/90 text-sm sm:text-base sm:leading-relaxed max-w-xl">
              {slide.description}
            </p>

            {/* Action Buttons & Trust Tags */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-4">
              <a
                href={slide.primaryBtnLink}
                className="bg-white hover:bg-emerald-50 active:scale-95 text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg shadow-black/20 hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer group"
              >
                <span>{slide.primaryBtnText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-fresh-700 group-hover:translate-x-1 transition-transform" />
              </a>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 hover:border-white/30 px-3 py-2 rounded-2xl flex items-center space-x-2 text-xs sm:text-xs font-semibold transition cursor-default">
                <Sec1Icon className="w-3.5 h-3.5 text-fresh-400" />
                <span>{slide.secondaryPill1Text}</span>
              </div>

              <div className="hidden sm:flex bg-white/10 backdrop-blur-md border border-white/15 hover:border-white/30 px-3 py-2 rounded-2xl items-center space-x-2 text-xs sm:text-xs font-semibold transition cursor-default">
                <Sec2Icon className="w-3.5 h-3.5 text-emerald-300" />
                <span>{slide.secondaryPill2Text}</span>
              </div>
            </div>
          </div>

          {/* Right Visual Artwork Composition (4 Cols) */}
          <div className="hidden lg:flex lg:col-span-4 items-center justify-center select-none pointer-events-none animate-slide-in-right">
            {slide.visualType === 'produce' && (
              <div className="relative w-72 h-72 flex items-center justify-center">
                <div className="absolute inset-0 bg-fresh-500/20 rounded-full blur-2xl"></div>
                <div className="relative z-10 text-center space-y-3 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl animate-float">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fresh-400 to-fresh-600 text-white flex items-center justify-center mx-auto shadow-lg text-2xl">
                    <Leaf className="w-8 h-8" />
                  </div>
                  <h3 className="font-black text-lg text-white">Daily Farm Harvest</h3>
                  <p className="text-xs text-emerald-200/90 leading-snug">Inspected, chilled and dispatched within 2 hours across Karachi.</p>
                  <span className="inline-block bg-fresh-500 text-white text-xs font-black px-3 py-1 rounded-full tracking-wide">
                    100% Certified
                  </span>
                </div>
              </div>
            )}

            {slide.visualType === 'flash' && (
              <div className="relative w-72 h-72 flex items-center justify-center">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl"></div>
                <div className="relative z-10 text-center space-y-3 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl animate-float">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg text-2xl">
                    <Percent className="w-8 h-8" />
                  </div>
                  <h3 className="font-black text-lg text-white">Imported Delicacies</h3>
                  <p className="text-xs text-purple-200/90 leading-snug">Gourmet Belgian chocolates, imported butter, and aged cheeses.</p>
                  <span className="inline-block bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full tracking-wide">
                    Up to 40% OFF
                  </span>
                </div>
              </div>
            )}

            {slide.visualType === 'bakery' && (
              <div className="relative w-72 h-72 flex items-center justify-center">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl"></div>
                <div className="relative z-10 text-center space-y-3 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl animate-float">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center mx-auto shadow-lg text-2xl">
                    <Croissant className="w-8 h-8" />
                  </div>
                  <h3 className="font-black text-lg text-white">Artisan Oven Bake</h3>
                  <p className="text-xs text-amber-200/90 leading-snug">Golden sourdoughs, crusty baguettes, and fresh wholemeal rolls.</p>
                  <span className="inline-block bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full tracking-wide">
                    Morning Batch
                  </span>
                </div>
              </div>
            )}

            {slide.visualType === 'perq' && (
              <div className="relative w-72 h-72 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-2xl"></div>
                <div className="relative z-10 text-center space-y-3 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl animate-float">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-fresh-600 text-white flex items-center justify-center mx-auto shadow-lg text-2xl">
                    <Gift className="w-8 h-8" />
                  </div>
                  <h3 className="font-black text-lg text-white">PERQ Rewards Club</h3>
                  <p className="text-xs text-emerald-200/90 leading-snug">Earn points on every order & unlock special member discounts.</p>
                  <span className="inline-block bg-brand-600 text-white text-xs font-black px-3 py-1 rounded-full tracking-wide">
                    Free To Join
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Arrows & Bottom Indicator Strip */}
        <div className="relative z-20 mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          {/* Indicator pills – the active one fills while the slide is playing */}
          <div className="flex items-center gap-2">
            {BANNER_SLIDES.map((s, idx) => {
              const isActive = currentSlide === idx;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={isActive ? 'true' : undefined}
                  className="relative h-6 min-w-6 flex items-center justify-center cursor-pointer group/dot"
                >
                  <span
                    className={`relative block h-2 rounded-full overflow-hidden transition-all duration-300 ${
                      isActive ? 'w-10 bg-white/25' : 'w-2.5 bg-white/40 group-hover/dot:bg-white/70'
                    }`}
                  >
                    {isActive && (
                      <span
                        key={`${s.id}-${autoplay}`}
                        className={`absolute inset-0 origin-left rounded-full bg-emerald-300 ${autoplay ? 'animate-slide-progress' : ''}`}
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
            <span className="text-xs text-emerald-100/70 tabular-nums ml-2" aria-hidden="true">
              {currentSlide + 1} / {BANNER_SLIDES.length}
            </span>
          </div>

          {/* Left/Right Carousel Controls */}
          <div className="flex items-center gap-2">
            {!reduceMotion && (
              <button
                type="button"
                onClick={() => setUserPaused(p => !p)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                aria-label={userPaused ? 'Play carousel' : 'Pause carousel'}
              >
                {userPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer"
              aria-label="Previous Banner"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer"
              aria-label="Next Banner"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trust Badges Strip (with Smooth Hover Effects) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mt-4 sm:mt-6">
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 hover:border-fresh-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 flex items-center space-x-2.5 sm:space-x-3 transition-all duration-200 group cursor-default">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-fresh-50 text-fresh-600 group-hover:bg-fresh-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-200 shadow-2xs">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-fresh-700 transition-colors truncate">Free Delivery</h4>
            <p className="text-xs sm:text-xs text-slate-400 truncate">Over PKR 2,500</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 hover:border-emerald-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 flex items-center space-x-2.5 sm:space-x-3 transition-all duration-200 group cursor-default">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-200 shadow-2xs">
            <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">Cash On Delivery</h4>
            <p className="text-xs sm:text-xs text-slate-400 truncate">Pay at door in Karachi</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 hover:border-amber-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 flex items-center space-x-2.5 sm:space-x-3 transition-all duration-200 group cursor-default">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors truncate">100% Quality</h4>
            <p className="text-xs sm:text-xs text-slate-400 truncate">Handpicked & inspected</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 hover:border-purple-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 flex items-center space-x-2.5 sm:space-x-3 transition-all duration-200 group cursor-default">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-200 shadow-2xs">
            <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors truncate">WhatsApp Orders</h4>
            <p className="text-xs sm:text-xs text-slate-400 truncate">+92 21 111-373-742</p>
          </div>
        </div>
      </div>
    </div>
  );
}
