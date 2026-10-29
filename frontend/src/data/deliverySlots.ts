// Delivery windows offered at checkout. Mirrors backend/app/Support/DeliverySlots.php: keep the keys in sync.

export interface SlotWindow {
  key: string;
  label: string;
  /** Hour the window ends (24h). Express has none. */
  end: number | null;
  hint?: string;
}

export const SLOT_WINDOWS: SlotWindow[] = [
  { key: 'asap', label: 'Express', end: null, hint: '60-90 min' },
  { key: '10:00-12:00', label: '10 AM - 12 PM', end: 12 },
  { key: '12:00-14:00', label: '12 PM - 2 PM', end: 14 },
  { key: '14:00-16:00', label: '2 PM - 4 PM', end: 16 },
  { key: '16:00-18:00', label: '4 PM - 6 PM', end: 18 },
  { key: '18:00-20:00', label: '6 PM - 8 PM', end: 20 },
];

export const MAX_DAYS_AHEAD = 2;

export function windowLabel(key?: string | null) {
  if (!key) return '';
  const w = SLOT_WINDOWS.find(s => s.key === key);
  return w ? (w.key === 'asap' ? 'Express (60-90 min)' : w.label) : '';
}

/** Calendar date and hour in Karachi, whatever timezone the shopper's device is in. */
export function karachiNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value);
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour') };
}

const pad = (n: number) => String(n).padStart(2, '0');

export interface SlotDay {
  /** YYYY-MM-DD */
  date: string;
  /** "Today", "Tomorrow", then the weekday */
  label: string;
  /** e.g. "Thu 30 Oct" */
  short: string;
  isToday: boolean;
}

export function slotDays(now = new Date()): SlotDay[] {
  const k = karachiNow(now);
  const base = Date.UTC(k.year, k.month - 1, k.day);
  return Array.from({ length: MAX_DAYS_AHEAD + 1 }, (_, i) => {
    const d = new Date(base + i * 86400000);
    const date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    const short = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }).format(d);
    const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long' }).format(d);
    return { date, label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekday, short, isToday: i === 0 };
  });
}

/** Windows still bookable for a day. Today's close one hour before they end; Express is today only. */
export function windowsFor(day: SlotDay, now = new Date()): SlotWindow[] {
  const { hour } = karachiNow(now);
  return SLOT_WINDOWS.filter(w => {
    if (w.key === 'asap') return day.isToday;
    if (day.isToday && w.end !== null && hour >= w.end - 1) return false;
    return true;
  });
}
