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
import QuantityStepper from '@/components/QuantityStepper';
import { useCart } from '@/context/CartContext';
import { fetchCategories, fetchProductBySlug } from '@/lib/api';
import { Product, Category } from '@/types';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  Banknote,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Clock,
  Sparkles,
  Barcode,
  Loader2,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addToCart, setIsCheckoutOpen } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'delivery'>('desc');
  const [copied, setCopied] = useState<boolean>(false);
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
      }
      setIsLoading(false);
    });
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
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

  const galleryImages = product.images && product.images.length > 0
    ? product.images.map(img => img.image_url)
    : [product.primary_image].filter(Boolean) as string[];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header categories={categories} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 pb-36 sm:pb-8">
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
              <div className="relative bg-slate-50 rounded-3xl border border-gray-100 p-8 flex items-center justify-center h-64 sm:h-96 overflow-hidden group">
                {discount && (
                  <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md z-10">
                    SAVE {discount}%
                  </span>
                )}
                <img
                  src={activeImage || product.primary_image || PLACEHOLDER_IMG}
                  alt={product.name}
                  className="max-h-72 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

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
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
                    {product.brand || 'Fresh House'}
                  </span>
                  <button
                    onClick={handleShare}
                    className="text-xs text-gray-500 hover:text-fresh-600 flex items-center gap-1 font-semibold h-11 px-2 -mr-2 rounded-lg cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copied ? 'Link Copied!' : 'Share'}</span>
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
                  {product.name}
                </h1>

                {/* SKU, Barcode, Stock */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1 font-mono">
                    <Barcode className="w-4 h-4 text-gray-500" />
                    <span>SKU: {product.sku}</span>
                  </span>
                  {product.barcode && (
                    <span className="font-mono text-gray-500">
                      Barcode: {product.barcode}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-fresh-600" />
                    {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : 'Low Stock'}
                  </span>
                </div>

                {/* Pricing Block */}
                <div className="my-6 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-baseline space-x-3">
                  <span className="text-3xl sm:text-4xl font-black text-gray-900">
                    PKR {product.price.toLocaleString()}
                  </span>
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <span className="text-base text-gray-400 line-through">
                      PKR {product.compare_at_price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 font-medium">
                    / {product.unit || '1 unit'} (Tax Included)
                  </span>
                </div>

                {/* Short Overview */}
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {product.short_description || product.description || 'Premium quality fresh grocery directly sourced by Fresh House.'}
                </p>
              </div>

              {/* Purchase Actions */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div ref={ctaRef} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {/* Quantity Stepper */}
                  <QuantityStepper
                    value={quantity}
                    min={1}
                    max={product.stock_quantity > 0 ? product.stock_quantity : 99}
                    label="quantity"
                    size="lg"
                    className="w-full sm:w-auto justify-between"
                    onChange={setQuantity}
                  />

                  {/* Add to Cart */}
                  <button
                    onClick={() => addToCart(product, quantity)}
                    className="flex-1 h-12 bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 text-white px-6 rounded-2xl font-bold text-sm shadow-xl shadow-fresh-600/25 flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add To Basket &bull; PKR {(product.price * quantity).toLocaleString()}</span>
                  </button>

                  {/* Buy Now COD */}
                  <button
                    onClick={handleBuyNow}
                    className="h-12 bg-fresh-950 hover:bg-black text-white px-6 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Banknote className="w-4 h-4 text-fresh-400" />
                    <span>Buy Now (COD)</span>
                  </button>
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

          {/* Product Tabs: Description, Specs, Delivery */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex space-x-4 border-b border-gray-200 text-sm font-bold mb-6">
              <button
                onClick={() => setActiveTab('desc')}
                className={`pb-3 px-2 transition border-b-2 ${
                  activeTab === 'desc'
                    ? 'border-fresh-600 text-fresh-700'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Product Details
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 px-2 transition border-b-2 ${
                  activeTab === 'specs'
                    ? 'border-fresh-600 text-fresh-700'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Specifications & POS Data
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`pb-3 px-2 transition border-b-2 ${
                  activeTab === 'delivery'
                    ? 'border-fresh-600 text-fresh-700'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Karachi Delivery & COD Policy
              </button>
            </div>

            <div className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-4xl">
              {activeTab === 'desc' && (
                <div className="space-y-4">
                  <p>{product.description || 'Sourced with care from authentic growers and top suppliers for Fresh House.'}</p>
                  <div className="bg-fresh-50 p-4 rounded-2xl border border-fresh-200 text-fresh-900 text-xs">
                    <h4 className="font-bold mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-fresh-600" /> Freshness Guarantee
                    </h4>
                    <p>If you are ever unsatisfied with any fresh produce or perishable item delivered, our rider will immediately replace it or refund on the spot.</p>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl flex justify-between">
                    <span className="text-gray-400 font-semibold">Brand / Vendor</span>
                    <span className="font-bold text-gray-900">{product.brand || 'Fresh House'}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl flex justify-between">
                    <span className="text-gray-400 font-semibold">SKU Code</span>
                    <span className="font-bold font-mono text-gray-900">{product.sku}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl flex justify-between">
                    <span className="text-gray-400 font-semibold">Barcode (EAN/UPC)</span>
                    <span className="font-bold font-mono text-gray-900">{product.barcode || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl flex justify-between">
                    <span className="text-gray-400 font-semibold">Pack Unit / Weight</span>
                    <span className="font-bold text-gray-900">{product.unit || '1 unit'}</span>
                  </div>
                </div>
              )}

              {activeTab === 'delivery' && (
                <div className="space-y-3">
                  <p><strong>Express Karachi Delivery:</strong> Orders placed before 9:00 PM are delivered within 60 to 90 minutes across all major Karachi zones (DHA, Clifton, Gulshan, PECHS, Nazimabad, Malir Cantt, etc.).</p>
                  <p><strong>Cash On Delivery:</strong> No credit card needed. Pay cash directly to the courier upon delivery.</p>
                  <p><strong>Free Delivery:</strong> Orders over PKR 2,500 automatically receive FREE express delivery.</p>
                </div>
              )}
            </div>
          </div>
        </div>

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
        className={`sm:hidden fixed left-0 right-0 z-[39] bottom-[calc(3.75rem+env(safe-area-inset-bottom))] px-3 transition-all duration-300 ease-out-expo ${
          ctaVisible ? 'opacity-0 translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-2 pl-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 truncate">{product.name}</p>
            <p className="text-base font-black text-slate-900">PKR {(product.price * quantity).toLocaleString()}</p>
          </div>
          <button
            type="button"
            tabIndex={ctaVisible ? -1 : 0}
            onClick={() => addToCart(product, quantity)}
            disabled={product.stock_quantity <= 0}
            className="h-12 px-5 rounded-xl bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 disabled:bg-slate-300 text-white text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Add{quantity > 1 ? ` ${quantity}` : ''} to basket
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

