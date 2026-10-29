'use client';

import React from 'react';
import Link from 'next/link';
import { FEATURED_AISLES } from '@/data/aisles';
import { ShoppingBag, Phone, Mail, MapPin, ShieldCheck, Heart, ArrowRight, MessageCircle, Sparkles, PackageSearch } from 'lucide-react';

export default function Footer() {
  const aisles = FEATURED_AISLES.map(a => ({ name: a.name, slug: a.slug }));

  const deliveryHubs = [
    'DHA Phase 1 - 8',
    'Clifton Blocks 1 - 9',
    'Gulshan-e-Iqbal',
    'PECHS & Tariq Road',
    'North Nazimabad',
    'KDA Scheme 1',
    'Gulistan-e-Jauhar',
    'Bahria Town Karachi',
  ];

  return (
    <footer className="bg-gradient-to-b from-[#0a170a] via-[#0f210e] to-[#071107] text-white mt-16 border-t border-emerald-900/80">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center group"
            >
              <span className="inline-flex items-center bg-white rounded-2xl px-4 py-2.5 shadow-lg shadow-black/20 group-hover:shadow-xl transition-shadow">
                <img src="/logo.png" alt="Fresh House" width={156} height={35} loading="lazy" className="h-9 w-auto" />
              </span>
            </Link>
            <p className="text-sm text-emerald-100/75 leading-relaxed">
              Karachi&apos;s leading online fresh supermarket. Sourcing pristine fruits, daily vegetables, bakery essentials, and imported provisions with express doorstep delivery.
            </p>
            <div className="flex items-center space-x-2 text-xs text-fresh-400 font-semibold group cursor-default">
              <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="group-hover:text-emerald-300 transition-colors">100% Quality & Hygiene Verified</span>
            </div>
          </div>

          {/* Quick Aisles (Interactive Category Links) */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 tracking-wide uppercase text-[11px] text-fresh-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Popular Aisles</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-200/80">
              {aisles.map(aisle => (
                <li key={aisle.name}>
                  <Link
                    href={`/category/${aisle.slug}`}
                    className="group flex items-center space-x-2.5 py-1 text-emerald-200/80 hover:text-white hover:translate-x-1.5 transition-all duration-200 cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:bg-amber-300 group-hover:scale-150 transition-all duration-200"></span>
                    <span className="group-hover:text-fresh-300 group-hover:font-semibold transition-colors">
                      {aisle.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Karachi Delivery Coverage */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 tracking-wide uppercase text-[11px] text-fresh-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Karachi Delivery Hubs</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-emerald-200/80">
              {deliveryHubs.map(hub => (
                <div
                  key={hub}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-emerald-900/60 hover:text-white hover:border-emerald-700/50 border border-transparent transition-all duration-200 group cursor-default"
                >
                  <span className="w-1 h-1 rounded-full bg-emerald-400 group-hover:scale-125 group-hover:bg-amber-300 transition-all"></span>
                  <span className="truncate">{hub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 tracking-wide uppercase text-[11px] text-fresh-400">
              Direct Helpline & CRM
            </h4>
            <div className="space-y-3 text-xs text-emerald-200/80">
              <a
                href="tel:+9221111373742"
                className="flex items-center space-x-2 group hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-900/60 group-hover:bg-fresh-600 text-fresh-400 group-hover:text-white flex items-center justify-center transition shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span className="group-hover:text-fresh-300 transition-colors">UAN: +92 21 111-373-742</span>
              </a>

              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 group hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-900/60 group-hover:bg-emerald-600 text-emerald-400 group-hover:text-white flex items-center justify-center transition shrink-0">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <span className="group-hover:text-emerald-300 transition-colors">WhatsApp: +92 300 123-4567</span>
              </a>

              <a
                href="mailto:orders@freshbasket.com.pk"
                className="flex items-center space-x-2 group hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-900/60 group-hover:bg-fresh-600 text-fresh-400 group-hover:text-white flex items-center justify-center transition shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="group-hover:text-fresh-300 transition-colors truncate">orders@freshbasket.com.pk</span>
              </a>

              <Link
                href="/track"
                className="flex items-center space-x-2 group hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-900/60 group-hover:bg-fresh-600 text-fresh-400 group-hover:text-white flex items-center justify-center transition shrink-0">
                  <PackageSearch className="w-3.5 h-3.5" />
                </div>
                <span className="group-hover:text-fresh-300 transition-colors">Track your order</span>
              </Link>

              <div className="pt-2">
                <a
                  href="/admin"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-900 to-fresh-900 hover:from-fresh-600 hover:to-emerald-700 text-fresh-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold border border-emerald-700/60 hover:border-fresh-500 shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-200 group"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-fresh-400 group-hover:rotate-12 transition-transform" />
                  <span>Admin CRM Login</span>
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/60 gap-4">
          <p>&copy; {new Date().getFullYear()} Fresh House. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500 animate-pulse" />
            <span>for seamless grocery delivery & POS integration.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
