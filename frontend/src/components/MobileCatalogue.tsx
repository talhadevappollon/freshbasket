'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { fetchProducts } from '@/lib/api';
import { Category, Product } from '@/types';
import { buildCatalogueGroups, CatalogueGroup } from '@/data/homeCatalogue';

/** Phone home page: every category with its products, so shoppers never have to leave the page. */

const ROW_SIZE = 4; // products shown per category on the home page; the category page has the rest
const FETCH_SIZE = 12; // products per request (the store's smallest page)

/** Up to three pictures for a group: the store's own product photos, falling back to category images. */
function groupImages(g: CatalogueGroup): string[] {
  const pool: string[] = [];
  const add = (u?: string | null) => {
    if (u && !pool.includes(u)) pool.push(u);
  };
  [g.parent, ...g.children].forEach(c => c?.preview_images?.forEach(add));
  if (pool.length === 0) [g.parent, ...g.children].forEach(c => add(c?.image_url));
  return pool.slice(0, 3);
}

const hideBrokenImage = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = 'none';
};

// ---------------------------------------------------------------------------------------------
// Category tiles
// ---------------------------------------------------------------------------------------------

function CategoryTile({ group, index, onJump }: { group: CatalogueGroup; index: number; onJump: (key: string) => void }) {
  const img = groupImages(group)[0];
  return (
    <li>
      <button
        type="button"
        onClick={() => onJump(group.key)}
        aria-label={`${group.name}, ${group.total} products. Jump to this category`}
        className="group w-full flex flex-col items-center gap-1 text-center cursor-pointer active:scale-95 transition-transform duration-150 animate-card-entrance"
        style={{ animationDelay: `${Math.min(Math.floor(index / 2), 6) * 50}ms` }}
      >
        <span className={`relative block w-full aspect-square rounded-2xl overflow-hidden border bg-gradient-to-br shadow-xs ${group.tone.tile}`}>
          <span aria-hidden="true" className="absolute -right-3 -top-3 w-9 h-9 rounded-full bg-white/55" />
          <span aria-hidden="true" className="absolute -left-3 -bottom-4 w-8 h-8 rounded-full bg-white/40" />
          {img ? (
            <img
              src={img}
              alt=""
              width={74}
              height={74}
              loading="lazy"
              decoding="async"
              onError={hideBrokenImage}
              className="absolute inset-0 w-full h-full object-contain p-1.5 mix-blend-multiply transition-transform duration-300 group-active:scale-110"
            />
          ) : (
            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-3xl">
              {group.emoji}
            </span>
          )}
          <span aria-hidden="true" className="absolute left-0.5 top-0.5 w-[18px] h-[18px] rounded-full bg-white/95 shadow-xs flex items-center justify-center text-[10px]">
            {group.emoji}
          </span>
          <span aria-hidden="true" className="absolute right-0.5 bottom-0.5 h-[15px] min-w-[15px] px-1 rounded-full bg-white/95 shadow-xs flex items-center justify-center text-[8.5px] font-black text-slate-700 tabular-nums">
            {group.total}
          </span>
        </span>
        <span className="block text-[10.5px] font-bold leading-[1.15] text-slate-800 line-clamp-2 min-h-[2.3em]">{group.name}</span>
      </button>
    </li>
  );
}

/** Two rows that scroll sideways: every category is one swipe away without a tall grid. */
const TILE_GRID = 'grid grid-rows-2 grid-flow-col auto-cols-[64px] gap-x-2 gap-y-2 w-max pr-4';

function TileSkeleton() {
  return (
    <div className="-mx-4 px-4 overflow-hidden" aria-hidden="true">
      <ul className={TILE_GRID}>
        {Array.from({ length: 12 }).map((_, i) => (
          <li key={i} className="flex flex-col items-center gap-1.5">
            <span className="skeleton block w-full aspect-square rounded-2xl" />
            <span className="skeleton block h-2.5 w-4/5 rounded" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function TileRows({ groups, onJump }: { groups: CatalogueGroup[]; onJump: (key: string) => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const el = scroller.current;
    if (el) setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 6);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, groups.length]);

  return (
    <div className="relative -mx-4">
      <div
        ref={scroller}
        onScroll={measure}
        role="region"
        aria-label="Categories. Swipe sideways to see more."
        tabIndex={0}
        className="overflow-x-auto no-scrollbar px-4 pb-1 snap-x snap-proximity scroll-px-4"
      >
        <ul className={TILE_GRID}>
          {groups.map((g, i) => (
            <CategoryTile key={g.key} group={g} index={i} onJump={onJump} />
          ))}
        </ul>
      </div>
      {/* fade on the right edge says "there is more this way" until the end is reached */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute right-0 top-0 bottom-1 w-12 bg-gradient-to-l from-slate-50 to-transparent transition-opacity duration-200 ${atEnd ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// One category: heading card, sub-category chips, products, load more
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
  const [total, setTotal] = useState(group.total);
  const [loading, setLoading] = useState(true);
  const rootRef = useRef<HTMLElement>(null);

  // "View all" opens the category's own page
  const seeAllHref = `/category/${category.slug}`;

  // Products are only requested once the section is close to the screen: 18 aisles, one request each, on demand
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
      setTotal(res.total);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [armed, category.slug]);

  return (
    <section id={`cat-${group.key}`} data-cat={group.key} ref={rootRef} aria-labelledby={`cat-title-${group.key}`}>
      {/* Slim heading */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br text-white pl-2.5 pr-2.5 py-2.5 flex items-center gap-2.5 shadow-md shadow-black/10 ${group.tone.header}`} data-surface="dark">
        <span aria-hidden="true" className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-white/10" />
        <span aria-hidden="true" className="absolute -left-8 -bottom-12 w-28 h-28 rounded-full bg-black/10" />
        <span aria-hidden="true" className="absolute right-20 -bottom-3 text-[4.5rem] leading-none opacity-[0.12] select-none">
          {group.emoji}
        </span>

        <span aria-hidden="true" className="relative w-10 h-10 shrink-0 rounded-xl bg-white/95 shadow-lg shadow-black/15 flex items-center justify-center text-[1.3rem]">
          {group.emoji}
        </span>

        <div className="relative min-w-0 flex-1">
          <h2 id={`cat-title-${group.key}`} className="text-base leading-tight font-black tracking-tight line-clamp-2 break-words">
            {group.name}
          </h2>
          <p className="text-[12px] font-semibold text-white/80 mt-0.5">{total} products</p>
        </div>

        <Link
          href={seeAllHref}
          className="relative shrink-0 inline-flex items-center gap-1 h-10 pl-3 pr-2 rounded-full bg-white text-slate-900 text-[12.5px] font-bold shadow-lg shadow-black/20 active:scale-95 transition-transform"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* One row, four products, then a View all card. Swipe sideways. */}
      <div className="mt-3 -mx-4 px-4 overflow-x-auto no-scrollbar snap-x snap-proximity scroll-px-4">
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
                <ProductCard product={product} imageBg={group.tone.imageBg} />
              </li>
            ))}
            <li className="snap-start shrink-0 w-[28vw] max-w-[130px]">
              <Link
                href={seeAllHref}
                aria-label={`View all ${total} products in ${group.name}`}
                className={`h-full min-h-[200px] rounded-2xl bg-gradient-to-br text-white flex flex-col items-center justify-center gap-2.5 p-3 text-center shadow-md shadow-black/10 active:scale-95 transition-transform ${group.tone.header}`}
                data-surface="dark"
              >
                <span aria-hidden="true" className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                  {group.emoji}
                </span>
                <span className="text-[13.5px] font-black leading-tight">
                  View all
                  <span className="block text-[12px] font-semibold text-white/80">{total} products</span>
                </span>
                <span aria-hidden="true" className="w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </li>
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
  const [activeKey, setActiveKey] = useState('');
  const railRef = useRef<HTMLDivElement>(null);
  const groupKeys = groups.map(g => g.key).join('|');

  // Highlight the chip of whichever category is at the top of the screen
  useEffect(() => {
    if (groups.length === 0 || typeof IntersectionObserver === 'undefined') return;
    const inBand = new Set<string>();
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          const key = (e.target as HTMLElement).dataset.cat!;
          if (e.isIntersecting) inBand.add(key);
          else inBand.delete(key);
        });
        const first = groups.find(g => inBand.has(g.key));
        if (first) setActiveKey(first.key);
      },
      { rootMargin: '-140px 0px -65% 0px' }
    );
    groups.forEach(g => {
      const el = document.getElementById(`cat-${g.key}`);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupKeys]);

  // Keep the active chip in view inside the horizontal bar
  useEffect(() => {
    const rail = railRef.current;
    const chip = rail?.querySelector<HTMLElement>(`[data-chip="${activeKey}"]`);
    if (!rail || !chip) return;
    rail.scrollTo({ left: chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' });
  }, [activeKey]);

  const jumpTo = useCallback((key: string) => {
    // tuck the header first so the section heading is not left underneath it
    window.dispatchEvent(new CustomEvent('fb:header-tuck'));
    setActiveKey(key);
    document.getElementById(`cat-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <section id="products-section-m" className="md:hidden px-4 pt-4 pb-3" aria-labelledby="shop-by-category">
      <div className="flex items-end justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h2 id="shop-by-category" className="text-xl leading-tight font-black tracking-tight text-slate-900">
            Shop by category
          </h2>
          <p className="text-[13px] text-slate-600 mt-0.5">Swipe for more, tap to jump</p>
        </div>
        {groups.length > 0 && (
          <span className="shrink-0 text-xs font-black text-fresh-800 bg-fresh-100 border border-fresh-200 rounded-full px-3 py-1.5">{groups.length} aisles</span>
        )}
      </div>

      {groups.length === 0 ? (
        <TileSkeleton />
      ) : (
        <TileRows groups={groups} onJump={jumpTo} />
      )}

      {groups.length > 0 && (
        <>
          {/* Sticky jump bar */}
          <nav aria-label="Jump to a category" className="catnav sticky z-30 -mx-4 mt-4 px-4 py-1.5 bg-white/90 backdrop-blur-xl border-b border-slate-200/70">
            <div ref={railRef} className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {groups.map(g => {
                const on = g.key === activeKey;
                return (
                  <button
                    key={g.key}
                    type="button"
                    data-chip={g.key}
                    onClick={() => jumpTo(g.key)}
                    aria-current={on ? 'true' : undefined}
                    className={`shrink-0 inline-flex items-center gap-1.5 h-9 pl-2.5 pr-3 rounded-full border text-[12.5px] font-bold whitespace-nowrap cursor-pointer transition-colors duration-200 active:scale-95 ${
                      on ? 'bg-fresh-700 border-fresh-700 text-white shadow-md shadow-fresh-700/25' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span aria-hidden="true" className="text-[15px] leading-none">
                      {g.emoji}
                    </span>
                    {g.name}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="mt-4 space-y-5">
            {groups.map(g => (
              <CategorySection key={g.key} group={g} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
