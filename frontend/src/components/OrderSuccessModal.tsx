'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { CheckCircle2, Clock, MapPin, Banknote, Phone, ArrowRight } from 'lucide-react';

export default function OrderSuccessModal() {
  const { completedOrder, setCompletedOrder } = useCart();

  if (!completedOrder) return null;

  const whatsappMessage = encodeURIComponent(
    `Hello Fresh Basket! I just placed order #${completedOrder.order_number} for PKR ${completedOrder.total.toLocaleString()} with Cash On Delivery. Please confirm estimated delivery time.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setCompletedOrder(null)}
      />

      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 border border-gray-100 text-center">
        {/* Animated Check */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-fresh-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order Placed Successfully!</h2>
        <p className="text-xs text-gray-500 mt-1">
          Thank you, <strong className="text-gray-800">{completedOrder.customer_name}</strong>. Your groceries are being picked fresh.
        </p>

        {/* Order Card */}
        <div className="my-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-left space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Order Reference</span>
              <span className="text-sm font-black font-mono text-emerald-800">
                {completedOrder.order_number}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Total COD Cash Due</span>
              <span className="text-sm font-black text-gray-900">
                PKR {completedOrder.total.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-2 text-xs text-gray-600">
            <Clock className="w-4 h-4 text-fresh-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-800">Express Delivery Window:</span>
              <p className="text-gray-500 text-[11px]">Estimated arrival in 60 - 90 minutes</p>
            </div>
          </div>

          <div className="flex items-start space-x-2 text-xs text-gray-600">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-800">Delivery Address:</span>
              <p className="text-gray-500 text-[11px] line-clamp-1">{completedOrder.delivery_address}, {completedOrder.delivery_city}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2 text-xs text-amber-800 bg-amber-50 p-2 rounded-xl">
            <Banknote className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-[11px] font-medium leading-tight">
              Please have <strong>PKR {completedOrder.total.toLocaleString()}</strong> ready in exact cash for our delivery rider.
            </span>
          </div>
        </div>

        {/* WhatsApp & Continue Shopping Buttons */}
        <div className="space-y-2">
          <a
            href={`https://wa.me/923001234567?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow transition"
          >
            <Phone className="w-4 h-4" />
            <span>Track Order via WhatsApp Support</span>
          </a>

          <button
            onClick={() => setCompletedOrder(null)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-xs transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

