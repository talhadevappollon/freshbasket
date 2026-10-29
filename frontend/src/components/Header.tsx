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
  ArrowRight,
  LayoutGrid,
  ChevronRight,
  Flame,
  Tag,
  Gift,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

interface MegaAisleInfo {
  id: string;
  name: string;
  icon: string;
  badge: string;
  description: string;
  popularSearches: string[];
  promoTitle: string;
  promoSubtitle: string;
  promoCode: string;
  accentGradient: string;
  imageIcon: string;
}

const MEGA_AISLES: MegaAisleInfo[] = [
  {
    id: 'fresh-produce',
    name: 'Fresh Fruits & Vegetables',
    icon: '🥦',
    badge: 'Daily Harvest',
    description: 'Farm-fresh organic vegetables, crisp greens, seasonal malta, mushrooms & dates.',
    popularSearches: ['Brown Button Mushrooms', 'White Button Mushrooms', 'Shakri Malta', 'Ajwa Saudi Dates', 'Fresh Salad Greens', 'Yellow Bell Pepper'],
    promoTitle: 'Orchard Fresh Harvest',
    promoSubtitle: '100% naturally grown produce from certified local farms',
    promoCode: 'FRESH10',
    accentGradient: 'from-emerald-950 via-emerald-900 to-fresh-950',
    imageIcon: '🥑',
  },
  {
    id: 'dairy-cheese',
    name: 'Dairy, Milk & Artisan Cheeses',
    icon: '🧀',
    badge: 'Imported Selection',
    description: 'Pure Almarai milk, aged Yayycheese cheddar, authentic Greek feta, and rich butter.',
    popularSearches: ['Yayycheese White Cheddar', 'Greek Feta Cheese', 'Almarai Full Cream Milk', 'Garlic & Herb Cream Cheese', 'Mozzarella Blocks'],
    promoTitle: 'Gourmet Dairy & Cheese',
    promoSubtitle: 'Temperature-controlled cold chain delivery in Karachi',
    promoCode: 'FRESH10',
    accentGradient: 'from-amber-950 via-amber-900 to-emerald-950',
    imageIcon: '🥛',
  },
  {
    id: 'bakery-breakfast',
    name: 'Artisan Bakery & Morning Breads',
    icon: '🥖',
    badge: 'Daily 8 AM Bake',
    description: 'Oven-fresh crusty baguettes, wholemeal flour tortillas, breakfast waffles & rolls.',
    popularSearches: ['Wrapster Flour Tortillas', 'Wholemeal Small 12pc', 'Waffles Kitchen Mozzarella Sticks', 'White Castle Digestives', 'Breakfast Croissants'],
    promoTitle: 'Warm Bakery Counter',
    promoSubtitle: 'Freshly baked daily batches delivered to your door',
    promoCode: 'FRESH10',
    accentGradient: 'from-orange-950 via-amber-950 to-emerald-950',
    imageIcon: '🥐',
  },
  {
    id: 'beverages-juices',
    name: 'Beverages, Juices & Chilled Drinks',
    icon: '🧃',
    badge: 'Chilled Express',
    description: 'Natural coconut water, pure fruit juices, iced coffees, kombucha & energy drinks.',
    popularSearches: ['Pure Coconut Water', 'Almarai Orange Juice', 'Barista Cold Coffee', 'Kombucha Wellness', 'Green Tea Brews'],
    promoTitle: 'Refreshment Bar',
    promoSubtitle: 'Chilled beverages ready to quench your thirst in 2 hours',
    promoCode: 'FRESH10',
    accentGradient: 'from-sky-950 via-blue-900 to-emerald-950',
    imageIcon: '🥥',
  },
  {
    id: 'pantry-cooking',
    name: 'Pantry Staples, Oils & Superfoods',
    icon: '🍯',
    badge: 'Organic Pantry',
    description: 'Cold pressed mustard oil, pure cooking tallow, acacia honey & artisanal nut butters.',
    popularSearches: ['Bone Broth Cooking Tallow', 'Cold Pressed Mustard Oil', 'Al-Shifa Acacia Honey', 'Thoughtful Kitchen Almond Butter', 'Wadi Food Sundried Tomatoes'],
    promoTitle: 'Pure Pantry Staples',
    promoSubtitle: 'Chemical-free unrefined oils, raw honeys, and keto fats',
    promoCode: 'FRESH10',
    accentGradient: 'from-emerald-950 via-teal-950 to-fresh-950',
    imageIcon: '🫒',
  },
];

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
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [selectedMegaAisle, setSelectedMegaAisle] = useState<MegaAisleInfo>(MEGA_AISLES[0]);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  // Debounced live product search
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

  // Click outside to dismiss search results & mega menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
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

  const handleSelectQuickSearch = (term: string) => {
    setSearchQuery(term);
    setIsMegaMenuOpen(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-100">
        {/* Top Highlight Utility Bar */}
        <div className="bg-gradient-to-r from-[#041d0e] via-[#062d16] to-[#041d0e] text-white text-[11px] py-2 px-3 sm:px-6 border-b border-emerald-950">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            {/* Left promo */}
            <div className="flex items-center space-x-2 font-medium overflow-hidden">
              <span className="bg-gradient-to-r from-emerald-500 to-fresh-500 hover:from-emerald-400 hover:to-fresh-400 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs shrink-0 cursor-default transition">
                <Sparkles className="w-2.5 h-2.5" /> Express
              </span>
              <span className="truncate text-slate-200">
                Same-Day 2-Hour Delivery in Karachi <span className="hidden sm:inline">| Free Over PKR 2,500</span>
              </span>
            </div>

            {/* Right utility items */}
            <div className="flex items-center space-x-3 sm:space-x-5 text-emerald-200/90 shrink-0">
              <span className="hidden md:flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <Clock className="w-3 h-3 text-emerald-400" /> 8:00 AM - 11:00 PM
              </span>

              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1 text-emerald-200/90 hover:text-white hover:underline underline-offset-4 hover:scale-105 transition-all"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>+92 21 111-373-742</span>
              </a>

              {/* Glassmorphic Admin CRM Button */}
              <a
                href="/admin"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-emerald-500/25 text-emerald-100 hover:text-white px-3.5 py-1 rounded-full text-[10px] font-bold border border-emerald-400/30 hover:border-emerald-300 backdrop-blur-md hover:scale-105 hover:shadow-xs transition-all duration-200 group"
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
                className="flex items-center space-x-2.5 text-left group hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-fresh-500 to-fresh-700 flex items-center justify-center text-white shadow-md shadow-fresh-600/25 group-hover:scale-105 group-hover:shadow-fresh-600/40 transition transform duration-200">
                  <ShoppingBag className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                </div>
                <div>
                  <div className="flex items-center space-x-1 leading-none">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-fresh-800 transition-colors">FRESH</span>
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-fresh-600 group-hover:text-fresh-500 transition-colors">BASKET</span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold tracking-wider mt-0.5 uppercase">
                    ORGANIC & GROCERY PK
                  </p>
                </div>
              </Link>

              {/* Delivering to Karachi Pill with Hover */}
              <div className="hidden xl:flex items-center space-x-2 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/70 hover:border-emerald-300 hover:shadow-xs px-3.5 py-1.5 rounded-2xl text-xs cursor-pointer hover:-translate-y-0.5 transition-all duration-200">
                <MapPin className="w-3.5 h-3.5 text-fresh-600 animate-bounce" />
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
                  className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 hover:border-fresh-300 focus:border-fresh-500 pl-10 pr-10 py-2.5 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 shadow-2xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              {showResults && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
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
                        className="p-3 hover:bg-emerald-50/60 hover:pl-4 flex items-center justify-between gap-3 transition-all duration-150 group cursor-pointer"
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
                          className="shrink-0 bg-fresh-600 hover:bg-fresh-700 active:scale-95 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs hover:shadow-md transition-all cursor-pointer"
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
                className="flex items-center bg-gradient-to-r from-fresh-600 to-emerald-700 hover:from-fresh-500 hover:to-emerald-600 text-white rounded-2xl p-1.5 sm:px-4 sm:py-2 shadow-lg shadow-fresh-600/20 hover:shadow-xl hover:shadow-fresh-600/35 hover:scale-[1.03] active:scale-95 transition-all duration-200 group cursor-pointer"
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

          {/* Mobile Search Bar */}
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

        {/* Category Navigation Bar with Creative MEGA MENU Trigger & Pills */}
        <div className="relative bg-white/95 backdrop-blur-xs border-t border-slate-100 py-2" ref={megaMenuRef}>
          <div className="max-w-7xl mx-auto px-4 flex items-center space-x-2 overflow-x-auto no-scrollbar scroll-smooth">
            {/* Creative Mega Menu Toggle Button */}
            <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 transition-all duration-200 shrink-0 cursor-pointer shadow-sm ${
                isMegaMenuOpen
                  ? 'bg-gradient-to-r from-emerald-950 to-slate-950 text-white shadow-md'
                  : 'bg-emerald-900 hover:bg-emerald-950 text-emerald-100 hover:text-white border border-emerald-800 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-fresh-400 animate-pulse" />
              <span>Explore Aisles & Mega Menu</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180 text-white' : 'text-emerald-300'}`} />
            </button>

            {/* "All Products" Pill with Enhanced Hover */}
            <Link
              href="/"
              onClick={() => {
                onSelectCategory('');
                setIsMegaMenuOpen(false);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                selectedCategory === ''
                  ? 'bg-gradient-to-r from-fresh-600 to-emerald-700 text-white shadow-md shadow-fresh-600/25 scale-[1.02]'
                  : 'text-slate-700 bg-slate-100/80 hover:bg-emerald-50 hover:text-fresh-700 hover:border-emerald-300 hover:shadow-sm hover:-translate-y-0.5 border border-transparent'
              }`}
            >
              <Sparkles className={`w-3 h-3 ${selectedCategory === '' ? 'text-amber-300' : 'text-slate-400 group-hover:text-amber-400'}`} />
              <span>All Products</span>
            </Link>

            {/* Horizontal Category Pills with Animated Dot & Color Shift on Hover */}
            {categories.slice(0, 14).map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.slug);
                  setIsMegaMenuOpen(false);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 group flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  selectedCategory === cat.slug
                    ? 'bg-gradient-to-r from-fresh-600 to-emerald-700 text-white shadow-md shadow-fresh-600/25 scale-[1.02]'
                    : 'text-slate-700 bg-slate-100/80 hover:bg-emerald-50 hover:text-fresh-700 hover:border-emerald-300 hover:shadow-sm hover:-translate-y-0.5 border border-transparent'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    selectedCategory === cat.slug
                      ? 'bg-amber-300'
                      : 'bg-emerald-400 group-hover:scale-150 group-hover:bg-fresh-600'
                  }`}
                />
                <span className="group-hover:tracking-wide transition-all duration-150">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* CREATIVE MEGA MENU EXPANDED PANEL (Desktop Dropdown) */}
          {isMegaMenuOpen && (
            <div
              className="absolute left-0 right-0 top-full mt-1 max-w-7xl mx-auto px-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <div className="bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/90 p-6 sm:p-8 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column (4 Cols): Main Supermarket Aisles Tabs */}
                  <div className="lg:col-span-4 border-r border-slate-100 pr-0 lg:pr-6 space-y-1">
                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Select Supermarket Aisle
                      </span>
                      <span className="text-[10px] text-fresh-700 font-bold bg-fresh-50 px-2 py-0.5 rounded-full">
                        750+ Items
                      </span>
                    </div>

                    {MEGA_AISLES.map(aisle => {
                      const isActive = selectedMegaAisle.id === aisle.id;
                      return (
                        <div
                          key={aisle.id}
                          onMouseEnter={() => setSelectedMegaAisle(aisle)}
                          onClick={() => {
                            onSelectCategory(aisle.id);
                            setIsMegaMenuOpen(false);
                          }}
                          className={`p-3 rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer group ${
                            isActive
                              ? 'bg-emerald-50 text-fresh-800 shadow-xs border-l-4 border-fresh-600 pl-4 font-bold'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-fresh-700 hover:pl-3.5 border-l-4 border-transparent'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl group-hover:scale-125 transition-transform duration-200">
                              {aisle.icon}
                            </span>
                            <div>
                              <h4 className="text-xs font-bold leading-tight">{aisle.name}</h4>
                              <span className="text-[10px] text-slate-400 font-medium">{aisle.badge}</span>
                            </div>
                          </div>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isActive ? 'text-fresh-600 translate-x-1' : 'text-slate-300 group-hover:text-slate-500'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Middle Column (4 Cols): Trending Items in Selected Aisle */}
                  <div className="lg:col-span-4 space-y-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-fresh-700 font-bold text-xs mb-1">
                        <Flame className="w-4 h-4 text-rose-500" />
                        <span>Trending in {selectedMegaAisle.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {selectedMegaAisle.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                        Quick Popular Searches:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedMegaAisle.popularSearches.map(term => (
                          <button
                            key={term}
                            onClick={() => handleSelectQuickSearch(term)}
                            className="bg-slate-100 hover:bg-fresh-600 hover:text-white text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs hover:scale-105 active:scale-95"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <Link
                        href="#products-section"
                        onClick={() => {
                          onSelectCategory('');
                          setIsMegaMenuOpen(false);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-fresh-700 hover:text-fresh-800 hover:underline"
                      >
                        <span>View all aisles in catalog</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Right Column (4 Cols): Creative Visual Card with Promo & Image */}
                  <div className="lg:col-span-4">
                    <div
                      className={`relative rounded-3xl p-6 text-white bg-gradient-to-br ${selectedMegaAisle.accentGradient} shadow-xl overflow-hidden flex flex-col justify-between h-full min-h-[260px] group`}
                    >
                      {/* Decorative Background Icon */}
                      <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                        {selectedMegaAisle.imageIcon}
                      </div>

                      <div className="relative z-10 space-y-2">
                        <div className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/20">
                          <Gift className="w-3 h-3 text-amber-300" />
                          <span>Special Aisle Bonus</span>
                        </div>
                        <h3 className="text-xl font-black text-white leading-tight">
                          {selectedMegaAisle.promoTitle}
                        </h3>
                        <p className="text-xs text-emerald-100/80 leading-snug">
                          {selectedMegaAisle.promoSubtitle}
                        </p>
                      </div>

                      <div className="relative z-10 pt-4 space-y-3">
                        <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-emerald-200">Coupon:</span>
                          <span className="font-mono font-black text-amber-300 tracking-wider">
                            {selectedMegaAisle.promoCode} (10% OFF)
                          </span>
                        </div>

                        <Link
                          href="#products-section"
                          onClick={() => {
                            onSelectCategory('');
                            setIsMegaMenuOpen(false);
                          }}
                          className="w-full bg-white hover:bg-emerald-50 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                        >
                          <span>Explore This Aisle</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Floating Bottom App Navigation for Mobile Devices */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-2 flex items-center justify-around shadow-2xl">
        <Link
          href="/"
          onClick={() => onSelectCategory('')}
          className={`flex flex-col items-center justify-center space-y-1 transition ${
            selectedCategory === '' ? 'text-fresh-600 font-bold' : 'text-slate-500 hover:text-fresh-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Store</span>
        </Link>

        <button
          onClick={focusSearch}
          className="flex flex-col items-center justify-center space-y-1 text-slate-500 hover:text-fresh-600 transition cursor-pointer"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Search</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center space-y-1 text-slate-500 hover:text-fresh-600 relative transition cursor-pointer"
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
