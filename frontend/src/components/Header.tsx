'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Product, Category } from '@/types';
import { fetchProducts } from '@/lib/api';
import {
  ShoppingBag,
  Search,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  ChevronDown,
  X,
  Plus,
  ShieldCheck,
  MessageCircle,
  Home,
  Layers,
  ArrowRight
} from 'lucide-react';

interface HeaderProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export default function Header({
  categories,
  selectedCategory,
  onSelectCategory,
}: HeaderProps) {
  const { totalItems, subtotal, setIsCartOpen, addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await fetchProducts({ search: searchQuery.trim(), per_page: 6 });
      setSearchResults(res.data);
      setIsSearching(false);
      setShowResults(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const focusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-100">
        {/* Top Highlight Banner */}
        <div className="bg-gradient-to-r from-[#041d0e] via-[#062d16] to-[#041d0e] text-white text-[11px] py-2 px-3 sm:px-6 border-b border-emerald-950">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            {/* Left promo */}
            <div className="flex items-center space-x-2 font-medium overflow-hidden">
              <span className="bg-gradient-to-r from-emerald-500 to-fresh-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs shrink-0">
                <Sparkles className="w-2.5 h-2.5" /> Express
              </span>
              <span className="truncate text-slate-200">
                Same-Day 2-Hour Delivery in Karachi <span className="hidden sm:inline">| Free Over PKR 2,500</span>
              </span>
            </div>

            {/* Right utility items */}
            <div className="flex items-center space-x-3 sm:space-x-5 text-emerald-200/90 shrink-0">
              <span className="hidden md:flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <Clock className="w-3 h-3 text-emerald-400" /> 8:00 AM - 11:00 PM
              </span>

              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1 hover:text-white transition"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>+92 21 111-373-742</span>
              </a>

              {/* Modern Glassmorphic Admin CRM Button */}
              <a
                href="/admin"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-emerald-500/20 text-emerald-100 hover:text-white px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-400/30 backdrop-blur-md transition-all shadow-xs group"
                title="Open Enterprise Admin CRM & POS"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400 group-hover:rotate-12 transition-transform" />
                <span>Admin CRM</span>
                <ArrowRight className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </a>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            {/* Brand Logo & Location */}
            <div className="flex items-center space-x-3 sm:space-x-6 shrink-0">
              <Link
                href="/"
                onClick={() => onSelectCategory('')}
                className="flex items-center space-x-2.5 text-left group"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-fresh-500 to-fresh-700 flex items-center justify-center text-white shadow-md shadow-fresh-600/25 group-hover:scale-105 transition transform">
                  <ShoppingBag className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                </div>
                <div>
                  <div className="flex items-center space-x-1 leading-none">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">FRESH</span>
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-fresh-600">BASKET</span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold tracking-wider mt-0.5 uppercase">
                    ORGANIC & GROCERY PK
                  </p>
                </div>
              </Link>

              {/* Delivering to Karachi Pill */}
              <div className="hidden xl:flex items-center space-x-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 px-3 py-1.5 rounded-2xl text-xs cursor-pointer transition">
                <MapPin className="w-3.5 h-3.5 text-fresh-600" />
                <div className="text-left">
                  <span className="block text-[9px] text-slate-400 font-bold leading-tight">DELIVERING TO</span>
                  <span className="font-bold text-slate-800 leading-tight">Karachi (All Zones)</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
              </div>
            </div>

            {/* Desktop Live Search Bar */}
            <div ref={searchRef} className="hidden md:block relative flex-1 max-w-xl mx-2">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowResults(true);
                  }}
                  placeholder="Search 750+ fresh items (e.g. mushrooms, milk, malta, butter)..."
                  className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-fresh-500 pl-10 pr-10 py-2.5 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition shadow-2xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              {showResults && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50">
                  <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600">
                      {isSearching ? 'Searching database...' : `Found ${searchResults.length} matching products`}
                    </span>
                    <span className="text-slate-400 text-[11px]">Click item to view</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {searchResults.map(p => (
                      <div
                        key={p.id}
                        className="p-3 hover:bg-fresh-50/50 flex items-center justify-between gap-3 transition"
                      >
                        <Link
                          href={`/products/${p.slug}`}
                          onClick={() => setShowResults(false)}
                          className="flex items-center space-x-3 overflow-hidden flex-1 group"
                        >
                          <img
                            src={p.primary_image || 'https://via.placeholder.com/60'}
                            alt={p.name}
                            className="w-11 h-11 object-contain rounded-xl border border-slate-200 p-0.5 shrink-0 group-hover:scale-105 transition"
                            loading="lazy"
                          />
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-fresh-600 transition truncate">
                              {p.name}
                            </h4>
                            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                              <span>{p.unit}</span>
                              <span className="font-black text-emerald-700">PKR {p.price.toLocaleString()}</span>
                              {p.compare_at_price && (
                                <span className="line-through text-slate-400 text-[10px]">
                                  PKR {p.compare_at_price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                        <button
                          onClick={() => addToCart(p, 1)}
                          className="shrink-0 bg-fresh-600 hover:bg-fresh-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs transition"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Action: Redesigned Premium Cart Button */}
            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center bg-gradient-to-r from-fresh-600 to-emerald-700 hover:from-fresh-500 hover:to-emerald-600 text-white rounded-2xl p-1.5 sm:px-4 sm:py-2 shadow-lg shadow-fresh-600/20 hover:shadow-fresh-600/35 transition-all group"
                aria-label="View Shopping Basket"
              >
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 bg-white/15 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left pl-3 pr-1">
                  <span className="block text-[9px] text-emerald-200 font-black tracking-wider uppercase leading-none mb-0.5">
                    MY BASKET
                  </span>
                  <span className="text-xs sm:text-sm font-black tracking-tight leading-none text-white font-mono">
                    PKR {subtotal.toLocaleString()}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar (Full Width on mobile devices) */}
          <div className="md:hidden mt-3 relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowResults(true);
                }}
                placeholder="Search 750+ fresh items..."
                className="w-full bg-slate-100 focus:bg-white border border-slate-200 focus:border-fresh-500 pl-9 pr-9 py-2 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="absolute right-3 top-2.5 text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Search Results Dropdown */}
            {showResults && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50">
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {searchResults.map(p => (
                    <div
                      key={p.id}
                      className="p-2.5 flex items-center justify-between gap-2"
                    >
                      <Link
                        href={`/products/${p.slug}`}
                        onClick={() => setShowResults(false)}
                        className="flex items-center space-x-2.5 overflow-hidden flex-1"
                      >
                        <img
                          src={p.primary_image || 'https://via.placeholder.com/60'}
                          alt={p.name}
                          className="w-9 h-9 object-contain rounded-lg border border-slate-200 p-0.5 shrink-0"
                          loading="lazy"
                        />
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                          <span className="text-[11px] font-black text-emerald-700">PKR {p.price.toLocaleString()}</span>
                        </div>
                      </Link>
                      <button
                        onClick={() => addToCart(p, 1)}
                        className="shrink-0 bg-fresh-600 text-white p-1.5 rounded-lg text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Navigation Pills (Smooth Touch Horizontal Scroll) */}
        <div className="bg-slate-50/90 border-t border-slate-100 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center space-x-2">
            <Link
              href="/"
              onClick={() => onSelectCategory('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === ''
                  ? 'bg-fresh-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              All Products
            </Link>
            {categories.slice(0, 14).map(cat => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-fresh-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Floating Bottom App Navigation for Mobile Devices */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-2 flex items-center justify-around shadow-2xl">
        <Link
          href="/"
          onClick={() => onSelectCategory('')}
          className={`flex flex-col items-center justify-center space-y-1 transition ${
            selectedCategory === '' ? 'text-fresh-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Store</span>
        </Link>

        <button
          onClick={focusSearch}
          className="flex flex-col items-center justify-center space-y-1 text-slate-500 hover:text-fresh-600 transition"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Search</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center space-y-1 text-slate-500 hover:text-fresh-600 relative transition"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-fresh-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px]">Basket</span>
        </button>

        <a
          href="https://wa.me/923001234567"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center space-y-1 text-slate-500 hover:text-emerald-600 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px]">WhatsApp</span>
        </a>

        <a
          href="/admin"
          className="flex flex-col items-center justify-center space-y-1 text-slate-500 hover:text-emerald-700 transition"
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px]">Admin</span>
        </a>
      </nav>
    </>
  );
}
