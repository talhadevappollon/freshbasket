'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight, Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { fetchProducts } from '@/lib/api';
import { Category, Product } from '@/types';
import { blurbFor, buildCatalogueGroups, CatalogueGroup, emojiFor, lastSegment } from '@/data/homeCatalogue';

/** Phone home page: every category with its products, so shoppers never have to leave the page. */

const STEP = 6; // products revealed per tap of "Load more"
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
        className="group w-full flex flex-col items-center gap-1.5 text-center cursor-pointer active:scale-95 transition-transform duration-150 animate-card-entrance"
        style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
      >
        <span className={`relative block w-full aspect-square rounded-[1.4rem] overflow-hidden border bg-gradient-to-br shadow-xs ${group.tone.tile}`}>
          <span aria-hidden="true" className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/55" />
          <span aria-hidden="true" className="absolute -left-4 -bottom-6 w-14 h-14 rounded-full bg-white/40" />
          {img ? (
            <img
              src={img}
              alt=""
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
              onError={hideBrokenImage}
              className="absolute inset-0 w-full h-full object-contain p-3 mix-blend-multiply transition-transform duration-300 group-active:scale-110"
            />
          ) : (
            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-4xl">
              {group.emoji}
            </span>
          )}
          <span aria-hidden="true" className="absolute left-1.5 top-1.5 w-6 h-6 rounded-full bg-white/95 shadow-xs flex items-center justify-center text-[13px]">
            {group.emoji}
          </span>
          <span aria-hidden="true" className="absolute right-1.5 bottom-1.5 h-5 min-w-5 px-1.5 rounded-full bg-white/95 shadow-xs flex items-center justify-center text-[10.5px] font-black text-slate-700 tabular-nums">
            {group.total}
          </span>
        </span>
        <span className="block text-[12.5px] font-bold leading-tight text-slate-800 line-clamp-2 min-h-[2.1em]">{group.name}</span>
      </button>
    </li>
  );
}

function TileSkeleton() {
  return (
    <ul className="grid grid-cols-3 gap-x-3 gap-y-4" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <li key={i} className="flex flex-col items-center gap-2">
          <span className="skeleton block w-full aspect-square rounded-[1.4rem]" />
          <span className="skeleton block h-3 w-4/5 rounded" />
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------------------------
// One category: heading card, sub-category chips, products, load more
// ---------------------------------------------------------------------------------------------

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-2.5" aria-hidden="true">
      <div className="skeleton h-36 rounded-2xl" />
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
  const firstSlug = (group.parent ?? group.children[0]).slug;
  const [slug, setSlug] = useState(firstSlug);
  const [armed, setArmed] = useState(false); // becomes true shortly before the section scrolls into view
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(group.total);
  const [visible, setVisible] = useState(STEP);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);
  const rootRef = useRef<HTMLElement>(null);

  const images = useMemo(() => groupImages(group), [group]);
  const selected = [group.parent, ...group.children].find(c => c?.slug === slug) ?? group.parent ?? group.children[0];
  const subChips = group.parent ? [group.parent, ...group.children] : group.children;

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
    setLoading(true);
    setItems([]);
    setVisible(STEP);
    pageRef.current = 1;
    fetchProducts({ category: slug, per_page: FETCH_SIZE }).then(res => {
      if (cancelled) return;
      setItems(res.data);
      setTotal(res.total);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [armed, slug]);

  const loadMore = async () => {
    if (loadingMore) return;
    const next = visible + STEP;
    // everything needed is already fetched (or there is nothing more to fetch)
    if (next <= items.length || items.length >= total) {
      setVisible(next);
      return;
    }
    setLoadingMore(true);
    const page = pageRef.current + 1;
    const res = await fetchProducts({ category: slug, per_page: FETCH_SIZE, page });
    pageRef.current = page;
    setItems(prev => {
      const seen = new Set(prev.map(p => p.id));
      return [...prev, ...res.data.filter(p => !seen.has(p.id))];
    });
    setVisible(next);
    setLoadingMore(false);
  };

  const shown = items.slice(0, visible);
  const shownCount = Math.min(shown.length, total);
  const pct = total > 0 ? Math.min(100, Math.round((shownCount / total) * 100)) : 0;
  const remaining = Math.max(0, total - shownCount);
  const seeAllHref = `/category/${selected?.slug ?? firstSlug}`;

  return (
    <section id={`cat-${group.key}`} data-cat={group.key} ref={rootRef} aria-labelledby={`cat-title-${group.key}`}>
      {/* Heading card */}
      <div className={`relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br text-white p-4 min-h-[138px] shadow-lg shadow-black/10 ${group.tone.header}`} data-surface="dark">
        <span aria-hidden="true" className="absolute -right-10 -top-12 w-44 h-44 rounded-full bg-white/10" />
        <span aria-hidden="true" className="absolute -left-10 -bottom-16 w-40 h-40 rounded-full bg-black/10" />
        <span aria-hidden="true" className="absolute right-2 -bottom-1 text-[6rem] leading-none opacity-[0.13] select-none">
          {group.emoji}
        </span>

        <div className="relative flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 h-7 pl-1 pr-2.5 rounded-full bg-white/15 border border-white/25 text-[11px] font-bold tracking-wide">
              <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[12px]" aria-hidden="true">
                {group.emoji}
              </span>
              {group.total} products
            </span>
            <h2 id={`cat-title-${group.key}`} className="mt-2 text-[1.45rem] leading-tight font-black tracking-tight break-words">
              {group.name}
            </h2>
            <p className="mt-0.5 text-[12.5px] leading-snug text-white/80 max-w-[11.5rem]">{blurbFor(group.name)}</p>
            <Link
              href={seeAllHref}
              className="mt-3 inline-flex items-center gap-1 h-10 pl-4 pr-3 rounded-full bg-white text-slate-900 text-[13px] font-bold shadow-lg shadow-black/20 active:scale-95 transition-transform"
            >
              See all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Product photos fanned out on the right */}
          <div className="relative shrink-0 w-[112px] h-[112px] mt-1" aria-hidden="true">
            {images.length > 0 ? (
              images.map((src, i) => (
                <span
                  key={src}
                  className="absolute w-[64px] h-[64px] rounded-2xl bg-white shadow-xl shadow-black/25 p-1 overflow-hidden"
                  style={{
                    left: [0, 40, 14][i],
                    top: [22, 0, 48][i],
                    transform: `rotate(${[-9, 8, -2][i]}deg)`,
                    zIndex: [2, 1, 3][i],
                  }}
                >
                  <img src={src} alt="" loading="lazy" decoding="async" onError={hideBrokenImage} className="w-full h-full object-contain" />
                </span>
              ))
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-6xl">{group.emoji}</span>
            )}
          </div>
        </div>
      </div>

      {/* Sub-categories */}
      {subChips.length > 1 && (
        <div className="mt-3 -mx-4 px-4 overflow-x-auto no-scrollbar">
          <ul className="flex items-center gap-2 w-max pr-4" aria-label={`${group.name} sub-categories`}>
            {subChips.map(c => {
              const isAll = c === group.parent;
              const on = c.slug === slug;
              const thumb = c.image_url || c.preview_images?.[0];
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSlug(c.slug)}
                    aria-pressed={on}
                    className={`inline-flex items-center gap-2 h-11 pl-1.5 pr-4 rounded-full border text-[13px] font-bold whitespace-nowrap cursor-pointer transition-colors duration-200 active:scale-95 ${
                      on ? 'bg-fresh-700 border-fresh-700 text-white shadow-md shadow-fresh-700/25' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 text-[15px]">
                      {!isAll && thumb ? (
                        <img src={thumb} alt="" width={32} height={32} loading="lazy" decoding="async" onError={hideBrokenImage} className="w-full h-full object-cover" />
                      ) : (
                        <span aria-hidden="true">{isAll ? group.emoji : emojiFor(c.name)}</span>
                      )}
                    </span>
                    {isAll ? `All ${group.name}` : lastSegment(c.name)}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Products */}
      <div className="mt-3 min-h-[200px]">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : shown.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {shown.map((product, i) => (
              <div key={product.id} className="animate-card-entrance" style={{ animationDelay: `${(i % STEP) * 45}ms` }}>
                <ProductCard product={product} imageBg={group.tone.imageBg} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center rounded-2xl bg-white border border-slate-200 px-5 py-10">
            <span className="text-4xl" aria-hidden="true">
              {group.emoji}
            </span>
            <p className="mt-2 text-sm font-bold text-slate-900">Fresh stock is on its way</p>
            <p className="text-xs text-slate-500 mt-0.5">Nothing in {selected ? lastSegment(selected.name) : group.name} right now.</p>
          </div>
        )}
      </div>

      {/* Load more */}
      {!loading && total > 0 && shown.length > 0 && (
        <div className="mt-3 rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-[12px] font-semibold text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{shownCount}</strong> of <strong className="text-slate-900">{total}</strong>
            </span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${group.name} products shown`}>
            <div className="h-full rounded-full bg-gradient-to-r from-fresh-500 to-fresh-700 transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>

          {remaining > 0 ? (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="mt-3 w-full h-12 rounded-xl bg-fresh-700 hover:bg-fresh-800 active:bg-fresh-900 active:scale-[0.99] disabled:opacity-70 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition"
            >
              {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDown className="w-4 h-4" />}
              {loadingMore ? 'Loading…' : `Load ${Math.min(STEP, remaining)} more · ${remaining} left`}
            </button>
          ) : (
            <Link
              href={seeAllHref}
              className="mt-3 w-full h-12 rounded-xl border border-fresh-200 bg-fresh-50 text-fresh-800 text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.99] transition"
            >
              That&apos;s everything in {selected ? lastSegment(selected.name) : group.name}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
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
    <section id="products-section-m" className="md:hidden px-4 pt-6 pb-4" aria-labelledby="shop-by-category">
      <div className="flex items-end justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 id="shop-by-category" className="text-[1.4rem] leading-tight font-black tracking-tight text-slate-900">
            Shop by category
          </h2>
          <p className="text-[13px] text-slate-600 mt-0.5">Tap one to jump straight to its products</p>
        </div>
        {groups.length > 0 && (
          <span className="shrink-0 text-xs font-black text-fresh-800 bg-fresh-100 border border-fresh-200 rounded-full px-3 py-1.5">{groups.length} aisles</span>
        )}
      </div>

      {groups.length === 0 ? (
        <TileSkeleton />
      ) : (
        <ul className="grid grid-cols-3 gap-x-3 gap-y-4">
          {groups.map((g, i) => (
            <CategoryTile key={g.key} group={g} index={i} onJump={jumpTo} />
          ))}
        </ul>
      )}

      {groups.length > 0 && (
        <>
          {/* Sticky jump bar */}
          <nav aria-label="Jump to a category" className="catnav sticky z-30 -mx-4 mt-6 px-4 py-2 bg-white/90 backdrop-blur-xl border-b border-slate-200/70">
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
                    className={`shrink-0 inline-flex items-center gap-1.5 h-10 pl-2.5 pr-3.5 rounded-full border text-[13px] font-bold whitespace-nowrap cursor-pointer transition-colors duration-200 active:scale-95 ${
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

          <div className="mt-5 space-y-10">
            {groups.map(g => (
              <CategorySection key={g.key} group={g} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
