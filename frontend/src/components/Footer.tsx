'use client';

import React from 'react';
import { ShoppingBag, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-white mt-16 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-fresh-500 flex items-center justify-center text-white shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white">FRESH</span>
                <span className="text-xl font-black tracking-tight text-fresh-400">BASKET</span>
              </div>
            </div>
            <p className="text-xs text-emerald-200/70 leading-relaxed">
              Karachi&apos;s leading online fresh supermarket. Sourcing pristine fruits, daily vegetables, bakery essentials, and imported provisions with express doorstep delivery.
            </p>
            <div className="flex items-center space-x-2 text-xs text-fresh-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Quality & Hygiene Verified</span>
            </div>
          </div>

          {/* Quick Aisles */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 tracking-wide uppercase text-[11px] text-fresh-400">
              Popular Aisles
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li><span className="hover:text-white transition cursor-pointer">Fresh Fruits & Organic Produce</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Farm Fresh Vegetables & Greens</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Artisan Breads, Buns & Cakes</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Pure Milk, Cheese & Dairy</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Beverages, Juices & Coconut Water</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Pantry Staples & Cooking Essentials</span></li>
            </ul>
          </div>

          {/* Karachi Delivery Coverage */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 tracking-wide uppercase text-[11px] text-fresh-400">
              Karachi Delivery Hubs
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-emerald-200/80">
              <span>&bull; DHA Phase 1 - 8</span>
              <span>&bull; Clifton Blocks 1 - 9</span>
              <span>&bull; Gulshan-e-Iqbal</span>
              <span>&bull; PECHS & Tariq Road</span>
              <span>&bull; North Nazimabad</span>
              <span>&bull; KDA Scheme 1</span>
              <span>&bull; Gulistan-e-Jauhar</span>
              <span>&bull; Bahria Town Karachi</span>
            </div>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 tracking-wide uppercase text-[11px] text-fresh-400">
              Direct Helpline
            </h4>
            <div className="space-y-3 text-xs text-emerald-200/80">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-fresh-400 shrink-0" />
                <span>UAN: +92 21 111-373-742</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-fresh-400 shrink-0" />
                <span>orders@freshbasket.com.pk</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-fresh-400 shrink-0" />
                <span>Fresh Basket Central Hub, Karachi, Pakistan</span>
              </div>
              <div className="pt-2">
                <a
                  href="/admin"
                  className="inline-block bg-emerald-900 hover:bg-emerald-800 text-fresh-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-800 transition"
                >
                  Admin CRM Login &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/60 gap-4">
          <p>&copy; {new Date().getFullYear()} Fresh Basket Pakistan. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
            <span>for seamless grocery delivery & POS integration.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

