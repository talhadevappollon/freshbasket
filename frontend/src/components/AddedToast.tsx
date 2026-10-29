'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { PLACEHOLDER_IMG } from '@/lib/placeholder';
import { useCart } from '@/context/CartContext';

const VISIBLE_MS = 4000;

/** Bottom toast confirming an add-to-basket, with a shortcut to the basket. */
export default function AddedToast() {
  const { lastAdded, dismissLastAdded, setIsCartOpen, isCartOpen, totalItems } = useCart();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!lastAdded || paused) return;
    const t = setTimeout(dismissLastAdded, VISIBLE_MS);
    return () => clearTimeout(t);
  }, [lastAdded, paused, dismissLastAdded]);

  if (!lastAdded || isCartOpen) return null;
  const { product, quantity } = lastAdded;

  return (
    <div
      // keyed on the add so repeated adds replay the entrance
      key={lastAdded.id}
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="fixed z-[65] left-4 right-4 bottom-20 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px] animate-fade-in-up"
    >
      <div className="relative overflow-hidden flex items-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 pr-2">
        <img src={product.primary_image || PLACEHOLDER_IMG} alt="" className="w-12 h-12 object-contain rounded-xl border border-slate-100 bg-white p-1 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-bold text-fresh-700">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Added to basket
          </p>
          <p className="text-sm font-semibold text-slate-900 truncate">
            {quantity > 1 ? `${quantity} × ` : ''}
            {product.name}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            dismissLastAdded();
            setIsCartOpen(true);
          }}
          className="h-10 px-4 rounded-xl bg-fresh-700 hover:bg-fresh-800 active:bg-fresh-900 text-white text-sm font-bold whitespace-nowrap cursor-pointer transition-colors"
        >
          View basket ({totalItems})
        </button>
        <button
          type="button"
          onClick={dismissLastAdded}
          aria-label="Dismiss"
          className="w-10 h-10 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        {!paused && <span className="absolute left-0 bottom-0 h-0.5 bg-fresh-500 origin-left animate-slide-progress" style={{ animationDuration: `${VISIBLE_MS}ms` }} aria-hidden="true" />}
      </div>
    </div>
  );
}
