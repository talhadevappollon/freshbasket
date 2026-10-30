'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import ScrollUI from '@/components/ScrollUI';
import { useAuth } from '@/context/AuthContext';
import { fetchCategories } from '@/lib/api';
import { AccountError, AccountOrder, fetchAccountOrders } from '@/lib/account';
import { Category } from '@/types';
import { ChevronRight, Loader2, LogOut, PackageSearch, ReceiptText, ShoppingBag, UserRound } from 'lucide-react';

const STATUS: Record<string, { label: string; tone: string }> = {
  pending: { label: 'Order placed', tone: 'bg-slate-100 text-slate-700' },
  processing: { label: 'Being packed', tone: 'bg-fresh-100 text-fresh-800' },
  dispatched: { label: 'Out for delivery', tone: 'bg-fresh-600 text-white' },
  delivered: { label: 'Delivered', tone: 'bg-fresh-100 text-fresh-900' },
  cancelled: { label: 'Cancelled', tone: 'bg-brand-100 text-brand-800' },
};

export default function AccountPage() {
  const { account, ready, openAuth, signOut } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<AccountOrder[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'My orders — Fresh House';
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!account) {
      setOrders(null);
      return;
    }
    let cancelled = false;
    fetchAccountOrders()
      .then(res => !cancelled && setOrders(res.orders))
      .catch(e => !cancelled && setError(e instanceof AccountError ? e.message : 'We could not load your orders.'));
    return () => {
      cancelled = true;
    };
  }, [account]);

  // lets the tracking page open straight onto this order
  const rememberForTracking = (orderNumber: string) => {
    if (!account) return;
    try {
      localStorage.setItem('fb_last_order', JSON.stringify({ n: orderNumber, p: account.phone }));
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header categories={categories} />
      <ScrollUI />

      <main id="main-content" className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-10 pb-24 sm:pb-10">
        {!ready ? (
          <div className="py-24 flex justify-center text-fresh-600">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : !account ? (
          <div className="text-center bg-white rounded-3xl border border-slate-200/80 shadow-card px-6 py-12">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-fresh-100 text-fresh-700 flex items-center justify-center">
              <UserRound className="w-7 h-7" />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900">Sign in to see your orders</h1>
            <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">Orders you place while signed in are kept here, with the same live tracking.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
              <button type="button" onClick={() => openAuth('login')} className="h-12 px-6 rounded-xl bg-fresh-700 hover:bg-fresh-800 text-white text-sm font-bold cursor-pointer transition-colors">
                Sign in
              </button>
              <button type="button" onClick={() => openAuth('register')} className="h-12 px-6 rounded-xl bg-white hover:bg-fresh-50 border border-slate-200 hover:border-fresh-300 text-slate-800 text-sm font-bold cursor-pointer transition-colors">
                Create account
              </button>
            </div>
            <Link href="/track" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-fresh-700 hover:underline underline-offset-4">
              <PackageSearch className="w-4 h-4" /> Track an order without signing in
            </Link>
          </div>
        ) : (
          <>
            <section className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-4 sm:p-5 flex items-center gap-3.5">
              <span className="w-14 h-14 rounded-full bg-fresh-700 text-white text-2xl font-black flex items-center justify-center shrink-0" aria-hidden="true">
                {account.name.trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-black text-slate-900 truncate">{account.name}</h1>
                <p className="text-sm text-slate-600 truncate">{[account.phone, account.email].filter(Boolean).join(' · ')}</p>
              </div>
              <button
                type="button"
                onClick={() => signOut()}
                className="h-11 px-3.5 rounded-xl border border-slate-200 hover:border-brand-200 hover:bg-brand-50 text-slate-700 hover:text-brand-700 text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" /> <span className="hidden xs:inline">Sign out</span>
              </button>
            </section>

            <h2 className="mt-7 mb-3 flex items-center gap-2 text-lg font-black text-slate-900">
              <ReceiptText className="w-5 h-5 text-fresh-700" /> My orders
            </h2>

            {error ? (
              <p role="alert" className="rounded-2xl bg-brand-50 border border-brand-200 text-brand-800 p-4 text-sm">
                {error}
              </p>
            ) : orders === null ? (
              <div className="py-12 flex justify-center text-fresh-600">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center bg-white rounded-3xl border border-slate-200/80 px-6 py-10">
                <ShoppingBag className="w-8 h-8 mx-auto text-slate-400" />
                <p className="mt-3 font-bold text-slate-900">No orders yet</p>
                <p className="text-sm text-slate-600 mt-1">Orders you place while signed in will show up here.</p>
                <Link href="/" className="mt-5 inline-flex items-center h-11 px-5 rounded-xl bg-fresh-700 hover:bg-fresh-800 text-white text-sm font-bold transition-colors">
                  Start shopping
                </Link>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {orders.map(o => {
                  const st = STATUS[o.order_status] ?? STATUS.pending;
                  return (
                    <li key={o.order_number}>
                      <Link
                        href="/track"
                        onClick={() => rememberForTracking(o.order_number)}
                        className="group flex items-center gap-3 bg-white rounded-2xl border border-slate-200/80 hover:border-fresh-300 shadow-xs hover:shadow-card p-3.5 sm:p-4 transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-black text-fresh-800">{o.order_number}</span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${st.tone}`}>{st.label}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {o.items_count} {o.items_count === 1 ? 'item' : 'items'}
                            {o.delivery_window_label ? ` · ${o.delivery_window_label}` : ''}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-slate-900">PKR {Number(o.total).toLocaleString()}</p>
                          <span className="text-xs font-semibold text-fresh-700 inline-flex items-center">
                            Track <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </main>

      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <Footer />
    </div>
  );
}
