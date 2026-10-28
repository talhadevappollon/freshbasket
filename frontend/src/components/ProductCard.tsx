'use client';

import React from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, ShoppingBag, Sparkles } from 'lucide-react';

export default function ProductCard({ product }: { product: Product }) {
  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = items.find(it => it.product.id === product.id);

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(
          ((product.compare_at_price - product.price) / product.compare_at_price) * 100
        )
      : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-xl hover:border-fresh-200 transition-all flex flex-col justify-between group relative overflow-hidden">
      {/* Top Badges */}
      <div className="flex items-center justify-between absolute top-3 left-3 right-3 z-10 pointer-events-none">
        {discount ? (
          <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
            SAVE {discount}%
          </span>
        ) : product.is_featured ? (
          <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" /> POPULAR
          </span>
        ) : (
          <span></span>
        )}

        <span className="bg-gray-900/70 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
          {product.unit || '1 unit'}
        </span>
      </div>

      {/* Image */}
      <div className="pt-4 pb-2 flex items-center justify-center relative overflow-hidden h-44">
        <img
          src={product.primary_image || 'https://via.placeholder.com/200?text=Fresh+Basket'}
          alt={product.name}
          className="max-h-40 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Fresh+Basket';
          }}
        />
      </div>

      {/* Information */}
      <div className="mt-2 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            {product.brand || 'Fresh Basket'}
          </span>
          <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 mt-0.5 group-hover:text-fresh-700 transition" title={product.name}>
            {product.name}
          </h3>
        </div>

        {/* Price & Action Button */}
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-sm sm:text-base font-black text-gray-900">
                PKR {product.price.toLocaleString()}
              </span>
            </div>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-[11px] text-gray-400 line-through block">
                PKR {product.compare_at_price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stepper or Add Button */}
          {cartItem ? (
            <div className="flex items-center space-x-1.5 bg-fresh-50 border border-fresh-200 rounded-xl p-1">
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-7 h-7 rounded-lg bg-white text-gray-700 hover:bg-gray-100 flex items-center justify-center transition shadow-xs text-xs"
                title="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-fresh-900 w-5 text-center">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-7 h-7 rounded-lg bg-fresh-600 text-white hover:bg-fresh-700 flex items-center justify-center transition shadow-xs text-xs"
                title="Increase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product, 1)}
              className="bg-fresh-50 hover:bg-fresh-600 text-fresh-700 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-fresh-200 hover:border-fresh-600 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
