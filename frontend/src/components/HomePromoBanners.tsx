'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Reveal from '@/components/Reveal';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Gift,
  Clock,
  Truck,
  Heart,
  MessageCircle,
  CheckCircle2,
  Copy,
  Star,
  ShoppingBag,
  Percent,
  Award,
  PhoneCall
} from 'lucide-react';

const CATEGORY_ROUTES: Record<string, string> = {
  'fresh-produce': '/category/karachi-breakfast',
  'dairy-cheese': '/category/dairy',
  'bakery-breakfast': '/category/bakery-items',
  'beverages-juices': '/category/karachi-beverages',
  'pantry-cooking': '/category/karachi-pantry-cooking-ingredients',
  'baby-food': '/category/karachi-baby-food',
  '': '/#products-section',
};

export default function HomePromoBanners() {
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const router = useRouter();
  const handleCategoryClick = (slug: string) => {
    const route = CATEGORY_ROUTES[slug] ?? `/category/${slug}`;
    if (route.startsWith('/#') && window.location.pathname === '/') {
      document.getElementById(route.slice(2))?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(route);
    }
  };

  // Non-button elements that behave as links get proper role + keyboard support
  const linkProps = (slug: string) => ({
    role: 'link' as const,
    tabIndex: 0,
    onClick: () => handleCategoryClick(slug),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCategoryClick(slug);
      }
    },
  });

  return (
    <div className="space-y-12 my-12 max-w-7xl mx-auto px-4">
      {/* SECTION 1: Dual High-Impact Lifestyle & Department Banners */}
      <Reveal as="section">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-black tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-block mb-1">
              Department Highlights
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-fresh-600 animate-pulse" />
              <span>Specialty Aisles &amp; Daily Supermarket Deals</span>
            </h2>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Live Inventory in Karachi</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Banner A: Organic Baby Food & Infant Nutrition */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#142614] via-[#153114] to-[#0a1709] text-white p-7 sm:p-8 shadow-xl border border-emerald-800/40 hover:border-emerald-500 transition-all duration-300 flex flex-col justify-between min-h-[320px] group">
            {/* Background Illustration & Glow */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-400/20 transition-all"></div>
            <div className="absolute right-4 bottom-4 text-7xl opacity-20 group-hover:opacity-35 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 pointer-events-none select-none">
              🥣
            </div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-xs font-black tracking-wide px-3 py-1 rounded-full">
                  <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                  <span>Baby &amp; Toddler Nutrition</span>
                </span>
                <span className="bg-white/10 text-slate-200 text-xs font-bold px-2.5 py-1 rounded-full">
                  100% Certified Organic
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Pure Nutrition For Your Little Ones
              </h3>

              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-lg">
                Gerber fruit purees, Ella&apos;s Kitchen smoothies, whole-grain infant cereals, and chemical-free baby snacks. Directly imported with sealed hygiene seals.
              </p>

              {/* Quick Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Gerber Organic', "Ella's Kitchen", 'Baby Oatmeal', 'Teething Biscuits'].map(tag => (
                  <span
                    key={tag}
                    {...linkProps('baby-food')}
                    className="text-xs bg-white/10 hover:bg-white/20 text-emerald-200 px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer transition"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-black/40 border border-white/15 px-3 py-1.5 rounded-xl text-xs font-mono">
                  <span className="text-xs text-emerald-300 block font-sans font-bold">Use Coupon:</span>
                  <span className="font-black text-amber-300">BABY15</span>
                </div>
                <button
                  onClick={() => handleCopyCode('BABY15')}
                  className="w-10 h-10 flex items-center justify-center bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-xl transition cursor-pointer"
                  title="Copy Coupon"
                >
                  {copiedCoupon === 'BABY15' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={() => handleCategoryClick('baby-food')}
                className="bg-white hover:bg-emerald-50 text-slate-950 font-black text-sm h-11 px-5 rounded-xl shadow-lg transition-all flex items-center gap-2 group/btn cursor-pointer"
              >
                <span>Browse Baby Care</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-900 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Banner B: Karachi Chilled Hydration & Smoothie Bar */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#102310] via-[#1a3719] to-[#0d1c0c] text-white p-7 sm:p-8 shadow-xl border border-sky-800/40 hover:border-sky-500 transition-all duration-300 flex flex-col justify-between min-h-[320px] group">
            {/* Background Illustration & Glow */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-sky-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-400/20 transition-all"></div>
            <div className="absolute right-4 bottom-4 text-7xl opacity-20 group-hover:opacity-35 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 pointer-events-none select-none">
              🥥
            </div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-sky-500/25 border border-sky-400/30 text-sky-300 text-xs font-black tracking-wide px-3 py-1 rounded-full">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Chilled Express Dispatch</span>
                </span>
                <span className="bg-white/10 text-slate-200 text-xs font-bold px-2.5 py-1 rounded-full">
                  Delivered Cold in 90 Mins
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Quench Karachi Heat With Chilled Drinks
              </h3>

              <p className="text-xs sm:text-sm text-sky-100/80 leading-relaxed max-w-lg">
                Fresh tender coconut water, Valencia orange juice, cold-brew iced coffees, kombucha wellness tonics, and Greek yogurt drinks kept chilled in thermal carrier boxes.
              </p>

              {/* Quick Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Pure Coconut Water', 'Cold Brew Iced Coffee', 'Almarai Juices', 'Greek Yogurt Smoothies'].map(tag => (
                  <span
                    key={tag}
                    {...linkProps('beverages-juices')}
                    className="text-xs bg-white/10 hover:bg-white/20 text-sky-200 px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer transition"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-black/40 border border-white/15 px-3 py-1.5 rounded-xl text-xs font-mono">
                  <span className="text-xs text-sky-300 block font-sans font-bold">Use Coupon:</span>
                  <span className="font-black text-amber-300">CHILLED10</span>
                </div>
                <button
                  onClick={() => handleCopyCode('CHILLED10')}
                  className="w-10 h-10 flex items-center justify-center bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-xl transition cursor-pointer"
                  title="Copy Coupon"
                >
                  {copiedCoupon === 'CHILLED10' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={() => handleCategoryClick('beverages-juices')}
                className="bg-white hover:bg-sky-50 text-slate-950 font-black text-sm h-11 px-5 rounded-xl shadow-lg transition-all flex items-center gap-2 group/btn cursor-pointer"
              >
                <span>Browse Chilled Bar</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-900 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      {/* SECTION 2: 4-Item Specialty Food Pantry Banners Grid */}
      <Reveal as="section">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-black tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-1.5">
            Curated For Every Lifestyle
          </span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Explore Karachi&apos;s Favorite Food Pantries
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Carefully sourced organic, non-GMO, and artisan pantry essentials delivered right to your kitchen counter.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Keto & Healthy Fats */}
          <div
            {...linkProps('pantry-cooking')}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-xs"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🥑
              </div>
              <span className="text-xs font-black tracking-wide text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block mb-2">
                Keto &amp; Healthy Fats
              </span>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Pure Cooking Tallow &amp; Oils
              </h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Cold-pressed mustard oil, beef bone broth tallow, raw almond butters, and organic chia seeds.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>View 24 Items</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Gourmet Delicatessen */}
          <div
            {...linkProps('dairy-cheese')}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-purple-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-xs"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🧀
              </div>
              <span className="text-xs font-black tracking-wide text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full inline-block mb-2">
                Imported Cheeses
              </span>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                Artisan Dairy &amp; Feta
              </h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Yayycheese Greek Feta, White Cheddar slices, Almarai full-cream milk, and gourmet garlic butter.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
              <span>View 36 Items</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Morning Bakery & Breads */}
          <div
            {...linkProps('bakery-breakfast')}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-orange-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-xs"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🥖
              </div>
              <span className="text-xs font-black tracking-wide text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full inline-block mb-2">
                Daily 8 AM Bake
              </span>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-orange-700 transition-colors">
                Wholemeal Tortillas &amp; Rolls
              </h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Wrapster flour tortillas, breakfast waffles, wholemeal rolls, and digestive biscuits.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-700">
              <span>View 18 Items</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Superfood Honeys & Dates */}
          <div
            {...linkProps('fresh-produce')}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-xs"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🍯
              </div>
              <span className="text-xs font-black tracking-wide text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-2">
                100% Pure Superfood
              </span>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Raw Honey &amp; Ajwa Dates
              </h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Al-Shifa natural acacia honey, authentic Saudi Ajwa dates, and organic roasted nuts.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>View 42 Items</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Reveal>

      {/* SECTION 3: Official Brand Partners Showcase Ribbon */}
      <Reveal as="section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-3">
          <div>
            <span className="text-xs font-black tracking-wide text-slate-400">
              Verified Stockist
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Shop Trusted Household Brands in Karachi
            </h3>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Original Products Guaranteed</span>
          </div>
        </div>

        {/* Brand Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-6">
          {[
            { name: 'Almarai', desc: 'Dairy & Juices', emoji: '🥛' },
            { name: 'Yayycheese', desc: 'Artisan Cheeses', emoji: '🧀' },
            { name: 'Wrapster', desc: 'Fresh Tortillas', emoji: '🌯' },
            { name: 'Gerber', desc: 'Baby Organic', emoji: '👶' },
            { name: "Ella's Kitchen", desc: 'Pure Purees', emoji: '🍓' },
            { name: 'Al-Shifa', desc: 'Acacia Honey', emoji: '🍯' },
            { name: 'Wadi Food', desc: 'Olives & Oil', emoji: '🫒' },
            { name: 'White Castle', desc: 'Fine Bakery', emoji: '🍪' },
          ].map(brand => (
            <div
              key={brand.name}
              {...linkProps('')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/70 hover:border-emerald-300 text-center transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-xs"
            >
              <span className="text-2xl block mb-1 group-hover:scale-125 transition-transform">
                {brand.emoji}
              </span>
              <h5 className="text-xs font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                {brand.name}
              </h5>
              <span className="text-xs text-slate-400 block truncate">
                {brand.desc}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* SECTION 4: WhatsApp Personal Concierge & Instant Order Banner */}
      <Reveal as="section" className="rounded-3xl overflow-hidden bg-gradient-to-r from-[#0c1b0b] via-[#132b12] to-[#081208] text-white p-7 sm:p-9 shadow-2xl border border-emerald-800/60 relative">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black tracking-wide px-3.5 py-1 rounded-full">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Karachi VIP WhatsApp Shopper Service</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Prefer Ordering on WhatsApp? Send Us Your Grocery List in Seconds!
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Don&apos;t feel like clicking through the website? Simply take a photo of your handwritten grocery list or send a quick voice note. Our dedicated Karachi personal shopper will pack, photograph, and deliver your basket in 90 minutes.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-emerald-200">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Advance Payment</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Cash on Delivery (COD)</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Direct Live Rider Tracking</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <a
              href="https://wa.me/923001234567?text=Assalam-o-Alaikum!%20I%20want%20to%20order%20groceries%20from%20Fresh%20House."
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm py-3.5 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <MessageCircle className="w-5 h-5 fill-slate-950 text-emerald-400" />
              <span>Chat on WhatsApp (+92 300 1234567)</span>
            </a>

            <a
              href="tel:+9221111373742"
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs py-3 px-5 rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-emerald-300" />
              <span>Call Hotline: +92 21 111-373-742</span>
            </a>
          </div>
        </div>
      </Reveal>

      {/* SECTION 5: Verified Karachi Shopper Reviews & Social Proof */}
      <Reveal as="section" className="bg-slate-100/70 rounded-3xl p-6 sm:p-8 border border-slate-200/70">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1 text-star mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-star text-star" />
            ))}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            Loved By Over 15,000+ Karachi Families
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Real feedback from verified grocery deliveries across DHA, Clifton, Gulshan, and PECHS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-star">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-star" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              &ldquo;The mushrooms and strawberries arrived fresher than our local supermarket in DHA Phase 5. The 2-hour delivery is genuinely accurate.&rdquo;
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Dr. Ayesha K.</span>
              <span className="text-slate-400">DHA Phase 5, Karachi</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-star">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-star" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              &ldquo;Finally an organic grocery in Karachi that understands cold chain. The Yayycheese cheddar and Almarai milk were cold and neatly packed in insulated bags.&rdquo;
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Salman Tariq</span>
              <span className="text-slate-400">Clifton Block 2, Karachi</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-star">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-star" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              &ldquo;Ordered via WhatsApp with a handwritten note and everything was delivered within 90 mins with Cash on Delivery. Amazing service!&rdquo;
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Mrs. Farhana</span>
              <span className="text-slate-400">PECHS Block 6, Karachi</span>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

