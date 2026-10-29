'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, ShoppingBag, Sparkles, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = items.find(it => it.product.id === product.id);

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(
          ((product.compare_at_price - product.price) / product.compare_at_price) * 100
        )
      : null;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-2.5 sm:p-4 shadow-2xs hover:shadow-xl hover:border-fresh-300 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
      {/* Top Badges */}
      <div className="flex items-center justify-between absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 z-10 pointer-events-none">
        {discount ? (
          <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs">
            -{discount}%
          </span>
        ) : product.is_featured ? (
          <span className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" /> FRESH
          </span>
        ) : (
          <span></span>
        )}

        <span className="bg-slate-900/70 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg">
          {product.unit || '1 unit'}
        </span>
      </div>

      {/* Image with Link & Quick View Hover Button */}
      <div className="relative pt-3 pb-1 flex items-center justify-center overflow-hidden h-32 sm:h-44">
        <Link
          href={`/products/${product.slug}`}
          className="w-full h-full flex items-center justify-center cursor-pointer"
        >
          <img
            src={product.primary_image || 'https://via.placeholder.com/200?text=Fresh+Basket'}
            alt={product.name}
            className="max-h-28 sm:max-h-40 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Fresh+Basket';
            }}
          />
        </Link>

        {onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
            className="hidden sm:flex absolute bottom-2 bg-white/90 hover:bg-white text-slate-800 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity items-center gap-1.5 border border-slate-200"
            title="Quick View"
          >
            <Eye className="w-3.5 h-3.5 text-fresh-600" />
            <span>Quick View</span>
          </button>
        )}
      </div>

      {/* Information */}
      <div className="mt-1 sm:mt-2 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">
            {product.brand || 'Fresh Basket'}
          </span>
          <Link
            href={`/products/${product.slug}`}
            className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 mt-0.5 group-hover:text-fresh-700 transition leading-snug"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Action Button */}
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="overflow-hidden">
            <div className="flex items-baseline space-x-1">
              <span className="text-xs sm:text-base font-black text-slate-900 font-mono whitespace-nowrap">
                PKR {product.price.toLocaleString()}
              </span>
            </div>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-[10px] sm:text-[11px] text-slate-400 line-through block font-mono">
                PKR {product.compare_at_price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stepper or Add Button */}
          {cartItem ? (
            <div className="flex items-center space-x-1 sm:space-x-1.5 bg-fresh-50 border border-fresh-200 rounded-xl p-0.5 sm:p-1 shrink-0">
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center transition shadow-2xs text-xs"
                title="Decrease"
              >
                <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <span className="text-[11px] sm:text-xs font-black text-fresh-900 w-4 sm:w-5 text-center font-mono">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-fresh-600 text-white hover:bg-fresh-700 flex items-center justify-center transition shadow-2xs text-xs"
                title="Increase"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product, 1)}
              className="bg-fresh-50 hover:bg-fresh-600 text-fresh-700 hover:text-white px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 border border-fresh-200 hover:border-fresh-600 shadow-2xs shrink-0"
              aria-label={`Add ${product.name} to basket`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
