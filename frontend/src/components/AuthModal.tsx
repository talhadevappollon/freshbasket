'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { LogOut, PackageSearch, ReceiptText, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/AuthForm';

/** Desktop popup for signing in, creating an account and the signed-in account summary. Phones use the /login and /register pages instead. */
export default function AuthModal() {
  const { account, modalOpen, view, setView, closeAuth, signOut } = useAuth();

  // A signed-in shopper always sees their account, never the forms
  const current = account ? 'account' : view === 'account' ? 'login' : view;

  useEffect(() => {
    if (!modalOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeAuth();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      prevFocus?.focus?.();
    };
  }, [modalOpen, closeAuth]);

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-in" onClick={closeAuth} />

      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[calc(100dvh-0.75rem)] overflow-y-auto overscroll-contain animate-fade-in-up">
        <div className="flex items-center justify-between px-5 sm:px-7 pt-5 pb-2">
          <img src="/logo.png" alt="Fresh House" width={110} height={25} className="h-6 w-auto" />
          <button
            type="button"
            onClick={closeAuth}
            aria-label="Close"
            className="w-11 h-11 -mr-2 rounded-full hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {current === 'account' && account ? (
          <div className="px-5 sm:px-7 pb-6">
            <div className="flex items-center gap-3.5 pt-2">
              <span className="w-14 h-14 rounded-full bg-fresh-700 text-white text-2xl font-black flex items-center justify-center shrink-0" aria-hidden="true">
                {account.name.trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <h2 id="auth-title" className="text-lg font-black text-slate-900 truncate">
                  {account.name}
                </h2>
                <p className="text-sm text-slate-600 truncate">{account.phone}</p>
                {account.email && <p className="text-sm text-slate-500 truncate">{account.email}</p>}
              </div>
            </div>

            <div className="mt-5 grid gap-2">
              <Link
                href="/account"
                onClick={closeAuth}
                className="h-12 px-4 rounded-xl bg-fresh-50 hover:bg-fresh-100 border border-fresh-200 text-fresh-900 text-sm font-bold flex items-center gap-3 transition-colors"
              >
                <ReceiptText className="w-5 h-5 text-fresh-700" /> My orders
              </Link>
              <Link
                href="/track"
                onClick={closeAuth}
                className="h-12 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold flex items-center gap-3 transition-colors"
              >
                <PackageSearch className="w-5 h-5 text-slate-500" /> Track an order
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  closeAuth();
                }}
                className="h-12 px-4 rounded-xl bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-slate-700 hover:text-brand-700 text-sm font-bold flex items-center gap-3 transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" /> Sign out
              </button>
            </div>
          </div>
        ) : (
          <AuthForm view={current === 'register' ? 'register' : 'login'} onViewChange={setView} onDone={closeAuth} className="px-5 sm:px-7 pb-6" />
        )}
      </div>
    </div>
  );
}
