'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import ScrollUI from '@/components/ScrollUI';
import { OfferCard } from '@/components/home/DesktopHome';
import { BUNDLES, GIFTS, PLANS } from '@/data/homeOffers';
import { fetchCategories } from '@/lib/api';
import { Category } from '@/types';
import { ChevronRight } from 'lucide-react';

export const OFFER_GROUPS = {
  membership: { title: 'Family Membership', href: '/membership-plans', offers: PLANS },
  bundles: { title: 'Bundle Boxes', href: '/bundle-boxes', offers: BUNDLES },
  gifts: { title: 'Gift Baskets', href: '/gift-baskets', offers: GIFTS },
} as const;

export type OfferGroupKey = keyof typeof OFFER_GROUPS;

/** One offer group on its own page, laid out like a category page ("View All" from the home page rows). */
export default function OfferGroupPage({ group }: { group: OfferGroupKey }) {
  const g = OFFER_GROUPS[group];
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header categories={categories} />
      <ScrollUI />
      <main id="main-content" className="flex-1 max-w-[1200px] w-full mx-auto px-4 pt-5 pb-24 md:pb-12">
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1 text-sm text-slate-500 mb-4">
          <Link href="/" className="hover:text-fresh-700">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span aria-current="page" className="font-semibold text-slate-900">
            {g.title}
          </span>
        </nav>

        <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8 lg:items-start">
          {/* the three offer groups, like the category sidebar */}
          <aside className="mb-5 lg:mb-0" aria-label="Offers">
            <h2 className="hidden lg:block text-lg font-bold text-[#173c2a] mb-3">Categories</h2>
            <ul className="flex lg:block gap-2 lg:space-y-2 overflow-x-auto no-scrollbar">
              {(Object.keys(OFFER_GROUPS) as OfferGroupKey[]).map(k => {
                const on = k === group;
                return (
                  <li key={k} className="shrink-0">
                    <Link
                      href={OFFER_GROUPS[k].href}
                      aria-current={on ? 'page' : undefined}
                      className={`block px-4 py-3 rounded-lg text-[15px] font-semibold whitespace-nowrap transition-colors ${
                        on ? 'bg-fresh-600 text-white' : 'bg-white text-[#173c2a] hover:bg-[#f0f4ea] hover:text-fresh-700'
                      }`}
                    >
                      {OFFER_GROUPS[k].title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div>
            <h1 className="mb-5 pb-4 border-b border-slate-200 text-2xl font-bold text-[#173c2a]">
              {g.title} <span className="text-base font-medium text-slate-500">({g.offers.length}) results found</span>
            </h1>
            <ul className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {g.offers.map(o => (
                <li key={o.key}>
                  <OfferCard offer={o} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <Footer />
    </div>
  );
}
