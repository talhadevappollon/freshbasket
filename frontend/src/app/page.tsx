'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import CategorySlider from '@/components/CategorySlider';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import Footer from '@/components/Footer';
import { fetchCategories, fetchProducts } from '@/lib/api';
import { Category, Product } from '@/types';
import { Sparkles, SlidersHorizontal, Loader2 } from 'lucide-react';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

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

        {/* Visual Category Aisle Slider */}
        <CategorySlider
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* Products Catalog Grid */}
        <section id="products-section" className="max-w-7xl mx-auto px-4 py-8">
          {/* Section Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200/80 gap-4 mb-8">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-fresh-600" />
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {currentCategoryName}
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Showing {products.length} of {totalProducts} verified fresh products
              </p>
            </div>

            {/* Sorting Filter */}
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500">Sort By:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-white border border-gray-200 text-xs font-semibold text-gray-800 rounded-xl px-3 py-2 focus:outline-none focus:border-fresh-500 shadow-xs cursor-pointer"
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
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-fresh-600 mb-2" />
              <p className="text-xs font-semibold">Loading Fresh Basket Catalog...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Load More Button */}
              {products.length < totalProducts && (
                <div className="text-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    className="bg-white hover:bg-fresh-50 border border-gray-200 hover:border-fresh-300 text-gray-800 hover:text-fresh-700 font-bold px-8 py-3 rounded-2xl text-xs sm:text-sm shadow-sm transition"
                  >
                    Load More Products ({totalProducts - products.length} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8">
              <h3 className="text-base font-bold text-gray-900">No products found in this aisle</h3>
              <p className="text-xs text-gray-400 mt-1 mb-6">
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
      </main>

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
