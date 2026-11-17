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
import { fetchCategories, submitContactInquiry } from '@/lib/api';
import { WHATSAPP_NUMBER } from '@/data/homeOffers';
import { Category } from '@/types';
import { MessageSquare, Loader2, AlertCircle, CheckCircle2, Phone, Clock, PackageSearch, Send } from 'lucide-react';

const TOPICS = ['Order issue', 'Delivery question', 'Product question', 'Membership & plans', 'Feedback', 'Other'];

type Field = 'name' | 'phone' | 'email' | 'subject' | 'order_number' | 'message';
const EMPTY: Record<Field, string> = { name: '', phone: '', email: '', subject: '', order_number: '', message: '' };

const inputClass =
  'w-full h-12 px-4 rounded-xl border border-gray-200 hover:border-fresh-300 text-sm bg-white focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none transition aria-[invalid=true]:border-brand-400';

export default function ContactPage() {
  const { account } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Record<Field, string>>(EMPTY);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ name: string; message: string } | null>(null);

  useEffect(() => {
    document.title = 'Contact us — Fresh House';
    fetchCategories().then(setCategories);
  }, []);

  // Signed-in customers start with their details filled in
  useEffect(() => {
    if (!account) return;
    setForm(f => ({
      ...f,
      name: f.name || account.name || '',
      phone: f.phone || account.phone || '',
      email: f.email || account.email || '',
    }));
  }, [account]);

  const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<Field, string>> = {};
    if (!form.name.trim()) e.name = 'Enter your name.';
    if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter your mobile number, for example 0300 1234567.';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address, or leave it empty.';
    if (!form.subject) e.subject = 'Choose what your message is about.';
    if (form.message.trim().length < 10) e.message = 'Tell us a little more (at least 10 characters).';
    return e;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`contact-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setSending(true);
    const res = await submitContactInquiry({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      subject: form.subject,
      order_number: form.order_number.trim() || undefined,
      message: form.message.trim(),
      website: honeypot,
    });
    setSending(false);

    if (res.ok) {
      setSent({ name: form.name.trim().split(/\s+/)[0], message: res.message });
      setForm(f => ({ ...EMPTY, name: f.name, phone: f.phone, email: f.email }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (res.error === 'validation' && res.fields) {
      const fromServer: Partial<Record<Field, string>> = {};
      (Object.keys(EMPTY) as Field[]).forEach(k => {
        if (res.fields?.[k]?.[0]) fromServer[k] = res.fields[k][0];
      });
      setErrors(fromServer);
      setFormError(Object.keys(fromServer).length ? 'Please check the highlighted fields.' : 'We could not send your message. Please try again.');
    } else {
      setFormError(
        res.error === 'rate_limited'
          ? 'Too many messages in a short time. Please wait a minute and try again.'
          : res.error === 'network'
            ? 'We could not reach the store. Check your connection and try again.'
            : 'Something went wrong on our side. Please try again, or message us on WhatsApp.'
      );
    }
  };

  const fieldProps = (field: Field) => ({
    id: `contact-${field}`,
    value: form[field],
    onChange: set(field),
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `contact-${field}-error` : undefined,
  });

  const errorText = (field: Field) =>
    errors[field] ? (
      <p id={`contact-${field}-error`} className="mt-1.5 text-xs font-medium text-brand-700">
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header categories={categories} />
      <ScrollUI />

      <main id="main-content" className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 pb-24 sm:pb-12">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-fresh-600 text-white flex items-center justify-center shadow-lg shadow-fresh-600/25">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Contact us</h1>
          <p className="mt-2 text-sm text-slate-600">Questions about an order, a product or a membership plan? Send us a message and our team will get back to you.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
          {sent ? (
            <section role="status" className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-10 text-center animate-fade-in-up">
              <CheckCircle2 className="w-14 h-14 mx-auto text-fresh-600" />
              <h2 className="mt-4 text-2xl font-black text-slate-900">Thanks{sent.name ? `, ${sent.name}` : ''}! Your message is with us.</h2>
              <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
                {sent.message || 'Our support team will get in touch with you shortly.'}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSent(null)}
                  className="h-11 px-5 rounded-xl border border-slate-200 hover:border-fresh-400 text-slate-800 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Send another message
                </button>
                <Link href="/" className="h-11 px-5 rounded-xl bg-fresh-700 hover:bg-fresh-800 text-white text-sm font-bold flex items-center transition-colors">
                  Continue shopping
                </Link>
              </div>
            </section>
          ) : (
            <form onSubmit={onSubmit} noValidate className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-5 sm:p-8 space-y-5">
              {formError && (
                <div role="alert" className="flex items-start gap-3 rounded-2xl bg-brand-50 border border-brand-200 text-brand-800 p-4 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Full name
                  </label>
                  <input {...fieldProps('name')} type="text" autoComplete="name" maxLength={191} placeholder="Your name" className={inputClass} />
                  {errorText('name')}
                </div>
                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Phone number
                  </label>
                  <input {...fieldProps('phone')} type="tel" inputMode="tel" autoComplete="tel" maxLength={50} placeholder="0300 1234567" className={inputClass} />
                  {errorText('phone')}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input {...fieldProps('email')} type="email" autoComplete="email" maxLength={191} placeholder="you@example.com" className={inputClass} />
                  {errorText('email')}
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    What is it about?
                  </label>
                  <select {...fieldProps('subject')} className={`${inputClass} cursor-pointer ${form.subject ? 'text-slate-900' : 'text-slate-400'}`}>
                    <option value="" disabled>
                      Choose a topic
                    </option>
                    {TOPICS.map(t => (
                      <option key={t} value={t} className="text-slate-900">
                        {t}
                      </option>
                    ))}
                  </select>
                  {errorText('subject')}
                </div>
              </div>

              <div>
                <label htmlFor="contact-order_number" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Order number <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input {...fieldProps('order_number')} type="text" autoComplete="off" autoCapitalize="characters" maxLength={50} placeholder="FB-ABC123" className={`${inputClass} font-mono uppercase sm:max-w-xs`} />
                {errorText('order_number')}
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Your message
                </label>
                <textarea
                  {...fieldProps('message')}
                  rows={6}
                  maxLength={5000}
                  placeholder="How can we help?"
                  className={`${inputClass} h-auto py-3 leading-relaxed resize-y`}
                />
                {errorText('message')}
              </div>

              {/* Honeypot for bots: hidden from people and screen readers */}
              <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                <label htmlFor="contact-website">Website</label>
                <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <p className="text-xs text-slate-500">We only use these details to answer your message.</p>
                <button
                  type="submit"
                  disabled={sending}
                  className="h-12 px-7 rounded-xl bg-fresh-700 hover:bg-fresh-800 active:bg-fresh-900 disabled:opacity-60 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors w-full sm:w-auto"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? 'Sending…' : 'Send message'}
                </button>
              </div>
            </form>
          )}

          <aside aria-label="Other ways to reach us" className="space-y-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 rounded-2xl bg-white border border-slate-200/80 hover:border-fresh-400 shadow-card p-4 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-fresh-600 shrink-0 mt-0.5" />
              <span>
                <span className="block text-sm font-bold text-slate-900">Chat on WhatsApp</span>
                <span className="block text-xs text-slate-500">Quickest for order questions</span>
              </span>
            </a>
            <a href="tel:+9221111373742" className="flex items-start gap-3 rounded-2xl bg-white border border-slate-200/80 hover:border-fresh-400 shadow-card p-4 transition-colors">
              <Phone className="w-5 h-5 text-fresh-600 shrink-0 mt-0.5" />
              <span>
                <span className="block text-sm font-bold text-slate-900">Call us</span>
                <span className="block text-xs text-slate-500">+92 21 111-373-742</span>
              </span>
            </a>
            <div className="flex items-start gap-3 rounded-2xl bg-white border border-slate-200/80 shadow-card p-4">
              <Clock className="w-5 h-5 text-fresh-600 shrink-0 mt-0.5" />
              <span>
                <span className="block text-sm font-bold text-slate-900">Opening hours</span>
                <span className="block text-xs text-slate-500">8 AM – 11 PM daily</span>
              </span>
            </div>
            <Link href="/track" className="flex items-start gap-3 rounded-2xl bg-white border border-slate-200/80 hover:border-fresh-400 shadow-card p-4 transition-colors">
              <PackageSearch className="w-5 h-5 text-fresh-600 shrink-0 mt-0.5" />
              <span>
                <span className="block text-sm font-bold text-slate-900">Track your order</span>
                <span className="block text-xs text-slate-500">See where your delivery is</span>
              </span>
            </Link>
          </aside>
        </div>
      </main>

      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <Footer />
    </div>
  );
}
