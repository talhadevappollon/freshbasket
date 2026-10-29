'use client';

import React, { useEffect } from 'react';
import { PLACEHOLDER_IMG } from '@/lib/placeholder';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import QuantityStepper from '@/components/QuantityStepper';
import AddedToast from '@/components/AddedToast';
import { X, Trash2, ShoppingBag, Truck, ArrowRight, Banknote } from 'lucide-react';

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


  // Escape closes the dialog; the page behind stays put while it is open
  useEffect(() => {
    if (!isCartOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isCartOpen, setIsCartOpen]);

  // The add-to-basket toast lives here so every page that mounts the drawer gets it
  if (!isCartOpen) return <AddedToast />;

  const percentFree = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden" role="dialog" aria-modal="true" aria-label="Your grocery basket">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-slide-in-right">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-fresh-600 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base leading-tight">Your Grocery Basket</h3>
                <span className="text-xs text-gray-400 font-medium">{items.length} {items.length === 1 ? "item" : "items"} selected</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  aria-label="Clear basket"
                  className="w-11 h-11 rounded-full flex items-center justify-center text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Clear entire cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                aria-label="Close basket"
                className="w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
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
                  className="h-11 bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 text-white px-6 rounded-xl text-sm font-bold transition shadow-md shadow-fresh-600/20 cursor-pointer"
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
                      src={item.product.primary_image || PLACEHOLDER_IMG}
                      alt={item.product.name}
                      className="w-14 h-14 object-contain rounded-xl border border-gray-100 p-1 hover:scale-105 transition"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      onClick={() => setIsCartOpen(false)}
                      className="text-sm font-bold text-gray-900 truncate block hover:text-fresh-600 transition"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-[11px] text-gray-400">{item.product.unit || '1 unit'}</p>
                    <p className="text-xs font-bold text-emerald-800 mt-0.5">
                      PKR {item.product.price.toLocaleString()}
                    </p>
                  </div>

                  <QuantityStepper
                    value={item.quantity}
                    min={0}
                    max={item.product.stock_quantity > 0 ? item.product.stock_quantity : 99}
                    label={item.product.name}
                    onChange={q => updateQuantity(item.product.id, q)}
                  />
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
                  className="w-full h-12 bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 active:scale-[0.99] text-white px-4 rounded-2xl font-bold text-sm shadow-xl shadow-fresh-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Proceed to COD Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full h-11 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-700 border border-gray-200 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-1.5 transition-colors"
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
