'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PLACEHOLDER_IMG } from '@/lib/placeholder';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, Sparkles, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  /** Classes for the picture area (a soft tint). Phones get a neutral one by default. */
  imageBg?: string;
}

export default function ProductCard({ product, onQuickView, imageBg }: ProductCardProps) {
  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = items.find(it => it.product.id === product.id);
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (addedTimer.current) clearTimeout(addedTimer.current);
  }, []);

  const handleAdd = () => {
    addToCart(product, 1);
    setJustAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAdded(false), 1400);
  };

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  return (
    <article className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-2.5 sm:p-4 shadow-xs hover:shadow-card-hover hover:border-fresh-300 transition-all duration-300 ease-out-expo flex flex-col justify-between group relative overflow-hidden h-full">
      {/* Top badges */}
      <div className="flex items-center justify-between gap-1.5 absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 z-10 pointer-events-none">
        {discount ? (
          <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap shrink-0">-{discount}%</span>
        ) : product.is_featured ? (
          <span className="bg-fresh-700 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 whitespace-nowrap shrink-0">
            <Sparkles className="w-3 h-3" aria-hidden="true" /> <span className="sr-only sm:not-sr-only">Fresh pick</span>
          </span>
        ) : (
          <span />
        )}

        <span className="bg-slate-900/75 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-md sm:rounded-lg truncate min-w-0 ml-auto">
          {product.unit || '1 unit'}
        </span>
      </div>

      {/* Image with link and quick-view */}
      <div className={`relative pt-8 sm:pt-3 pb-1 flex items-center justify-center overflow-hidden h-36 sm:h-44 ${imageBg ?? "max-sm:rounded-2xl max-sm:bg-gradient-to-b max-sm:from-slate-50 max-sm:to-slate-100/70"}`}>
        <Link
          href={`/products/${product.slug}`}
          className="w-full h-full flex items-center justify-center"
          aria-label={`View ${product.name}`}
          tabIndex={-1}
        >
          <img
            src={product.primary_image || PLACEHOLDER_IMG}
            alt={product.name}
            width={160}
            height={160}
            className="max-h-28 sm:max-h-40 max-w-full object-contain max-sm:mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out-expo"
            loading="lazy"
            decoding="async"
            onError={e => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
            }}
          />
        </Link>

        {onQuickView && (
          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              onQuickView(product);
            }}
            className="hidden sm:flex absolute bottom-2 h-10 bg-white/95 hover:bg-fresh-600 hover:text-white hover:border-fresh-600 text-slate-800 backdrop-blur-md px-3.5 rounded-full text-xs font-bold shadow-md opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0 transition-all duration-200 items-center gap-1.5 border border-slate-200 cursor-pointer"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye className="w-3.5 h-3.5" />
            Quick view
          </button>
        )}
      </div>

      {/* Information */}
      <div className="mt-1 sm:mt-2 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 block truncate">{product.brand || 'Fresh House'}</span>
          <Link
            href={`/products/${product.slug}`}
            className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 mt-0.5 hover:text-fresh-700 group-hover:text-fresh-700 transition-colors leading-snug"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        {/* Price and action */}
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="overflow-hidden">
            <span className="block text-sm sm:text-base font-black text-slate-900 whitespace-nowrap tabular-nums">
              PKR {product.price.toLocaleString()}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-slate-500 line-through block tabular-nums">
                PKR {product.compare_at_price.toLocaleString()}
              </span>
            )}
          </div>

          {cartItem ? (
            <div className="flex items-center gap-1 bg-fresh-50 border border-fresh-200 rounded-xl p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 active:scale-90 flex items-center justify-center transition-all cursor-pointer"
                aria-label={`Decrease ${product.name} quantity`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black text-fresh-900 w-5 text-center tabular-nums" aria-live="polite">
                {cartItem.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-fresh-600 text-white hover:bg-fresh-700 active:scale-90 flex items-center justify-center transition-all cursor-pointer"
                aria-label={`Increase ${product.name} quantity`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className={`h-11 min-w-11 justify-center sm:h-10 px-2.5 sm:px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1 border shrink-0 cursor-pointer active:scale-95 ${
                justAdded
                  ? 'bg-fresh-700 border-fresh-700 text-white'
                  : 'bg-fresh-50 border-fresh-200 text-fresh-700 hover:bg-fresh-600 hover:border-fresh-600 hover:text-white'
              }`}
              aria-label={`Add ${product.name} to basket`}
            >
              {justAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span className="hidden xs:inline">{justAdded ? 'Added' : 'Add'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
