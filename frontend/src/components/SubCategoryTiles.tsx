'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Category } from '@/types';
import { CATEGORY_ICONS } from '@/data/categoryIcons';
import { emojiFor, lastSegment } from '@/data/homeCatalogue';

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

interface Props {
  categories: Category[];
  activeSlug: string;
}

/**
 * The row of picture tiles under a category's title, like the reference store: the category itself first,
 * then each of its sub-categories (Fruits -> Regular Fruits, World Fruits, Fresh Cut Fruits). The open one is outlined.
 */
export default function SubCategoryTiles({ categories, activeSlug }: Props) {
  const scroller = useRef<HTMLDivElement>(null);

  const tiles = useMemo(() => {
    const active = categories.find(c => c.slug === activeSlug);
    if (!active) return [];
    const head = clean(active.name.split('/')[0]);
    const family = categories.filter(c => clean(c.name.split('/')[0]) === head);
    const parent = family.find(c => !c.name.includes('/'));
    // a sub-category with nothing on its shelf is left out, unless it is the page being viewed
    const children = family.filter(c => c.name.includes('/') && ((c.products_count ?? 0) > 0 || c.slug === activeSlug));
    if (children.length === 0) return [];
    return [...(parent ? [{ cat: parent, label: head, isParent: true }] : []), ...children.map(c => ({ cat: c, label: lastSegment(c.name), isParent: false }))].map(t => ({
      ...t,
      head,
    }));
  }, [categories, activeSlug]);

  // bring the open tile into view when the row scrolls sideways
  useEffect(() => {
    const el = scroller.current?.querySelector<HTMLElement>('[aria-current="page"]');
    const box = scroller.current;
    if (!el || !box) return;
    box.scrollTo({ left: el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2, behavior: 'auto' });
  }, [activeSlug, tiles.length]);

  if (tiles.length === 0) return null;

  return (
    <div className="mt-4 md:mt-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs p-3">
      <div ref={scroller} className="-mx-3 px-3 overflow-x-auto no-scrollbar">
        <ul className="flex gap-2.5 w-max pr-3" aria-label="Sub-categories">
          {tiles.map(({ cat, label, isParent, head }) => {
            const on = cat.slug === activeSlug;
            const img = isParent ? CATEGORY_ICONS[head] || cat.preview_images?.[0] : cat.preview_images?.[0] || cat.image_url;
            return (
              <li key={cat.id} className="shrink-0 w-[76px] md:w-24">
                <Link href={`/category/${cat.slug}`} prefetch={false} aria-current={on ? 'page' : undefined} className="group flex flex-col items-center gap-1.5 text-center active:scale-95 transition-transform duration-150">
                  <span
                    className={`w-[68px] h-[68px] md:w-[84px] md:h-[84px] rounded-xl bg-white flex items-center justify-center overflow-hidden transition-all duration-200 ${
                      on ? 'border-2 border-fresh-600 shadow-[0_0_0_3px_rgba(71,143,69,0.16)]' : 'border border-slate-200 group-hover:border-fresh-400'
                    }`}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        width={68}
                        height={68}
                        loading="lazy"
                        decoding="async"
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className={isParent ? 'w-[52px] h-[52px] md:w-[62px] md:h-[62px] object-contain' : 'w-full h-full object-contain p-1.5'}
                      />
                    ) : (
                      <span aria-hidden="true" className="text-3xl">
                        {emojiFor(head)}
                      </span>
                    )}
                  </span>
                  <span className={`block text-[11.5px] md:text-[13px] leading-[1.2] line-clamp-2 ${on ? 'font-bold text-slate-900' : 'font-medium text-slate-700 group-hover:text-fresh-800'}`}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
