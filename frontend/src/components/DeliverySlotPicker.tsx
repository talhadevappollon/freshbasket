'use client';

import React, { useMemo } from 'react';
import { CalendarDays, Zap, Clock } from 'lucide-react';
import { slotDays, windowsFor } from '@/data/deliverySlots';

interface Props {
  date: string;
  windowKey: string;
  onChange: (date: string, windowKey: string) => void;
}

/** Day tabs + time-window radio cards. Only windows that can still be met are offered. */
export default function DeliverySlotPicker({ date, windowKey, onChange }: Props) {
  const days = useMemo(() => slotDays(), []);
  const day = days.find(d => d.date === date) ?? days[0];
  const windows = useMemo(() => windowsFor(day), [day]);

  const pickDay = (d: (typeof days)[number]) => {
    const available = windowsFor(d);
    // Keep the chosen window when it exists on the new day, otherwise take the first one on offer
    const keep = available.find(w => w.key === windowKey) ?? available[0];
    onChange(d.date, keep ? keep.key : '');
  };

  return (
    <div className="space-y-3">
      <div role="tablist" aria-label="Delivery day" className="grid grid-cols-3 gap-2">
        {days.map(d => {
          const selected = d.date === day.date;
          return (
            <button
              key={d.date}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => pickDay(d)}
              className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center leading-tight transition-colors cursor-pointer ${
                selected
                  ? 'border-fresh-600 bg-fresh-50 text-fresh-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-fresh-300 hover:bg-fresh-50/40'
              }`}
            >
              <span className="text-sm font-bold">{d.label}</span>
              <span className="text-[11px] text-gray-500">{d.short}</span>
            </button>
          );
        })}
      </div>

      <div role="radiogroup" aria-label="Delivery time window" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {windows.map(w => {
          const selected = w.key === windowKey;
          return (
            <button
              key={w.key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(day.date, w.key)}
              className={`min-h-[52px] px-3 py-2 rounded-xl border-2 text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                selected
                  ? 'border-fresh-600 bg-fresh-50 text-fresh-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-fresh-300 hover:bg-fresh-50/40'
              }`}
            >
              <span
                className={`hidden min-[400px]:flex w-8 h-8 rounded-lg items-center justify-center shrink-0 ${selected ? 'bg-fresh-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                aria-hidden="true"
              >
                {w.key === 'asap' ? <Zap className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold whitespace-nowrap">{w.label}</span>
                {w.hint && <span className="block text-[11px] text-gray-500">{w.hint}</span>}
              </span>
            </button>
          );
        })}
        {windows.length === 0 && (
          <p className="col-span-full flex items-center gap-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3">
            <CalendarDays className="w-4 h-4 text-fresh-600 shrink-0" />
            No windows left for this day. Please pick another day.
          </p>
        )}
      </div>
    </div>
  );
}
