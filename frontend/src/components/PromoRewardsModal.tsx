'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface PromoRewardsModalProps {
  /** Optional custom redirect URL for the primary button */
  linkUrl?: string;
  /** Optional coupon code unlocked upon joining */
  rewardCoupon?: string;
}

export default function PromoRewardsModal({
  linkUrl = '#products-section',
  rewardCoupon = 'FRESH10',
}: PromoRewardsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { setIsCartOpen } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    // Check if user has already dismissed the popup in the current session
    const hasSeen = sessionStorage.getItem('fb_perq_popup_dismissed');

    // Force open if url has ?rewards=open
    const params = new URLSearchParams(window.location.search);
    const forceOpen = params.get('rewards') === 'open' || params.get('perq') === '1';

    if (!hasSeen || forceOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem('fb_perq_popup_dismissed', 'true');
  };

  const handleJoinNow = (e: React.MouseEvent) => {
    // Save reward coupon in session storage for checkout
    try {
      sessionStorage.setItem('fb_applied_coupon', rewardCoupon);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(rewardCoupon);
      }
    } catch (err) {
      // ignore
    }

    setCopiedCode(true);

    // Save dismissal
    sessionStorage.setItem('fb_perq_popup_dismissed', 'true');

    setTimeout(() => {
      setIsOpen(false);
      // Smooth scroll to products if anchored
      if (linkUrl.startsWith('#')) {
        const targetId = linkUrl.substring(1);
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.location.href = linkUrl;
      }
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Fresh Basket Perq Rewards"
    >
      {/* Modal Card */}
      <div
        className="relative w-full max-w-[420px] bg-gradient-to-b from-[#377c35] via-[#2f6a2d] to-[#235021] text-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-8 shadow-2xl border border-white/20 overflow-x-hidden overflow-y-auto overscroll-contain animate-menu-in max-h-[calc(100dvh-2rem)] flex flex-col"
        data-surface="dark"
        onClick={e => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 50px -12px rgba(10, 60, 30, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* Subtle Organic Background Patterns */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-950/40 rounded-full blur-2xl"></div>
        </div>

        {/* Top Header inside Modal */}
        <div className="flex items-center justify-between relative z-10">
          {/* Brand Mark */}
          <div className="flex items-center space-x-1.5">
            <span className="inline-flex items-center bg-white rounded-full px-3 py-1.5 shadow-md">
              <img src="/logo-sm.png" alt="Fresh House" width={96} height={22} className="h-5 w-auto" />
            </span>
          </div>

          {/* Close Button with Playful Accent Doodles */}
          <div className="relative">
            {/* Playful spark doodle radiating near close button */}
            <svg
              viewBox="0 0 50 50"
              className="w-8 h-8 text-white/80 absolute -top-2.5 -left-6 pointer-events-none select-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 25 Q 18 12, 30 18 T 42 12" />
              <line x1="30" y1="8" x2="33" y2="3" />
              <line x1="38" y1="10" x2="42" y2="6" />
            </svg>

            <button
              ref={closeRef}
              onClick={handleDismiss}
              className="w-11 h-11 -mr-1.5 rounded-full bg-white/20 hover:bg-white/35 active:scale-95 text-white flex items-center justify-center transition backdrop-blur-xs cursor-pointer shadow-sm"
              aria-label="Close rewards popup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body Content */}
        <div className="relative z-10 mt-5 space-y-3">
          {/* PERQ 3D Sticker Badge */}
          <div>
            <span className="inline-block bg-black text-white font-black text-2xl sm:text-3xl tracking-wider px-3.5 py-0.5 rounded-xl border-2 border-black uppercase transform -rotate-1 shadow-[3px_4px_0px_#ffffff] select-none">
              PERQ
            </span>
          </div>

          {/* Punchy Headline */}
          <h2 className="text-2xl sm:text-[28px] font-black uppercase text-white tracking-tight leading-[1.08] drop-shadow-xs">
            YOUR GROCERIES
            <br />
            CAN GIVE BACK.
          </h2>

          {/* Explanatory Body */}
          <p className="text-sm text-emerald-50/95 leading-relaxed font-medium">
            Join Fresh Basket Perq Rewards to earn points on eligible orders, get a first order bonus, and redeem your points for savings at checkout.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={handleJoinNow}
              className="w-full h-12 inline-flex items-center justify-center bg-white hover:bg-emerald-50 active:scale-[0.98] text-slate-900 font-extrabold text-sm px-6 rounded-full shadow-lg shadow-black/15 transition duration-200 cursor-pointer group"
            >
              {copiedCode ? (
                <span className="flex items-center gap-1.5 text-fresh-700">
                  <CheckCircle2 className="w-4 h-4 text-fresh-600" />
                  Code {rewardCoupon} unlocked
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Join now, it&apos;s free
                  <ArrowRight className="w-4 h-4 text-slate-700 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full h-12 inline-flex items-center justify-center border border-white/60 hover:bg-white/15 active:bg-white/20 active:scale-[0.98] text-white font-semibold text-sm px-6 rounded-full transition duration-200 cursor-pointer"
            >
              Maybe later
            </button>
          </div>
        </div>

        {/* Bottom Graphic Artwork Composition */}
        <div className="relative z-10 mt-4 pt-3 flex items-end justify-between select-none pointer-events-none [@media(max-height:680px)]:hidden">
          {/* Left: Gift Box Doodle with Floating Sparkles & Coins */}
          <div className="relative w-32 h-28 shrink-0 flex items-end">
            <svg
              viewBox="0 0 120 120"
              className="w-full h-full text-white drop-shadow-md"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Gift Box Base */}
              <rect x="25" y="55" width="55" height="42" rx="4" />
              {/* Box Lid */}
              <rect x="20" y="45" width="65" height="12" rx="3" />
              {/* Vertical Ribbon */}
              <line x1="52" y1="45" x2="52" y2="97" />
              {/* Ribbon Bow */}
              <path d="M52 45 C40 28, 22 34, 38 45" />
              <path d="M52 45 C64 28, 82 34, 66 45" />

              {/* Floating Star Coins */}
              <g className="animate-pulse">
                <circle cx="16" cy="28" r="9" strokeWidth="2.4" />
                <path d="M16 23 L17.5 26.5 L21 27 L18.5 29.5 L19 33 L16 31 L13 33 L13.5 29.5 L11 27 L14.5 26.5 Z" fill="currentColor" stroke="none" />
              </g>

              <g>
                <circle cx="102" cy="40" r="8" strokeWidth="2.4" />
                <path d="M102 36 L103 38.5 L106 39 L104 41 L104.5 44 L102 42.5 L99.5 44 L100 41 L98 39 L101 38.5 Z" fill="currentColor" stroke="none" />
              </g>

              <circle cx="90" cy="18" r="6" strokeWidth="2" />
              <circle cx="14" cy="78" r="5" strokeWidth="2" />

              {/* Sparkle rays */}
              <line x1="8" y1="18" x2="4" y2="14" strokeWidth="2.2" />
              <line x1="26" y1="18" x2="30" y2="14" strokeWidth="2.2" />
            </svg>
          </div>

          {/* Right: Fresh Basket Green Canvas Tote Bag with Fresh Produce */}
          <div className="relative w-44 sm:w-48 h-36 shrink-0 flex items-end justify-end">
            {/* Produce Popping out of the bag */}
            <div className="absolute bottom-16 right-3 w-40 flex items-end justify-center gap-0.5 z-0">
              {/* Fresh Crusty Baguette */}
              <div
                className="w-6 h-20 bg-gradient-to-t from-[#b45309] via-[#f59e0b] to-[#fcd34d] rounded-t-full transform -rotate-12 shadow-sm border border-[#92400e]/20"
                title="Fresh French Baguette"
              >
                <div className="w-full h-1 bg-[#92400e]/30 my-3 transform -rotate-45"></div>
                <div className="w-full h-1 bg-[#92400e]/30 my-3 transform -rotate-45"></div>
                <div className="w-full h-1 bg-[#92400e]/30 my-3 transform -rotate-45"></div>
              </div>

              {/* Crisp Red Apple */}
              <div
                className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-700 rounded-full shadow-md transform -translate-x-1"
                title="Organic Red Apple"
              >
                <div className="w-1 h-2 bg-[#78350f] mx-auto -mt-1 rounded-full"></div>
              </div>

              {/* Ripe Bananas */}
              <div
                className="w-10 h-16 bg-gradient-to-br from-[#fde047] to-[#fbbf24] rounded-tl-3xl rounded-br-2xl transform rotate-12 shadow-md border-r-2 border-[#f59e0b]/40"
                title="Fresh Farm Bananas"
              >
                <div className="w-1.5 h-2 bg-emerald-800 rounded-t-full"></div>
              </div>

              {/* Vine Ripe Tomato */}
              <div
                className="w-8 h-8 bg-gradient-to-br from-red-600 to-rose-800 rounded-full shadow-md transform translate-x-1 translate-y-1"
                title="Fresh Tomato"
              >
                <div className="w-2 h-2 bg-emerald-600 mx-auto -mt-0.5 rounded-full"></div>
              </div>

              {/* Fresh Green Capsicum / Broccoli */}
              <div
                className="w-8 h-10 bg-gradient-to-br from-emerald-500 to-green-700 rounded-t-2xl shadow-sm transform -rotate-6"
                title="Organic Green Produce"
              ></div>
            </div>

            {/* The Green Canvas Tote Bag */}
            <div className="relative z-10 w-36 h-24 bg-gradient-to-b from-[#2f602e] to-[#1c3c1b] rounded-b-2xl rounded-t-lg shadow-xl border-t-2 border-[#427a40] flex flex-col items-center justify-center p-2">
              {/* Bag Handles */}
              <div className="absolute -top-6 w-16 h-8 border-3 border-[#2f602e] rounded-t-full shadow-xs"></div>

              {/* Canvas texture weave lines */}
              <div className="w-full flex flex-col items-center justify-center space-y-0.5 text-center mt-2">
                <span className="text-[11px] font-black tracking-tight text-white/95 leading-tight lowercase">
                  fresh basket
                </span>
                <span className="text-[7px] text-emerald-300/90 font-bold uppercase tracking-widest leading-none">
                  perq rewards
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
