'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PLACEHOLDER_IMG } from '@/lib/placeholder';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import CategorySlider from '@/components/CategorySlider';
import ProductCard from '@/components/ProductCard';
import ProductRail from '@/components/ProductRail';
import QuickViewModal from '@/components/QuickViewModal';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import PromoRewardsModal from '@/components/PromoRewardsModal';
import MidPageBanners from '@/components/MidPageBanners';
import HomePromoBanners from '@/components/HomePromoBanners';
import Reveal from '@/components/Reveal';
import ScrollUI from '@/components/ScrollUI';
import {
  TrustMarquee,
  BentoAisles,
  DealOfTheDay,
  DualPromo,
  StatsBand,
  HowItWorks,
  FaqSection,
  NewsletterBanner,
} from '@/components/HomeSections';
import Footer from '@/components/Footer';
import { fetchCategories, fetchProducts } from '@/lib/api';
import { Category, Product } from '@/types';
import { SlidersHorizontal, MessageCircle, Flame, ShieldCheck, Truck, RefreshCw, ArrowDown } from 'lucide-react';

const INITIAL_ROWS_COUNT = 8; // Exactly 2 rows of 4 columns by default on desktop

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-3 sm:p-4" aria-hidden="true">
      <div className="skeleton h-32 sm:h-40 rounded-2xl" />
      <div className="skeleton h-3 w-1/3 rounded mt-4" />
      <div className="skeleton h-4 w-5/6 rounded mt-2" />
      <div className="skeleton h-4 w-2/3 rounded mt-1.5" />
      <div className="flex items-center justify-between mt-5">
        <div className="skeleton h-5 w-20 rounded" />
        <div className="skeleton h-10 w-16 rounded-xl" />
      </div>
    </div>
  );
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [dairyPicks, setDairyPicks] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<string>('latest');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchProducts({ featured: true, per_page: 12 }).then(res => setBestSellers(res.data));
    fetchProducts({ category: 'dairy', per_page: 12 }).then(res => setDairyPicks(res.data));
  }, []);

  // Main grid: 2 rows by default, re-fetched when the sort changes
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchProducts({ sort: sortBy, per_page: INITIAL_ROWS_COUNT }).then(res => {
      if (cancelled) return;
      setProducts(res.data);
      setTotalProducts(res.total);
      setIsLoading(false);
      setPage(1);
    });
    return () => {
      cancelled = true;
    };
  }, [sortBy]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    const res = await fetchProducts({ sort: sortBy, per_page: INITIAL_ROWS_COUNT * nextPage });
    setProducts(res.data);
    setPage(nextPage);
  };

  const flashDeals = products.filter(p => p.compare_at_price && p.compare_at_price > p.price).slice(0, 4);
  const featuredPick = bestSellers.find(p => p.primary_image) ?? bestSellers[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header categories={categories} />
      <ScrollUI />

      <main id="main-content" className="flex-1 pb-16 sm:pb-8">
        <HeroBanner />
        <TrustMarquee />

        {/* Flash sale strip – only shown when real discounted products exist */}
        {flashDeals.length > 0 && (
          <Reveal as="section" className="max-w-7xl mx-auto px-4 pt-6 pb-2">
            <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-brand-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden" data-surface="dark">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-11 h-11 bg-rose-500 rounded-xl text-white flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white">Today&apos;s flash deals</h2>
                  <p className="text-sm text-rose-100">Discounted prices on fresh produce, dairy and pantry staples</p>
                </div>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {flashDeals.map(deal => (
                  <li key={deal.id}>
                    <Link
                      href={`/products/${deal.slug}`}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 hover:border-white/35 p-3 rounded-2xl flex items-center gap-3 transition-colors duration-200"
                    >
                      <img
                        src={deal.primary_image || PLACEHOLDER_IMG}
                        alt=""
                        width={48}
                        height={48}
                        className="w-12 h-12 object-contain rounded-xl bg-white p-1 shrink-0"
                      />
                      <span className="overflow-hidden">
                        <span className="block text-sm font-bold text-white truncate">{deal.name}</span>
                        <span className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-sm font-black text-amber-300">PKR {deal.price.toLocaleString()}</span>
                          <span className="text-xs text-rose-200 line-through">PKR {deal.compare_at_price?.toLocaleString()}</span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        <CategorySlider categories={categories} />
        <BentoAisles />

        <ProductRail
          title="Best sellers"
          subtitle="What Karachi is adding to basket this week"
          products={bestSellers}
          viewAllHref="/category/karachi-best-selling"
          onQuickView={setQuickViewProduct}
        />

        <MidPageBanners />

        {featuredPick && <DealOfTheDay product={featuredPick} />}

        <ProductRail
          title="Dairy and cheese favourites"
          subtitle="Cold-chain delivered milk, yogurt and imported cheeses"
          products={dairyPicks}
          viewAllHref="/category/dairy"
          onQuickView={setQuickViewProduct}
        />

        {/* Products catalogue grid */}
        <section id="products-section" className="max-w-7xl mx-auto px-4 py-8">
          <Reveal className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200/80 gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">All fresh supermarket essentials</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {isLoading ? 'Loading products…' : `Showing ${products.length} of ${totalProducts} products`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <label htmlFor="home-sort" className="text-sm font-semibold text-slate-600">
                Sort by
              </label>
              <select
                id="home-sort"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="h-10 bg-white border border-slate-200 hover:border-fresh-400 text-sm font-semibold text-slate-800 rounded-xl px-3 focus:outline-none focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 cursor-pointer transition"
              >
                <option value="latest">Featured &amp; newest</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </Reveal>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-6">
              {Array.from({ length: INITIAL_ROWS_COUNT }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-6">
                {products.map((product, idx) => (
                  <div
                    key={product.id}
                    className="animate-card-entrance"
                    style={{ animationDelay: `${(idx % 8) * 50}ms` }}
                  >
                    <ProductCard product={product} onQuickView={p => setQuickViewProduct(p)} />
                  </div>
                ))}
              </div>

              {products.length < totalProducts && (
                <div className="mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="h-12 sm:min-w-[260px] px-8 bg-white hover:bg-fresh-600 border border-slate-200 hover:border-fresh-600 text-slate-800 hover:text-white font-bold rounded-2xl text-sm shadow-sm hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    <span>Show more ({totalProducts - products.length} left)</span>
                    <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsLoading(true);
                      const res = await fetchProducts({ sort: sortBy, per_page: 120 });
                      setProducts(res.data);
                      setPage(15);
                      setIsLoading(false);
                    }}
                    className="h-12 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-semibold rounded-2xl text-sm transition-colors duration-200 cursor-pointer active:scale-95"
                  >
                    Show all {totalProducts}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <DualPromo />
        <HomePromoBanners />
        <StatsBand />
        <HowItWorks />

        {/* Why choose Fresh Basket */}
        <section className="bg-white border-y border-slate-200/80 py-12 px-4 mt-8">
          <div className="max-w-7xl mx-auto">
            <Reveal className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Why thousands in Karachi trust us daily</h2>
              <p className="text-sm text-slate-600 mt-2">Fresh produce, honest prices and a rider you can actually reach.</p>
            </Reveal>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  Icon: Truck,
                  tone: 'bg-emerald-100 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white',
                  title: '90-minute fast delivery',
                  body: 'Temperature-controlled dispatch across DHA, Clifton, Gulshan, PECHS and all Karachi neighbourhoods.',
                },
                {
                  Icon: ShieldCheck,
                  tone: 'bg-fresh-100 text-fresh-800 group-hover:bg-fresh-600 group-hover:text-white',
                  title: 'Farm-picked quality',
                  body: "Inspected every morning at dawn. If any fruit or vegetable isn't 100% fresh, we replace it instantly.",
                },
                {
                  Icon: RefreshCw,
                  tone: 'bg-amber-100 text-amber-800 group-hover:bg-amber-500 group-hover:text-white',
                  title: 'Cash on delivery',
                  body: 'Zero advance payment. Inspect your grocery basket at your doorstep before paying our rider.',
                },
                {
                  Icon: MessageCircle,
                  tone: 'bg-purple-100 text-purple-800 group-hover:bg-purple-600 group-hover:text-white',
                  title: 'WhatsApp rider tracking',
                  body: 'A direct WhatsApp line to our Karachi dispatch counter for special requests and address help.',
                },
              ].map((item, i) => (
                <Reveal as="li" key={item.title} delay={i * 90}>
                  <div className="group h-full p-6 rounded-3xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-300 hover:shadow-card transition-all duration-300 space-y-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${item.tone}`}>
                      <item.Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        <FaqSection />
        <NewsletterBanner />
      </main>

      {/* Floating WhatsApp quick-order button (sits above the mobile bottom nav) */}
      <a
        href="https://wa.me/923001234567?text=Assalam-o-Alaikum!%20I%20want%20to%20order%20groceries%20from%20Fresh%20Basket%20Pakistan."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 h-12 w-12 sm:w-auto sm:px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-full shadow-2xl flex items-center justify-center gap-2 z-40 transition-all duration-200"
        aria-label="Chat with Fresh Basket support on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden sm:inline font-bold text-sm">WhatsApp order support</span>
      </a>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      <PromoRewardsModal linkUrl="#products-section" rewardCoupon="FRESH10" />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <Footer />
    </div>
  );
}
