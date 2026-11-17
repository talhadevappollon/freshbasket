'use client';

import React from 'react';
import Link from 'next/link';
import { FEATURED_AISLES } from '@/data/aisles';
import { CATEGORY_ICONS, ICON_CATEGORIES } from '@/data/categoryIcons';

/**
 * Phone home page: the "Shop by Category" icon grid. Every category opens its own page; the sections
 * below it (Weekly Bestsellers, Fresh Fruits, Fresh Vegetables, ...) are the same ones the website shows.
 */

/** Reference slugs are always valid: the category page finds the live category by its name. */
const REFERENCE_SLUG = new Map(FEATURED_AISLES.map(a => [a.name, a.slug]));
const hrefFor = (name: string, fallbackSlug?: string) => `/category/${REFERENCE_SLUG.get(name) ?? fallbackSlug ?? ''}`;

function CategoryGrid() {
  return (
    <ul className="grid grid-cols-5 gap-x-1 gap-y-3" aria-label="Categories">
      {ICON_CATEGORIES.map((name, i) => (
        <li key={name}>
          <Link
            href={hrefFor(name)}
            prefetch={false}
            className="group flex flex-col items-center gap-1 px-0.5 py-0.5 rounded-xl text-center active:scale-95 active:bg-fresh-50 transition-all duration-150 animate-card-entrance"
            style={{ animationDelay: `${Math.min(i, 9) * 30}ms` }}
          >
            <img
              src={CATEGORY_ICONS[name]}
              alt=""
              width={36}
              height={36}
              loading={i < 5 ? 'eager' : 'lazy'}
              decoding="async"
              className="w-9 h-9 object-contain transition-transform duration-200 group-active:scale-110"
            />
            <span className="block text-[11.5px] max-[359px]:text-[10.5px] leading-[1.2] font-semibold text-slate-800 group-active:text-fresh-800">{name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function MobileCatalogue() {
  return (
    <section id="products-section-m" className="md:hidden px-4 pt-5 pb-1" aria-labelledby="shop-by-category">
      <h2 id="shop-by-category" className="text-[1.5rem] leading-tight font-bold tracking-tight text-slate-900 mb-4">
        Shop by Category
      </h2>
      <CategoryGrid />
    </section>
  );
}
