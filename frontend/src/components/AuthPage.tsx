'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, PackageSearch } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import AuthForm, { AuthFormView } from '@/components/AuthForm';
import { useAuth } from '@/context/AuthContext';
import { takeAuthReturn } from '@/lib/account';
import { fetchCategories } from '@/lib/api';
import { Category } from '@/types';

/** Full-page sign in / create account, used on phones instead of the popup (and reachable from any screen by URL). */
export default function AuthPage({ view }: { view: AuthFormView }) {
  const router = useRouter();
  const { account, ready } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const finished = useRef(false);

  useEffect(() => {
    document.title = `${view === 'login' ? 'Sign in' : 'Create account'} — Fresh House`;
  }, [view]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // Someone already signed in has nothing to do here
  useEffect(() => {
    if (ready && account && !finished.current) router.replace('/account');
  }, [ready, account, router]);

  const done = () => {
    finished.current = true;
    router.replace(takeAuthReturn() || '/');
  };

  const back = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header categories={categories} />

      <main id="main-content" className="flex-1 w-full max-w-md mx-auto px-4 py-5 sm:py-10 pb-28 sm:pb-10">
        <button type="button" onClick={back} className="mb-3 -ml-1 h-10 px-1 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-fresh-800 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card pt-6">
          {!ready || (account && !finished.current) ? (
            <div className="py-16 flex justify-center text-fresh-600">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
          ) : (
            <AuthForm
              view={view}
              onViewChange={v => router.replace(v === 'login' ? '/login' : '/register')}
              onDone={done}
              headingTag="h1"
              className="px-5 sm:px-7 pb-6"
            />
          )}
        </div>

        <Link href="/track" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-fresh-700 hover:underline underline-offset-4">
          <PackageSearch className="w-4 h-4" /> Track an order without signing in
        </Link>
      </main>

      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <Footer />
    </div>
  );
}
