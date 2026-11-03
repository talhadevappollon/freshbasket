'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { fetchProducts } from '@/lib/api';
import { Category, Product } from '@/types';
import { buildCatalogueGroups, CatalogueGroup } from '@/data/homeCatalogue';
import { FEATURED_AISLES } from '@/data/aisles';
import { CATEGORY_ICONS, ICON_CATEGORIES } from '@/data/categoryIcons';

/**
 * Phone home page, laid out like the reference store:
 *  - "Shop by Category": an icon grid; every category opens its own page
 *  - one row per category with its latest products and a "See more" link to that page
 */

const ROW_SIZE = 8; // products shown per category on the home page; the category page has the rest
const FETCH_SIZE = 12; // products per request (the store's smallest page)

/** Reference slugs are always valid: the category page finds the live category by its name. */
const REFERENCE_SLUG = new Map(FEATURED_AISLES.map(a => [a.name, a.slug]));
const hrefFor = (name: string, fallbackSlug?: string) => `/category/${REFERENCE_SLUG.get(name) ?? fallbackSlug ?? ''}`;

// ---------------------------------------------------------------------------------------------
// Shop by Category: icon grid
// ---------------------------------------------------------------------------------------------

function CategoryGrid() {
  return (
    <ul className="grid grid-cols-5 gap-x-1 gap-y-5" aria-label="Categories">
      {ICON_CATEGORIES.map((name, i) => (
        <li key={name}>
          <Link
            href={hrefFor(name)}
            prefetch={false}
            className="group flex flex-col items-center gap-1.5 px-0.5 py-1 rounded-2xl text-center active:scale-95 active:bg-fresh-50 transition-all duration-150 animate-card-entrance"
            style={{ animationDelay: `${Math.min(i, 9) * 30}ms` }}
          >
            <img
              src={CATEGORY_ICONS[name]}
              alt=""
              width={48}
              height={48}
              loading={i < 5 ? 'eager' : 'lazy'}
              decoding="async"
              className="w-12 h-12 object-contain transition-transform duration-200 group-active:scale-110"
            />
            <span className="block text-[12.5px] max-[359px]:text-[11px] leading-[1.2] font-semibold text-slate-800 group-active:text-fresh-800">{name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------------------------
// One category: heading, a swipeable row of products
// ---------------------------------------------------------------------------------------------

/** Card-sized placeholder while a row is loading. */
function RailSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-2.5 w-[40vw] max-w-[170px] shrink-0" aria-hidden="true">
      <div className="skeleton h-28 rounded-2xl" />
      <div className="skeleton h-3 w-1/3 rounded mt-3" />
      <div className="skeleton h-3.5 w-5/6 rounded mt-2" />
      <div className="flex items-center justify-between mt-4">
        <div className="skeleton h-4 w-16 rounded" />
        <div className="skeleton h-11 w-11 rounded-xl" />
      </div>
    </div>
  );
}

function CategorySection({ group }: { group: CatalogueGroup }) {
  const category = group.parent ?? group.children[0];
  const [armed, setArmed] = useState(false); // becomes true shortly before the section scrolls into view
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const rootRef = useRef<HTMLElement>(null);

  // "See more" opens the category's own page
  const seeMoreHref = hrefFor(group.name, category.slug);

  // Products are only requested once the section is close to the screen: one request per category, on demand
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setArmed(true);
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: '900px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!armed) return;
    let cancelled = false;
    fetchProducts({ category: category.slug, per_page: FETCH_SIZE }).then(res => {
      if (cancelled) return;
      setItems(res.data.slice(0, ROW_SIZE));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [armed, category.slug]);

  return (
    <section id={`cat-${group.key}`} data-cat={group.key} ref={rootRef} aria-labelledby={`cat-title-${group.key}`}>
      <div className="flex items-center justify-between gap-3 mb-1">
        <h2 id={`cat-title-${group.key}`} className="min-w-0 text-[1.375rem] leading-tight font-bold tracking-tight text-fresh-800 break-words">
          {group.name}
        </h2>
        <Link
          href={seeMoreHref}
          prefetch={false}
          aria-label={`See more ${group.name}`}
          className="shrink-0 inline-flex items-center gap-1 h-11 pl-2 pr-0.5 -mr-0.5 text-[15px] font-semibold text-brand-600 hover:text-brand-700 active:opacity-70 transition-colors"
        >
          See more
          <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
        </Link>
      </div>

      {/* Eight products in a row you swipe sideways */}
      <div className="-mx-4 px-4 overflow-x-auto no-scrollbar snap-x snap-proximity scroll-px-4 pb-1">
        {loading ? (
          <div className="flex gap-3 w-max pr-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <RailSkeleton key={i} />
            ))}
          </div>
        ) : items.length > 0 ? (
          <ul className="flex gap-3 w-max pr-4" aria-label={`${group.name} products`}>
            {items.map((product, i) => (
              <li key={product.id} className="snap-start shrink-0 w-[40vw] max-w-[170px] animate-card-entrance" style={{ animationDelay: `${i * 45}ms` }}>
                <ProductCard product={product} imageBg={group.imageBg} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center rounded-2xl bg-white border border-slate-200 px-5 py-8">
            <span className="text-3xl" aria-hidden="true">
              {group.emoji}
            </span>
            <p className="mt-1.5 text-sm font-bold text-slate-900">Fresh stock is on its way</p>
            <p className="text-xs text-slate-500 mt-0.5">Nothing in {group.name} right now.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------
// The whole catalogue
// ---------------------------------------------------------------------------------------------

export default function MobileCatalogue({ categories }: { categories: Category[] }) {
  const groups = useMemo(() => buildCatalogueGroups(categories), [categories]);
  // categories with nothing on the shelf get no row (their page and grid icon still exist)
  const stocked = useMemo(() => groups.filter(g => g.total > 0), [groups]);
  const [activeKey, setActiveKey] = useState('');
  const railRef = useRef<HTMLDivElement>(null);
  const stockedKeys = stocked.map(g => g.key).join('|');

  // Highlight the chip of whichever category is at the top of the screen
  useEffect(() => {
    if (stocked.length === 0 || typeof IntersectionObserver === 'undefined') return;
    const inBand = new Set<string>();
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          const key = (e.target as HTMLElement).dataset.cat!;
          if (e.isIntersecting) inBand.add(key);
          else inBand.delete(key);
        });
        const first = stocked.find(g => inBand.has(g.key));
        if (first) setActiveKey(first.key);
      },
      { rootMargin: '-140px 0px -65% 0px' }
    );
    stocked.forEach(g => {
      const el = document.getElementById(`cat-${g.key}`);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockedKeys]);

  // Keep the active chip in view inside the horizontal bar
  useEffect(() => {
    const rail = railRef.current;
    const chip = rail?.querySelector<HTMLElement>(`[data-chip="${activeKey}"]`);
    if (!rail || !chip) return;
    rail.scrollTo({ left: chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' });
  }, [activeKey]);

  return (
    <section id="products-section-m" className="md:hidden px-4 pt-5 pb-3" aria-labelledby="shop-by-category">
      <h2 id="shop-by-category" className="text-[1.5rem] leading-tight font-bold tracking-tight text-slate-900 mb-4">
        Shop by Category
      </h2>

      <CategoryGrid />

      {stocked.length > 0 && (
        <>
          {/* Sticky bar: each chip opens that category's page */}
          <nav aria-label="Categories" className="catnav sticky z-30 -mx-4 mt-6 px-4 py-1.5 bg-white/90 backdrop-blur-xl border-b border-slate-200/70">
            <div ref={railRef} className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {stocked.map(g => {
                const on = g.key === activeKey;
                const icon = CATEGORY_ICONS[g.name];
                return (
                  <Link
                    key={g.key}
                    href={hrefFor(g.name, (g.parent ?? g.children[0]).slug)}
                    prefetch={false}
                    data-chip={g.key}
                    aria-current={on ? 'true' : undefined}
                    className={`shrink-0 inline-flex items-center gap-1.5 h-9 pl-2 pr-3 rounded-full border text-[12.5px] font-bold whitespace-nowrap transition-colors duration-200 active:scale-95 ${
                      on ? 'bg-fresh-700 border-fresh-700 text-white shadow-md shadow-fresh-700/25' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {icon ? (
                      <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                        <img src={icon} alt="" width={20} height={20} loading="lazy" decoding="async" className="w-5 h-5 object-contain" />
                      </span>
                    ) : (
                      <span aria-hidden="true" className="text-[15px] leading-none">
                        {g.emoji}
                      </span>
                    )}
                    {g.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="mt-5 space-y-8">
            {stocked.map(g => (
              <CategorySection key={g.key} group={g} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
