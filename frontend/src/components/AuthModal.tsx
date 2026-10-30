'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Eye, EyeOff, Loader2, LogOut, PackageSearch, ReceiptText, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AccountError } from '@/lib/account';

const inputClass =
  'w-full h-12 px-4 rounded-xl border bg-white text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition';
const okInput = 'border-slate-200 hover:border-fresh-300 focus:border-fresh-500 focus:ring-fresh-500/15';
const badInput = 'border-brand-400 focus:border-brand-500 focus:ring-brand-500/15';

function Field({
  id,
  label,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label} {optional && <span className="font-normal text-slate-400">(optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] font-medium text-brand-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default function AuthModal() {
  const { account, modalOpen, view, setView, closeAuth, signIn, signUp, signOut } = useAuth();

  const [login, setLogin] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const firstField = useRef<HTMLInputElement>(null);

  // A signed-in shopper always sees their account, never the forms
  const current = account ? 'account' : view === 'account' ? 'login' : view;

  useEffect(() => {
    if (!modalOpen) return;
    setError('');
    setFields({});
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => firstField.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeAuth();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      prevFocus?.focus?.();
    };
  }, [modalOpen, closeAuth]);

  // switching tabs clears the errors of the other form
  useEffect(() => {
    setError('');
    setFields({});
  }, [current]);

  if (!modalOpen) return null;

  const fail = (e: unknown) => {
    if (e instanceof AccountError) {
      setFields(e.fields);
      setError(Object.keys(e.fields).length ? '' : e.message);
    } else {
      setError('Something went wrong. Please try again.');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFields({});

    const local: Record<string, string> = {};
    if (current === 'login') {
      if (!login.trim()) local.login = 'Enter your phone number or email.';
      if (!password) local.password = 'Enter your password.';
    } else {
      if (!name.trim()) local.name = 'Enter your name.';
      if (phone.replace(/\D/g, '').length < 10) local.phone = 'Enter your mobile number, for example 0300 1234567.';
      if (password.length < 6) local.password = 'Your password needs at least 6 characters.';
    }
    if (Object.keys(local).length) {
      setFields(local);
      return;
    }

    setBusy(true);
    try {
      if (current === 'login') await signIn(login.trim(), password);
      else await signUp({ name: name.trim(), phone: phone.trim(), email: email.trim() || undefined, password });
      setPassword('');
      closeAuth();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const cls = (key: string) => `${inputClass} ${fields[key] ? badInput : okInput}`;
  const describe = (key: string) => (fields[key] ? { 'aria-invalid': true as const, 'aria-describedby': `${key}-error` } : {});

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
          <form onSubmit={submit} noValidate className="px-5 sm:px-7 pb-6">
            <h2 id="auth-title" className="text-xl font-black tracking-tight text-slate-900">
              {current === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              {current === 'login' ? 'Sign in to check out faster and see your orders.' : 'Save your details for faster checkout and keep your orders in one place.'}
            </p>

            <div role="tablist" aria-label="Sign in or create account" className="mt-4 grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100">
              {(['login', 'register'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={current === v}
                  onClick={() => setView(v)}
                  className={`h-11 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    current === v ? 'bg-white text-fresh-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {v === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            {error && (
              <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 p-3 text-sm">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-4 space-y-3.5">
              {current === 'login' ? (
                <Field id="login" label="Phone number or email" error={fields.login}>
                  <input
                    id="login"
                    ref={firstField}
                    value={login}
                    onChange={e => setLogin(e.target.value)}
                    autoComplete="username"
                    inputMode="email"
                    placeholder="0300 1234567"
                    className={cls('login')}
                    {...describe('login')}
                  />
                </Field>
              ) : (
                <>
                  <Field id="name" label="Full name" error={fields.name}>
                    <input id="name" ref={firstField} value={name} onChange={e => setName(e.target.value)} autoComplete="name" placeholder="Hamza Tariq" className={cls('name')} {...describe('name')} />
                  </Field>
                  <Field id="phone" label="Mobile number" error={fields.phone}>
                    <input id="phone" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" placeholder="0300 1234567" className={cls('phone')} {...describe('phone')} />
                  </Field>
                  <Field id="email" label="Email" optional error={fields.email}>
                    <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="hamza@example.com" className={cls('email')} {...describe('email')} />
                  </Field>
                </>
              )}

              <Field id="password" label="Password" error={fields.password}>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete={current === 'login' ? 'current-password' : 'new-password'}
                    placeholder={current === 'login' ? 'Your password' : 'At least 6 characters'}
                    className={`${cls('password')} pr-12`}
                    {...describe('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </Field>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-5 w-full h-12 rounded-xl bg-fresh-700 hover:bg-fresh-800 active:bg-fresh-900 disabled:opacity-70 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-fresh-700/20"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {busy ? 'Please wait…' : current === 'login' ? 'Sign in' : 'Create account'}
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">You can still order without an account. Cash on delivery either way.</p>
          </form>
        )}
      </div>
    </div>
  );
}
