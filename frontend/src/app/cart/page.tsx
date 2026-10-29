'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { useCart } from '@/context/CartContext';
import { fetchCategories } from '@/lib/api';
import { Category } from '@/types';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Truck,
  ArrowRight,
  ShieldCheck,
  Banknote,
  ArrowLeft,
  Tag,
  CheckCircle2,
} from 'lucide-react';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    total,
    freeDeliveryThreshold,
    amountUntilFreeDelivery,
    setIsCheckoutOpen,
  } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const percentFree = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'FRESH10') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid voucher code. Try "FRESH10" for 10% off.');
      setCouponApplied(false);
    }
  };

  const discountAmount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = Math.max(0, total - discountAmount);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        categories={categories}
        selectedCategory=""
        onSelectCategory={() => {}}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-gray-400 mb-6 font-medium">
          <Link href="/" className="hover:text-fresh-600 transition flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-bold">Shopping Cart</span>
        </div>

        <div className="flex items-center justify-between pb-6 border-b border-gray-200 gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-7 h-7 text-fresh-600" />
              <span>Your Shopping Basket</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Review your items before proceeding to Cash On Delivery (COD) checkout
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-fresh-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your Basket is Currently Empty</h2>
            <p className="text-xs text-gray-500 mt-2 mb-8 leading-relaxed">
              Explore 750+ fresh fruits, organic greens, dairy, bakery items, and pantry essentials from Fresh Basket Pakistan.
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 bg-fresh-600 hover:bg-fresh-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-fresh-600/30 transition"
            >
              <span>Explore Supermarket Aisle</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Items Table & Delivery Progress */}
            <div className="lg:col-span-2 space-y-6">
              {/* Free Delivery Meter */}
              <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 shadow-xs">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-emerald-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-fresh-600" />
                    {amountUntilFreeDelivery === 0
                      ? 'Congratulations! You unlocked FREE Express Delivery in Karachi!'
                      : `Add PKR ${amountUntilFreeDelivery.toLocaleString()} more to unlock FREE Delivery`}
                  </span>
                  <span className="font-extrabold text-emerald-800">{percentFree}%</span>
                </div>
                <div className="w-full bg-emerald-200/60 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-fresh-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${percentFree}%` }}
                  />
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                  <span>Product Details</span>
                  <span className="hidden sm:inline">Subtotal</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map(item => (
                    <div
                      key={item.product.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/40 transition"
                    >
                      <div className="flex items-center space-x-4">
                        <Link href={`/products/${item.product.slug}`} className="shrink-0">
                          <img
                            src={item.product.primary_image || 'https://via.placeholder.com/80'}
                            alt={item.product.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl border border-gray-100 p-1 hover:scale-105 transition"
                          />
                        </Link>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            {item.product.brand || 'Fresh Basket'}
                          </span>
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="font-bold text-sm text-gray-900 hover:text-fresh-600 transition line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <span className="text-xs text-gray-400 block mt-0.5">
                            {item.product.unit || '1 unit'} &bull; SKU: {item.product.sku}
                          </span>
                          <span className="font-bold text-xs text-emerald-800 mt-1 block sm:hidden">
                            PKR {item.product.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Controls & Price */}
                      <div className="flex items-center justify-between sm:justify-end space-x-6 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl p-1 shrink-0">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white text-gray-700 hover:bg-gray-100 flex items-center justify-center transition shadow-xs text-xs"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-gray-900 w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-fresh-600 text-white hover:bg-fresh-700 flex items-center justify-center transition shadow-xs text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right min-w-[90px]">
                          <span className="font-black text-sm text-gray-900 block">
                            PKR {(item.product.price * item.quantity).toLocaleString()}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            PKR {item.product.price.toLocaleString()} each
                          </span>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-rose-600 p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Shopping Link */}
              <div className="flex justify-between items-center text-xs">
                <Link href="/" className="inline-flex items-center space-x-1.5 text-fresh-700 font-bold hover:underline">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Add more items from Fresh Produce & Bakery</span>
                </Link>
                <span className="text-gray-400">Total {items.length} unique products</span>
              </div>
            </div>

            {/* Right 1 Col: Order Summary & COD Checkout */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
                <h3 className="font-black text-lg text-gray-900 pb-3 border-b border-gray-100">
                  Order Summary
                </h3>

                {/* Promo Voucher */}
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700">Promo Code or Voucher</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        placeholder="Try 'FRESH10'"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono uppercase focus:outline-none focus:border-fresh-500 bg-gray-50/50"
                      />
                      <Tag className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5" />
                    </div>
                    <button
                      type="submit"
                      className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 10% Fresh discount applied!
                    </p>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                  )}
                </form>

                {/* Calculations */}
                <div className="space-y-2.5 text-xs text-gray-600 pt-3 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span className="font-bold text-gray-900">PKR {subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Express Delivery (Karachi):</span>
                    <span className="font-bold text-gray-900">
                      {deliveryFee === 0 ? (
                        <span className="text-fresh-600 font-bold uppercase">Free</span>
                      ) : (
                        `PKR ${deliveryFee}`
                      )}
                    </span>
                  </div>

                  {couponApplied && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Voucher Discount (10%):</span>
                      <span>- PKR {discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-3 border-t border-gray-200 text-base font-black text-gray-900">
                    <span>Estimated Total:</span>
                    <span className="text-emerald-800">PKR {finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Badge */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-2.5 text-xs text-amber-900">
                  <Banknote className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Cash On Delivery (COD)</span>
                    <span className="text-[11px] text-amber-800">Pay cash in hand when rider delivers</span>
                  </div>
                </div>

                {/* Checkout Trigger Button */}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-fresh-600 hover:bg-fresh-700 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-fresh-600/30 flex items-center justify-center space-x-2 transition"
                >
                  <span>Proceed to COD Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Assurance */}
                <div className="pt-2 flex items-center justify-center space-x-4 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-fresh-600" /> 100% Quality
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-fresh-600" /> Express 2hr Slot
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <Footer />
    </div>
  );
}

