'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Category } from '@/types';

/**
 * Category page sidebar, like the reference store: the category and each of its sub-categories as a list of
 * boxes (the current one highlighted), then a "What are you looking for?" search box.
 */
export default function CategorySidebar({
  parent,
  subs,
  activeSlug,
}: {
  parent?: Category;
  subs: Category[];
  activeSlug: string;
}) {
  const [q, setQ] = useState('');
  const items = [...(parent ? [parent] : []), ...subs.filter(c => (c.total_products ?? c.products_count ?? 1) > 0)];
  const label = (c: Category) => c.name.split('/').pop()!.trim();

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    // the header search box shows the live results
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('fb:search', { detail: term }));
  };

  return (
    <aside className="hidden lg:block space-y-6" aria-label="Categories">
      <div>
        <h2 className="text-lg font-bold text-[#173c2a] mb-3">Categories</h2>
        <ul className="space-y-2">
          {items.map(c => {
            const on = c.slug === activeSlug;
            return (
              <li key={c.id}>
                <Link
                  href={`/category/${c.slug}`}
                  aria-current={on ? 'page' : undefined}
                  className={`block px-4 py-3 rounded-lg text-[15px] font-semibold transition-colors ${
                    on ? 'bg-fresh-600 text-white' : 'bg-white text-[#173c2a] hover:bg-[#f0f4ea] hover:text-fresh-700'
                  }`}
                >
                  {label(c)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-bold text-[#173c2a] mb-3">Search</h2>
        <form onSubmit={search} role="search" className="relative">
          <label htmlFor="sidebar-search" className="sr-only">
            Search products
          </label>
          <input
            id="sidebar-search"
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="What are you looking for?"
            className="w-full h-12 rounded-lg bg-white border border-slate-200 pl-4 pr-12 text-sm text-slate-900 placeholder-slate-500 outline-none focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15"
          />
          <button type="submit" aria-label="Search" className="absolute right-1 top-1 bottom-1 w-10 rounded-md bg-fresh-600 hover:bg-fresh-700 text-white flex items-center justify-center cursor-pointer">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
