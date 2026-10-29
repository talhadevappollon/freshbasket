'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import OrderTimeline from '@/components/OrderTimeline';
import ScrollUI from '@/components/ScrollUI';
import { fetchCategories, trackOrder } from '@/lib/api';
import { windowLabel } from '@/data/deliverySlots';
import { Category, TrackedOrder } from '@/types';
import { PackageSearch, Loader2, AlertCircle, CalendarClock, Banknote, RefreshCw, Phone } from 'lucide-react';

const POLL_MS = 30000;
const LAST_ORDER_KEY = 'fb_last_order';

const inputClass =
  'w-full h-12 px-4 rounded-xl border border-gray-200 hover:border-fresh-300 text-sm bg-white focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none transition';

export default function TrackOrderPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const lookup = useRef({ orderNumber: '', phone: '' });

  const run = useCallback(async (n: string, p: string, quiet = false) => {
    if (!quiet) {
      setLoading(true);
      setError('');
    }
    const res = await trackOrder(n, p);
    if (res.order) {
      setOrder(res.order);
      setUpdatedAt(new Date());
      lookup.current = { orderNumber: n, phone: p };
      try {
        localStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ n, p }));
      } catch {}
    } else if (!quiet) {
      setOrder(null);
      setError(
        res.error === 'network'
          ? 'We could not reach the store. Check your connection and try again.'
          : res.error === 'rate_limited'
            ? 'Too many attempts. Please wait a minute and try again.'
            : 'We could not find an order with those details. Check the order number and the phone number you used at checkout.'
      );
    }
    if (!quiet) setLoading(false);
  }, []);

  useEffect(() => {
    document.title = 'Track your order — Fresh House';
    fetchCategories().then(setCategories);
    // Prefill from this device's last order and look it up straight away
    try {
      const saved = JSON.parse(localStorage.getItem(LAST_ORDER_KEY) || 'null');
      if (saved?.n && saved?.p) {
        setOrderNumber(saved.n);
        setPhone(saved.p);
        run(saved.n, saved.p);
      }
    } catch {}
  }, [run]);

  // Keep an open order fresh until it is finished
  const finished = order?.order_status === 'delivered' || order?.order_status === 'cancelled';
  useEffect(() => {
    if (!order || finished) return;
    const id = setInterval(() => run(lookup.current.orderNumber, lookup.current.phone, true), POLL_MS);
    return () => clearInterval(id);
  }, [order, finished, run]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError('Enter both your order number and the phone number you used at checkout.');
      return;
    }
    run(orderNumber.trim().toUpperCase(), phone.trim());
  };

  const slot =
    order?.delivery_window
      ? `${order.delivery_date ? new Date(order.delivery_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' : ''}${order.delivery_window_label || windowLabel(order.delivery_window)}`
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header categories={categories} />
      <ScrollUI />

      <main id="main-content" className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 pb-24 sm:pb-12">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-fresh-600 text-white flex items-center justify-center shadow-lg shadow-fresh-600/25">
            <PackageSearch className="w-7 h-7" />
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Track your order</h1>
          <p className="mt-2 text-sm text-slate-600">Enter the order number from your confirmation and the phone number you checked out with.</p>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-5 sm:p-6 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end" noValidate>
          <div>
            <label htmlFor="track-order" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Order number
            </label>
            <input id="track-order" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} placeholder="FB-ABC123" autoCapitalize="characters" autoComplete="off" className={`${inputClass} font-mono uppercase`} />
          </div>
          <div>
            <label htmlFor="track-phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Phone number
            </label>
            <input id="track-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0300 1234567" autoComplete="tel" className={inputClass} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-fresh-700 hover:bg-fresh-800 active:bg-fresh-900 disabled:opacity-60 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Looking…' : 'Track order'}
          </button>
        </form>

        {error && (
          <div role="alert" className="mt-4 flex items-start gap-3 rounded-2xl bg-brand-50 border border-brand-200 text-brand-800 p-4 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {order && (
          <section aria-label={`Order ${order.order_number}`} className="mt-6 bg-white rounded-3xl border border-slate-200/80 shadow-card p-5 sm:p-8 animate-fade-in-up">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-5 border-b border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-500">Order</p>
                <p className="text-xl font-black font-mono text-fresh-800">{order.order_number}</p>
                <p className="text-xs text-slate-500 mt-0.5">Placed {new Date(order.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500">Cash due on delivery</p>
                <p className="text-xl font-black text-slate-900">PKR {order.total.toLocaleString()}</p>
              </div>
            </div>

            <div className="py-6">
              <OrderTimeline status={order.order_status} />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <CalendarClock className="w-5 h-5 text-fresh-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Delivery</p>
                  <p className="text-sm text-slate-600">{slot ?? 'As soon as possible (60-90 min)'}</p>
                  <p className="text-xs text-slate-500">{[order.delivery_area, order.delivery_city].filter(Boolean).join(', ')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <Banknote className="w-5 h-5 text-fresh-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Payment</p>
                  <p className="text-sm text-slate-600">Cash on delivery · {order.payment_status === 'paid' ? 'Paid' : 'Pay the rider'}</p>
                </div>
              </div>
            </div>

            <ul className="mt-6 divide-y divide-slate-100 text-sm">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0 truncate text-slate-700">
                    <span className="font-semibold text-slate-900">{it.quantity} ×</span> {it.product_name}
                  </span>
                  <span className="font-semibold text-slate-900 shrink-0">PKR {Number(it.subtotal).toLocaleString()}</span>
                </li>
              ))}
              <li className="flex justify-between py-2.5 text-slate-600">
                <span>Delivery</span>
                <span>{order.delivery_fee === 0 ? 'Free' : `PKR ${order.delivery_fee}`}</span>
              </li>
            </ul>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                {!finished && <RefreshCw className="w-3.5 h-3.5" />}
                {finished ? 'This order is complete.' : `Updates automatically${updatedAt ? ` · checked ${updatedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : ''}`}
              </span>
              <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-200 hover:border-fresh-400 hover:text-fresh-800 text-slate-700 font-semibold transition-colors">
                <Phone className="w-4 h-4" /> Need help? WhatsApp us
              </a>
            </div>
          </section>
        )}

        <p className="mt-8 text-center text-sm text-slate-500">
          Not ordered yet?{' '}
          <Link href="/" className="font-semibold text-fresh-700 hover:underline underline-offset-4">
            Start shopping
          </Link>
        </p>
      </main>

      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <Footer />
    </div>
  );
}
