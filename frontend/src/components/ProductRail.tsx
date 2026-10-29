'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/Reveal';

interface ProductRailProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
  onQuickView?: (product: Product) => void;
}

export default function ProductRail({ title, subtitle, products, viewAllHref, onQuickView }: ProductRailProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    return () => {
      el.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
    };
  }, [updateEdges, products.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  const arrowClass =
    'w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs transition-colors duration-200 cursor-pointer hover:bg-fresh-600 hover:border-fresh-600 hover:text-white active:bg-fresh-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 disabled:hover:text-slate-700';

  return (
    <Reveal as="section" className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="hidden xs:inline-flex items-center h-11 px-4 rounded-xl text-sm font-semibold text-fresh-700 hover:text-fresh-800 hover:bg-fresh-50 active:bg-fresh-100 transition-colors duration-200"
            >
              View all
            </Link>
          )}
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={!canPrev}
            aria-label={`Scroll ${title} left`}
            className={arrowClass}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={!canNext}
            aria-label={`Scroll ${title} right`}
            className={arrowClass}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <ul
        ref={trackRef}
        className="flex gap-3 sm:gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth scroll-pl-4 scroll-pr-4 -mx-4 px-4 pb-3"
        aria-label={title}
      >
        {products.map(product => (
          <li key={product.id} className="snap-start shrink-0 w-[44%] sm:w-[30%] lg:w-[23%]">
            <ProductCard product={product} onQuickView={onQuickView} />
          </li>
        ))}
      </ul>

      {viewAllHref && (
        <div className="xs:hidden mt-3">
          <Link
            href={viewAllHref}
            className="flex items-center justify-center gap-1.5 w-full h-12 rounded-2xl border border-fresh-200 bg-white text-sm font-bold text-fresh-800 hover:bg-fresh-50 active:bg-fresh-100 transition-colors duration-200"
          >
            View all {title.toLowerCase()}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </Reveal>
  );
}
