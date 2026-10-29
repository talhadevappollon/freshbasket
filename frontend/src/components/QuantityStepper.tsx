'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface Props {
  value: number;
  onChange: (next: number) => void;
  /** Lowest value the minus button can reach. With min 0 the minus becomes a bin at 1 (removes the line). */
  min?: number;
  max?: number;
  label?: string;
  size?: 'md' | 'lg';
  className?: string;
}

const HOLD_DELAY = 420;
const HOLD_INTERVAL = 90;

/** − / + stepper. Press and hold to repeat, keyboard and screen-reader friendly. */
export default function QuantityStepper({ value, onChange, min = 1, max = 99, label = 'quantity', size = 'md', className = '' }: Props) {
  const valueRef = useRef(value);
  valueRef.current = value;
  const timers = useRef<{ delay?: ReturnType<typeof setTimeout>; repeat?: ReturnType<typeof setInterval> }>({});

  const stop = useCallback(() => {
    clearTimeout(timers.current.delay);
    clearInterval(timers.current.repeat);
  }, []);
  useEffect(() => stop, [stop]);

  const step = useCallback(
    (dir: 1 | -1) => {
      const next = Math.min(max, Math.max(min, valueRef.current + dir));
      if (next === valueRef.current) {
        stop();
        return;
      }
      valueRef.current = next;
      onChange(next);
    },
    [min, max, onChange, stop]
  );

  const holdProps = (dir: 1 | -1) => ({
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      step(dir);
      stop();
      timers.current.delay = setTimeout(() => {
        timers.current.repeat = setInterval(() => step(dir), HOLD_INTERVAL);
      }, HOLD_DELAY);
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    // Keyboard activation (Enter / Space) arrives as a click with no pointer
    onClick: (e: React.MouseEvent) => {
      if (e.detail === 0) step(dir);
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  const btn = size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const atMin = value <= min;
  const removes = min === 0 && value <= 1;

  return (
    <div className={`inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-2xl p-1 shrink-0 select-none ${className}`} role="group" aria-label={label}>
      <button
        type="button"
        {...holdProps(-1)}
        disabled={atMin && !removes}
        aria-label={removes ? `Remove from ${label}` : `Decrease ${label}`}
        className={`${btn} rounded-xl bg-white text-gray-700 hover:bg-brand-50 hover:text-brand-700 active:scale-90 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-700 flex items-center justify-center transition shadow-xs cursor-pointer disabled:cursor-not-allowed touch-manipulation`}
      >
        {removes ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
      </button>
      <output aria-live="polite" className={`${size === 'lg' ? 'w-10 text-base' : 'w-8 text-sm'} text-center font-black text-gray-900 tabular-nums`}>
        {value}
      </output>
      <button
        type="button"
        {...holdProps(1)}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        className={`${btn} rounded-xl bg-fresh-600 text-white hover:bg-fresh-700 active:bg-fresh-800 active:scale-90 disabled:opacity-40 disabled:hover:bg-fresh-600 flex items-center justify-center transition shadow-xs cursor-pointer disabled:cursor-not-allowed touch-manipulation`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
