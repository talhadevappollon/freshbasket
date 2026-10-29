'use client';

import React, { useState, useEffect } from 'react';
import { PLACEHOLDER_IMG } from '@/lib/placeholder';
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
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Banknote,
  Tag,
  CheckCircle2,
  Sparkles,
  Loader2,
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
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponData, setCouponData] = useState<{
    code: string;
    title: string;
    discount: number;
    discount_type: string;
  } | null>(null);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const percentFree = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const applyVoucherCode = async (codeToApply: string) => {
    if (!codeToApply.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError('');

    try {
      const res = await fetch('/api/v1/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ code: codeToApply.trim(), subtotal: subtotal }),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        setCouponData(data.coupon);
        setCouponApplied(true);
        setCouponError('');
      } else {
        setCouponError(data.message || 'Invalid or expired voucher code.');
        setCouponApplied(false);
        setCouponData(null);
      }
    } catch {
      // Offline fallback
      if (codeToApply.trim().toUpperCase() === 'FRESH10') {
        const disc = Math.round(subtotal * 0.1);
        setCouponData({ code: 'FRESH10', title: '10% Fresh Discount', discount: disc, discount_type: 'percentage' });
        setCouponApplied(true);
        setCouponError('');
      } else {
        setCouponError('Error validating voucher with server. Try "FRESH10"');
      }
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    applyVoucherCode(couponCode);
  };

  const discountAmount = couponData ? couponData.discount : 0;
  const finalTotal = Math.max(0, total - discountAmount);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header categories={categories} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 pb-20 sm:pb-8">
        {/* Checkout Stepper Progress */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5 text-fresh-700">
              <span className="w-5 h-5 rounded-full bg-fresh-600 text-white flex items-center justify-center text-[10px]">1</span>
              Basket Review
            </span>
            <span className="flex-1 h-0.5 bg-slate-200 mx-3"></span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">2</span>
              Address & Delivery
            </span>
            <span className="flex-1 h-0.5 bg-slate-200 mx-3"></span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">3</span>
              COD Cash Order
            </span>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-6 font-medium">
          <Link href="/" className="hover:text-fresh-600 transition flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Shopping Basket</span>
        </div>

        <div className="flex items-center justify-between pb-6 border-b border-slate-200 gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-7 h-7 text-fresh-600" />
              <span>Your Shopping Basket</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Review your fresh grocery items before proceeding to Cash On Delivery (COD) checkout
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl border border-rose-200 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-20 h-20 bg-fresh-50 text-fresh-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Your basket is currently empty</h3>
            <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">
              Looks like you haven&apos;t added any farm-fresh vegetables, organic fruits, or pantry essentials yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 bg-fresh-600 hover:bg-fresh-700 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-fresh-600/30 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Fresh Grocery Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Cols: Cart Table & Delivery Progress */}
            <div className="lg:col-span-2 space-y-6">
              {/* Free Delivery Meter */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-fresh-600" />
                    <span className="font-bold text-slate-800">
                      {amountUntilFreeDelivery > 0 ? (
                        <>
                          Add <strong className="text-fresh-700">PKR {amountUntilFreeDelivery.toLocaleString()}</strong> more to get <strong className="text-emerald-700">FREE EXPRESS DELIVERY</strong>
                        </>
                      ) : (
                        <strong className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 inline" /> You unlocked FREE EXPRESS DELIVERY!
                        </strong>
                      )}
                    </span>
                  </div>
                  <span className="font-black text-slate-400 font-mono text-[11px]">{percentFree}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-fresh-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentFree}%` }}
                  ></div>
                </div>
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50/75 border-b border-slate-100 flex justify-between text-xs font-bold text-slate-500">
                  <span>Product Details</span>
                  <span>Quantity & Subtotal</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {items.map(item => (
                    <div
                      key={item.product.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
                    >
                      <div className="flex items-center space-x-4">
                        <Link href={`/products/${item.product.slug}`} className="shrink-0">
                          <img
                            src={item.product.primary_image || PLACEHOLDER_IMG}
                            alt={item.product.name}
                            className="w-16 h-16 object-contain rounded-2xl bg-white border border-slate-200 p-1"
                          />
                        </Link>
                        <div>
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
                            {item.product.brand || 'Fresh Basket'}
                          </span>
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="font-bold text-slate-900 text-sm hover:text-fresh-700 transition line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                            {item.product.unit || 'Per Unit'} &bull; SKU: {item.product.sku}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-6">
                        {/* Stepper */}
                        <div className="flex items-center space-x-2 bg-slate-100 rounded-xl p-1 border border-slate-200">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center transition shadow-2xs text-xs"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-slate-900 w-6 text-center font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-fresh-600 text-white hover:bg-fresh-700 flex items-center justify-center transition shadow-2xs text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right min-w-[90px]">
                          <span className="font-black text-sm text-slate-900 block font-mono">
                            PKR {(item.product.price * item.quantity).toLocaleString()}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            PKR {item.product.price.toLocaleString()} each
                          </span>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition"
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
                <span className="text-slate-400 font-mono font-medium">Total {items.length} unique products</span>
              </div>
            </div>

            {/* Right 1 Col: Order Summary & COD Checkout */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                <h3 className="font-black text-lg text-slate-900 pb-3 border-b border-slate-100">
                  Order Summary
                </h3>

                {/* Promo Voucher with Live Validation */}
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Promo Code or Voucher</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        placeholder="e.g. FRESH10"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase focus:outline-none focus:border-fresh-500 bg-slate-50"
                      />
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                    </div>
                    <button
                      type="submit"
                      disabled={isValidatingCoupon}
                      className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      {isValidatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                    </button>
                  </div>

                  {/* Quick-Apply Promo Chips */}
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold block w-full">Available Offers:</span>
                    <button
                      type="button"
                      onClick={() => { setCouponCode('FRESH10'); applyVoucherCode('FRESH10'); }}
                      className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200 transition"
                    >
                      FRESH10 (10% OFF)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCouponCode('WELCOME500'); applyVoucherCode('WELCOME500'); }}
                      className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md border border-amber-200 transition"
                    >
                      WELCOME500 (Rs. 500)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCouponCode('FREEDEL'); applyVoucherCode('FREEDEL'); }}
                      className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md border border-blue-200 transition"
                    >
                      FREEDEL
                    </button>
                  </div>

                  {couponApplied && couponData && (
                    <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {couponData.title} applied! Saved PKR {couponData.discount.toLocaleString()}
                    </p>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-rose-600 font-bold pt-1">{couponError}</p>
                  )}
                </form>

                {/* Calculations */}
                <div className="space-y-2.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span className="font-bold text-slate-900 font-mono">PKR {subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Express Delivery (Karachi):</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {deliveryFee === 0 ? (
                        <span className="text-fresh-600 font-black uppercase">Free</span>
                      ) : (
                        `PKR ${deliveryFee}`
                      )}
                    </span>
                  </div>

                  {couponApplied && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Voucher Discount:</span>
                      <span className="font-mono">- PKR {discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-3 border-t border-slate-200 text-base font-black text-slate-900">
                    <span>Payable on Delivery:</span>
                    <span className="text-emerald-800 font-mono text-lg">PKR {finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Badge */}
                <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center space-x-2.5 text-xs text-amber-900">
                  <Banknote className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Cash On Delivery (COD)</span>
                    <span className="text-[11px] text-amber-800">Pay cash in hand when rider delivers to your address</span>
                  </div>
                </div>

                {/* Checkout Trigger Button */}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-fresh-600 hover:bg-fresh-700 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-fresh-600/30 flex items-center justify-center space-x-2 transition transform hover:-translate-y-0.5"
                >
                  <span>Proceed to COD Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Assurance */}
                <div className="pt-2 flex items-center justify-center space-x-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-fresh-600" /> 100% Quality Fresh
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-fresh-600" /> Express Delivery
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
