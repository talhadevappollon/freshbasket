'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { X, Plus, Minus, ShoppingBag, ShieldCheck, Truck, Banknote, Sparkles } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  const handleAdd = () => {
    addToCart(product, qty);
    onClose();
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* Image */}
          <div className="bg-slate-50 rounded-2xl p-6 flex items-center justify-center relative border border-slate-100 h-64 sm:h-72">
            {discount && (
              <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                SAVE {discount}%
              </span>
            )}
            <img
              src={product.primary_image || 'https://via.placeholder.com/250?text=Fresh+Basket'}
              alt={product.name}
              className="max-h-56 max-w-full object-contain"
            />
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-fresh-700 uppercase tracking-widest block">
                {product.brand || 'Fresh Basket Pakistan'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1 leading-snug">
                {product.name}
              </h3>
              <span className="text-xs text-slate-500 font-medium block mt-1">
                Pack Unit: <strong>{product.unit || 'Per Unit'}</strong>
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900">
                PKR {product.price.toLocaleString()}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-sm text-slate-400 line-through">
                  PKR {product.compare_at_price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock badge */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-emerald-800">
                In Stock &bull; 90-Min Karachi Express Delivery
              </span>
            </div>

            {/* Stepper + Add */}
            <div className="flex items-center space-x-3 pt-2">
              <div className="flex items-center space-x-2 bg-slate-100 rounded-xl p-1 border border-slate-200">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-8 h-8 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-50 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-bold text-sm">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-8 h-8 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 bg-fresh-600 hover:bg-fresh-700 text-white py-3 px-4 rounded-2xl text-xs font-black shadow-lg shadow-fresh-600/30 flex items-center justify-center space-x-2 transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Basket &bull; PKR {(product.price * qty).toLocaleString()}</span>
              </button>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-fresh-600 shrink-0" />
                <span>Cash on Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% Fresh Replacement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

