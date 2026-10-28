'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { submitCheckout } from '@/lib/api';
import { OrderCustomer } from '@/types';
import {
  X,
  Banknote,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const KARACHI_AREAS = [
  'DHA Phase 1',
  'DHA Phase 2',
  'DHA Phase 4',
  'DHA Phase 5',
  'DHA Phase 6',
  'DHA Phase 7',
  'DHA Phase 8',
  'Clifton Block 1 to 9',
  'Gulshan-e-Iqbal',
  'PECHS Block 2 / 6',
  'Bahria Town Karachi',
  'North Nazimabad',
  'Gulistan-e-Jauhar',
  'Muhammad Ali Society (MACHS)',
  'KDA Scheme 1',
  'Sharifabad / Federal B Area',
  'Malir Cantt',
  'Other Karachi Area',
];

export default function CheckoutModal() {
  const {
    items,
    isCheckoutOpen,
    setIsCheckoutOpen,
    subtotal,
    deliveryFee,
    total,
    clearCart,
    setCompletedOrder,
  } = useCart();

  const [formData, setFormData] = useState<OrderCustomer>({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_city: 'Karachi',
    delivery_area: 'DHA Phase 6',
    delivery_address: '',
    order_notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCheckoutOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.customer_name.trim() || !formData.customer_phone.trim() || !formData.delivery_address.trim()) {
      setErrorMsg('Please fill in your name, contact phone number, and delivery address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitCheckout(formData, items);
      if (res.success && res.order) {
        clearCart();
        setIsCheckoutOpen(false);
        setCompletedOrder(res.order);
      } else {
        setErrorMsg(res.message || 'Error creating order.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong during checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isSubmitting && setIsCheckoutOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-fresh-600 text-white flex items-center justify-center font-bold">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Express Checkout</h2>
              <p className="text-xs text-gray-500 font-medium">Cash On Delivery &bull; Instant Order Placement</p>
            </div>
          </div>
          <button
            disabled={isSubmitting}
            onClick={() => setIsCheckoutOpen(false)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Contact */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">1. Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hamza Tariq"
                  value={formData.customer_name}
                  onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-fresh-500 focus:outline-none bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile Number (WhatsApp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +92 300 1234567"
                  value={formData.customer_phone}
                  onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-fresh-500 focus:outline-none bg-gray-50/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address <span className="text-gray-400 font-normal">(Optional for order receipt)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. hamza@example.com"
                  value={formData.customer_email}
                  onChange={e => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-fresh-500 focus:outline-none bg-gray-50/50"
                />
              </div>
            </div>
          </div>

          {/* Delivery Location */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">2. Delivery Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                <select
                  value={formData.delivery_city}
                  onChange={e => setFormData({ ...formData, delivery_city: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-fresh-500 focus:outline-none bg-white font-medium"
                >
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Delivery Area</label>
                <select
                  value={formData.delivery_area}
                  onChange={e => setFormData({ ...formData, delivery_area: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-fresh-500 focus:outline-none bg-white font-medium"
                >
                  {KARACHI_AREAS.map(area => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Complete Street Address, House / Flat # <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. House 42-B, Khayaban-e-Seher, Phase 6, DHA"
                  value={formData.delivery_address}
                  onChange={e => setFormData({ ...formData, delivery_address: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-fresh-500 focus:outline-none bg-gray-50/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Rider Delivery Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leave with gatekeeper or call before ringing bell"
                  value={formData.order_notes}
                  onChange={e => setFormData({ ...formData, order_notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-fresh-500 focus:outline-none bg-gray-50/50"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">3. Payment Option</h3>
            <div className="border-2 border-fresh-600 bg-fresh-50/70 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-fresh-600 text-white flex items-center justify-center font-bold">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Cash On Delivery (COD)</h4>
                  <p className="text-xs text-gray-500">Pay cash in hand upon receiving your fresh groceries</p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 text-fresh-700 font-bold text-xs bg-white px-3 py-1.5 rounded-xl border border-fresh-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-fresh-600" />
                <span>Selected</span>
              </div>
            </div>
          </div>

          {/* Order Summary Breakdown */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Items Total ({items.length}):</span>
              <span className="font-bold text-gray-900">PKR {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charges:</span>
              <span className="font-bold text-gray-900">
                {deliveryFee === 0 ? <span className="text-fresh-600 font-bold">FREE</span> : `PKR ${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-black text-gray-900">
              <span>Total Cash Due at Doorstep:</span>
              <span className="text-emerald-800">PKR {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit Order Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-fresh-600 hover:bg-fresh-700 disabled:bg-gray-400 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-fresh-600/30 flex items-center justify-center space-x-2 transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Placing Your Order...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm Order with Cash On Delivery &bull; PKR {total.toLocaleString()}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
