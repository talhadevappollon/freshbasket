'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PLACEHOLDER_IMG } from '@/lib/placeholder';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, Eye, Check } from 'lucide-react';
import { unavailableLabel } from '@/lib/availability';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  /** kept for older callers; the card now has the reference store's plain white look */
  imageBg?: string;
}

/*
 * Shapes measured from the reference store's card artwork:
 *  - the card's bottom edge bulges down in a shallow arc, about 22px deeper in the middle than at the sides
 *  - the "+" block's top dips about 5px in the middle and its bottom bulges about 15px
 * Both are drawn with CSS masks, so the shapes stretch with the card width.
 */
const svg = (viewBox: string, d: string) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='${viewBox}' preserveAspectRatio='none'%3E%3Cpath d='${d}'/%3E%3C/svg%3E")`;

export const CARD_MASK: React.CSSProperties = {
  WebkitMaskImage: `linear-gradient(#000,#000), ${svg('0 0 100 24', 'M0 0H100V2Q50 46 0 2Z')}`,
  maskImage: `linear-gradient(#000,#000), ${svg('0 0 100 24', 'M0 0H100V2Q50 46 0 2Z')}`,
  WebkitMaskSize: '100% calc(100% - 23px), 100% 24px',
  maskSize: '100% calc(100% - 23px), 100% 24px',
  WebkitMaskPosition: 'top, bottom',
  maskPosition: 'top, bottom',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
};

export const BLOCK_MASK: React.CSSProperties = {
  WebkitMaskImage: svg('0 0 148 58', 'M0 3Q74 13 148 3V41Q74 71 0 41Z'),
  maskImage: svg('0 0 148 58', 'M0 3Q74 13 148 3V41Q74 71 0 41Z'),
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
};

/**
 * Product card in the reference store's style: centred photo, centred title, "Be the first to review",
 * a large bold price and a full-width pale-green "+" block that turns lime on hover and when in the basket.
 */
export default function ProductCard({ product, onQuickView }: ProductCardProps) {
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

  const unavailable = unavailableLabel(product);
  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  return (
    // the drop shadow follows the masked shape, giving the white card a hairline edge on the light page
    <article className="relative h-full group [filter:drop-shadow(0_1px_1.5px_rgba(23,60,42,0.13))]">
      <div className="h-full flex flex-col bg-white rounded-t-[10px] p-[15px] text-center" style={CARD_MASK}>
        {discount && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full pointer-events-none">-{discount}%</span>
        )}

        {/* Photo */}
        <div className="relative h-[120px] flex items-center justify-center">
          <Link href={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center" aria-label={`View ${product.name}`} tabIndex={-1}>
            <img
              src={product.primary_image || PLACEHOLDER_IMG}
              alt={product.name}
              width={120}
              height={120}
              className="h-full w-auto max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out-expo"
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
              className="hidden sm:flex absolute -bottom-1 h-8 bg-white/95 hover:bg-fresh-600 hover:text-white hover:border-fresh-600 text-slate-800 px-3 rounded-full text-xs font-bold shadow-md opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0 transition-all duration-200 items-center gap-1.5 border border-slate-200 cursor-pointer"
              aria-label={`Quick view ${product.name}`}
            >
              <Eye className="w-3.5 h-3.5" />
              Quick view
            </button>
          )}
        </div>

        {/* Title, review line, price */}
        <div className="mt-3 flex-1 flex flex-col">
          <Link
            href={`/products/${product.slug}`}
            className="min-h-[46px] text-[13px] font-medium leading-[23px] tracking-[-0.03em] text-[#173c2a] line-clamp-3 hover:text-fresh-600 transition-colors"
            title={product.name}
          >
            {product.name}
          </Link>
          <div className="mt-auto pt-2">
            <p className="text-[11px] text-slate-400">Be the first to review</p>
            <p className="text-[22px] md:text-[17px] font-extrabold leading-[34px] text-[#173c2a] tabular-nums">Rs.{product.price.toLocaleString()}</p>
            {discount && <s className="block text-[0.7rem] text-gray-500 -mt-1 tabular-nums">Rs.{product.compare_at_price!.toLocaleString()}</s>}
          </div>
        </div>

        {/* "+" block */}
        <div className="mt-2.5">
          {unavailable ? (
            <span role="status" className="h-[59px] pb-4 flex items-center justify-center text-sm font-bold bg-[#fff1cc] text-[#8a5a00] cursor-not-allowed select-none" style={BLOCK_MASK}>
              {unavailable}
            </span>
          ) : cartItem ? (
            <div className="h-[59px] bg-[#bbea70] pt-[10px]" style={BLOCK_MASK}>
              <div className="h-[34px] px-2.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                  className="w-7 h-7 rounded-full border-2 border-[#3e872a] text-[#3e872a] flex items-center justify-center hover:bg-white/50 active:scale-90 transition cursor-pointer"
                  aria-label={`Decrease ${product.name} quantity`}
                >
                  <Minus className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
                <span className="text-[22px] font-bold text-[#3e872a] tabular-nums" aria-live="polite">
                  {cartItem.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                  className="w-7 h-7 rounded-full border-2 border-[#3e872a] text-[#3e872a] flex items-center justify-center hover:bg-white/50 active:scale-90 transition cursor-pointer"
                  aria-label={`Increase ${product.name} quantity`}
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              style={BLOCK_MASK}
              className="w-full h-[59px] pb-4 bg-[#f0f4ea] hover:bg-[#bbea70] text-[#3e872a] flex items-center justify-center transition-colors duration-300 cursor-pointer"
              aria-label={`Add ${product.name} to basket`}
            >
              {justAdded ? <Check className="w-6 h-6" strokeWidth={3} /> : <Plus className="w-6 h-6" strokeWidth={3} />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
