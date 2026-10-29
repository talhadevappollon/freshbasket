'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Product } from '@/types';
import { X, SlidersHorizontal, Check } from 'lucide-react';

export interface Filters {
  inStock: boolean;
  onSale: boolean;
  minPrice: string;
  maxPrice: string;
  brands: string[];
}

export const EMPTY_FILTERS: Filters = { inStock: false, onSale: false, minPrice: '', maxPrice: '', brands: [] };

export const isOnSale = (p: Product) => !!p.compare_at_price && p.compare_at_price > p.price;

export function applyFilters(products: Product[], f: Filters): Product[] {
  const min = f.minPrice === '' ? null : Number(f.minPrice);
  const max = f.maxPrice === '' ? null : Number(f.maxPrice);
  return products.filter(p => {
    if (f.inStock && p.stock_quantity <= 0) return false;
    if (f.onSale && !isOnSale(p)) return false;
    if (min !== null && !Number.isNaN(min) && p.price < min) return false;
    if (max !== null && !Number.isNaN(max) && p.price > max) return false;
    if (f.brands.length > 0 && !f.brands.includes(p.brand || 'Other')) return false;
    return true;
  });
}

export function activeFilterCount(f: Filters) {
  return (f.inStock ? 1 : 0) + (f.onSale ? 1 : 0) + (f.minPrice || f.maxPrice ? 1 : 0) + f.brands.length;
}

const fmt = (n: number) => `PKR ${n.toLocaleString()}`;

/** Removable chips for every active filter, with a clear-all. */
export function ActiveFilterChips({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (filters.inStock) chips.push({ key: 'stock', label: 'In stock', clear: () => onChange({ ...filters, inStock: false }) });
  if (filters.onSale) chips.push({ key: 'sale', label: 'On sale', clear: () => onChange({ ...filters, onSale: false }) });
  if (filters.minPrice || filters.maxPrice) {
    const label =
      filters.minPrice && filters.maxPrice
        ? `${fmt(Number(filters.minPrice))} – ${fmt(Number(filters.maxPrice))}`
        : filters.minPrice
          ? `From ${fmt(Number(filters.minPrice))}`
          : `Up to ${fmt(Number(filters.maxPrice))}`;
    chips.push({ key: 'price', label, clear: () => onChange({ ...filters, minPrice: '', maxPrice: '' }) });
  }
  filters.brands.forEach(b =>
    chips.push({ key: `brand-${b}`, label: b, clear: () => onChange({ ...filters, brands: filters.brands.filter(x => x !== b) }) })
  );
  if (chips.length === 0) return null;
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map(c => (
        <li key={c.key}>
          <button
            type="button"
            onClick={c.clear}
            aria-label={`Remove filter ${c.label}`}
            className="inline-flex items-center gap-1.5 h-9 pl-3.5 pr-2.5 rounded-full bg-fresh-50 border border-fresh-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 text-fresh-800 text-sm font-semibold transition-colors cursor-pointer"
          >
            {c.label}
            <X className="w-3.5 h-3.5" />
          </button>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="h-9 px-3 rounded-full text-sm font-semibold text-slate-600 hover:text-brand-700 underline-offset-4 hover:underline cursor-pointer"
        >
          Clear all
        </button>
      </li>
    </ul>
  );
}

function Panel({
  products,
  filters,
  onChange,
}: {
  products: Product[];
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const [showAllBrands, setShowAllBrands] = useState(false);

  const { lo, hi, brands } = useMemo(() => {
    let lo = Infinity;
    let hi = 0;
    const counts = new Map<string, number>();
    products.forEach(p => {
      lo = Math.min(lo, p.price);
      hi = Math.max(hi, p.price);
      const b = p.brand || 'Other';
      counts.set(b, (counts.get(b) || 0) + 1);
    });
    return {
      lo: lo === Infinity ? 0 : lo,
      hi,
      brands: Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    };
  }, [products]);

  const visibleBrands = showAllBrands ? brands : brands.slice(0, 8);

  const toggleBrand = (b: string) =>
    onChange({
      ...filters,
      brands: filters.brands.includes(b) ? filters.brands.filter(x => x !== b) : [...filters.brands, b],
    });

  const checkbox = (checked: boolean) => (
    <span
      className={`flex items-center justify-center w-5 h-5 rounded-md border shrink-0 transition-colors ${
        checked ? 'bg-fresh-600 border-fresh-600 text-white' : 'bg-white border-slate-300 group-hover:border-fresh-500'
      }`}
      aria-hidden="true"
    >
      {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
    </span>
  );

  const rowClass =
    'group flex items-center gap-3 min-h-[44px] px-1 rounded-lg cursor-pointer text-sm text-slate-700 hover:text-slate-900';
  const inputClass =
    'w-full h-11 px-3 rounded-xl border border-slate-200 hover:border-fresh-400 bg-white text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 transition';

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-black text-slate-900 mb-1">Availability</legend>
        <label className={rowClass}>
          <input type="checkbox" className="sr-only peer" checked={filters.inStock} onChange={e => onChange({ ...filters, inStock: e.target.checked })} />
          <span className="contents peer-focus-visible:[&>span]:ring-2 peer-focus-visible:[&>span]:ring-fresh-500 peer-focus-visible:[&>span]:ring-offset-2">{checkbox(filters.inStock)}</span>
          In stock only
        </label>
        <label className={rowClass}>
          <input type="checkbox" className="sr-only peer" checked={filters.onSale} onChange={e => onChange({ ...filters, onSale: e.target.checked })} />
          <span className="contents peer-focus-visible:[&>span]:ring-2 peer-focus-visible:[&>span]:ring-fresh-500 peer-focus-visible:[&>span]:ring-offset-2">{checkbox(filters.onSale)}</span>
          On sale
        </label>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-black text-slate-900 mb-2">Price (PKR)</legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            aria-label="Minimum price"
            placeholder={String(lo)}
            value={filters.minPrice}
            onChange={e => onChange({ ...filters, minPrice: e.target.value })}
            className={inputClass}
          />
          <span className="text-slate-400" aria-hidden="true">
            –
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            aria-label="Maximum price"
            placeholder={String(hi)}
            value={filters.maxPrice}
            onChange={e => onChange({ ...filters, maxPrice: e.target.value })}
            className={inputClass}
          />
        </div>
        {hi > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { label: 'Under 500', min: '', max: '500' },
              { label: '500 – 1,500', min: '500', max: '1500' },
              { label: '1,500+', min: '1500', max: '' },
            ].map(p => {
              const on = filters.minPrice === p.min && filters.maxPrice === p.max;
              return (
                <button
                  key={p.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ ...filters, minPrice: on ? '' : p.min, maxPrice: on ? '' : p.max })}
                  className={`h-9 px-3 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                    on ? 'bg-fresh-700 border-fresh-700 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-fresh-400 hover:text-fresh-800'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      {brands.length > 1 && (
        <fieldset>
          <legend className="text-sm font-black text-slate-900 mb-1">Brand</legend>
          <div className="max-h-72 overflow-y-auto overscroll-contain pr-1">
            {visibleBrands.map(([b, n]) => (
              <label key={b} className={rowClass}>
                <input type="checkbox" className="sr-only peer" checked={filters.brands.includes(b)} onChange={() => toggleBrand(b)} />
                <span className="contents peer-focus-visible:[&>span]:ring-2 peer-focus-visible:[&>span]:ring-fresh-500 peer-focus-visible:[&>span]:ring-offset-2">{checkbox(filters.brands.includes(b))}</span>
                <span className="flex-1 truncate">{b}</span>
                <span className="text-xs text-slate-400 tabular-nums">{n}</span>
              </label>
            ))}
          </div>
          {brands.length > 8 && (
            <button
              type="button"
              onClick={() => setShowAllBrands(v => !v)}
              className="mt-1 h-10 px-1 text-sm font-semibold text-fresh-700 hover:text-fresh-800 hover:underline underline-offset-4 cursor-pointer"
            >
              {showAllBrands ? 'Show fewer brands' : `Show all ${brands.length} brands`}
            </button>
          )}
        </fieldset>
      )}
    </div>
  );
}

interface Props {
  products: Product[];
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
  open: boolean;
  onClose: () => void;
}

/** Sticky sidebar on large screens; the same panel in a bottom sheet on phones. */
export default function CategoryFilters({ products, filters, onChange, resultCount, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const count = activeFilterCount(filters);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        aria-label="Filter products"
        className="hidden lg:block sticky top-[calc(var(--header-offset,80px)+16px)] self-start bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card max-h-[calc(100dvh-var(--header-offset,80px)-32px)] overflow-y-auto overscroll-contain"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-base font-black text-slate-900">
            <SlidersHorizontal className="w-4 h-4 text-fresh-600" /> Filters
          </h2>
          {count > 0 && (
            <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="h-9 px-2 text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline underline-offset-4 cursor-pointer">
              Reset
            </button>
          )}
        </div>
        <Panel products={products} filters={filters} onChange={onChange} />
      </aside>

      {/* Mobile bottom sheet */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[70] flex items-end" role="dialog" aria-modal="true" aria-label="Filter products">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-in" onClick={onClose} />
          <div className="relative w-full bg-white rounded-t-3xl max-h-[88dvh] flex flex-col shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
              <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
                <SlidersHorizontal className="w-5 h-5 text-fresh-600" /> Filters
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="w-11 h-11 -mr-2 rounded-full hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              <Panel products={products} filters={filters} onChange={onChange} />
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-slate-100 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => onChange(EMPTY_FILTERS)}
                disabled={count === 0}
                className="h-12 px-5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 hover:border-slate-300 disabled:opacity-40 cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-12 rounded-2xl bg-fresh-700 hover:bg-fresh-800 active:bg-fresh-900 text-white text-sm font-bold cursor-pointer transition-colors"
              >
                Show {resultCount} {resultCount === 1 ? 'product' : 'products'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
