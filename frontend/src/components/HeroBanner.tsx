'use client';

import React from 'react';
import { Truck, ShieldCheck, Banknote, Sparkles, HeartHandshake } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
      {/* Main Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-fresh-900 text-white shadow-xl p-8 sm:p-12">
        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-fresh-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/2 -top-20 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-fresh-500/20 text-fresh-300 border border-fresh-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Farm-Fresh Supermarket Delivered</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            Freshness You Can Taste. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fresh-400 to-emerald-200">
              Delivered To Your Door.
            </span>
          </h1>

          <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
            Karachi&apos;s favorite destination for handpicked organic fruits, farm-fresh vegetables, dairy, imported bakery, and premium household essentials.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl flex items-center space-x-2 text-xs font-semibold">
              <Banknote className="w-4 h-4 text-fresh-400" />
              <span>Cash on Delivery (COD) Checkout</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl flex items-center space-x-2 text-xs font-semibold">
              <Truck className="w-4 h-4 text-emerald-300" />
              <span>Express 2-Hour Delivery Slot</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-fresh-50 text-fresh-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Free Delivery</h4>
            <p className="text-[11px] text-gray-400">On all orders over PKR 2,500</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Cash On Delivery</h4>
            <p className="text-[11px] text-gray-400">Pay cash upon safe delivery</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">100% Quality Fresh</h4>
            <p className="text-[11px] text-gray-400">Inspected daily at dawn</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">WhatsApp Support</h4>
            <p className="text-[11px] text-gray-400">Real-time rider assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
