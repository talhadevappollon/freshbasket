'use client';

import React, { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { windowLabel } from '@/data/deliverySlots';
import { CheckCircle2, Clock, MapPin, Banknote, Phone, PackageSearch } from 'lucide-react';

export default function OrderSuccessModal() {
  const { completedOrder, setCompletedOrder } = useCart();


  // Escape closes the dialog; the page behind stays put while it is open
  useEffect(() => {
    if (!completedOrder) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCompletedOrder(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [completedOrder, setCompletedOrder]);

  if (!completedOrder) return null;

  const whatsappMessage = encodeURIComponent(
    `Hello Fresh Basket! I just placed order #${completedOrder.order_number} for PKR ${completedOrder.total.toLocaleString()} with Cash On Delivery. Please confirm estimated delivery time.`
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Order confirmed">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setCompletedOrder(null)}
      />

      <div className="relative bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl z-10 border border-gray-100 text-center max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain animate-menu-in">
        {/* Animated Check */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-fresh-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order Placed Successfully!</h2>
        <p className="text-sm text-gray-600 mt-1">
          Thank you, <strong className="text-gray-800">{completedOrder.customer_name}</strong>. Your groceries are being picked fresh.
        </p>

        {/* Order Card */}
        <div className="my-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-left space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <div>
              <span className="text-xs text-gray-500 font-semibold block">Order Reference</span>
              <span className="text-sm font-black font-mono text-emerald-800">
                {completedOrder.order_number}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 font-semibold block">Total COD Cash Due</span>
              <span className="text-sm font-black text-gray-900">
                PKR {completedOrder.total.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-fresh-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-800">Delivery window:</span>
              <p className="text-gray-500 text-xs">
                {completedOrder.delivery_window && completedOrder.delivery_window !== 'asap'
                  ? `${completedOrder.delivery_date ? new Date(completedOrder.delivery_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' : ''}${windowLabel(completedOrder.delivery_window)}`
                  : 'Express: estimated arrival in 60 - 90 minutes'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-800">Delivery Address:</span>
              <p className="text-gray-500 text-xs line-clamp-1">{completedOrder.delivery_address}, {completedOrder.delivery_city}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 p-2 rounded-xl">
            <Banknote className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-xs font-medium leading-tight">
              Please have <strong>PKR {completedOrder.total.toLocaleString()}</strong> ready in exact cash for our delivery rider.
            </span>
          </div>
        </div>

        {/* WhatsApp & Continue Shopping Buttons */}
        <div className="space-y-2">
          <Link
            href="/track"
            onClick={() => setCompletedOrder(null)}
            className="w-full h-12 bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow transition-colors"
          >
            <PackageSearch className="w-4 h-4" />
            <span>Track this order</span>
          </Link>

          <a
            href={`https://wa.me/923001234567?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="w-full h-12 bg-white hover:bg-fresh-50 border border-gray-200 hover:border-fresh-300 text-gray-800 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Phone className="w-4 h-4 text-fresh-600" />
            <span>Confirm via WhatsApp</span>
          </a>

          <button
            onClick={() => setCompletedOrder(null)}
            className="w-full h-12 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

