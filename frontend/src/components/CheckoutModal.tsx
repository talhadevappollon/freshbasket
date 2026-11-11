'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useDelivery } from '@/context/DeliveryContext';
import { KARACHI_AREAS } from '@/data/deliveryAreas';
import { submitCheckout } from '@/lib/api';
import { OrderCustomer } from '@/types';
import DeliverySlotPicker from '@/components/DeliverySlotPicker';
import { slotDays } from '@/data/deliverySlots';
import {
  X,
  CreditCard,
  Banknote,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ChevronDown,
  Tag,
  ArrowRight,
} from 'lucide-react';

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

  const { account, refreshAccount } = useAuth();
  const { location: deliverTo } = useDelivery();

  // Split name for First & Last name fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('Karachi');
  const [area, setArea] = useState('DHA Phase 6');
  const [postalCode, setPostalCode] = useState('75500');
  const [orderNotes, setOrderNotes] = useState('');
  const [saveInfo, setSaveInfo] = useState(true);
  const [emailOffers, setEmailOffers] = useState(true);

  // Delivery slot
  const [deliveryDate, setDeliveryDate] = useState(slotDays()[0]?.date || '');
  const [deliveryWindow, setDeliveryWindow] = useState('asap');

  // Payment method: 'card' | 'cod' | 'pos'
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'pos'>('cod');

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [sameBillingAddress, setSameBillingAddress] = useState(true);

  // Promo code
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0);
  const [discountMsg, setDiscountMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Lock body scroll
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

  // Autofill user account info
  useEffect(() => {
    if (!isCheckoutOpen || !account) return;
    if (account.name) {
      const parts = account.name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
    if (account.phone) {
      setPhone(account.phone);
      setEmailOrPhone(account.phone);
    }
    if (account.email && !emailOrPhone) {
      setEmailOrPhone(account.email);
    }
    if (account.delivery_city) setCity(account.delivery_city);
    if (account.delivery_area) setArea(account.delivery_area);
    if (account.delivery_address) setAddress(account.delivery_address);
  }, [isCheckoutOpen, account]);

  // Sync delivery area from header picker
  useEffect(() => {
    if (!isCheckoutOpen || !deliverTo) return;
    setCity(deliverTo.city);
    setArea(deliverTo.area);
  }, [isCheckoutOpen, deliverTo]);

  // Ensure slot stays valid
  useEffect(() => {
    if (!isCheckoutOpen) return;
    const days = slotDays();
    if (!days.some(d => d.date === deliveryDate)) {
      setDeliveryDate(days[0]?.date || '');
      setDeliveryWindow('asap');
    }
  }, [isCheckoutOpen, deliveryDate]);

  if (!isCheckoutOpen) return null;

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const code = discountCode.trim().toUpperCase();
    if (!code) return;
    if (code === 'FRESH10' || code === 'WELCOME10' || code === 'SAVE10') {
      const disc = Math.round(subtotal * 0.1);
      setDiscountApplied(disc);
      setDiscountMsg({ type: 'ok', text: `Promo code applied! Saved PKR ${disc.toLocaleString()}` });
    } else if (code === 'FRESH20' || code === 'SUPER20') {
      const disc = Math.round(subtotal * 0.2);
      setDiscountApplied(disc);
      setDiscountMsg({ type: 'ok', text: `20% Discount applied! Saved PKR ${disc.toLocaleString()}` });
    } else {
      setDiscountMsg({ type: 'err', text: 'Enter a valid coupon or gift code (try FRESH10)' });
    }
  };

  const finalDeliveryFee = subtotal >= 2500 ? 0 : 150;
  const finalTotal = Math.max(0, subtotal - discountApplied + finalDeliveryFee);

  const formatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 16);
    return raw.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 4);
    if (raw.length >= 3) return `${raw.substring(0, 2)} / ${raw.substring(2)}`;
    return raw;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) {
      setErrorMsg('Please enter your first and last name.');
      return;
    }

    const contactPhone = phone.trim() || (emailOrPhone.includes('@') ? '' : emailOrPhone.trim());
    if (!contactPhone) {
      setErrorMsg('Please provide a valid contact mobile phone number.');
      return;
    }

    const fullStreetAddress = apartment.trim()
      ? `${apartment.trim()}, ${address.trim()}`
      : address.trim();

    if (!fullStreetAddress) {
      setErrorMsg('Please provide your complete delivery address.');
      return;
    }

    if (paymentMethod === 'card') {
      const rawCard = cardNumber.replace(/\s/g, '');
      if (rawCard.length < 15) {
        setErrorMsg('Please enter a valid 16-digit credit/debit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMsg('Please enter a valid card expiry date (MM / YY).');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMsg('Please enter a valid 3-digit CVV security code.');
        return;
      }
      if (!cardName.trim()) {
        setErrorMsg('Please enter the name printed on your card.');
        return;
      }
    }

    const paymentLabel =
      paymentMethod === 'card'
        ? `Paid via Credit Card ending in ${cardNumber.replace(/\s/g, '').slice(-4) || '****'}`
        : paymentMethod === 'pos'
        ? 'Pay with Card upon Delivery (Rider POS machine)'
        : 'Cash on Delivery (COD)';

    const combinedNotes = [
      orderNotes.trim() ? `Note: ${orderNotes.trim()}` : '',
      `[Payment: ${paymentLabel}]`,
      discountApplied > 0 ? `[Discount: PKR ${discountApplied} (${discountCode})]` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const customerPayload: OrderCustomer = {
      customer_name: fullName,
      customer_phone: contactPhone,
      customer_email: emailOrPhone.includes('@') ? emailOrPhone.trim() : (account?.email || ''),
      delivery_city: city,
      delivery_area: area,
      delivery_address: `${fullStreetAddress}, ${area}, ${city} ${postalCode ? `(${postalCode})` : ''}`,
      order_notes: combinedNotes,
      delivery_date: deliveryDate,
      delivery_window: deliveryWindow,
    };

    setIsSubmitting(true);
    try {
      const res = await submitCheckout(customerPayload, items);
      if (res.success && res.order) {
        try {
          localStorage.setItem(
            'fb_last_order',
            JSON.stringify({ n: res.order.order_number, p: contactPhone })
          );
        } catch {}
        clearCart();
        if (account) refreshAccount();
        setIsCheckoutOpen(false);
        setCompletedOrder({
          ...res.order,
          payment_method: paymentMethod,
          subtotal,
          delivery_fee: finalDeliveryFee,
          discount: discountApplied,
          total: finalTotal,
        });
      } else {
        setErrorMsg(res.message || 'Error processing your order. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong during checkout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Checkout"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isSubmitting && setIsCheckoutOpen(false)}
      />

      {/* Main Modal Card */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full shadow-2xl z-10 max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain border border-gray-100 animate-menu-in">
        {/* Header Bar */}
        <div className="sticky top-0 bg-white/95 backdrop-blur z-20 px-5 sm:px-8 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Fresh Basket"
              className="h-6 sm:h-7 w-auto object-contain"
            />
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-fresh-50 text-fresh-700 border border-fresh-200">
              Secure Checkout
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-1.5 text-xs text-gray-500">
              <Lock className="w-3.5 h-3.5 text-fresh-600" />
              256-Bit SSL Encrypted
            </span>
            <button
              disabled={isSubmitting}
              onClick={() => setIsCheckoutOpen(false)}
              aria-label="Close checkout"
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="m-5 sm:m-8 mb-0 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Details (7 cols) */}
            <div className="lg:col-span-7 space-y-7">
              {/* Contact */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Contact</h3>
                  {!account && (
                    <span className="text-xs text-gray-500">
                      Already have an account?{' '}
                      <span className="text-fresh-700 font-semibold cursor-pointer">Log in</span>
                    </span>
                  )}
                </div>
                <div className="space-y-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Email or mobile phone number"
                    value={emailOrPhone}
                    onChange={e => setEmailOrPhone(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-2 focus:ring-fresh-500/20 focus:outline-none transition bg-white"
                  />
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={emailOffers}
                      onChange={e => setEmailOffers(e.target.checked)}
                      className="w-4 h-4 rounded text-fresh-600 focus:ring-fresh-500 border-gray-300"
                    />
                    <span>Email me with news, seasonal harvests and exclusive offers</span>
                  </label>
                </div>
              </section>

              {/* Delivery */}
              <section>
                <h3 className="text-base font-bold text-gray-900 tracking-tight mb-3">Delivery</h3>
                <div className="space-y-3">
                  {/* Country */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Country / Region
                    </label>
                    <div className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm bg-gray-50/70 text-gray-700 flex items-center font-medium">
                      Pakistan
                    </div>
                  </div>

                  {/* Name fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="First name"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-2 focus:ring-fresh-500/20 focus:outline-none transition bg-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Last name"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-2 focus:ring-fresh-500/20 focus:outline-none transition bg-white"
                    />
                  </div>

                  {/* Address */}
                  <input
                    type="text"
                    required
                    placeholder="Address (House/Flat #, Street, Block)"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-2 focus:ring-fresh-500/20 focus:outline-none transition bg-white"
                  />

                  {/* Apartment / Suite */}
                  <input
                    type="text"
                    placeholder="Apartment, suite, landmark, etc. (optional)"
                    value={apartment}
                    onChange={e => setApartment(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-2 focus:ring-fresh-500/20 focus:outline-none transition bg-white"
                  />

                  {/* City, Area, Postal Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <select
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-2 focus:ring-fresh-500/20 focus:outline-none transition bg-white font-medium"
                      >
                        <option value="Karachi">Karachi</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Islamabad">Islamabad</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={area}
                        onChange={e => setArea(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-2 focus:ring-fresh-500/20 focus:outline-none transition bg-white font-medium truncate"
                      >
                        {KARACHI_AREAS.map(a => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Postal code"
                        value={postalCode}
                        onChange={e => setPostalCode(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-2 focus:ring-fresh-500/20 focus:outline-none transition bg-white"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <input
                    type="tel"
                    inputMode="tel"
                    required
                    placeholder="Phone number (for delivery rider WhatsApp / Call)"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-2 focus:ring-fresh-500/20 focus:outline-none transition bg-white"
                  />

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-600 pt-1">
                    <input
                      type="checkbox"
                      checked={saveInfo}
                      onChange={e => setSaveInfo(e.target.checked)}
                      className="w-4 h-4 rounded text-fresh-600 focus:ring-fresh-500 border-gray-300"
                    />
                    <span>Save this information for next time</span>
                  </label>
                </div>
              </section>

              {/* Shipping Method */}
              <section>
                <h3 className="text-base font-bold text-gray-900 tracking-tight mb-2">
                  Shipping method
                </h3>
                <div className="border border-fresh-500/40 bg-fresh-50/40 p-3.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-fresh-600 text-white flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Standard Express Delivery ({city})</p>
                      <p className="text-[11px] text-gray-500">Delivered directly to your door in refrigerated temperature-controlled bags</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    {finalDeliveryFee === 0 ? (
                      <span className="text-fresh-700 uppercase tracking-wide">Free</span>
                    ) : (
                      `PKR ${finalDeliveryFee}`
                    )}
                  </span>
                </div>
              </section>

              {/* Delivery Slot */}
              <section>
                <h3 className="text-base font-bold text-gray-900 tracking-tight mb-2">
                  Delivery schedule
                </h3>
                <DeliverySlotPicker
                  date={deliveryDate}
                  windowKey={deliveryWindow}
                  onChange={(d, w) => {
                    setDeliveryDate(d);
                    setDeliveryWindow(w);
                  }}
                />
              </section>

              {/* Payment Section (Matching Fresh Basket Screenshot 15) */}
              <section>
                <div className="mb-2">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Payment</h3>
                  <p className="text-xs text-gray-500">All transactions are secure and encrypted.</p>
                </div>

                <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-200">
                  {/* 1. Credit Card Option */}
                  <div>
                    <label
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                        paymentMethod === 'card' ? 'bg-fresh-50/50' : 'hover:bg-gray-50/50'
                      }`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="w-4 h-4 text-fresh-600 focus:ring-fresh-500 border-gray-300"
                        />
                        <span className="text-sm font-semibold text-gray-900">Credit card</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-blue-900 text-white text-[10px] font-black tracking-wider">
                          VISA
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black tracking-wider">
                          MC
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-black tracking-wider">
                          PAYPAK
                        </span>
                      </div>
                    </label>

                    {/* Expandable card input fields */}
                    {paymentMethod === 'card' && (
                      <div className="p-4 bg-gray-50/70 border-t border-gray-200 space-y-3 animate-fade-in">
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Card number"
                            maxLength={19}
                            value={cardNumber}
                            onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                            className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-2 focus:ring-fresh-500/20 focus:outline-none transition bg-white"
                          />
                          <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Expiration date (MM / YY)"
                            maxLength={7}
                            value={cardExpiry}
                            onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-2 focus:ring-fresh-500/20 focus:outline-none transition bg-white"
                          />
                          <input
                            type="password"
                            inputMode="numeric"
                            placeholder="Security code (CVV)"
                            maxLength={4}
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-2 focus:ring-fresh-500/20 focus:outline-none transition bg-white"
                          />
                        </div>

                        <input
                          type="text"
                          placeholder="Name on card"
                          value={cardName}
                          onChange={e => setCardName(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-2 focus:ring-fresh-500/20 focus:outline-none transition bg-white"
                        />

                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-600 pt-1">
                          <input
                            type="checkbox"
                            checked={sameBillingAddress}
                            onChange={e => setSameBillingAddress(e.target.checked)}
                            className="w-4 h-4 rounded text-fresh-600 focus:ring-fresh-500 border-gray-300"
                          />
                          <span>Use shipping address as billing address</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* 2. Cash on Delivery (COD) Option */}
                  <div>
                    <label
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                        paymentMethod === 'cod' ? 'bg-fresh-50/50' : 'hover:bg-gray-50/50'
                      }`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="w-4 h-4 text-fresh-600 focus:ring-fresh-500 border-gray-300"
                        />
                        <div>
                          <span className="text-sm font-semibold text-gray-900 block">
                            Cash on Delivery (COD)
                          </span>
                          <span className="text-xs text-gray-500">
                            Pay in cash upon receiving groceries
                          </span>
                        </div>
                      </div>
                      <Banknote className="w-5 h-5 text-fresh-700" />
                    </label>
                  </div>

                  {/* 3. Pay with Card Upon Delivery Option */}
                  <div>
                    <label
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                        paymentMethod === 'pos' ? 'bg-fresh-50/50' : 'hover:bg-gray-50/50'
                      }`}
                      onClick={() => setPaymentMethod('pos')}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'pos'}
                          onChange={() => setPaymentMethod('pos')}
                          className="w-4 h-4 text-fresh-600 focus:ring-fresh-500 border-gray-300"
                        />
                        <div>
                          <span className="text-sm font-semibold text-gray-900 block">
                            Pay with card upon delivery
                          </span>
                          <span className="text-xs text-gray-500">
                            Rider will bring a POS swipe card machine to your door
                          </span>
                        </div>
                      </div>
                      <CreditCard className="w-5 h-5 text-gray-600" />
                    </label>
                  </div>
                </div>
              </section>

              {/* Rider Note */}
              <section>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Rider Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leave with security guard, call before ringing bell"
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-2 focus:ring-fresh-500/20 focus:outline-none transition bg-white"
                />
              </section>
            </div>

            {/* Right Column: Order Summary & Review (5 cols) */}
            <div className="lg:col-span-5 bg-gray-50/90 rounded-2xl p-5 sm:p-6 border border-gray-200/80 space-y-5 sticky top-24">
              <h3 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-200/80 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-normal text-gray-500">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </h3>

              {/* Scrollable Items List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-200/60 pr-1 space-y-2">
                {items.map(item => (
                  <div key={item.product.id} className="pt-2 flex items-center gap-3">
                    <div className="relative w-14 h-14 shrink-0 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center p-1">
                      <img
                        src={item.product.primary_image}
                        alt={item.product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                      <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-gray-500">{item.product.unit}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-gray-900">
                        PKR {(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code Input */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Discount code (e.g. FRESH10)"
                      value={discountCode}
                      onChange={e => setDiscountCode(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-2 focus:ring-fresh-500/20 focus:outline-none transition bg-white uppercase font-semibold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    className="h-10 px-4 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {discountMsg && (
                  <p
                    className={`mt-1.5 text-[11px] font-medium ${
                      discountMsg.type === 'ok' ? 'text-fresh-700' : 'text-rose-600'
                    }`}
                  >
                    {discountMsg.text}
                  </p>
                )}
              </div>

              {/* Breakdown */}
              <div className="pt-3 border-t border-gray-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    PKR {subtotal.toLocaleString()}
                  </span>
                </div>

                {discountApplied > 0 && (
                  <div className="flex justify-between text-fresh-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Discount ({discountCode})
                    </span>
                    <span>-PKR {discountApplied.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {finalDeliveryFee === 0 ? (
                      <span className="text-fresh-700 font-bold uppercase">Free</span>
                    ) : (
                      `PKR ${finalDeliveryFee}`
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-300 flex justify-between items-baseline text-gray-900">
                  <div>
                    <span className="text-sm font-black">Total</span>
                    <span className="block text-[10px] text-gray-500 font-normal">
                      Including taxes & delivery
                    </span>
                  </div>
                  <span className="text-lg font-black text-fresh-900">
                    PKR {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Pay Now Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm cursor-pointer shadow-lg shadow-fresh-600/25 flex items-center justify-center gap-2 transition"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {paymentMethod === 'card'
                          ? `Pay now • PKR ${finalTotal.toLocaleString()}`
                          : `Complete order • PKR ${finalTotal.toLocaleString()}`}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Guarantee badges */}
              <div className="pt-2 grid grid-cols-2 gap-2 text-[10px] text-gray-500 text-center">
                <div className="p-2 rounded-lg bg-white/80 border border-gray-200/60 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-fresh-600" />
                  <span>100% Guaranteed</span>
                </div>
                <div className="p-2 rounded-lg bg-white/80 border border-gray-200/60 flex items-center justify-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-fresh-600" />
                  <span>Cold-Chain Express</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
