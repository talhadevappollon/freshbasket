'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PLACEHOLDER_IMG } from '@/lib/placeholder';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { X, Plus, Minus, ShoppingBag, ShieldCheck, Banknote } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const [qty, setQty] = useState(1);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Fresh quantity for every product; lock page scroll and handle Escape while open
  useEffect(() => {
    if (!product) return;
    setQty(1);
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [product, onClose]);

  if (!product) return null;

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;
  const inStock = product.stock_quantity > 0;

  const handleAdd = () => {
    addToCart(product, qty);
    onClose();
    setIsCartOpen(true);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl p-5 sm:p-8 shadow-2xl relative overflow-y-auto overscroll-contain max-h-[calc(100dvh-2rem)] animate-menu-in"
        onClick={e => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 items-center">
          {/* Image */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 flex items-center justify-center relative border border-slate-100 h-48 sm:h-72 mt-8 sm:mt-0">
            {discount && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                Save {discount}%
              </span>
            )}
            <img
              src={product.primary_image || PLACEHOLDER_IMG}
              alt={product.name}
              width={256}
              height={224}
              className="max-h-40 sm:max-h-56 max-w-full object-contain"
              onError={e => {
                (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
              }}
            />
          </div>

          {/* Details */}
          <div className="space-y-4 min-w-0">
            <div>
              <span className="text-sm font-semibold text-fresh-700 block">{product.brand || 'Fresh Basket Pakistan'}</span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1 leading-snug">{product.name}</h3>
              <span className="text-sm text-slate-600 block mt-1">
                Pack size: <strong>{product.unit || 'Per unit'}</strong>
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tabular-nums">PKR {product.price.toLocaleString()}</span>
              {discount && (
                <span className="text-sm text-slate-500 line-through tabular-nums">
                  PKR {product.compare_at_price!.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} aria-hidden="true" />
              <span className={`font-semibold ${inStock ? 'text-emerald-800' : 'text-rose-700'}`}>
                {inStock ? 'In stock · 90-minute Karachi express delivery' : 'Currently out of stock'}
              </span>
            </div>

            {/* Quantity + add */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-rose-50 hover:text-rose-700 active:scale-90 transition cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-base tabular-nums" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  aria-label="Increase quantity"
                  className="w-10 h-10 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-fresh-50 hover:text-fresh-700 active:scale-90 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={!inStock}
                className="flex-1 h-12 min-w-0 bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 rounded-xl text-sm font-bold shadow-lg shadow-fresh-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span className="truncate">Add · PKR {(product.price * qty).toLocaleString()}</span>
              </button>
            </div>

            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="inline-flex items-center h-11 text-sm font-semibold text-fresh-700 hover:text-fresh-800 hover:underline underline-offset-4"
            >
              View full details
            </Link>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-fresh-600 shrink-0" />
                <span>Cash on delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Fresh replacement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
