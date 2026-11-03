'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useDelivery } from '@/context/DeliveryContext';
import { DEFAULT_CITY, KARACHI_AREAS } from '@/data/deliveryAreas';

const selectClass =
  'w-full h-12 px-4 pr-9 rounded-xl border border-slate-200 hover:border-fresh-300 bg-white text-[15px] text-slate-900 focus:outline-none focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 transition appearance-none cursor-pointer bg-[length:18px] bg-[right_0.75rem_center] bg-no-repeat';
// the arrow is drawn into the background so the select looks the same in every browser
const ARROW = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

/** "Change Delivery Location": the same small window the reference store opens from "Deliver to". */
export default function DeliverToModal() {
  const { modalOpen, closeDeliver, location, setLocation } = useDelivery();
  const [area, setArea] = useState<string>(KARACHI_AREAS[4]);
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Opening the window starts from what is saved
  useEffect(() => {
    if (modalOpen) setArea(location?.area ?? KARACHI_AREAS[4]);
  }, [modalOpen, location]);

  useEffect(() => {
    if (!modalOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => confirmRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDeliver();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      prevFocus?.focus?.();
    };
  }, [modalOpen, closeDeliver]);

  if (!modalOpen) return null;

  const confirm = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation({ city: DEFAULT_CITY, area });
    closeDeliver();
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="deliver-title">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-in" onClick={closeDeliver} />

      <form onSubmit={confirm} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 sm:p-6 animate-menu-in">
        <button
          type="button"
          onClick={closeDeliver}
          aria-label="Close"
          className="absolute -top-3 -right-1 sm:-right-3 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="deliver-title" className="text-[1.4rem] leading-tight font-bold text-fresh-900 pb-3 border-b border-slate-200">
          Change Delivery Location
        </h2>

        <div className="mt-4 space-y-3.5">
          <div>
            <label htmlFor="ship-to" className="block text-sm font-bold text-slate-800 mb-1.5">
              Shipping to:
            </label>
            <select id="ship-to" defaultValue="khi" className={selectClass} style={{ backgroundImage: ARROW }}>
              <option value="khi">Karachi</option>
              {/* the store delivers in Karachi for now; the reference store's Nationwide option is a separate shop */}
              <option value="nw" disabled>
                Nationwide (coming soon)
              </option>
            </select>
          </div>

          <div>
            <label htmlFor="ship-area" className="block text-sm font-bold text-slate-800 mb-1.5">
              Area
            </label>
            <select id="ship-area" value={area} onChange={e => setArea(e.target.value)} className={selectClass} style={{ backgroundImage: ARROW }}>
              {KARACHI_AREAS.map(a => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          ref={confirmRef}
          type="submit"
          className="mt-5 w-full h-12 rounded-xl bg-fresh-700 hover:bg-fresh-800 active:bg-fresh-900 text-white text-[15px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-fresh-700/20"
        >
          Confirm <ArrowRight className="w-4.5 h-4.5" />
        </button>

        <p className="mt-3 text-center text-xs text-slate-500">Your area is saved on this device and filled in at checkout.</p>
      </form>
    </div>
  );
}
