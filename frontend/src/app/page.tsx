'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import QuickViewModal from '@/components/QuickViewModal';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import PromoRewardsModal from '@/components/PromoRewardsModal';
import ScrollUI from '@/components/ScrollUI';
import { FaqSection, NewsletterBanner } from '@/components/HomeSections';
import MobileCatalogue from '@/components/MobileCatalogue';
import Footer from '@/components/Footer';
import {
  PromoBanner,
  Bestsellers,
  CategoryShowcase,
  MembershipSection,
  BundlesAndGifts,
  RecipeIdeas,
  NutTiles,
  CommitmentBar,
} from '@/components/home/DesktopHome';
import { fetchCategories } from '@/lib/api';
import { Category, Product } from '@/types';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  // null until measured. Phones show the all-categories catalogue instead of the desktop sections.
  const [isPhone, setIsPhone] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // "#products-section" links (hero button, menu, promo popup) must land on whichever catalogue this screen shows
  useEffect(() => {
    if (isPhone === null) return;
    const target = () => document.getElementById(isPhone ? 'products-section-m' : 'bestsellers');
    const goCatalogue = () => target()?.scrollIntoView({ behavior: 'smooth' });
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href$="#products-section"]');
      if (!a) return;
      e.preventDefault();
      goCatalogue();
    };
    document.addEventListener('click', onClick, true);
    if (window.location.hash === '#products-section') setTimeout(goCatalogue, 250);
    return () => document.removeEventListener('click', onClick, true);
  }, [isPhone]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header categories={categories} />
      <ScrollUI />

      <main id="main-content" className="flex-1 pb-16 sm:pb-0">
        <HeroBanner />

        {/* Phones: every category with its products, in place */}
        <MobileCatalogue categories={categories} />

        {/* Desktop: the sections of the Fresh House web update, in order */}
        <div className="max-md:hidden">
          <PromoBanner />
          <Bestsellers onQuickView={setQuickViewProduct} />
          <CategoryShowcase title="Fresh Fruits" slug="fruits" banner="/home/banner-fruits.webp" bannerAlt="Fresh fruits, nature's best delivered fresh" side="left" onQuickView={setQuickViewProduct} />
          <CategoryShowcase title="Fresh Vegetables" slug="vegetables" banner="/home/banner-vegetables.webp" bannerAlt="Fresh vegetables handpicked daily for your family" side="right" onQuickView={setQuickViewProduct} />
          <CategoryShowcase
            title="Premium Nuts & Dry Fruits in Karachi"
            description="Almonds, cashews, walnuts, pine nuts, figs and dried berries, chosen for quality and freshness. Perfect for snacking, gifting and healthy breakfasts."
            slug="karachi-nuts-and-dates"
            banner="/home/banner-nuts.webp"
            bannerAlt="Premium nuts, healthy snacking starts here"
            side="left"
            onQuickView={setQuickViewProduct}
          />
          <div className="mt-14">
            <MembershipSection />
            <BundlesAndGifts />
          </div>
          <RecipeIdeas />
          <NutTiles />
        </div>

        <FaqSection />
        <NewsletterBanner />
        <div className="max-md:hidden -mb-16 relative">
          <CommitmentBar />
        </div>
      </main>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      <PromoRewardsModal linkUrl="#products-section" rewardCoupon="FRESH10" />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <Footer />
    </div>
  );
}
