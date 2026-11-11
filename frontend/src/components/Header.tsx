'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Product, Category } from '@/types';
import { fetchProducts } from '@/lib/api';
import { PLACEHOLDER_IMG } from '@/lib/placeholder';
import AccountButton from '@/components/AccountButton';
import MobileTabBar from '@/components/MobileTabBar';
import WhatsAppFab from '@/components/WhatsAppFab';
import { useAuth } from '@/context/AuthContext';
import { CATEGORY_ICONS } from '@/data/categoryIcons';
import { FEATURED_AISLES, resolveCategory } from '@/data/aisles';
import {
  ShoppingBag,
  Search,
  Phone,
  Clock,
  X,
  Plus,
  Menu,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Milk,
  Croissant,
  CupSoda,
  Baby,
  ShoppingBasket,
  Truck,
  ShieldCheck,
  Loader2,
  PackageSearch,
  Crown,
} from 'lucide-react';

interface HeaderProps {
  categories: Category[];
}

/* ------------------------------------------------------------------ */
/* Data helpers                                                         */
/* ------------------------------------------------------------------ */

interface AisleGroup {
  key: string;
  name: string;
  parent?: Category;
  children: Category[];
  Icon: React.ComponentType<{ className?: string }>;
}

const ANNOUNCEMENTS = [
  'Same-day 2-hour delivery across Karachi',
  'Free delivery on orders over PKR 2,500',
  'Cash on delivery – pay when it arrives',
];

const POPULAR_SEARCHES = ['Mushrooms', 'Cheese', 'Milk', 'Honey', 'Coffee', 'Almond'];

function iconFor(name: string): AisleGroup['Icon'] {
  const n = name.toLowerCase();
  if (n.includes('dairy')) return Milk;
  if (n.includes('bakery')) return Croissant;
  if (n.includes('bever')) return CupSoda;
  if (n.includes('baby')) return Baby;
  return ShoppingBasket;
}

/**
 * Category names look like "Bakery/Bread & Loafs". Group them by the first segment so the
 * menu stays tidy whatever the API returns; standalone categories collect under "More categories".
 */
function buildGroups(categories: Category[]): AisleGroup[] {
  const map = new Map<string, { parent?: Category; children: Category[] }>();
  categories.forEach(cat => {
    const [head, ...rest] = cat.name.split('/');
    const key = head.trim();
    const entry = map.get(key) ?? { children: [] };
    if (rest.length === 0) entry.parent = cat;
    else entry.children.push(cat);
    map.set(key, entry);
  });

  const groups: AisleGroup[] = [];
  const singles: Category[] = [];
  map.forEach((entry, key) => {
    if (entry.children.length > 0) {
      groups.push({ key, name: key, parent: entry.parent, children: entry.children, Icon: iconFor(key) });
    } else if (entry.parent) {
      singles.push(entry.parent);
    }
  });
  if (singles.length > 0) {
    groups.push({ key: '__more', name: 'More categories', children: singles, Icon: ShoppingBasket });
  }
  return groups;
}

const childLabel = (cat: Category) => cat.name.split('/').slice(1).join(' / ').trim() || cat.name;

/* ------------------------------------------------------------------ */
/* Search                                                               */
/* ------------------------------------------------------------------ */

interface SearchBoxProps {
  inputRef: React.RefObject<HTMLInputElement>;
}

function SearchBox({ inputRef }: SearchBoxProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

  // Debounced live search; ignore out-of-order responses
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      setActive(-1);
      return;
    }
    setLoading(true);
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      const res = await fetchProducts({ search: q, per_page: 6 });
      if (id !== requestId.current) return;
      setResults(res.data);
      setActive(-1);
      setLoading(false);
      setOpen(true);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // "/" jumps to search from anywhere (except while typing in another field)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inputRef]);

  // Lets the mega menu push a popular search into the box
  useEffect(() => {
    const onFill = (e: Event) => {
      setQuery((e as CustomEvent<string>).detail);
      inputRef.current?.focus();
    };
    window.addEventListener('fb:search', onFill);
    return () => window.removeEventListener('fb:search', onFill);
  }, [inputRef]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown' && results.length) {
      e.preventDefault();
      setOpen(true);
      setActive(a => (a + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length) {
      e.preventDefault();
      setActive(a => (a <= 0 ? results.length - 1 : a - 1));
    } else if (e.key === 'Enter' && active >= 0 && results[active]) {
      e.preventDefault();
      router.push(`/products/${results[active].slug}`);
      setOpen(false);
    }
  };

  const showPanel = open && query.trim().length > 0;
  const showSuggestions = open && query.trim().length === 0;

  return (
    <div ref={wrapRef} className="relative w-full">
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <div className="relative group">
        <Search className="w-4.5 h-4.5 md:w-5 md:h-5 text-slate-400 md:text-slate-800 group-focus-within:text-fresh-600 transition-colors absolute left-4 md:left-auto md:right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id="site-search"
          name="q"
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="site-search-results"
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `search-opt-${active}` : undefined}
          autoComplete="off"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search fruits, veggies, dry fruits…"
          className="w-full h-10 sm:h-11 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 pl-11 pr-11 md:pl-6 md:pr-12 rounded-xl md:rounded-full md:h-[38px] md:bg-white md:hover:bg-white md:text-[14px] text-sm text-slate-900 placeholder-slate-500 outline-none transition-all duration-200 [&::-webkit-search-cancel-button]:hidden"
        />
        <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 text-fresh-600 animate-spin" aria-hidden="true" />}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="w-8 h-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {(showPanel || showSuggestions) && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-menu-in">
          {showSuggestions && (
            <div className="p-4">
              <p className="text-xs font-semibold text-slate-500 mb-2.5">Popular right now</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-3.5 h-9 rounded-full bg-slate-100 hover:bg-fresh-600 hover:text-white text-slate-800 text-sm font-medium transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showPanel && (
            <>
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-600" aria-live="polite">
                {loading ? 'Searching…' : results.length ? `${results.length} matching products` : `No products match “${query.trim()}”`}
              </div>
              <ul id="site-search-results" role="listbox" className="divide-y divide-slate-100 max-h-[22rem] overflow-y-auto">
                {results.map((p, i) => (
                  <li
                    key={p.id}
                    id={`search-opt-${i}`}
                    role="option"
                    aria-selected={i === active}
                    className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${i === active ? 'bg-fresh-50' : 'hover:bg-slate-50'}`}
                  >
                    <Link href={`/products/${p.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={p.primary_image || PLACEHOLDER_IMG}
                        alt=""
                        width={44}
                        height={44}
                        className="w-11 h-11 object-contain rounded-lg border border-slate-200 bg-white p-0.5 shrink-0"
                        loading="lazy"
                        onError={e => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                        }}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-900 truncate">{p.name}</span>
                        <span className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{p.unit}</span>
                          <span className="font-bold text-fresh-700">PKR {p.price.toLocaleString()}</span>
                        </span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => addToCart(p, 1)}
                      aria-label={`Add ${p.name} to basket`}
                      className="shrink-0 h-9 px-3 rounded-lg bg-fresh-600 hover:bg-fresh-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                               */
/* ------------------------------------------------------------------ */

export default function Header({ categories }: HeaderProps) {
  const { totalItems, subtotal, setIsCartOpen } = useCart();
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { openAuth, account } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  // desktop category row: the category whose sub-categories are showing in the hover panel
  const [menuKey, setMenuKey] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeGroupKey, setActiveGroupKey] = useState<string>('');
  const [openAccordion, setOpenAccordion] = useState<string>('');
  const [announceIdx, setAnnounceIdx] = useState(0);
  const [bumpKey, setBumpKey] = useState(0);
  // Phones: the search row tucks away while reading down the page and returns on the way back up
  const [searchTucked, setSearchTucked] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const tuckLock = useRef(0); // scroll events before this time (ms, performance.now) must not change the tucked state

  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const megaTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCount = useRef(totalItems);

  const groups = useMemo(() => buildGroups(categories), [categories]);
  const activeGroup = groups.find(g => g.key === activeGroupKey) ?? groups[0];

  // The category page currently shown, so its nav link can be highlighted
  const activeSlug = pathname.startsWith('/category/') ? decodeURIComponent(pathname.split('/')[2] || '') : '';

  const activeCategory = activeSlug ? resolveCategory(categories, activeSlug) : undefined;

  /** Every category opens its own page. */
  const go = useCallback(
    (slug: string) => {
      setMegaOpen(false);
      setDrawerOpen(false);
      router.push(`/category/${slug}`);
    },
    [router]
  );

  const goAllProducts = useCallback(() => {
    setMegaOpen(false);
    setDrawerOpen(false);
    if (pathname === '/') {
      const phone = window.matchMedia('(max-width: 767px)').matches;
      document.getElementById(phone ? 'products-section-m' : 'products-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#products-section');
    }
  }, [pathname, router]);

  // Condense on scroll
  useEffect(() => {
    let lastY = window.scrollY;
    let travel = 0; // signed distance scrolled since the direction last changed
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const dy = y - lastY;
      lastY = y;
      if (y < 120) {
        setSearchTucked(false);
        travel = 0;
        return;
      }
      // Collapsing the row shifts the page a little; ignore that and only react to a deliberate 40px swipe
      if (performance.now() < tuckLock.current) return;
      travel = Math.sign(dy) === Math.sign(travel) ? travel + dy : dy;
      if (travel > 40) {
        setSearchTucked(true);
        travel = 0;
        tuckLock.current = performance.now() + 400;
      } else if (travel < -40) {
        setSearchTucked(false);
        travel = 0;
        tuckLock.current = performance.now() + 400;
      }
    };
    // In-page jumps (category chips on the phone home page) tuck the header and hold it there while the page scrolls
    const onForceTuck = () => {
      if (window.scrollY < 120) return;
      setSearchTucked(true);
      tuckLock.current = performance.now() + 1400;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('fb:header-tuck', onForceTuck);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('fb:header-tuck', onForceTuck);
    };
  }, []);

  // How much of the header is on screen right now, so sticky bars below it can sit flush against it
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const apply = () => {
      const phone = window.matchMedia('(max-width: 767px)').matches;
      const tucked = phone && searchTucked && !searchFocused;
      document.documentElement.style.setProperty('--header-visible', `${el.offsetHeight - (tucked ? 48 : 0)}px`);
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [searchTucked, searchFocused]);

  // Keep anchor scrolling in sync with the real header height
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const apply = () => document.documentElement.style.setProperty('--header-offset', `${el.offsetHeight + 8}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Rotating announcement
  useEffect(() => {
    const t = setInterval(() => setAnnounceIdx(i => (i + 1) % ANNOUNCEMENTS.length), 4200);
    return () => clearInterval(t);
  }, []);

  // Cart badge bump when quantity rises
  useEffect(() => {
    if (totalItems > prevCount.current) setBumpKey(k => k + 1);
    prevCount.current = totalItems;
  }, [totalItems]);

  // Escape closes whichever layer is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (megaOpen) {
        setMegaOpen(false);
        megaTriggerRef.current?.focus();
      }
      if (drawerOpen) setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [megaOpen, drawerOpen]);

  // Drawer locks page scroll and takes focus
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerCloseRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  useEffect(() => {
    setMegaOpen(false);
    setDrawerOpen(false);
    setMenuKey(null);
  }, [pathname]);

  const openMega = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setMegaOpen(true), 90);
  };
  const closeMega = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setMegaOpen(false), 180);
  };

  const fillSearch = (term: string) => {
    setMegaOpen(false);
    setDrawerOpen(false);
    window.dispatchEvent(new CustomEvent('fb:search', { detail: term }));
  };

  return (
    <>
      {/* Announcement bar: ordinary page content above the sticky header, so it scrolls away by itself.
          (Collapsing it inside the sticky header changed the page height mid-scroll and made the header flicker.) */}
      <div
        data-surface="dark"
        className="bg-fresh-950 text-white md:hidden"
      >
        <div className="max-w-[1200px] mx-auto px-4 h-9 flex items-center justify-between gap-4 text-xs">
          <p className="hidden md:block flex-1 text-center font-medium tracking-wide text-emerald-50">
            Daily Harvest <span className="mx-1.5 text-emerald-300/60">|</span> Free Delivery Across Karachi on Orders Rs. 2,500+
          </p>
          <div className="md:hidden relative h-5 flex-1 min-w-0 overflow-hidden" role="status" aria-live="off">
            {ANNOUNCEMENTS.map((text, i) => (
              <p
                key={text}
                className={`absolute inset-0 flex items-center gap-2 font-medium text-emerald-50 transition-all duration-500 ease-out-expo ${
                  i === announceIdx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span className="truncate">{text}</span>
              </p>
            ))}
          </div>

          <div className="hidden items-center gap-5 text-emerald-100/90 shrink-0">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              8 AM – 11 PM daily
            </span>
            <a href="tel:+9221111373742" className="flex items-center gap-1.5 h-9 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-emerald-300" />
              +92 21 111-373-742
            </a>
            <Link href="/track" className="flex items-center gap-1.5 h-9 hover:text-white transition-colors">
              <PackageSearch className="w-3.5 h-3.5 text-emerald-300" />
              Track order
            </Link>
            <a href="/admin" className="flex items-center gap-1.5 h-9 text-emerald-200/70 hover:text-white transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" />
              Staff login
            </a>
          </div>
        </div>
      </div>

      <header
        ref={headerRef}
        data-tucked={searchTucked && !searchFocused ? 'true' : 'false'}
        className={`header-tuck sticky top-0 z-40 border-b md:border-b-0 md:pt-2 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-500 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl border-slate-200 shadow-card md:bg-transparent md:backdrop-blur-none md:shadow-none md:border-transparent'
            : 'bg-white border-slate-100 md:bg-transparent md:border-transparent'
        }`}
        onMouseLeave={() => {
          closeMega();
          setMenuKey(null);
        }}
        onMouseEnter={() => hoverTimer.current && clearTimeout(hoverTimer.current)}
      >
        {/* Main bar */}
        <div className="max-w-[1200px] mx-auto px-4 py-2 sm:py-3 md:py-0">
          <div
            className={`flex flex-wrap md:flex-nowrap items-center gap-x-3 gap-y-2 md:gap-4 md:px-5 md:py-2 md:rounded-2xl md:border md:transition-all md:duration-500 ${
              scrolled
                ? 'md:bg-[#cfeed4]/80 md:backdrop-blur-xl md:border-[#8fcf9b]/60 md:shadow-[0_12px_28px_-16px_rgba(8,40,24,0.3)]'
                : 'md:bg-gradient-to-r md:from-fresh-950 md:to-[#0f3a26] md:border-[#d9b25a]/40 md:shadow-[0_10px_24px_-14px_rgba(8,40,24,0.6)]'
            }`}
          >
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open category menu"
              aria-expanded={drawerOpen}
              className="lg:hidden order-1 w-11 h-11 -ml-2 rounded-xl text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link
              href="/"
              onClick={e => {
                if (pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="order-2 flex items-center gap-2 group shrink-0 mr-auto md:mr-0"
              aria-label="Fresh House – home"
            >
              <span className="relative block">
                <img
                  src="/logo.png"
                  alt="Fresh House"
                  width={150}
                  height={32}
                  decoding="async"
                  className="w-auto h-6 sm:h-7 md:h-[28px] transition-[transform,opacity] duration-500 ease-out-expo group-hover:scale-[1.03]"
                />
                <span
                  aria-hidden="true"
                  className={`hidden md:block absolute inset-0 transition-opacity duration-500 ${
                    scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                  style={{
                    background: 'linear-gradient(180deg,#f8e9ae 0%,#dcb355 38%,#a8741f 64%,#efcf7c 100%)',
                    WebkitMaskImage: 'url(/logo.png)',
                    maskImage: 'url(/logo.png)',
                    WebkitMaskSize: '100% 100%',
                    maskSize: '100% 100%',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                  }}
                />
              </span>
            </Link>

            <div
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`order-4 md:order-3 w-full md:w-auto md:flex-1 md:max-w-[460px] md:mx-auto max-md:transition-[opacity,transform,visibility] max-md:duration-300 ${
                searchTucked && !searchFocused ? 'max-md:opacity-0 max-md:-translate-y-2 max-md:invisible max-md:pointer-events-none' : ''
              }`}
            >
              <SearchBox inputRef={searchInputRef} />
            </div>

            <div className="order-3 md:order-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuth(account ? 'account' : 'register')}
                aria-haspopup="dialog"
                aria-label={account ? 'Fresh House Membership Club: open my account' : 'Join the Fresh House Membership Club'}
                className="hidden md:flex relative items-center h-[32px] rounded-full bg-[#b3e4b9] text-fresh-950 border border-[#d9b25a]/70 shadow-[0_0_0_2px_rgba(217,178,90,0.18)] hover:shadow-[0_0_0_2px_rgba(217,178,90,0.4)] transition-shadow duration-300 cursor-pointer"
              >
                <Crown className="absolute -top-2.5 right-4 w-4 h-4 text-[#d9ac4e] drop-shadow" strokeWidth={1.8} aria-hidden="true" />
                <span className="pl-3.5 pr-2.5 text-xs font-semibold whitespace-nowrap">Membership Club</span>
                <span className="h-[26px] mr-[3px] px-3 rounded-full bg-fresh-950 text-white text-xs font-bold flex items-center whitespace-nowrap">
                  {account ? 'My account' : 'Join Now'}
                </span>
              </button>
              <AccountButton />
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label={`Open basket, ${totalItems} item${totalItems === 1 ? '' : 's'}, PKR ${subtotal.toLocaleString()}`}
                className={`flex items-center gap-3 h-11 px-3 sm:px-4 rounded-xl active:scale-[0.97] text-white transition-all duration-300 cursor-pointer sheen bg-fresh-700 hover:bg-fresh-800 shadow-lg shadow-fresh-700/20 md:rounded-full md:w-[34px] md:h-[34px] md:px-0 md:justify-center md:bg-white md:text-slate-900 md:hover:bg-fresh-50 md:shadow-none`}
              >
                <span className="relative">
                  <ShoppingBag className="w-4 h-4" />
                  {totalItems > 0 && (
                    <span
                      key={bumpKey}
                      className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-brand-600 text-white ring-2 ring-fresh-700 md:ring-white text-[10px] font-black flex items-center justify-center animate-bump"
                    >
                      {totalItems}
                    </span>
                  )}
                </span>
                <span className="hidden sm:block md:hidden text-left leading-tight">
                  <span className="block text-[11px] text-emerald-200 font-medium">My basket</span>
                  <span className="block text-sm font-bold tabular-nums">PKR {subtotal.toLocaleString()}</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Category icon row, like the reference store: the all-categories menu, then each top-level category with its icon */}
        <nav aria-label="Shop by category" className="hidden lg:block">
          <div className="max-w-[1200px] mx-auto px-4 mt-0.5">
          <div className={`h-[44px] px-4 rounded-2xl flex items-center gap-3 transition-colors duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs' : 'bg-[#f3f4ef] border border-slate-200/70'}`}>
            <ul className="flex-1 min-w-0 flex items-center gap-2 overflow-x-scroll pb-0.5 cat-scroll">
              {FEATURED_AISLES.map(aisle => {
                const icon = CATEGORY_ICONS[aisle.name];
                const isActive = activeCategory !== undefined && activeCategory.slug === resolveCategory(categories, aisle.slug)?.slug;
                return (
                  <li key={aisle.slug} className="shrink-0" onMouseEnter={() => setMenuKey(aisle.slug)}>
                    <Link
                      href={`/category/${aisle.slug}`}
                      aria-current={isActive ? 'true' : undefined}
                      className={`group flex items-center gap-2 h-[34px] px-3 rounded-xl text-[14px] font-semibold whitespace-nowrap transition-colors duration-200 ${
                        isActive ? 'bg-white text-fresh-800 ring-1 ring-fresh-200 shadow-xs' : menuKey === aisle.slug ? 'text-fresh-600' : 'text-slate-800 hover:text-fresh-800 active:bg-fresh-50'
                      }`}
                    >
                      {icon ? (
                        <img
                          src={icon}
                          alt=""
                          width={36}
                          height={36}
                          loading="lazy"
                          decoding="async"
                          className={`w-7 h-7 object-contain transition-all duration-300 group-hover:scale-110 group-hover:grayscale-0 group-hover:saturate-150 ${isActive ? '' : 'grayscale contrast-125 brightness-75'}`}
                        />
                      ) : (
                        <CupSoda
                          className={`w-7 h-7 p-1 transition-all duration-300 group-hover:scale-110 group-hover:text-fresh-600 ${isActive ? 'text-fresh-600' : 'text-slate-600'}`}
                          strokeWidth={1.3}
                          aria-hidden="true"
                        />
                      )}
                      {aisle.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          </div>
        </nav>

        {/* Hover panel: the sub-categories of the category being pointed at, with their pictures */}
        {menuKey && (() => {
          const aisle = FEATURED_AISLES.find(a => a.slug === menuKey);
          const parent = aisle ? resolveCategory(categories, aisle.slug) : undefined;
          const kids = parent
            ? categories.filter(c => (c.parent_id === parent.id || c.name.startsWith(parent.name + '/')) && c.id !== parent.id && (c.total_products ?? c.products_count ?? 1) > 0)
            : [];
          if (kids.length === 0) return null;
          return (
            // Like the reference store: the panel opens in place on the page background, inside the page width,
            // and pushes the page down (no floating band or shadow)
            <div className="hidden lg:block bg-slate-50 animate-menu-in" onMouseEnter={() => setMenuKey(menuKey)}>
              <ul className="max-w-[1200px] mx-auto px-4 pt-3 pb-5 flex flex-wrap gap-x-[10px] gap-y-3" aria-label={`${aisle?.name} sub-categories`}>
                {kids.map(k => (
                  <li key={k.id} className="w-[105px]">
                    <Link href={`/category/${k.slug}`} className="group block text-center" onClick={() => setMenuKey(null)}>
                      <span className="block h-[80px] bg-white overflow-hidden flex items-center justify-center">
                        {k.preview_images?.[0] || k.image_url ? (
                          <img src={(k.preview_images?.[0] || k.image_url) as string} alt="" loading="lazy" className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <span className="text-2xl" aria-hidden="true">🛒</span>
                        )}
                      </span>
                      <span className="block mt-2 text-[12.5px] font-medium text-[#173c2a] leading-tight group-hover:text-fresh-600">{childLabel(k)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        {/* Mega menu panel */}
        {megaOpen && groups.length > 0 && activeGroup && (
          <div
            id="mega-panel"
            className="hidden lg:block absolute left-0 right-0 top-full bg-white border-t border-slate-100 shadow-2xl animate-menu-in"
          >
            <div className="max-w-[1200px] mx-auto px-4 py-7 grid grid-cols-12 gap-8 max-h-[calc(100vh-var(--header-offset)-1rem)] overflow-y-auto">
              {/* Groups */}
              <ul className="col-span-3 space-y-1" role="tablist" aria-label="Category groups">
                {groups.map(g => {
                  const isActive = g.key === activeGroup.key;
                  return (
                    <li key={g.key}>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onMouseEnter={() => setActiveGroupKey(g.key)}
                        onFocus={() => setActiveGroupKey(g.key)}
                        onClick={() => setActiveGroupKey(g.key)}
                        className={`w-full flex items-center gap-3 px-3 h-12 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-fresh-50 text-fresh-900 shadow-[inset_3px_0_0_0_theme(colors.fresh.600)]'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isActive ? 'bg-fresh-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <g.Icon className="w-4 h-4" />
                        </span>
                        <span className="flex-1 text-sm font-bold">{g.name}</span>
                        <ChevronRight
                          className={`w-4 h-4 transition-all duration-200 ${isActive ? 'text-fresh-700 translate-x-0.5' : 'text-slate-300'}`}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Sub-categories of the active group */}
              <div className="col-span-6" key={activeGroup.key} role="tabpanel">
                <div className="flex items-baseline justify-between pb-3 mb-4 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900">{activeGroup.name}</h3>
                  {activeGroup.parent && (
                    <Link
                      href={`/category/${activeGroup.parent.slug}`}
                      className="text-sm font-semibold text-fresh-700 hover:text-fresh-800 flex items-center gap-1 group"
                    >
                      Shop all {activeGroup.name}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>

                <ul className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                  {activeGroup.children.map((cat, i) => (
                    <li key={cat.id} className="animate-fade-in" style={{ animationDelay: `${i * 25}ms` }}>
                      <Link
                        href={`/category/${cat.slug}`}
                        className="flex items-center justify-between h-10 px-3 -mx-3 rounded-lg text-sm text-slate-700 hover:text-fresh-800 hover:bg-fresh-50 transition-colors group"
                      >
                        <span className="truncate">{activeGroup.key === '__more' ? cat.name : childLabel(cat)}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-fresh-600 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-2.5">People also search for</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map(term => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => fillSearch(term)}
                        className="px-3 h-8 rounded-full bg-slate-100 hover:bg-fresh-600 hover:text-white text-slate-700 text-sm font-medium transition-colors cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Single featured offer */}
              <div className="col-span-3">
                <div
                  className="relative h-full min-h-[220px] rounded-2xl bg-gradient-to-br from-fresh-900 via-fresh-800 to-fresh-950 text-white p-6 flex flex-col justify-between overflow-hidden"
                  data-surface="dark"
                >
                  <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-fresh-400/20 blur-2xl animate-blob" aria-hidden="true" />
                  <div className="relative">
                    <p className="text-sm font-semibold text-emerald-200">First order with us?</p>
                    <p className="mt-1 text-2xl font-black leading-tight">10% off your basket</p>
                    <p className="mt-2 text-sm text-emerald-100/80">Use code FRESH10 at checkout. Free delivery over PKR 2,500.</p>
                  </div>
                  <button
                    type="button"
                    onClick={goAllProducts}
                    className="relative mt-5 h-11 rounded-xl bg-white text-slate-950 text-sm font-bold hover:bg-emerald-50 active:scale-[0.98] transition cursor-pointer"
                  >
                    Start shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Dim the page behind the open mega menu */}
      {megaOpen && (
        <div
          className="hidden lg:block fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] animate-fade-in"
          onClick={() => setMegaOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile / tablet aisle drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-[55]" role="dialog" aria-modal="true" aria-label="Shop by category">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[86%] max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in-left">
            <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 shrink-0">
              <span className="text-lg font-black text-slate-900">Shop by category</span>
              <button
                ref={drawerCloseRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="w-11 h-11 -mr-2 rounded-xl hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              <button
                type="button"
                onClick={goAllProducts}
                className="w-full flex items-center gap-3 px-3 h-12 rounded-xl text-sm font-bold text-slate-900 hover:bg-slate-50 cursor-pointer"
              >
                <span className="w-8 h-8 rounded-lg bg-fresh-600 text-white flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </span>
                All products
              </button>

              {groups.map(g => {
                const expanded = openAccordion === g.key;
                return (
                  <div key={g.key}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setOpenAccordion(expanded ? '' : g.key)}
                      className="w-full flex items-center gap-3 px-3 h-12 rounded-xl text-sm font-bold text-slate-900 hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                        <g.Icon className="w-4 h-4" />
                      </span>
                      <span className="flex-1 text-left">{g.name}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out-expo ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                    >
                      <ul className="overflow-hidden pl-14 pr-2">
                        {g.parent && (
                          <li>
                            <button
                              type="button"
                              onClick={() => go(g.parent!.slug)}
                              className="w-full text-left h-11 text-sm font-semibold text-fresh-700 cursor-pointer"
                              tabIndex={expanded ? 0 : -1}
                            >
                              Shop all {g.name}
                            </button>
                          </li>
                        )}
                        {g.children.map(cat => (
                          <li key={cat.id}>
                            <button
                              type="button"
                              onClick={() => go(cat.slug)}
                              className="w-full text-left h-11 text-sm text-slate-700 hover:text-fresh-700 cursor-pointer"
                              tabIndex={expanded ? 0 : -1}
                            >
                              {g.key === '__more' ? cat.name : childLabel(cat)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="shrink-0 border-t border-slate-100 p-4 space-y-2 text-sm">
              <Link href="/track" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2 text-slate-800 font-semibold h-11">
                <PackageSearch className="w-4 h-4 text-fresh-600" /> Track your order
              </Link>
              <a href="tel:+9221111373742" className="flex items-center gap-2 text-slate-700 h-11">
                <Phone className="w-4 h-4 text-fresh-600" /> +92 21 111-373-742
              </a>
              <a href="/admin" className="flex items-center gap-2 text-slate-500 h-11">
                <ShieldCheck className="w-4 h-4" /> Staff login
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Phone navigation and the WhatsApp button */}
      <MobileTabBar onCategories={() => setDrawerOpen(true)} categoriesOpen={drawerOpen} />
      <WhatsAppFab />
    </>
  );
}
