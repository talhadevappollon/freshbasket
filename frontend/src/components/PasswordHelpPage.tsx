'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, MailCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { useAuth } from '@/context/AuthContext';
import { AccountError, requestPasswordReset, resetPassword, setToken } from '@/lib/account';
import { fetchCategories } from '@/lib/api';
import { Category } from '@/types';

const inputClass =
  'w-full h-12 px-4 rounded-xl border bg-white text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition';
const okInput = 'border-slate-200 hover:border-fresh-300 focus:border-fresh-500 focus:ring-fresh-500/15';
const badInput = 'border-brand-400 focus:border-brand-500 focus:ring-brand-500/15';
const buttonClass =
  'mt-5 w-full h-12 rounded-xl bg-fresh-700 hover:bg-fresh-800 active:bg-fresh-900 disabled:opacity-70 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-fresh-700/20';

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 p-3 text-sm">
      <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

/** "Forgot password" (ask for an email link) and "Choose a new password" (from that link) for shopper accounts. */
export default function PasswordHelpPage({ mode }: { mode: 'forgot' | 'reset' }) {
  const router = useRouter();
  const { refreshAccount } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [email, setEmail] = useState('');
  const [token, setTokenParam] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [sent, setSent] = useState('');
  const [done, setDone] = useState(false);
  const [linkChecked, setLinkChecked] = useState(false);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = `${mode === 'forgot' ? 'Forgot password' : 'Choose a new password'} — Fresh House`;
    fetchCategories().then(setCategories);
    const q = new URLSearchParams(window.location.search);
    setEmail((q.get('email') || '').slice(0, 191));
    setTokenParam((q.get('token') || '').slice(0, 64));
    setLinkChecked(true);
    const t = setTimeout(() => firstField.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [mode]);

  const fail = (e: unknown) => {
    if (e instanceof AccountError) {
      setFields(e.fields);
      setError(Object.keys(e.fields).length ? '' : e.message);
    } else {
      setError('Something went wrong. Please try again.');
    }
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFields({});
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setFields({ email: 'Enter the email address of your account.' });
      return;
    }
    setBusy(true);
    try {
      const res = await requestPasswordReset(email.trim());
      setSent(res.message);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFields({});
    const local: Record<string, string> = {};
    if (password.length < 6) local.password = 'Your password needs at least 6 characters.';
    else if (password !== confirm) local.password_confirmation = 'The two passwords do not match.';
    if (Object.keys(local).length) {
      setFields(local);
      return;
    }
    setBusy(true);
    try {
      const res = await resetPassword({ email, token, password, password_confirmation: confirm });
      setToken(res.token);
      await refreshAccount();
      setDone(true);
      setTimeout(() => router.replace('/account'), 1800);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const cls = (key: string) => `${inputClass} ${fields[key] ? badInput : okInput}`;
  const describe = (key: string) => (fields[key] ? { 'aria-invalid': true as const, 'aria-describedby': `${key}-error` } : {});
  const fieldError = (key: string) =>
    fields[key] ? (
      <p id={`${key}-error`} className="mt-1.5 text-[13px] font-medium text-brand-700">
        {fields[key]}
      </p>
    ) : null;
  const linkBroken = mode === 'reset' && linkChecked && (!token || !email);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header categories={categories} />

      <main id="main-content" className="flex-1 w-full max-w-md mx-auto px-4 py-5 sm:py-10 pb-28 sm:pb-10">
        <Link href="/login" className="mb-3 -ml-1 h-10 px-1 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-fresh-800">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card px-5 sm:px-7 pt-6 pb-6">
          {mode === 'forgot' ? (
            sent ? (
              <div role="status">
                <MailCheck className="w-10 h-10 text-fresh-600" aria-hidden="true" />
                <h1 className="mt-3 text-xl font-black tracking-tight text-slate-900">Check your email</h1>
                <p className="mt-1.5 text-sm text-slate-600">{sent}</p>
                <p className="mt-3 text-sm text-slate-600">
                  No email after a few minutes? Your account may use your phone number only: call or WhatsApp us and we will help you sign in.
                </p>
                <button type="button" onClick={() => setSent('')} className="mt-4 text-sm font-semibold text-fresh-700 hover:underline underline-offset-4 cursor-pointer">
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={submitForgot} noValidate>
                <h1 className="text-xl font-black tracking-tight text-slate-900">Forgot your password?</h1>
                <p className="text-sm text-slate-600 mt-0.5">Enter the email address of your account and we will send you a link to choose a new password.</p>
                {error && <Alert>{error}</Alert>}
                <div className="mt-4">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input id="email" ref={firstField} type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="hamza@example.com" className={cls('email')} {...describe('email')} />
                  {fieldError('email')}
                </div>
                <button type="submit" disabled={busy} className={buttonClass}>
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {busy ? 'Please wait…' : 'Send the link'}
                </button>
              </form>
            )
          ) : done ? (
            <div role="status">
              <CheckCircle2 className="w-10 h-10 text-fresh-600" aria-hidden="true" />
              <h1 className="mt-3 text-xl font-black tracking-tight text-slate-900">Password changed</h1>
              <p className="mt-1.5 text-sm text-slate-600">You are signed in. Taking you to your account…</p>
            </div>
          ) : linkBroken ? (
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">This link is incomplete</h1>
              <p className="mt-1.5 text-sm text-slate-600">Open the link from the email again, or ask for a new one.</p>
              <Link href="/forgot-password" className={buttonClass}>Send me a new link</Link>
            </div>
          ) : (
            <form onSubmit={submitReset} noValidate>
              <h1 className="text-xl font-black tracking-tight text-slate-900">Choose a new password</h1>
              <p className="text-sm text-slate-600 mt-0.5">For {email || 'your account'}. You will be signed in straight after.</p>
              {(error || fields.token || fields.email) && (
                <Alert>
                  {fields.token || fields.email || error}{' '}
                  {(fields.token || fields.email) && (
                    <Link href={`/forgot-password?email=${encodeURIComponent(email)}`} className="font-bold underline underline-offset-2">Send a new link</Link>
                  )}
                </Alert>
              )}
              <div className="mt-4 space-y-3.5">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      id="password"
                      ref={firstField}
                      type={show ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      className={`${cls('password')} pr-12`}
                      {...describe('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShow(v => !v)}
                      aria-label={show ? 'Hide password' : 'Show password'}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                    >
                      {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldError('password')}
                </div>
                <div>
                  <label htmlFor="password_confirmation" className="block text-sm font-semibold text-slate-700 mb-1.5">New password again</label>
                  <input
                    id="password_confirmation"
                    type={show ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    className={cls('password_confirmation')}
                    {...describe('password_confirmation')}
                  />
                  {fieldError('password_confirmation')}
                </div>
              </div>
              <button type="submit" disabled={busy} className={buttonClass}>
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {busy ? 'Please wait…' : 'Save and sign in'}
              </button>
            </form>
          )}
        </div>
      </main>

      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <Footer />
    </div>
  );
}
