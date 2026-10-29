import React from 'react';
import { Check, ClipboardCheck, PackageCheck, Truck, Home, XCircle } from 'lucide-react';

const STEPS = [
  { key: 'pending', label: 'Order placed', detail: 'We have your order', Icon: ClipboardCheck },
  { key: 'processing', label: 'Being packed', detail: 'Picking fresh items', Icon: PackageCheck },
  { key: 'dispatched', label: 'Out for delivery', detail: 'Rider is on the way', Icon: Truck },
  { key: 'delivered', label: 'Delivered', detail: 'Enjoy your groceries', Icon: Home },
] as const;

/** Progress of an order, driven by the real order_status from the store. */
export default function OrderTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div role="status" className="flex items-center gap-3 rounded-2xl bg-brand-50 border border-brand-200 text-brand-800 p-4">
        <XCircle className="w-6 h-6 shrink-0" />
        <div className="text-left">
          <p className="font-bold text-sm">This order was cancelled</p>
          <p className="text-xs text-brand-700">If you did not expect this, please contact support.</p>
        </div>
      </div>
    );
  }

  const current = Math.max(0, STEPS.findIndex(s => s.key === status));

  return (
    <ol className="flex flex-col sm:flex-row sm:items-start gap-0 sm:gap-2" aria-label="Order progress">
      {STEPS.map((step, i) => {
        const done = i < current || (i === current && status === 'delivered');
        const active = i === current && !done;
        return (
          <li key={step.key} aria-current={active ? 'step' : undefined} className="relative flex sm:flex-col sm:flex-1 sm:items-center gap-3 sm:gap-2 pb-6 sm:pb-0 last:pb-0">
            {/* connector */}
            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute left-5 top-10 bottom-0 w-0.5 sm:left-1/2 sm:top-5 sm:bottom-auto sm:h-0.5 sm:w-full sm:ml-5 ${i < current ? 'bg-fresh-500' : 'bg-gray-200'}`}
              />
            )}
            <span
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                done
                  ? 'bg-fresh-600 border-fresh-600 text-white'
                  : active
                    ? 'bg-white border-fresh-600 text-fresh-700 ring-4 ring-fresh-500/20'
                    : 'bg-white border-gray-200 text-gray-400'
              }`}
            >
              {done ? <Check className="w-5 h-5" strokeWidth={3} /> : <step.Icon className="w-4.5 h-4.5" />}
            </span>
            <span className="sm:text-center min-w-0">
              <span className={`block text-sm font-bold ${done || active ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</span>
              <span className={`block text-xs ${active ? 'text-fresh-700 font-semibold' : 'text-gray-400'}`}>{active ? 'In progress' : step.detail}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
