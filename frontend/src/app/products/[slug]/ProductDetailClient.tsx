'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PLACEHOLDER_IMG } from '@/lib/placeholder';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import QuantityStepper from '@/components/QuantityStepper';
import ProductImageViewer from '@/components/ProductImageViewer';
import { useCart } from '@/context/CartContext';
import { fetchCategories, fetchProductBySlug } from '@/lib/api';
import { Product, Category, ProductVariant } from '@/types';
import { maxOrderQuantity, unavailableLabel } from '@/lib/availability';
import {
  ShoppingCart,
  Truck,
  ShieldCheck,
  Banknote,
  CheckCircle2,
  ArrowLeft,
  Clock,
  Sparkles,
  Loader2,
  Star,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const routeSlug = params?.slug as string;
  // The shell page (products/_) serves products added after the last build: their slug is in the URL
  const [slug, setSlug] = useState(routeSlug === '_' ? '' : routeSlug);
  useEffect(() => {
    if (routeSlug === '_') setSlug(decodeURIComponent(window.location.pathname.split('/').filter(Boolean)[1] || ''));
    else setSlug(routeSlug);
  }, [routeSlug]);

  const { addToCart, setIsCheckoutOpen } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ctaVisible, setCtaVisible] = useState<boolean>(true);
  const ctaRef = useRef<HTMLDivElement>(null);

  // The mobile bar only appears once the main add-to-basket button has scrolled out of view
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting), { rootMargin: '0px 0px -64px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [product]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    fetchProductBySlug(slug).then(res => {
      if (res) {
        setProduct(res.product);
        setRelated(res.related);
        setActiveImage(res.product.primary_image || '');
        if (res.product.variants && res.product.variants.length > 0) {
          setSelectedVariant(res.product.variants[0]);
        }
      }
      setIsLoading(false);
    });
  }, [slug]);

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity, selectedVariant || undefined);
    setIsCheckoutOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header categories={categories} />
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin text-fresh-600 mb-3" />
          <p className="text-sm font-semibold">Loading Fresh Product Details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header categories={categories} />
        <div className="flex-1 max-w-md mx-auto py-24 text-center px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-xs text-gray-500 mb-6">The requested product could not be found or is out of season.</p>
          <Link href="/" className="bg-fresh-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow">
            Return to Supermarket
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  const details = (product.description || product.short_description || '').trim();

  const galleryImages = product.images && product.images.length > 0
    ? product.images.map(img => img.image_url)
    : [product.primary_image].filter(Boolean) as string[];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header categories={categories} />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-6 sm:py-8 pb-36 sm:pb-8">
        {/* Breadcrumb */}
        <div className="flex items-center flex-wrap space-x-2 text-xs text-gray-400 mb-4 sm:mb-6 font-medium min-h-11">
          <Link href="/" className="hover:text-fresh-600 transition flex items-center gap-1 min-h-11">
            <ArrowLeft className="w-3.5 h-3.5" /> Supermarket
          </Link>
          <span>/</span>
          <span className="text-gray-500">{product.brand || 'Fresh Produce'}</span>
          <span>/</span>
          <span className="text-gray-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Showcase Grid */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-10 mb-8 sm:mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Left Column: Image Gallery */}
            <div className="space-y-4">
              <ProductImageViewer
                images={galleryImages}
                activeImage={activeImage}
                onSelect={setActiveImage}
                alt={product.name}
                badge={
                  discount ? (
                    <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md z-10">
                      SAVE {discount}%
                    </span>
                  ) : null
                }
              />

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 rounded-2xl border-2 p-1 bg-slate-50 shrink-0 transition ${
                        activeImage === img ? 'border-fresh-600 shadow-md' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Information & Actions */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
                  {product.name}
                </h1>

                {/* Rating line like Fresh Basket reference */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <a href="#customer-reviews" className="text-xs text-slate-500 hover:text-fresh-700 font-medium hover:underline">
                    {product.slug === 'apple-green-local-1kg' ? '4 reviews' : 'Be the first to review'}
                  </a>
                </div>

                {/* Stock: in stock or not, never how many */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                  {unavailableLabel(product) ? (
                    <span className="inline-flex items-center gap-1 text-brand-700 font-bold bg-brand-50 px-2.5 py-0.5 rounded-full">
                      {unavailableLabel(product)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-fresh-600" />
                      In stock
                    </span>
                  )}
                </div>

                {/* Variant / Size Selector */}
                {product.variants && product.variants.length > 0 && (
                  <div className="my-5 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                        Select Option / Size:
                      </span>
                      <span className="text-xs font-bold text-fresh-700 bg-white px-2.5 py-0.5 rounded-full border border-fresh-200">
                        {selectedVariant?.title || product.variants[0].title}
                      </span>
                    </div>
                    <div
                      className={`grid gap-2.5 ${
                        product.variants.length === 2
                          ? 'grid-cols-2'
                          : product.variants.length === 4
                          ? 'grid-cols-2 sm:grid-cols-4'
                          : 'grid-cols-1 sm:grid-cols-3'
                      }`}
                    >
                      {product.variants.map(v => {
                        const isSelected = (selectedVariant?.id ?? product.variants![0].id) === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              setSelectedVariant(v);
                              if (v.image) setActiveImage(v.image);
                            }}
                            className={`p-3 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[64px] ${
                              isSelected
                                ? 'bg-fresh-600 text-white shadow-md shadow-fresh-600/30 ring-2 ring-fresh-600 scale-[1.02]'
                                : 'bg-white text-gray-800 border border-gray-200 hover:border-fresh-400 hover:bg-white'
                            }`}
                          >
                            <span className="text-xs font-bold leading-tight">
                              {v.title}
                            </span>
                            <span
                              className={`text-[12px] font-extrabold mt-1 ${
                                isSelected ? 'text-emerald-100' : 'text-fresh-800'
                              }`}
                            >
                              PKR {v.price.toLocaleString()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pricing Block */}
                <div className="my-6 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-baseline space-x-3">
                  <span className="text-3xl sm:text-4xl font-black text-gray-900">
                    PKR {(selectedVariant?.price ?? product.price).toLocaleString()}
                  </span>
                  {(selectedVariant?.compare_at_price ?? product.compare_at_price) &&
                    (selectedVariant?.compare_at_price ?? product.compare_at_price)! > (selectedVariant?.price ?? product.price) && (
                    <span className="text-base text-gray-400 line-through">
                      PKR {(selectedVariant?.compare_at_price ?? product.compare_at_price)!.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 font-medium">
                    / {selectedVariant?.unit || product.unit || '1 unit'} (Tax Included)
                  </span>
                </div>

                {/* Short Overview (admin: Short description) */}
                {(product.short_description || product.description) && (
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {product.short_description || product.description}
                  </p>
                )}
              </div>

              {/* Purchase Actions */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div ref={ctaRef} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {/* Quantity Stepper */}
                  <QuantityStepper
                    value={quantity}
                    min={1}
                    max={maxOrderQuantity(product)}
                    label="quantity"
                    size="lg"
                    className="w-full sm:w-auto justify-between"
                    onChange={setQuantity}
                  />

                  {/* Add to Cart + Buy it now: pill buttons side by side on every screen, as on the reference store */}
                  <div className="flex gap-3 sm:flex-1 min-w-0">
                    <button
                      onClick={() => addToCart(product, quantity, selectedVariant || undefined)}
                      disabled={!!unavailableLabel(product)}
                      className="flex-1 min-w-0 h-12 px-4 rounded-full bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 disabled:bg-[#fff4d6] disabled:text-[#8a5a00] disabled:shadow-none disabled:cursor-not-allowed text-white text-[15px] font-bold whitespace-nowrap shadow-lg shadow-fresh-600/25 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <ShoppingCart className="w-[18px] h-[18px] shrink-0 fill-current" aria-hidden="true" />
                      <span className="truncate">{unavailableLabel(product) ?? 'Add to Cart'}</span>
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={!!unavailableLabel(product)}
                      className="flex-1 min-w-0 h-12 px-4 rounded-full bg-[#bbe96f] hover:bg-[#addf5a] active:bg-[#a1d64c] disabled:opacity-40 disabled:cursor-not-allowed text-fresh-900 text-[15px] font-semibold whitespace-nowrap flex items-center justify-center transition-colors cursor-pointer"
                    >
                      Buy it now
                    </button>
                  </div>
                </div>

                {/* Karachi Assurance Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-gray-100 flex items-center space-x-2 text-xs">
                    <Clock className="w-4 h-4 text-fresh-600 shrink-0" />
                    <span className="text-[11px] text-gray-600 font-medium">Express 60-90 Min Karachi Slot</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-gray-100 flex items-center space-x-2 text-xs">
                    <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-[11px] text-gray-600 font-medium">Cash On Delivery at Doorstep</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-gray-100 flex items-center space-x-2 text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-[11px] text-gray-600 font-medium">Daily Inspected Fresh Quality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details: exactly the text saved in the admin panel (Products → Edit → Product details) */}
          {details && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex border-b border-gray-200 text-sm font-bold mb-6">
                <h2 className="pb-3 px-2 border-b-2 border-fresh-600 text-fresh-700">Product Details</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-4xl whitespace-pre-line">{details}</p>
            </div>
          )}
        </div>

        {/* Customer Reviews Section */}
        <ProductReviews product={product} />

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-12">
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-fresh-600" />
              <span>You Might Also Need</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {related.map(rel => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Sticky add-to-basket bar for phones, shown once the main button is off screen */}
      <div
        aria-hidden={ctaVisible}
        className={`sm:hidden fixed left-0 right-0 z-[39] bottom-[calc(5.75rem+env(safe-area-inset-bottom))] px-3 transition-all duration-300 ease-out-expo ${
          ctaVisible ? 'opacity-0 translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-2 pl-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 truncate">{product.name} {selectedVariant ? `(${selectedVariant.title})` : ''}</p>
            <p className="text-base font-black text-slate-900">PKR {((selectedVariant?.price ?? product.price) * quantity).toLocaleString()}</p>
          </div>
          <button
            type="button"
            tabIndex={ctaVisible ? -1 : 0}
            onClick={() => addToCart(product, quantity, selectedVariant || undefined)}
            disabled={!!unavailableLabel(product)}
            className="h-12 px-5 rounded-full bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 disabled:bg-slate-300 text-white text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ShoppingCart className="w-4 h-4 fill-current" aria-hidden="true" />
            {unavailableLabel(product) ?? 'Add to Cart'}
          </button>
        </div>
      </div>

      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <Footer />
    </div>
  );
}

