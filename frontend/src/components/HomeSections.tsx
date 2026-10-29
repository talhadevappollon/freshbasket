'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Banknote,
  Leaf,
  Clock,
  ShieldCheck,
  Sparkles,
  Flame,
  Milk,
  Croissant,
  CupSoda,
  Baby,
  Gift,
  ShoppingBasket,
  Check,
  ChevronDown,
  Plus,
  MessageCircle,
  Timer,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import { AISLES } from '@/data/aisles';
import { useCart } from '@/context/CartContext';
import { PLACEHOLDER_IMG } from '@/lib/placeholder';
import { Product } from '@/types';

/* ------------------------------------------------------------------ */
/* TrustMarquee                                                         */
/* ------------------------------------------------------------------ */

const MARQUEE_ITEMS = [
  'Free delivery over PKR 2,500',
  'Cash on delivery',
  '2-hour express slots',
  'Farm-fresh quality checks',
  'Almarai',
  'Gerber',
  'Yayycheese',
  'Al-Shifa honey',
];

export function TrustMarquee() {
  const half = (hidden: boolean) => (
    <ul className="flex items-center gap-10 pr-10 shrink-0" aria-hidden={hidden || undefined}>
      {MARQUEE_ITEMS.map(item => (
        <li key={item} className="flex items-center gap-10 text-sm font-semibold text-slate-700 whitespace-nowrap">
          <span>{item}</span>
          <Leaf className="w-4 h-4 text-fresh-500" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );

  return (
    <Reveal as="section" className="py-4" variant="zoom">
      <div
        className="marquee-track overflow-hidden border-y border-slate-200 bg-white py-3.5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
        aria-label="Why shop with Fresh House"
      >
        <div className="marquee-inner flex w-max animate-marquee">
          {half(false)}
          {half(true)}
        </div>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* BentoAisles                                                          */
/* ------------------------------------------------------------------ */

interface BentoTile {
  slug: string;
  title: string;
  blurb: string;
  gradient: string;
  Icon: React.ComponentType<{ className?: string }>;
  large?: boolean;
}

const BENTO_TILES: BentoTile[] = [
  {
    slug: AISLES.bestSelling.slug,
    title: 'This week’s best sellers',
    blurb: 'The groceries Karachi keeps adding to the basket, restocked every morning.',
    gradient: 'from-fresh-900 via-fresh-800 to-emerald-900',
    Icon: Flame,
    large: true,
  },
  {
    slug: AISLES.dairy.slug,
    title: 'Dairy & cheese',
    blurb: 'Milk, yogurt, butter and imported cheeses.',
    gradient: 'from-fresh-700 to-fresh-900',
    Icon: Milk,
  },
  {
    slug: AISLES.bakery.slug,
    title: 'Bakery',
    blurb: 'Breads, rolls and croissants.',
    gradient: 'from-brand-700 to-brand-900',
    Icon: Croissant,
  },
  {
    slug: AISLES.beverages.slug,
    title: 'Beverages',
    blurb: 'Juices, coconut water and cold coffee.',
    gradient: 'from-teal-800 to-cyan-900',
    Icon: CupSoda,
  },
  {
    slug: AISLES.baby.slug,
    title: 'Baby food',
    blurb: 'Organic purees and toddler snacks.',
    gradient: 'from-rose-800 to-fuchsia-900',
    Icon: Baby,
  },
];

export function BentoAisles() {
  return (
    <Reveal as="section" className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Shop by need</h2>
        <p className="text-sm text-slate-600 mt-1">Start from what’s for dinner, breakfast or the baby bag.</p>
      </div>

      <ul className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(150px,auto)] gap-3 sm:gap-4">
        {BENTO_TILES.map(tile => (
          <li key={tile.slug} className={tile.large ? 'col-span-2 lg:row-span-2' : ''}>
            <Link
              href={`/category/${tile.slug}`}
              data-surface="dark"
              className={`group relative flex h-full min-h-[150px] flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br ${tile.gradient} p-5 sm:p-6 text-white ring-0 ring-white/30 transition-shadow duration-300 hover:ring-2 hover:shadow-card-hover`}
            >
              <tile.Icon
                className={`absolute -right-4 -top-4 text-white/10 transition-transform duration-500 ease-out-expo group-hover:scale-110 group-hover:text-white/15 ${
                  tile.large ? 'w-56 h-56 lg:w-72 lg:h-72' : 'w-32 h-32'
                }`}
                aria-hidden="true"
              />
              <div className="relative">
                <h3
                  className={`font-black leading-tight transition-colors duration-200 group-hover:text-amber-200 ${
                    tile.large ? 'text-2xl sm:text-3xl max-w-sm' : 'text-lg'
                  }`}
                >
                  {tile.title}
                </h3>
                <p className={`mt-1.5 text-white/85 leading-snug ${tile.large ? 'text-base max-w-sm' : 'text-sm'}`}>{tile.blurb}</p>
                <span className="mt-3 inline-block text-sm font-semibold underline decoration-white/40 underline-offset-4 transition-colors duration-200 group-hover:decoration-amber-200 group-hover:text-amber-200">
                  Shop now
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* DealOfTheDay                                                         */
/* ------------------------------------------------------------------ */

export function DealOfTheDay({ product }: { product?: Product | null }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  if (!product) return null;

  const hasDiscount = !!product.compare_at_price && product.compare_at_price > product.price;

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Reveal as="section" className="max-w-7xl mx-auto px-4 py-10">
      <div
        data-surface="dark"
        className="grid lg:grid-cols-2 overflow-hidden rounded-3xl bg-gradient-to-br from-fresh-950 via-fresh-900 to-[#173216] text-white"
      >
        <div className="p-7 sm:p-10 flex flex-col justify-center">
          <span className="inline-flex items-center gap-1.5 self-start h-8 px-3 rounded-full bg-brand-600 text-white text-sm font-bold">
            <Timer className="w-4 h-4" />
            Featured pick
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight leading-tight">{product.name}</h2>
          <p className="mt-3 text-base text-emerald-100/85 max-w-md">
            A best seller from this week&apos;s baskets, checked for freshness and packed cold for delivery across Karachi.
          </p>
          <Link
            href={`/products/${product.slug}`}
            className="mt-6 self-start inline-flex items-center h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/20 text-sm font-bold transition-colors duration-200"
          >
            View product details
          </Link>
        </div>

        <div className="p-5 sm:p-8 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
          <div className="w-full max-w-sm rounded-3xl bg-white text-slate-900 p-5 shadow-2xl">
            <Link href={`/products/${product.slug}`} className="block rounded-2xl bg-slate-50 hover:bg-fresh-50 transition-colors duration-200 p-4">
              <img
                src={product.primary_image || PLACEHOLDER_IMG}
                alt={product.name}
                width={320}
                height={192}
                className="mx-auto h-48 w-full object-contain"
                onError={e => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                }}
              />
            </Link>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/products/${product.slug}`}
                  className="block text-base font-bold leading-snug line-clamp-2 hover:text-fresh-700 transition-colors duration-200"
                >
                  {product.name}
                </Link>
                <p className="mt-0.5 text-sm text-slate-600">{product.unit || '1 unit'}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-black tabular-nums">PKR {product.price.toLocaleString()}</p>
                {hasDiscount && (
                  <p className="text-sm text-slate-500 line-through tabular-nums">PKR {product.compare_at_price!.toLocaleString()}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              aria-live="polite"
              className={`mt-4 w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                added ? 'bg-emerald-100 text-emerald-900' : 'bg-fresh-700 text-white hover:bg-fresh-800 active:bg-fresh-900'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> Added
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add to basket
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* DualPromo                                                            */
/* ------------------------------------------------------------------ */

export function DualPromo() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <Reveal variant="left">
          <div
            data-surface="dark"
            className="group relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-fresh-800 via-fresh-700 to-emerald-800 p-7 sm:p-9 text-white"
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
            <div className="relative">
              <Truck className="w-9 h-9 text-emerald-200" aria-hidden="true" />
              <h3 className="mt-4 text-2xl sm:text-3xl font-black leading-tight">Free delivery over PKR 2,500</h3>
              <p className="mt-2 text-base text-emerald-50/90 max-w-sm">
                Fill the basket once and skip the delivery fee on the way out.
              </p>

              <div className="mt-6 max-w-sm" aria-hidden="true">
                <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full w-[70%] rounded-full bg-white" />
                </div>
                <p className="mt-2 text-sm text-emerald-50/90">Example basket: PKR 1,750, with PKR 750 to go.</p>
              </div>

              <Link
                href="/#products-section"
                className="mt-6 inline-flex items-center h-12 px-6 rounded-xl bg-white text-slate-950 text-sm font-bold hover:bg-emerald-50 active:bg-emerald-100 transition-colors duration-200"
              >
                Fill my basket
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal variant="right" delay={100}>
          <div
            data-surface="dark"
            className="group relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-7 sm:p-9 text-white"
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
            <Gift className="pointer-events-none absolute -right-6 -bottom-6 w-44 h-44 text-white/10" aria-hidden="true" />
            <div className="relative">
              <Sparkles className="w-9 h-9 text-amber-200" aria-hidden="true" />
              <h3 className="mt-4 text-2xl sm:text-3xl font-black leading-tight">Earn points on every order</h3>
              <p className="mt-2 text-base text-orange-50/95 max-w-sm">
                Join Perq Rewards for a first-order bonus, then turn your points into savings at checkout.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-orange-50">
                {['Points on every grocery order', 'First-order bonus on joining', 'Redeem at checkout'].map(point => (
                  <li key={point} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-200 shrink-0" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                href="/#products-section"
                className="mt-6 inline-flex items-center h-12 px-6 rounded-xl bg-white text-slate-950 text-sm font-bold hover:bg-amber-50 active:bg-amber-100 transition-colors duration-200"
              >
                Start earning
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* StatsBand                                                            */
/* ------------------------------------------------------------------ */

function CountUp({ to, decimals = 0, suffix = '' }: { to: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') {
      setValue(to);
      return;
    }

    let raf = 0;
    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        const duration = 1600;
        const start = performance.now();
        const frame = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setValue(to * eased);
          if (t < 1) raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return (
    <span ref={ref} className="tabular-nums">
      {formatted}
      {suffix}
    </span>
  );
}

const STATS = [
  { to: 15000, suffix: '+', label: 'Karachi families served', decimals: 0 },
  { to: 750, suffix: '+', label: 'Products in the store', decimals: 0 },
  { to: 90, suffix: ' min', label: 'Average delivery time', decimals: 0 },
  { to: 4.9, suffix: '/5', label: 'Average customer rating', decimals: 1 },
];

export function StatsBand() {
  return (
    <Reveal as="section" className="max-w-7xl mx-auto px-4 py-10">
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200">
        {STATS.map(stat => (
          <div key={stat.label} className="bg-white px-5 py-7 sm:py-9 text-center flex flex-col">
            <dt className="order-2 mt-1.5 text-sm text-slate-600">{stat.label}</dt>
            <dd className="text-3xl sm:text-4xl font-black text-fresh-800">
              <CountUp to={stat.to} decimals={stat.decimals} suffix={stat.suffix} />
            </dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* HowItWorks                                                           */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    Icon: ShoppingBasket,
    title: 'Pick your groceries',
    body: 'Browse 750+ products or search for exactly what you need, then add it to your basket.',
  },
  {
    Icon: Clock,
    title: 'Choose a delivery slot',
    body: 'Select express 2-hour delivery or a time that suits you anywhere in Karachi.',
  },
  {
    Icon: Banknote,
    title: 'Pay on arrival',
    body: 'Check your order at the door and pay our rider in cash. No advance payment.',
  },
];

export function HowItWorks() {
  return (
    <Reveal as="section" className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Groceries in three steps</h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2">From basket to doorstep without the supermarket queue.</p>
      </div>

      <div className="relative">
        <div
          className="hidden lg:block absolute top-7 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-fresh-200 via-fresh-400 to-fresh-200"
          aria-hidden="true"
        />
        <ol className="relative grid gap-8 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 120} className="text-center">
              <div className="relative mx-auto w-14 h-14 rounded-full bg-fresh-600 text-white flex items-center justify-center shadow-glow ring-4 ring-slate-50">
                <step.Icon className="w-6 h-6" aria-hidden="true" />
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border border-fresh-200 text-fresh-800 text-xs font-black flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-sm sm:text-base text-slate-600 max-w-xs mx-auto leading-relaxed">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* FaqSection                                                          */
/* ------------------------------------------------------------------ */

const FAQS = [
  {
    q: 'Which areas of Karachi do you deliver to?',
    a: 'We deliver across Karachi, including DHA, Clifton, Gulshan-e-Iqbal, PECHS, North Nazimabad, KDA Scheme 1, Gulistan-e-Jauhar and Bahria Town. Express orders usually arrive within 2 hours.',
  },
  {
    q: 'Is there a minimum order, and when is delivery free?',
    a: 'There is no strict minimum order. Delivery is free when your basket is over PKR 2,500; smaller baskets pay a flat delivery fee shown at checkout.',
  },
  {
    q: 'Can I pay cash on delivery?',
    a: 'Yes. Cash on delivery is available on every order, so you can check your groceries at the door and pay the rider afterwards.',
  },
  {
    q: 'What if something is not fresh?',
    a: 'Tell us on WhatsApp or by phone as soon as you open the order. If any fruit, vegetable or dairy item is not fresh, we replace it or refund it.',
  },
  {
    q: 'Can I order on WhatsApp instead of the website?',
    a: 'Yes. Send your grocery list, a photo of a handwritten note or a voice note to our WhatsApp number and a personal shopper will pack and deliver it.',
  },
  {
    q: 'Can I change or cancel an order after placing it?',
    a: 'You can change or cancel until the order is packed. Call or message us with your order details and we will update it straight away.',
  },
];

export function FaqSection() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Reveal as="section" className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Questions before you order</h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Quick answers about delivery, payment and freshness in Karachi. Can’t find yours? Ask us directly.
          </p>
          <a
            href="https://wa.me/923001234567"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 h-12 px-5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 active:bg-emerald-800 transition-colors duration-200"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            Ask on WhatsApp
          </a>
        </div>

        <div className="lg:col-span-8 space-y-3">
          {FAQS.map((item, i) => {
            const open = openIndex === i;
            const buttonId = `${baseId}-q-${i}`;
            const panelId = `${baseId}-a-${i}`;
            return (
              <div
                key={item.q}
                className={`rounded-2xl border transition-colors duration-200 ${
                  open ? 'bg-fresh-50 border-fresh-300' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? null : i)}
                    className={`w-full flex items-center justify-between gap-4 px-5 min-h-[56px] py-3 text-left text-base font-bold cursor-pointer transition-colors duration-200 ${
                      open ? 'text-fresh-900' : 'text-slate-900'
                    }`}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform duration-300 ease-out-expo ${
                        open ? 'rotate-180 text-fresh-700' : 'text-slate-500'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out-expo ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm sm:text-base text-slate-700 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* NewsletterBanner                                                     */
/* ------------------------------------------------------------------ */

export function NewsletterBanner() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText('FRESH10');
    } catch {
      /* clipboard can be blocked; the code is still visible on screen */
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2200);
  };

  return (
    <Reveal as="section" className="max-w-7xl mx-auto px-4 py-10">
      <div
        data-surface="dark"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fresh-950 via-fresh-900 to-[#173216] px-6 py-10 sm:px-12 sm:py-14 text-white"
      >
        <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-fresh-400/15 blur-3xl animate-blob" aria-hidden="true" />
        <div className="relative grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">Take 10% off your first order</h2>
            <p className="mt-3 text-base text-emerald-100/85 max-w-md">
              Add the code at checkout. Free delivery applies automatically on baskets over PKR 2,500.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:justify-end gap-3">
            <div className="flex items-center justify-between gap-4 h-12 pl-5 pr-1.5 rounded-xl bg-white/10 border border-dashed border-white/40 sm:min-w-[260px]">
              <span className="text-lg font-black tracking-widest text-white">FRESH10</span>
              <button
                type="button"
                onClick={copy}
                aria-live="polite"
                className={`h-9 min-w-[88px] px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-colors duration-200 cursor-pointer active:scale-95 ${
                  copied ? 'bg-emerald-400 text-slate-950' : 'bg-white text-slate-950 hover:bg-emerald-50'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" /> Copied
                  </>
                ) : (
                  'Copy code'
                )}
              </button>
            </div>
            <Link
              href="/#products-section"
              className="h-12 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-sm font-bold flex items-center justify-center transition-colors duration-200"
            >
              Start shopping
            </Link>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
