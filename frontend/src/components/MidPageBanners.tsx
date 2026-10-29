'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Flame, Gift, Clock, Truck, Heart } from 'lucide-react';

interface MidPageBannersProps {
  onSelectCategory?: (slug: string) => void;
}

export default function MidPageBanners({ onSelectCategory }: MidPageBannersProps) {
  const handleClickAisle = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
    }
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-fresh-600 bg-fresh-50 border border-fresh-200 px-2.5 py-0.5 rounded-full inline-block mb-1">
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
          onClick={() => handleClickAisle('fresh-produce')}
          className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#052613] via-[#094824] to-[#041a0d] text-white p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:-translate-y-2 border border-emerald-800/40 hover:border-fresh-400 transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[300px]"
        >
          {/* Subtle Background Glow & Floating Fruit Emoji */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-fresh-500/20 rounded-full blur-2xl group-hover:bg-fresh-500/30 transition-all pointer-events-none"></div>
          <div className="absolute right-4 bottom-4 text-6xl opacity-20 group-hover:opacity-40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 pointer-events-none select-none">
            🥦
          </div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-300 border border-white/15">
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
            <div className="flex items-center gap-1 text-[11px] text-emerald-200 font-bold">
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
          onClick={() => handleClickAisle('dairy-cheese')}
          className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#260a36] via-[#181147] to-[#072117] text-white p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:-translate-y-2 border border-purple-800/40 hover:border-purple-400 transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[300px]"
        >
          {/* Subtle Background Glow & Floating Cheese Emoji */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all pointer-events-none"></div>
          <div className="absolute right-4 bottom-4 text-6xl opacity-20 group-hover:opacity-40 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300 pointer-events-none select-none">
            🧀
          </div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-rose-300 border border-white/15">
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
            <div className="flex items-center gap-1 text-[11px] text-purple-200 font-bold">
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
          onClick={() => handleClickAisle('bakery-breakfast')}
          className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#3d1805] via-[#291708] to-[#062011] text-white p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:-translate-y-2 border border-amber-800/40 hover:border-amber-400 transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[300px]"
        >
          {/* Subtle Background Glow & Floating Bread Emoji */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-all pointer-events-none"></div>
          <div className="absolute right-4 bottom-4 text-6xl opacity-20 group-hover:opacity-40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 pointer-events-none select-none">
            🥖
          </div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-300 border border-white/15">
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
            <div className="flex items-center gap-1 text-[11px] text-amber-200 font-bold">
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
    </section>
  );
}
