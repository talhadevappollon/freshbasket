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
    }, 300);

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

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
      {/* Top Highlight Banner */}
      <div className="bg-fresh-900 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-2 font-medium">
            <span className="bg-fresh-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Express
            </span>
            <span>Same-Day 2-Hour Grocery Delivery Across Karachi | Free Delivery Over PKR 2,500</span>
          </div>
          <div className="flex items-center space-x-6 text-gray-300 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-fresh-400" /> 8:00 AM - 11:00 PM
            </span>
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white flex items-center gap-1 transition"
            >
              <Phone className="w-3 h-3 text-fresh-400" /> Helpline: +92 21 111-373-742
            </a>
            <a
              href="http://localhost:8000/admin"
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-800 hover:bg-emerald-700 text-white px-2.5 py-0.5 rounded text-[10px] font-bold transition ml-2"
            >
              Admin CRM &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Location */}
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            onClick={() => onSelectCategory('')}
            className="flex items-center space-x-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fresh-500 to-fresh-700 flex items-center justify-center text-white shadow-md shadow-fresh-500/20 group-hover:scale-105 transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xl font-black tracking-tight text-gray-900">FRESH</span>
                <span className="text-xl font-black tracking-tight text-fresh-600">BASKET</span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide">ORGANIC & GROCERY PK</p>
            </div>
          </Link>

          {/* City / Location Pill */}
          <div className="hidden lg:flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 px-3 py-1.5 rounded-xl text-xs cursor-pointer transition">
            <MapPin className="w-3.5 h-3.5 text-fresh-600" />
            <div className="text-left">
              <span className="block text-[10px] text-gray-400 font-semibold leading-tight">DELIVERING TO</span>
              <span className="font-bold text-gray-800 leading-tight">Karachi (All Areas)</span>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400 ml-1" />
          </div>
        </div>

        {/* Live Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-xl mx-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowResults(true);
              }}
              placeholder="Search 750+ fresh items (e.g. mushrooms, milk, malta, cookies)..."
              className="w-full bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 focus:border-fresh-500 pl-10 pr-10 py-2.5 rounded-2xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Instant Search Results Dropdown */}
          {showResults && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-600">
                  {isSearching ? 'Searching...' : `Found ${searchResults.length} items`}
                </span>
                <span className="text-gray-400 text-[11px]">Click item for full details</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
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
                        className="w-11 h-11 object-cover rounded-xl border border-gray-100 shrink-0 group-hover:scale-105 transition"
                      />
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-gray-900 group-hover:text-fresh-600 transition truncate">
                          {p.name}
                        </h4>
                        <div className="flex items-center space-x-2 text-[11px] text-gray-500">
                          <span>{p.unit}</span>
                          <span className="font-bold text-emerald-700">PKR {p.price.toLocaleString()}</span>
                          {p.compare_at_price && (
                            <span className="line-through text-gray-400 text-[10px]">
                              PKR {p.compare_at_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => addToCart(p, 1)}
                      className="shrink-0 bg-fresh-600 hover:bg-fresh-700 text-white p-2 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cart & Direct View Cart Button */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link
            href="/cart"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:text-fresh-700 hover:bg-gray-100 transition"
          >
            <span>View Cart</span>
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center space-x-3 bg-fresh-600 hover:bg-fresh-700 text-white px-4 py-2.5 rounded-2xl shadow-lg shadow-fresh-600/25 transition group"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-gray-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {totalItems}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left border-l border-fresh-500/50 pl-3">
              <span className="block text-[10px] text-fresh-200 font-semibold leading-tight">YOUR BASKET</span>
              <span className="text-xs font-black tracking-tight leading-tight">
                PKR {subtotal.toLocaleString()}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="bg-gray-50 border-t border-gray-100 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center space-x-2">
          <Link
            href="/"
            onClick={() => onSelectCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === ''
                ? 'bg-fresh-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            All Products
          </Link>
          {categories.slice(0, 10).map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.slug
                  ? 'bg-fresh-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200/60'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
