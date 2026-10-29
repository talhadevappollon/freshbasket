'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { submitCheckout } from '@/lib/api';
import { OrderCustomer } from '@/types';
import DeliverySlotPicker from '@/components/DeliverySlotPicker';
import { slotDays } from '@/data/deliverySlots';
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
    // Express today unless the shopper picks a window
    delivery_date: slotDays()[0].date,
    delivery_window: 'asap',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');


  // Escape closes the dialog; the page behind stays put while it is open
  useEffect(() => {
    if (!isCheckoutOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) setIsCheckoutOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isCheckoutOpen, isSubmitting, setIsCheckoutOpen]);

  // A tab left open overnight must not offer yesterday's slot
  useEffect(() => {
    if (!isCheckoutOpen) return;
    const days = slotDays();
    setFormData(f => (days.some(d => d.date === f.delivery_date) ? f : { ...f, delivery_date: days[0].date, delivery_window: 'asap' }));
  }, [isCheckoutOpen]);

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
        try {
          // lets the tracking page pick the order up on this device
          localStorage.setItem('fb_last_order', JSON.stringify({ n: res.order.order_number, p: formData.customer_phone }));
        } catch {}
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Express checkout">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isSubmitting && setIsCheckoutOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain border border-gray-100 animate-menu-in">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-fresh-600 text-white flex items-center justify-center font-bold">
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
            aria-label="Close checkout"
            className="w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
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
            <h3 className="text-sm font-bold text-gray-500 mb-3">1. Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="e.g. Hamza Tariq"
                  value={formData.customer_name}
                  onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none transition bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mobile Number (WhatsApp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder="e.g. +92 300 1234567"
                  value={formData.customer_phone}
                  onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none transition bg-gray-50/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address <span className="text-gray-400 font-normal">(Optional for order receipt)</span>
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. hamza@example.com"
                  value={formData.customer_email}
                  onChange={e => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none transition bg-gray-50/50"
                />
              </div>
            </div>
          </div>

          {/* Delivery Location */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-3">2. Delivery Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                <select
                  value={formData.delivery_city}
                  onChange={e => setFormData({ ...formData, delivery_city: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none transition bg-white font-medium"
                >
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Delivery Area</label>
                <select
                  value={formData.delivery_area}
                  onChange={e => setFormData({ ...formData, delivery_area: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none transition bg-white font-medium"
                >
                  {KARACHI_AREAS.map(area => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Complete Street Address, House / Flat # <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  autoComplete="street-address"
                  required
                  placeholder="e.g. House 42-B, Khayaban-e-Seher, Phase 6, DHA"
                  value={formData.delivery_address}
                  onChange={e => setFormData({ ...formData, delivery_address: e.target.value })}
                  className="w-full min-h-[88px] py-2.5 px-4 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none transition bg-gray-50/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Rider Delivery Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leave with gatekeeper or call before ringing bell"
                  value={formData.order_notes}
                  onChange={e => setFormData({ ...formData, order_notes: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none transition bg-gray-50/50"
                />
              </div>
            </div>
          </div>

          {/* Delivery Slot */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-3">3. Delivery Time</h3>
            <DeliverySlotPicker
              date={formData.delivery_date || ''}
              windowKey={formData.delivery_window || ''}
              onChange={(date, win) => setFormData({ ...formData, delivery_date: date, delivery_window: win })}
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-3">4. Payment Option</h3>
            <div className="border-2 border-fresh-600 bg-fresh-50/70 p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-fresh-600 text-white flex items-center justify-center font-bold">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Cash On Delivery (COD)</h4>
                  <p className="text-xs text-gray-500">Pay cash in hand upon receiving your fresh groceries</p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 text-fresh-700 font-bold text-xs bg-white px-3 py-1.5 rounded-xl border border-fresh-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-fresh-600" />
                <span className="hidden xs:inline">Selected</span>
              </div>
            </div>
          </div>

          {/* Order Summary Breakdown */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-sm">
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
              <span>Total due in cash:</span>
              <span className="text-emerald-800 whitespace-nowrap">PKR {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit Order Button */}
          <div className="sticky bottom-0 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 px-6 sm:px-8 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur border-t border-gray-100 rounded-b-3xl">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 active:scale-[0.99] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm cursor-pointer shadow-xl shadow-fresh-600/30 flex items-center justify-center space-x-2 transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Placing Your Order...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span className="sm:hidden">Place order &bull; PKR {total.toLocaleString()}</span>
                <span className="hidden sm:inline">Confirm Order with Cash On Delivery &bull; PKR {total.toLocaleString()}</span>
              </>
            )}
          </button>
          </div>
        </form>
      </div>
    </div>
  );
}

