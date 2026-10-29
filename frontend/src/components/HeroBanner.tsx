'use client';

import React from 'react';
import { Truck, ShieldCheck, Banknote, Sparkles, HeartHandshake } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6 pb-2">
      {/* Main Hero Card */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-fresh-900 text-white shadow-xl p-5 sm:p-12">
        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-fresh-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/2 -top-20 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 sm:space-x-2 bg-fresh-500/20 text-fresh-300 border border-fresh-400/30 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">
            <Sparkles className="w-3 h-3 text-fresh-400" />
            <span>Farm-Fresh Supermarket Delivered</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3 sm:mb-4">
            Freshness You Can Taste. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fresh-400 to-emerald-200">
              Delivered To Your Door.
            </span>
          </h1>

          <p className="text-emerald-100/80 text-xs sm:text-base leading-relaxed mb-4 sm:mb-6 max-w-xl">
            Karachi&apos;s favorite destination for handpicked organic fruits, farm-fresh vegetables, dairy, imported bakery, and premium household essentials.
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center space-x-2 text-[11px] sm:text-xs font-semibold">
              <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fresh-400" />
              <span>Cash on Delivery (COD)</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center space-x-2 text-[11px] sm:text-xs font-semibold">
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
              <span>Express 2-Hour Delivery Slot</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mt-4 sm:mt-6">
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 shadow-2xs flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-fresh-50 text-fresh-600 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 truncate">Free Delivery</h4>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Over PKR 2,500</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 shadow-2xs flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 truncate">Cash On Delivery</h4>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Pay at door</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 shadow-2xs flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 truncate">100% Quality</h4>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Inspected daily</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 shadow-2xs flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 truncate">WhatsApp Order</h4>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Direct assistant</p>
          </div>
        </div>
      </div>
    </div>
  );
}
