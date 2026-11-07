'use client';

import React from 'react';
import Link from 'next/link';
import { FEATURED_AISLES } from '@/data/aisles';
import { SOCIAL_LINKS, SocialLink } from '@/data/socialLinks';
import { useAuth } from '@/context/AuthContext';
import { useDelivery } from '@/context/DeliveryContext';
import { Heart, Mail, MessageCircle, Phone } from 'lucide-react';

function SocialIcon({ name }: { name: SocialLink['key'] }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (name) {
    case 'facebook':
      return (
        <svg {...common}>
          <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v3.5H8V21h3.5v-7.5H15L15.5 10h-4V7.8c0-.5.4-.8.8-.8H15z" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...common}>
          <path d="M14 3v11.2a3.7 3.7 0 1 1-3.7-3.7" />
          <path d="M14 3c.4 2.6 2 4.2 4.6 4.5" />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...common}>
          <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
          <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'x':
      return (
        <svg {...common}>
          <path d="M4 4l16 16M20 4L4 20" />
        </svg>
      );
    default:
      return <MessageCircle width={20} height={20} aria-hidden="true" />;
  }
}

const linkCls = 'block py-1.5 text-[17px] text-slate-800 hover:text-fresh-700 transition-colors cursor-pointer text-left';

export default function Footer() {
  const { openAuth } = useAuth();
  const { openDeliver } = useDelivery();
  const aisles = FEATURED_AISLES.map(a => ({ name: a.name, slug: a.slug }));
  const socials = SOCIAL_LINKS.filter(s => s.url);

  return (
    <footer className="bg-[#f4f4f2] text-slate-900 mt-16 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-14">
        {/* Connect with us */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
          <h2 className="text-xl font-semibold text-slate-800">Connect with us</h2>
          <ul className="flex items-center gap-3">
            {socials.map(s => (
              <li key={s.key}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="w-11 h-11 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-fresh-700 hover:scale-105 active:scale-95 transition"
                >
                  <SocialIcon name={s.key} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid grid-cols-2 lg:grid-cols-[1fr_1fr_1.1fr_1.1fr_1.6fr] gap-x-8 gap-y-10">
          <ul>
            <li>
              <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer" className={linkCls}>
                Contact Us
              </a>
            </li>
            <li>
              <Link href="/recipes" className={linkCls}>
                Recipes
              </Link>
            </li>
            <li>
              <Link href="/track" className={linkCls}>
                Track your order
              </Link>
            </li>
          </ul>

          <ul>
            <li>
              <button type="button" onClick={() => openAuth('login')} className={linkCls}>
                Login
              </button>
            </li>
            <li>
              <Link href="/account" className={linkCls}>
                My Account
              </Link>
            </li>
            <li>
              <button type="button" onClick={openDeliver} className={linkCls}>
                Postal Codes
              </button>
            </li>
          </ul>

          <ul>
            {aisles.slice(0, 6).map(a => (
              <li key={a.slug}>
                <Link href={`/category/${a.slug}`} className={linkCls}>
                  {a.name}
                </Link>
              </li>
            ))}
          </ul>
          <ul>
            {aisles.slice(6).map(a => (
              <li key={a.slug}>
                <Link href={`/category/${a.slug}`} className={linkCls}>
                  {a.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="col-span-2 lg:col-span-1 space-y-4">
            <a href="mailto:orders@freshbasket.com.pk" className="flex items-center gap-4 rounded-2xl border-2 border-[#bfe96f] bg-white/40 px-5 py-3.5 hover:bg-white transition">
              <Mail className="w-6 h-6 text-fresh-950 shrink-0" aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold uppercase tracking-wide text-[#6fa31a]">Help Center</span>
                <span className="block font-bold text-fresh-950">orders@freshbasket.com.pk</span>
              </span>
            </a>
            <a href="tel:+9221111373742" className="flex items-center gap-4 rounded-2xl border-2 border-[#bfe96f] bg-white/40 px-5 py-3.5 hover:bg-white transition">
              <Phone className="w-6 h-6 text-fresh-950 shrink-0" aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold uppercase tracking-wide text-[#6fa31a]">Phone Support</span>
                <span className="block font-bold text-fresh-950">021-111-373-742</span>
              </span>
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-300/70 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-600 gap-3 text-center sm:text-left pb-28 md:pb-0">
          <p>
            &copy; {new Date().getFullYear()} Fresh House. All rights reserved. <a href="/admin" className="ml-2 text-slate-400 hover:text-slate-700">Staff login</a>
          </p>
          <div className="flex items-center justify-center flex-wrap gap-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" aria-label="love" />
            <span>for seamless grocery delivery.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
