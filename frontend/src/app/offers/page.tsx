'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import ScrollUI from '@/components/ScrollUI';
import { OfferCard } from '@/components/home/DesktopHome';
import { BUNDLES, GIFTS, Offer, PLANS } from '@/data/homeOffers';
import { fetchCategories } from '@/lib/api';
import { Category } from '@/types';

const SECTIONS: { id: string; title: string; offers: Offer[] }[] = [
  { id: 'membership', title: 'Family Membership – fresh boxes every week', offers: PLANS },
  { id: 'bundles', title: 'Bundle boxes – save more', offers: BUNDLES },
  { id: 'gift-baskets', title: 'Gift Baskets', offers: GIFTS },
];

/** Every membership plan, bundle box and gift basket ("View All" from the home page rows). */
export default function OffersPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header categories={categories} />
      <ScrollUI />
      <main id="main-content" className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-8 pb-24 md:pb-12">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-fresh-950">Memberships, bundles &amp; gift baskets</h1>
        {SECTIONS.map(sec => (
          <section key={sec.id} id={sec.id} className="mt-10 scroll-mt-[calc(var(--header-offset,120px)+12px)]" aria-labelledby={`${sec.id}-title`}>
            <h2 id={`${sec.id}-title`} className="font-serif text-[1.6rem] font-bold text-fresh-950 mb-4">
              {sec.title}
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {sec.offers.map(o => (
                <li key={o.key}>
                  <OfferCard offer={o} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <Footer />
    </div>
  );
}
