'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, CreditCard, Crown, Gift, HandHeart, MapPin, Package, PackageCheck, Smartphone, Sprout, Store } from 'lucide-react';
import ProductCard, { BLOCK_MASK, CARD_MASK } from '@/components/ProductCard';
import { fetchProducts } from '@/lib/api';
import { Product } from '@/types';
import recipes from '@/data/recipes.json';
import { BUNDLES, COMMITMENTS, GIFTS, NUT_TILES, Offer, PLANS, discountOf, whatsappLink } from '@/data/homeOffers';

/** The desktop home page sections, in the order set out in "Fresh House WebData Updates". */

const SHELL = 'max-w-[1200px] mx-auto px-4';

/** true once the element is within `margin` of the screen (sections only fetch products when near) */
function useNear<T extends HTMLElement>(margin = '800px 0px') {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(e => e.some(x => x.isIntersecting) && (setNear(true), io.disconnect()), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, near] as const;
}

function useCategoryProducts(slug: string, count: number, enabled: boolean) {
  const [items, setItems] = useState<Product[] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let off = false;
    fetchProducts({ category: slug, per_page: count }).then(r => !off && setItems(r.data.slice(0, count)));
    return () => {
      off = true;
    };
  }, [slug, count, enabled]);
  return items;
}

function GridSkeleton({ n }: { n: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="bg-white rounded-3xl border border-slate-200/80 p-4" aria-hidden="true">
          <div className="skeleton h-40 rounded-2xl" />
          <div className="skeleton h-3 w-1/3 rounded mt-4" />
          <div className="skeleton h-4 w-5/6 rounded mt-2" />
          <div className="skeleton h-9 w-full rounded-xl mt-5" />
        </div>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Banner after the intro banners                                                              */
/* ------------------------------------------------------------------------------------------ */

export function PromoBanner() {
  return (
    <section className={`${SHELL} pt-6`} aria-label="Order groceries">
      <div
        data-surface="dark"
        className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-fresh-950 via-fresh-900 to-fresh-700 text-white min-h-[240px] flex items-center"
      >
        <div className="relative z-10 px-8 lg:px-14 py-10 max-w-xl">
          <h2 className="text-3xl lg:text-[2.6rem] font-black leading-[1.15] tracking-tight">Order groceries &amp; more for same-day delivery</h2>
          <p className="mt-3 text-emerald-100/90 text-base">Fresh fruit, vegetables, dry fruits and pantry staples across Karachi.</p>
          <a href="#bestsellers" className="inline-flex mt-6 h-12 items-center px-7 rounded-xl bg-white text-fresh-900 font-bold hover:bg-fresh-50 active:scale-95 transition">
            Order today
          </a>
        </div>
        <div className="hidden md:flex absolute right-6 lg:right-14 top-1/2 -translate-y-1/2 items-center" aria-hidden="true">
          {['nuts', 'dates', 'mixed-nuts', 'seeds'].map((n, i) => (
            <img
              key={n}
              src={`/home/tile-${n}.webp`}
              alt=""
              width={150}
              height={150}
              className="w-32 h-32 lg:w-44 lg:h-44 rounded-full object-cover ring-4 ring-white/80 shadow-2xl -ml-8 first:ml-0"
              style={{ transform: `translateY(${i % 2 ? 14 : -14}px)` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Offer cards (membership plans, bundles, gift baskets)                                       */
/* ------------------------------------------------------------------------------------------ */

export function OfferCard({ offer }: { offer: Offer }) {
  const off = discountOf(offer);
  const plan = offer.kind === 'plan';
  return (
    <article className="relative h-full group [filter:drop-shadow(0_1px_1.5px_rgba(23,60,42,0.13))]">
      <div className="h-full flex flex-col bg-white rounded-t-[10px] p-[15px] text-center" style={CARD_MASK}>
        <div className="relative rounded-2xl bg-[#f8f4ec] aspect-square flex items-center justify-center overflow-hidden">
          {off && <span className="absolute top-2 left-2 text-[11px] font-bold text-white bg-[#cf6c4d] rounded-full px-2.5 py-1 z-10">Save</span>}
          {off && <span className="absolute top-2 right-2 text-[11px] font-bold text-brand-700 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-xs z-10">{off}%</span>}
          <img src={offer.image} alt={offer.name} loading="lazy" decoding="async" className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500 ease-out-expo" />
        </div>
        <h3 className="mt-3 text-[13px] font-semibold text-[#173c2a] leading-[22px] min-h-[44px] line-clamp-2">{offer.name}</h3>
        <div className="mt-auto pt-1 mb-2">
          {offer.was && <s className="block text-[0.7rem] text-slate-400 tabular-nums">Rs.{offer.was.toLocaleString()}</s>}
          <p className="text-[20px] md:text-[17px] font-extrabold leading-[28px] text-[#173c2a] tabular-nums">
            Rs.{offer.price.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 min-h-[1.2rem] truncate">{offer.note}</p>
        </div>
        <a
          href={whatsappLink(`Assalam-o-Alaikum! I'd like to order: ${offer.name} (Rs ${offer.price.toLocaleString()}).`)}
          target="_blank"
          rel="noreferrer"
          style={BLOCK_MASK}
          className="h-[52px] pb-3 bg-[#f0f4ea] hover:bg-[#bbea70] text-[#3e872a] text-[12px] font-extrabold tracking-wide uppercase flex items-center justify-center transition-colors duration-300"
        >
          {plan ? 'Choose plan' : 'Order on WhatsApp'}
        </a>
      </div>
    </article>
  );
}

const TILE_ICONS = { crown: Crown, gift: Gift, package: Package } as const;

function OfferRail({ id, title, offers, tileLabel, tileIcon, viewAll }: { id?: string; title: string; offers: Offer[]; tileLabel: string; tileIcon: keyof typeof TILE_ICONS; viewAll?: string }) {
  const TileIcon = TILE_ICONS[tileIcon];
  const scroller = useRef<HTMLUListElement>(null);
  const by = (dir: number) => scroller.current?.scrollBy({ left: dir * 640, behavior: 'smooth' });
  return (
    <section id={id} className="py-10 scroll-mt-[var(--header-offset,120px)]">
      <div className={SHELL}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-fresh-950 tracking-tight">{title}</h2>
          {viewAll && (
            <Link href={viewAll} className="shrink-0 text-[15px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        <div className="relative">
          <ul ref={scroller} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-proximity pb-3 scroll-smooth">
            <li className="snap-start shrink-0 w-[190px] relative rounded-3xl overflow-hidden bg-white shadow-card hidden md:block">
              <span className="absolute inset-0 bg-gradient-to-br from-[#dff3d4] via-[#f4efe0] to-[#e9dcc0]" aria-hidden="true" />
              <TileIcon className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-fresh-700/70" strokeWidth={1.1} aria-hidden="true" />
              <span className="absolute left-3 right-3 bottom-3 rounded-xl bg-white/90 backdrop-blur text-center py-2.5 font-bold text-sm text-fresh-950 shadow-xs">{tileLabel}</span>
            </li>
            {offers.map(o => (
              <li key={o.key} className="snap-start shrink-0 w-[215px]">
                <OfferCard offer={o} />
              </li>
            ))}
          </ul>
          <button type="button" aria-label="Previous" onClick={() => by(-1)} className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-card items-center justify-center hover:bg-fresh-50 cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" aria-label="Next" onClick={() => by(1)} className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-card items-center justify-center hover:bg-fresh-50 cursor-pointer">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

/** 5th: Fresh House Family Membership */
export function MembershipSection() {
  return <OfferRail id="membership" title="Family Membership – fresh boxes every week" offers={PLANS} tileLabel="Membership" tileIcon="crown" viewAll="/membership-plans" />;
}

/** 6th and 7th: Bundles, then Gift Baskets */
export function BundlesAndGifts() {
  return (
    <>
      <OfferRail id="bundles" title="Bundle boxes – save more" offers={BUNDLES} tileLabel="Offers & Bundles" tileIcon="package" viewAll="/bundle-boxes" />
      <OfferRail id="gift-baskets" title="Gift Baskets" offers={GIFTS} tileLabel="Gift Baskets" tileIcon="gift" viewAll="/gift-baskets" />
    </>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* 1st: Weekly Bestsellers                                                                     */
/* ------------------------------------------------------------------------------------------ */

const TABS = [
  { key: 'fruits', label: 'Fruits', slug: 'fruits' },
  { key: 'vegetables', label: 'Vegetables', slug: 'vegetables' },
  { key: 'dry-fruits', label: 'Dry Fruits', slug: 'dry-fruits' },
  { key: 'gifts', label: 'Gift Baskets & Membership Plans', slug: '' },
] as const;

export function Bestsellers({ onQuickView }: { onQuickView: (p: Product) => void }) {
  const [ref, near] = useNear<HTMLElement>();
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('fruits');
  const active = TABS.find(t => t.key === tab)!;
  const [cache, setCache] = useState<Record<string, Product[]>>({});
  useEffect(() => {
    if (!near || !active.slug || cache[active.slug]) return;
    let off = false;
    fetchProducts({ category: active.slug, per_page: 6 }).then(r => !off && setCache(c => ({ ...c, [active.slug]: r.data.slice(0, 6) })));
    return () => {
      off = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near, active.slug]);
  const shown = cache[active.slug] ?? null;

  return (
    <section id="bestsellers" ref={ref} className={`${SHELL} pt-12 scroll-mt-[var(--header-offset,120px)]`}>
      <h2 className="text-4xl font-black tracking-tight text-fresh-950">
        Weekly <span className="bg-fresh-600 text-white px-1.5 ml-1 rounded-sm">Bestsellers</span>
      </h2>
      <div className="flex flex-wrap gap-3 mt-6" role="tablist" aria-label="Bestseller groups">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`h-12 px-7 rounded-full text-lg font-semibold transition cursor-pointer ${tab === t.key ? 'bg-fresh-600 text-white shadow-md' : 'bg-white text-slate-800 hover:bg-fresh-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {tab === 'gifts' ? (
          [...PLANS.slice(0, 3), ...GIFTS.slice(0, 3)].map(o => <OfferCard key={o.key} offer={o} />)
        ) : shown ? (
          shown.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView} />)
        ) : (
          <GridSkeleton n={6} />
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* 2nd, 3rd, 4th: Fresh Fruits, Fresh Vegetables, Premium Nuts & Dry Fruits                    */
/* ------------------------------------------------------------------------------------------ */

export function CategoryShowcase({
  title,
  description,
  slug,
  banner,
  bannerAlt,
  side,
  onQuickView,
}: {
  title: string;
  description?: string;
  slug: string;
  banner: string;
  bannerAlt: string;
  side: 'left' | 'right';
  onQuickView: (p: Product) => void;
}) {
  const [ref, near] = useNear<HTMLElement>();
  const items = useCategoryProducts(slug, 8, near);
  return (
    <section ref={ref} className={`${SHELL} pt-14`} aria-labelledby={`sc-${slug}`}>
      <div className="flex items-end justify-between gap-6 mb-5">
        <div>
          <h2 id={`sc-${slug}`} className="text-[1.9rem] font-black tracking-tight text-fresh-950">{title}</h2>
          {description && <p className="text-sm text-slate-600 mt-1.5 max-w-3xl">{description}</p>}
        </div>
        <Link href={`/category/${slug}`} className="shrink-0 text-[15px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Link
          href={`/category/${slug}`}
          className={`hidden lg:block row-span-2 row-start-1 rounded-3xl overflow-hidden shadow-card relative group ${side === 'left' ? 'col-start-1' : 'col-start-5'}`}
          aria-label={`Shop ${title}`}
        >
          {/* blurred copy fills the space around the artwork, which keeps its own proportions */}
          <img src={banner} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-80" />
          <img src={banner} alt={bannerAlt} loading="lazy" className="absolute inset-0 w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500" />
        </Link>
        {items ? items.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView} />) : <GridSkeleton n={8} />}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* 8th: Recipe ideas                                                                           */
/* ------------------------------------------------------------------------------------------ */

export function RecipeIdeas() {
  const scroller = useRef<HTMLUListElement>(null);
  const by = (dir: number) => scroller.current?.scrollBy({ left: dir * 700, behavior: 'smooth' });
  const list = recipes.filter(r => r.image).slice(0, 12);
  return (
    <section className={`${SHELL} pt-16`} aria-labelledby="recipe-ideas">
      <div className="flex items-end justify-between mb-5">
        <h2 id="recipe-ideas" className="text-[1.9rem] font-black tracking-tight text-fresh-950">Recipe Ideas</h2>
        <Link href="/recipes" className="text-[15px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5">
          Explore All Recipes <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="relative">
        <ul ref={scroller} className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-proximity scroll-smooth pb-2">
          {list.map(r => (
            <li key={r.slug} className="snap-start shrink-0 w-[calc((100%-80px)/5)] min-w-[200px]">
              <Link href={`/recipes/${r.slug}`} className="group block">
                <span className="block aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
                  <img src={r.image!} alt={r.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </span>
                <span className="block mt-3 font-semibold text-slate-900 group-hover:text-fresh-700 leading-snug">{r.title}</span>
                <span className="flex items-center gap-1.5 text-sm text-slate-600 mt-1">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  {r.cook_time}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <button type="button" aria-label="Previous recipes" onClick={() => by(-1)} className="absolute left-1 top-[28%] w-11 h-11 rounded-full bg-white/90 shadow-card flex items-center justify-center hover:bg-white cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button type="button" aria-label="Next recipes" onClick={() => by(1)} className="absolute right-1 top-[28%] w-11 h-11 rounded-full bg-white/90 shadow-card flex items-center justify-center hover:bg-white cursor-pointer">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* 9th: Nuts – Dates – Mixed Nuts – Seeds – Snack Pack                                         */
/* ------------------------------------------------------------------------------------------ */

export function NutTiles() {
  return (
    <section className={`${SHELL} pt-16`} aria-label="Nuts, dates, mixed nuts, seeds and snack packs">
      <ul className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {NUT_TILES.map(t => (
          <li key={t.name}>
            <Link
              href={`/category/${t.slug}`}
              className="group relative block h-[340px] rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition duration-300"
              style={{ backgroundColor: t.bg }}
            >
              <span className="absolute top-3 left-0 bg-[#24150a] rounded-r-xl px-4 py-1.5 text-[1.7rem] font-extrabold" style={{ color: t.ink }}>
                {t.name}
              </span>
              <span className="absolute left-5 right-4 top-[76px] text-[15px] leading-snug text-[#2a1b0c]/90">{t.blurb}</span>
              <img
                src={t.image}
                alt=""
                loading="lazy"
                className="absolute left-1/2 -translate-x-1/2 -bottom-10 w-[190px] h-[190px] rounded-full object-cover shadow-xl ring-8 ring-black/10 group-hover:scale-105 transition-transform duration-500"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* 10th: running commitment bar                                                                */
/* ------------------------------------------------------------------------------------------ */

const ICONS = { MapPin, Smartphone, PackageCheck, Sprout, HandHeart, Gift, CreditCard, Store } as const;

export function CommitmentBar() {
  const row = [...COMMITMENTS, ...COMMITMENTS];
  return (
    <section
      className="mt-16 bg-[#bbe96f] pt-12 overflow-hidden [border-radius:50%_50%_0_0/46px_46px_0_0]"
      aria-label="Our commitments"
    >
      <h2 className="text-center text-[1.65rem] font-semibold text-[#0b3b2c] leading-snug">
        We always provide
        <br />
        you the best in Karachi
      </h2>
      <div className="marquee-track mt-14">
        <ul className="marquee-inner flex w-max gap-[22px] animate-marquee pl-[22px]">
          {[...row, ...row].map((c, i) => {
            const Icon = ICONS[c.icon];
            return (
              <li
                key={i}
                aria-hidden={i >= COMMITMENTS.length ? 'true' : undefined}
                data-surface="dark"
                className="w-[200px] h-[182px] shrink-0 bg-[#023038] text-[#bbe96f] px-5 pt-[46px] flex flex-col"
                style={{ clipPath: 'path("M0 182 V48 C0 35 8 29 22 26 C70 14 130 14 178 26 C192 29 200 35 200 48 V182 Z")' }}
              >
                <span className="text-[15px] font-semibold leading-snug">{c.label}</span>
                <Icon className="w-[56px] h-[56px] mt-auto mb-5 self-center" strokeWidth={1.2} aria-hidden="true" />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
