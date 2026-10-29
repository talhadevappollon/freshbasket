'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import ScrollUI from '@/components/ScrollUI';
import Reveal from '@/components/Reveal';
import { fetchCategories, fetchProducts } from '@/lib/api';
import { resolveCategory } from '@/data/aisles';
import { FEATURED_AISLES } from '@/data/aisles';
import { Category, Product } from '@/types';
import { ChevronRight, ArrowDown, SlidersHorizontal, SearchX, Truck, ShieldCheck, Banknote, ArrowRight } from 'lucide-react';

const PAGE_SIZE = 12;

// Placeholder slug of the generic shell page (see page.tsx): the real slug is read from the URL.
const SHELL_SLUG = '_';

interface Props {
  slug: string;
  initialName: string;
  initialDescription: string;
}

const lastSegment = (name: string) => name.split('/').pop()!.trim();

function humanize(slug: string) {
  return slug
    .replace(/^karachi-/, '')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-4" aria-hidden="true">
      <div className="skeleton h-40 rounded-2xl" />
      <div className="skeleton h-3 w-1/3 rounded mt-4" />
      <div className="skeleton h-4 w-5/6 rounded mt-2" />
      <div className="skeleton h-4 w-2/3 rounded mt-1.5" />
      <div className="flex items-center justify-between mt-5">
        <div className="skeleton h-5 w-20 rounded" />
        <div className="skeleton h-9 w-16 rounded-xl" />
      </div>
    </div>
  );
}

export default function CategoryPageClient({ slug: routeSlug, initialName, initialDescription }: Props) {
  // Pre-built pages know their slug; the shell reads it from the address bar once mounted
  const [slug, setSlug] = useState(routeSlug === SHELL_SLUG ? '' : routeSlug);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('latest');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [quickView, setQuickView] = useState<Product | null>(null);

  // Links may carry the bundled catalogue's slug (e.g. karachi-beverages) while the live API names the
  // same category differently (beverages): resolve by slug first, then by category name.
  const current = categoriesLoaded ? resolveCategory(categories, slug) : undefined;
  const activeSlug = current?.slug ?? slug;

  useEffect(() => {
    if (routeSlug !== SHELL_SLUG) return;
    const fromUrl = decodeURIComponent(window.location.pathname.split('/').filter(Boolean)[1] || '');
    setSlug(fromUrl);
  }, [routeSlug]);

  useEffect(() => {
    fetchCategories().then(cats => {
      setCategories(cats);
      setCategoriesLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!slug || !categoriesLoaded) return;
    if (!current) {
      setIsLoading(false); // unknown category: the "aisle not found" state is shown instead
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    fetchProducts({ category: activeSlug, sort: sortBy, per_page: PAGE_SIZE }).then(res => {
      if (cancelled) return;
      setProducts(res.data);
      setTotal(res.total);
      setPage(1);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, activeSlug, current, categoriesLoaded, sortBy]);

  const loadMore = async () => {
    if (!slug || !current) return;
    setIsLoadingMore(true);
    const next = page + 1;
    const res = await fetchProducts({ category: activeSlug, sort: sortBy, per_page: PAGE_SIZE * next });
    setProducts(res.data);
    setPage(next);
    setIsLoadingMore(false);
  };

  const fullName = current?.name || initialName || humanize(slug);
  const title = lastSegment(fullName);
  const groupName = fullName.includes('/') ? fullName.split('/')[0].trim() : '';
  const description = current?.description || initialDescription;

  // Sibling categories (same first segment) become quick filters between category pages
  const siblings = useMemo(() => {
    const head = (groupName || fullName).trim();
    const family = categories.filter(c => c.name.split('/')[0].trim() === head);
    const parent = family.find(c => !c.name.includes('/'));
    return { parent, children: family.filter(c => c.name.includes('/')) };
  }, [categories, fullName, groupName]);

  const otherAisles = FEATURED_AISLES.filter(a => a.slug !== slug && a.slug !== activeSlug).slice(0, 4);

  // Pages opened through the shell get their title once the category is known
  useEffect(() => {
    if (current) document.title = `${lastSegment(current.name)} — Fresh Basket Pakistan`;
  }, [current]);

  // The slug matches no category (typo, deleted aisle): say so instead of showing an empty shelf
  const notFound = slug !== '' && categoriesLoaded && !current;

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header categories={categories} />
        <main id="main-content" className="flex-1 pb-20 sm:pb-8">
          <div className="max-w-xl mx-auto px-4 py-20 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <SearchX className="w-7 h-7" />
            </div>
            <h1 className="mt-5 text-2xl font-black text-slate-900">We couldn&apos;t find that aisle</h1>
            <p className="mt-2 text-sm text-slate-600">
              The link may be out of date. Browse the whole store or head to one of our busiest aisles.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link
                href="/#products-section"
                className="inline-flex items-center h-11 px-5 rounded-xl bg-fresh-700 hover:bg-fresh-800 text-white text-sm font-bold transition-colors"
              >
                Browse all products
              </Link>
              {otherAisles.slice(0, 3).map(a => (
                <Link
                  key={a.slug}
                  href={`/category/${a.slug}`}
                  className="inline-flex items-center h-11 px-5 rounded-xl bg-white border border-slate-200 hover:border-fresh-400 text-slate-800 text-sm font-semibold transition-colors"
                >
                  {a.name}
                </Link>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header categories={categories} />
      <ScrollUI />

      <main id="main-content" className="flex-1 pb-20 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 pt-5">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-sm text-slate-500 mb-4">
            <Link href="/" className="hover:text-fresh-700 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            {groupName && siblings.parent ? (
              <>
                <Link href={`/category/${siblings.parent.slug}`} className="hover:text-fresh-700 transition-colors">
                  {groupName}
                </Link>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </>
            ) : (
              <>
                <span>Aisles</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </>
            )}
            <span aria-current="page" className="font-semibold text-slate-900">
              {title}
            </span>
          </nav>

          {/* Category banner */}
          <section
            data-surface="dark"
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fresh-950 via-fresh-900 to-[#0b3d22] text-white p-7 sm:p-10 animate-fade-in-up"
          >
            <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-fresh-400/15 blur-3xl animate-blob" aria-hidden="true" />
            <div className="absolute right-6 bottom-0 text-[9rem] leading-none opacity-[0.07] select-none font-black tracking-tighter hidden sm:block" aria-hidden="true">
              {title.charAt(0)}
            </div>

            <div className="relative max-w-2xl">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">{title}</h1>
              <p className="mt-3 text-sm sm:text-base text-emerald-100/85 leading-relaxed">
                {description ||
                  `Freshly stocked ${title.toLowerCase()} delivered across Karachi in as little as 2 hours, with Cash on Delivery.`}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-medium">
                <span className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-white/10 border border-white/15">
                  <Truck className="w-4 h-4 text-emerald-300" /> 2-hour express slots
                </span>
                <span className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-white/10 border border-white/15">
                  <Banknote className="w-4 h-4 text-emerald-300" /> Cash on delivery
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-white/10 border border-white/15">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" /> Quality checked
                </span>
              </div>
            </div>
          </section>

          {/* Sibling category chips */}
          {siblings.children.length > 0 && (
            <div className="mt-5 -mx-4 px-4 overflow-x-auto no-scrollbar">
              <ul className="flex items-center gap-2 w-max">
                {siblings.parent && (
                  <li>
                    <Link
                      href={`/category/${siblings.parent.slug}`}
                      aria-current={siblings.parent.slug === activeSlug ? 'page' : undefined}
                      className={`inline-flex items-center h-10 px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                        siblings.parent.slug === activeSlug
                          ? 'bg-fresh-700 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-fresh-400 hover:text-fresh-800'
                      }`}
                    >
                      All {groupName || title}
                    </Link>
                  </li>
                )}
                {siblings.children.map(c => (
                  <li key={c.id}>
                    <Link
                      href={`/category/${c.slug}`}
                      aria-current={c.slug === activeSlug ? 'page' : undefined}
                      className={`inline-flex items-center h-10 px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                        c.slug === activeSlug
                          ? 'bg-fresh-700 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-fresh-400 hover:text-fresh-800'
                      }`}
                    >
                      {lastSegment(c.name)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Toolbar */}
          <div className="mt-8 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-200">
            <p className="text-sm text-slate-600" aria-live="polite">
              {isLoading ? (
                'Loading products…'
              ) : (
                <>
                  Showing <strong className="text-slate-900">{products.length}</strong> of{' '}
                  <strong className="text-slate-900">{total}</strong> products
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <label htmlFor="category-sort" className="text-sm font-semibold text-slate-600">
                Sort by
              </label>
              <select
                id="category-sort"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="h-10 bg-white border border-slate-200 hover:border-fresh-400 text-sm font-semibold text-slate-800 rounded-xl px-3 focus:outline-none focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 cursor-pointer transition"
              >
                <option value="latest">Featured &amp; newest</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
                {products.map((product, idx) => (
                  <div
                    key={product.id}
                    className="animate-card-entrance"
                    style={{ animationDelay: `${(idx % PAGE_SIZE) * 40}ms` }}
                  >
                    <ProductCard product={product} onQuickView={setQuickView} />
                  </div>
                ))}
              </div>

              {products.length < total && (
                <div className="text-center mt-10">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-white border border-slate-200 hover:border-fresh-600 hover:bg-fresh-600 hover:text-white text-slate-800 text-sm font-bold shadow-sm active:scale-95 disabled:opacity-60 transition-all duration-200 cursor-pointer group"
                  >
                    {isLoadingMore ? 'Loading…' : `Show more (${total - products.length} left)`}
                    <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center bg-white rounded-3xl border border-slate-200 px-6 py-16">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                <SearchX className="w-7 h-7" />
              </div>
              <h2 className="mt-4 text-lg font-black text-slate-900">Nothing in {title} right now</h2>
              <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
                This aisle is being restocked. Browse the whole store or jump to one of our busiest aisles.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Link
                  href="/#products-section"
                  className="inline-flex items-center h-11 px-5 rounded-xl bg-fresh-700 hover:bg-fresh-800 text-white text-sm font-bold transition-colors"
                >
                  Browse all products
                </Link>
                {otherAisles.slice(0, 3).map(a => (
                  <Link
                    key={a.slug}
                    href={`/category/${a.slug}`}
                    className="inline-flex items-center h-11 px-5 rounded-xl bg-white border border-slate-200 hover:border-fresh-400 text-slate-800 text-sm font-semibold transition-colors"
                  >
                    {a.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Other aisles */}
          <Reveal className="mt-14">
            <h2 className="text-xl font-black text-slate-900 mb-4">Keep exploring</h2>
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {otherAisles.map(a => (
                <li key={a.slug}>
                  <Link
                    href={`/category/${a.slug}`}
                    className="group flex flex-col h-full p-5 rounded-2xl bg-white border border-slate-200 hover:border-fresh-400 hover:shadow-card-hover transition-all duration-300 ease-out-expo hover:-translate-y-1"
                  >
                    <span className="text-3xl" aria-hidden="true">
                      {a.emoji}
                    </span>
                    <span className="mt-3 text-base font-bold text-slate-900 group-hover:text-fresh-700 transition-colors">{a.name}</span>
                    <span className="mt-1 text-sm text-slate-600 leading-snug">{a.blurb}</span>
                    <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold text-fresh-700">
                      Shop aisle
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </main>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <Footer />
    </div>
  );
}
