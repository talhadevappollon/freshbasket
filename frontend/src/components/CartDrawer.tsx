'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag, Truck, ArrowRight, Banknote } from 'lucide-react';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    total,
    amountUntilFreeDelivery,
    freeDeliveryThreshold,
    setIsCheckoutOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const percentFree = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-fresh-600 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base leading-tight">Your Grocery Basket</h3>
                <span className="text-xs text-gray-400 font-medium">{items.length} items selected</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-gray-400 hover:text-rose-600 text-xs font-semibold p-1 transition"
                  title="Clear entire cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Free Delivery Meter */}
          <div className="bg-emerald-50/70 p-4 border-b border-emerald-100/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-fresh-600" />
                {amountUntilFreeDelivery === 0
                  ? 'You qualified for FREE Karachi Express Delivery!'
                  : `Add PKR ${amountUntilFreeDelivery.toLocaleString()} more for FREE Delivery`}
              </span>
              <span className="font-bold text-emerald-700">{percentFree}%</span>
            </div>
            <div className="w-full bg-emerald-200/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-fresh-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${percentFree}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-3xl bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-gray-900 font-bold text-base">Your basket is empty</h4>
                <p className="text-gray-400 text-xs max-w-xs mt-1 mb-6">
                  Explore our farm fresh fruits, organic vegetables, and imported pantry items.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-fresh-600 hover:bg-fresh-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-fresh-600/20"
                >
                  Start Shopping Now
                </button>
              </div>
            ) : (
              items.map(item => (
                <div key={item.product.id} className="py-4 flex items-center justify-between gap-3">
                  <Link
                    href={`/products/${item.product.slug}`}
                    onClick={() => setIsCartOpen(false)}
                    className="shrink-0"
                  >
                    <img
                      src={item.product.primary_image || 'https://via.placeholder.com/60'}
                      alt={item.product.name}
                      className="w-14 h-14 object-contain rounded-xl border border-gray-100 p-1 hover:scale-105 transition"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      onClick={() => setIsCartOpen(false)}
                      className="text-xs font-bold text-gray-900 truncate block hover:text-fresh-600 transition"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-[11px] text-gray-400">{item.product.unit || '1 unit'}</p>
                    <p className="text-xs font-bold text-emerald-800 mt-0.5">
                      PKR {item.product.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center space-x-1.5 bg-gray-50 border border-gray-200 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-white text-gray-700 hover:bg-gray-100 flex items-center justify-center transition shadow-xs text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-gray-900 w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg bg-fresh-600 text-white hover:bg-fresh-700 flex items-center justify-center transition shadow-xs text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-gray-50/80 space-y-4">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-gray-900">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Karachi Delivery Fee:</span>
                  <span className="font-bold text-gray-900">
                    {deliveryFee === 0 ? (
                      <span className="text-fresh-600 font-bold uppercase">Free</span>
                    ) : (
                      `PKR ${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-black text-gray-900">
                  <span>Total (Cash on Delivery):</span>
                  <span className="text-emerald-800">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Cash On Delivery Notification */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center space-x-2 text-[11px] text-amber-900 font-medium">
                <Banknote className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Zero prepayment needed &bull; Pay cash at doorstep</span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full bg-fresh-600 hover:bg-fresh-700 text-white py-3.5 px-4 rounded-2xl font-bold text-sm shadow-xl shadow-fresh-600/30 flex items-center justify-center space-x-2 transition"
                >
                  <span>Proceed to COD Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                >
                  <span>View Full Cart Page & Details</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
