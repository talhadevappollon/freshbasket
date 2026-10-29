'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import CategorySlider from '@/components/CategorySlider';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import Footer from '@/components/Footer';
import { fetchCategories, fetchProducts } from '@/lib/api';
import { Category, Product } from '@/types';
import { Sparkles, SlidersHorizontal, Loader2, MessageCircle, Flame, Clock, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Load Categories on mount
  useEffect(() => {
    async function loadCats() {
      const cats = await fetchCategories();
      setCategories(cats);
    }
    loadCats();
  }, []);

  // Load Products whenever category or sort changes
  useEffect(() => {
    async function loadProds() {
      setIsLoading(true);
      const res = await fetchProducts({
        category: selectedCategory || undefined,
        sort: sortBy,
        per_page: 32,
      });
      setProducts(res.data);
      setTotalProducts(res.total);
      setIsLoading(false);
      setPage(1);
    }
    loadProds();
  }, [selectedCategory, sortBy]);

  const handleSelectCategory = (slug: string) => {
    setSelectedCategory(slug);
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    const res = await fetchProducts({
      category: selectedCategory || undefined,
      sort: sortBy,
      per_page: 32 * nextPage,
    });
    setProducts(res.data);
    setPage(nextPage);
  };

  const currentCategoryName = selectedCategory
    ? categories.find(c => c.slug === selectedCategory)?.name || 'Selected Category'
    : 'All Fresh Supermarket Essentials';

  // Filter flash deal items for promotion
  const flashDeals = products.filter(p => p.compare_at_price && p.compare_at_price > p.price).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <Header
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroBanner />

        {/* Flash Sale Deal Strip */}
        {flashDeals.length > 0 && !selectedCategory && (
          <section className="max-w-7xl mx-auto px-4 pt-6 pb-2">
            <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center space-x-2.5">
                  <span className="p-2 bg-rose-500 rounded-xl text-white">
                    <Flame className="w-5 h-5 animate-bounce" />
                  </span>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-white">Today&apos;s Fresh Basket Flash Deals</h3>
                    <p className="text-xs text-rose-200">Limited-time discounted prices on fresh fruits, dairy, and farm produce</p>
                  </div>
                </div>

                <div className="inline-flex items-center space-x-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs font-mono font-bold">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Offer Ends: 05h : 42m : 18s</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {flashDeals.map(deal => (
                  <div key={deal.id} className="bg-white/10 backdrop-blur-md border border-white/15 p-3 rounded-2xl flex items-center space-x-3">
                    <img src={deal.primary_image || 'https://via.placeholder.com/60'} alt={deal.name} className="w-12 h-12 object-contain rounded-xl bg-white p-1 shrink-0" />
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white truncate">{deal.name}</h4>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="text-xs font-black text-amber-300">PKR {deal.price.toLocaleString()}</span>
                        <span className="text-[10px] text-rose-300 line-through">PKR {deal.compare_at_price?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Visual Category Aisle Slider */}
        <CategorySlider
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* Products Catalog Grid */}
        <section id="products-section" className="max-w-7xl mx-auto px-4 py-8">
          {/* Section Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200/80 gap-4 mb-8">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-fresh-600" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentCategoryName}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Showing {products.length} of {totalProducts} verified fresh products
              </p>
            </div>

            {/* Sorting Filter */}
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">Sort By:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3.5 py-2 focus:outline-none focus:border-fresh-500 shadow-2xs cursor-pointer"
              >
                <option value="latest">Featured & Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Alphabetical (A - Z)</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-fresh-600 mb-2" />
              <p className="text-xs font-bold">Loading Fresh Basket Catalog...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {products.length < totalProducts && (
                <div className="text-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    className="bg-white hover:bg-fresh-50 border border-slate-200 hover:border-fresh-300 text-slate-800 hover:text-fresh-700 font-bold px-8 py-3 rounded-2xl text-xs sm:text-sm shadow-2xs transition"
                  >
                    Load More Products ({totalProducts - products.length} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 p-8 shadow-xs">
              <h3 className="text-base font-bold text-slate-900">No products found in this aisle</h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                Try selecting another category or clear your search filters.
              </p>
              <button
                onClick={() => setSelectedCategory('')}
                className="bg-fresh-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-fresh-600/20"
              >
                Browse All Products
              </button>
            </div>
          )}
        </section>

        {/* Why Choose Fresh Basket Section */}
        <section className="bg-white border-y border-slate-200/80 py-12 px-4 mt-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-black text-fresh-600 uppercase tracking-widest block mb-1">
                The Fresh Basket Difference
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Why Thousands in Karachi Trust Us Daily
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-left space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold">
                  <Truck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900">90-Minute Fast Delivery</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Temperature-controlled dispatch across DHA, Clifton, Gulshan, PECHS, and all Karachi neighborhoods.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-left space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-fresh-100 text-fresh-800 flex items-center justify-center text-xl font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900">Farm-Picked Quality</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Inspected every morning at dawn. If any fruit or vegetable isn&apos;t 100% fresh, we replace it instantly.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-left space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl font-bold">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900">Cash on Delivery (COD)</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Zero advance payment required. Inspect your grocery basket at your doorstep before paying our rider.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-left space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-xl font-bold">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900">WhatsApp Rider Tracking</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Direct WhatsApp link to our Karachi dispatch counter for special grocery requests and address assistance.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating WhatsApp Quick Order Support Button */}
      <a
        href="https://wa.me/923001234567?text=Assalam-o-Alaikum!%20I%20want%20to%20order%20groceries%20from%20Fresh%20Basket%20Pakistan."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center space-x-2 z-40 transition transform hover:scale-105"
        title="Chat with Fresh Basket Support on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden sm:inline font-bold text-xs">WhatsApp Order Support</span>
      </a>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Checkout Modal (Cash on Delivery) */}
      <CheckoutModal />

      {/* Order Success Modal */}
      <OrderSuccessModal />

      {/* Footer */}
      <Footer />
    </div>
  );
}
