'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Reveal from '@/components/Reveal';
import { Sparkles, ArrowRight, ShieldCheck, Flame, Gift, Clock, Truck, Heart } from 'lucide-react';

const CATEGORY_ROUTES: Record<string, string> = {
  'fresh-produce': '/category/karachi-breakfast',
  'dairy-cheese': '/category/dairy',
  'bakery-breakfast': '/category/bakery-items',
  'beverages-juices': '/category/karachi-beverages',
  'pantry-cooking': '/category/karachi-pantry-cooking-ingredients',
  'baby-food': '/category/karachi-baby-food',
  '': '/#products-section',
};

export default function MidPageBanners() {
  const [copied, setCopied] = React.useState(false);
  const router = useRouter();
  const handleClickAisle = (slug: string) => {
    const route = CATEGORY_ROUTES[slug] ?? `/category/${slug}`;
    if (route.startsWith('/#') && window.location.pathname === '/') {
      document.getElementById(route.slice(2))?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(route);
    }
  };

  // Non-button elements that behave as links get proper role + keyboard support
  const linkProps = (slug: string) => ({
    role: 'link' as const,
    tabIndex: 0,
    onClick: () => handleClickAisle(slug),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClickAisle(slug);
      }
    },
  });

  return (
    <Reveal as="section" className="max-w-7xl mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-black tracking-wide text-fresh-600 bg-fresh-50 border border-fresh-200 px-2.5 py-0.5 rounded-full inline-block mb-1">
            Curated Collections
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-fresh-600 animate-pulse" />
            <span>Seasonal Fresh Picks & Special Aisle Banners</span>
          </h2>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5 text-fresh-600" />
          <span>Updated Daily 8:00 AM</span>
        </span>
      </div>

      {/* 3-Column Interactive Animated Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {/* Banner 1: Organic Farm Harvest */}
        <div
          {...linkProps('fresh-produce')}
          className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#052613] via-[#094824] to-[#041a0d] text-white p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:-translate-y-2 border border-emerald-800/40 hover:border-fresh-400 transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[300px]"
        >
          {/* Subtle Background Glow & Floating Fruit Emoji */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-fresh-500/20 rounded-full blur-2xl group-hover:bg-fresh-500/30 transition-all pointer-events-none"></div>
          <div className="absolute right-4 bottom-4 text-6xl opacity-20 group-hover:opacity-40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 pointer-events-none select-none">
            🥦
          </div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black tracking-wide text-emerald-300 border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>100% Organic Harvest</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Pristine Farm Greens &amp; Local Citrus
            </h3>

            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Brown button mushrooms, Shakri malta, crisp salad greens, and sweet carrots picked fresh this morning.
            </p>
          </div>

          <div className="relative z-10 pt-5 flex items-center justify-between border-t border-white/10 mt-4">
            <div className="flex items-center gap-1 text-xs text-emerald-200 font-bold">
              <Truck className="w-3.5 h-3.5 text-fresh-400" />
              <span>2-Hr Karachi Delivery</span>
            </div>

            <span className="inline-flex items-center gap-1.5 bg-white group-hover:bg-fresh-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-md group-hover:scale-105 transition-all duration-200">
              <span>Shop Aisle</span>
              <ArrowRight className="w-3.5 h-3.5 text-fresh-800 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* Banner 2: Gourmet Imported Dairy & Cheeses */}
        <div
          {...linkProps('dairy-cheese')}
          className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#260a36] via-[#181147] to-[#072117] text-white p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:-translate-y-2 border border-purple-800/40 hover:border-purple-400 transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[300px]"
        >
          {/* Subtle Background Glow & Floating Cheese Emoji */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all pointer-events-none"></div>
          <div className="absolute right-4 bottom-4 text-6xl opacity-20 group-hover:opacity-40 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300 pointer-events-none select-none">
            🧀
          </div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black tracking-wide text-rose-300 border border-white/15">
              <Flame className="w-3 h-3 text-rose-400" />
              <span>Gourmet Delicatessen</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Artisan Cheeses, Honey &amp; Nut Butters
            </h3>

            <p className="text-xs text-purple-100/80 leading-relaxed">
              Yayycheese Greek Feta, White Cheddar slices, Al-Shifa raw Acacia honey, and pure almond butters at bundle prices.
            </p>
          </div>

          <div className="relative z-10 pt-5 flex items-center justify-between border-t border-white/10 mt-4">
            <div className="flex items-center gap-1 text-xs text-purple-200 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Up to 40% OFF</span>
            </div>

            <span className="inline-flex items-center gap-1.5 bg-white group-hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-md group-hover:scale-105 transition-all duration-200">
              <span>View Cheeses</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-900 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* Banner 3: Oven-Fresh Bakery & Breakfast Club */}
        <div
          {...linkProps('bakery-breakfast')}
          className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#3d1805] via-[#291708] to-[#062011] text-white p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:-translate-y-2 border border-amber-800/40 hover:border-amber-400 transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[300px]"
        >
          {/* Subtle Background Glow & Floating Bread Emoji */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-all pointer-events-none"></div>
          <div className="absolute right-4 bottom-4 text-6xl opacity-20 group-hover:opacity-40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 pointer-events-none select-none">
            🥖
          </div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black tracking-wide text-amber-300 border border-white/15">
              <Gift className="w-3 h-3 text-amber-300" />
              <span>Fresh Oven Bake 8 AM</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Golden Breads, Tortillas &amp; Breakfast
            </h3>

            <p className="text-xs text-amber-100/80 leading-relaxed">
              Wrapster wholemeal tortillas, crisp waffles, mozzarella sticks, and breakfast rolls baked fresh with pure ingredients.
            </p>
          </div>

          <div className="relative z-10 pt-5 flex items-center justify-between border-t border-white/10 mt-4">
            <div className="flex items-center gap-1 text-xs text-amber-200 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Same-Day Freshness</span>
            </div>

            <span className="inline-flex items-center gap-1.5 bg-white group-hover:bg-amber-300 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-md group-hover:scale-105 transition-all duration-200">
              <span>Order Bakery</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-900 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>

      {/* Panoramic Weekend Mega Restock & Family Savings Banner */}
      <div className="mt-8 rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-800/50 shadow-2xl relative text-white p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-fresh-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-3 py-1 rounded-full text-xs tracking-wide shadow-sm">
                <Flame className="w-3.5 h-3.5 text-rose-700 animate-bounce" />
                <span>Karachi Weekend Mega Restock</span>
              </span>
              <span className="bg-white/10 backdrop-blur-md text-emerald-300 font-bold px-3 py-1 rounded-full text-xs border border-white/15">
                Up to 35% OFF Family Essentials
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Fill Your Pantry With Farm Quality Groceries &amp; Gourmet Imports
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Cold-pressed mustard oils, grass-fed cooking tallow, Yayycheese Greek feta, pure Almarai milk, and farm-picked mushrooms. Packed in cold thermal containers and dispatched in 90 minutes.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-emerald-200">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Quality Inspected</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Free Delivery Over PKR 2,500</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Same-Day 2-Hour Express</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3.5">
            {/* Coupon Code Pill with Copy Action */}
            <div className="bg-black/50 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <span className="text-xs tracking-wide text-slate-400 block font-bold">
                  Use Coupon at Checkout
                </span>
                <span className="font-mono text-base font-black text-amber-300 tracking-wider">
                  RESTOCK25
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('RESTOCK25');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2200);
                }}
                className="h-10 min-w-[96px] bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 active:scale-95 text-white text-sm font-bold px-4 rounded-xl transition cursor-pointer shadow-xs"
              >
                {copied ? 'Copied' : 'Copy code'}
              </button>
            </div>

            <button
              onClick={() => handleClickAisle('')}
              className="bg-gradient-to-r from-fresh-500 to-emerald-600 hover:from-fresh-400 hover:to-emerald-500 text-white font-black text-xs sm:text-sm py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Explore Restock Deals</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

