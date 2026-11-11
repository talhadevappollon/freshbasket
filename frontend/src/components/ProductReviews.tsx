'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { Star, ShieldCheck, Check, UploadCloud, ChevronDown, User, CheckCircle2, Loader2 } from 'lucide-react';
import { API_BASE } from '@/lib/api';

export interface ProductReview {
  id: string;
  author: string;
  email?: string;
  rating: number; // 1 to 5
  title: string;
  content: string;
  date: string;
  verified: boolean;
  image?: string;
}

// Seed sample reviews for demo products matching Fresh Basket reference
const DEFAULT_SAMPLE_REVIEWS: Record<string, ProductReview[]> = {
  'apple-green-local-1kg': [
    {
      id: 'rev-1',
      author: 'Muhammad Hamza',
      rating: 5,
      title: 'Apples',
      content: 'Good Apples. Very fresh and crisp, properly packed.',
      date: '11/05/2025',
      verified: true,
    },
    {
      id: 'rev-2',
      author: 'Ayesha Khan',
      rating: 5,
      title: 'Fresh & Crunchy',
      content: 'Excellent quality green apples, best for juicing and salads.',
      date: '10/28/2025',
      verified: true,
    },
    {
      id: 'rev-3',
      author: 'Bilal Ahmed',
      rating: 5,
      title: 'Top notch quality',
      content: 'Delivered in 90 minutes in DHA Phase 6. Totally fresh.',
      date: '10/14/2025',
      verified: true,
    },
    {
      id: 'rev-4',
      author: 'Sana Malik',
      rating: 5,
      title: 'Always fresh',
      content: 'Regular buyer of fresh produce from here. Always 10/10.',
      date: '09/30/2025',
      verified: true,
    },
  ],
  'white-button-mushrooms-250g': [
    {
      id: 'rev-m1',
      author: 'Dr. Farhan',
      rating: 5,
      title: 'Super Fresh Mushrooms',
      content: 'White, firm, and spotless. Delivered chilled and fresh.',
      date: '11/02/2025',
      verified: true,
    },
    {
      id: 'rev-m2',
      author: 'Zainab R.',
      rating: 5,
      title: 'Perfect for pasta',
      content: 'Clean and ready to cook. Great cold chain packaging.',
      date: '10/22/2025',
      verified: true,
    },
  ],
  'shakri-malta': [
    {
      id: 'rev-sm1',
      author: 'Kamran S.',
      rating: 5,
      title: 'Sweet and juicy citrus',
      content: 'Very juicy Shakri malta, perfectly ripe and sweet.',
      date: '11/04/2025',
      verified: true,
    },
  ],
};

interface ProductReviewsProps {
  product: Product;
}

export default function ProductReviews({ product }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const storageKey = `fb_reviews_${product.slug}`;

  // Load reviews on mount or product change from API with fallback
  useEffect(() => {
    let active = true;

    async function loadReviews() {
      try {
        const res = await fetch(`${API_BASE}/products/${product.slug}/reviews`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.reviews) && json.reviews.length > 0) {
            const apiReviews: ProductReview[] = json.reviews.map((r: any) => ({
              id: String(r.id),
              author: r.customer_name || 'Customer',
              rating: Number(r.rating) || 5,
              title: r.review_title || 'Review',
              content: r.review_body || '',
              date: r.created_at || 'Recently',
              verified: Boolean(r.is_verified),
              image: r.media_urls?.[0] || undefined,
            }));
            if (active) {
              setReviews(apiReviews);
              return;
            }
          }
        }
      } catch {
        // Backend API offline or unreachable, fallback below
      }

      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          if (active) {
            setReviews(JSON.parse(saved));
            return;
          }
        }
      } catch {}

      if (active) {
        setReviews(DEFAULT_SAMPLE_REVIEWS[product.slug] || []);
      }
    }

    loadReviews();
    setIsWriting(false);
    setSubmittedMessage(false);

    return () => {
      active = false;
    };
  }, [product.slug, storageKey]);

  // Calculate rating stats
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(2)
    : '0.00';

  const countByStar = [5, 4, 3, 2, 1].map(s => reviews.filter(r => r.rating === s).length);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !author.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      author: author.trim(),
      email: email.trim(),
      rating,
      title: title.trim(),
      content: content.trim(),
      date: formattedDate,
      verified: true,
      image: previewImage || undefined,
    };

    try {
      const res = await fetch(`${API_BASE}/products/${product.slug}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          rating,
          customer_name: author.trim(),
          customer_email: email.trim() || 'customer@freshbasket.com.pk',
          review_title: title.trim(),
          review_body: content.trim(),
          media_urls: previewImage ? [previewImage] : null,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.review?.id) {
          newRev.id = String(json.review.id);
        }
      }
    } catch {
      // offline fallback
    }

    const updated = [newRev, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}

    // Reset Form
    setTitle('');
    setContent('');
    setAuthor('');
    setEmail('');
    setPreviewImage(null);
    setIsWriting(false);
    setIsSubmitting(false);
    setSubmittedMessage(true);
    setTimeout(() => setSubmittedMessage(false), 5000);
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <section id="customer-reviews" className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-10 mt-10 scroll-mt-24">
      <h2 className="text-xl sm:text-2xl font-bold text-center text-slate-900 mb-6">
        Customer Reviews
      </h2>

      {submittedMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Thank you! Your verified review has been posted successfully.</span>
        </div>
      )}

      {/* Top Review Summary Bar */}
      <div className="py-6 border-y border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        {totalReviews > 0 ? (
          <>
            {/* Left Score */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left min-w-[180px]">
              <div className="flex items-center gap-1 text-amber-400 mb-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 text-base font-bold text-slate-900">{avgRating} out of 5</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span>Based on {totalReviews} review{totalReviews > 1 ? 's' : ''}</span>
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
              </div>
            </div>

            {/* Middle: Rating Bars */}
            <div className="flex-1 w-full max-w-sm space-y-1">
              {[5, 4, 3, 2, 1].map((stars, idx) => {
                const count = countByStar[idx];
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-0.5 w-16 shrink-0 text-amber-400">
                      {[...Array(stars)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-5 text-right text-slate-400 text-[11px] tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Empty Reviews State (Screenshot 13) */
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-0.5 text-slate-300">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className="w-4 h-4" />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-700">Be the first to write a review</span>
          </div>
        )}

        {/* Action Button: Write a Review / Cancel Review */}
        <div>
          <button
            type="button"
            onClick={() => setIsWriting(!isWriting)}
            className={`px-7 py-2.5 rounded-md text-sm font-bold transition-all shadow-xs cursor-pointer ${
              isWriting
                ? 'bg-slate-700 hover:bg-slate-800 text-white'
                : 'bg-[#2d7d32] hover:bg-[#256b2a] text-white active:scale-95'
            }`}
          >
            {isWriting ? 'Cancel review' : 'Write a review'}
          </button>
        </div>
      </div>

      {/* Write a Review Collapsible Form (Screenshot 14) */}
      {isWriting && (
        <form onSubmit={handleSubmitReview} className="mt-8 pt-6 border-t border-slate-100 space-y-5 animate-menu-in">
          <h3 className="text-base font-bold text-slate-900 text-center">Write a review</h3>

          {/* Interactive Rating */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-500 mb-1.5">Rating</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(star => {
                const filled = hoverRating ? star <= hoverRating : star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                    aria-label={`${star} star rating`}
                  >
                    <Star className={`w-6 h-6 ${filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Review Title (40)
            </label>
            <input
              type="text"
              maxLength={40}
              required
              placeholder="Give your review a title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full h-11 px-3.5 rounded-md border border-slate-300 text-sm focus:border-emerald-600 focus:outline-none transition bg-white"
            />
          </div>

          {/* Review Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Review content
            </label>
            <textarea
              rows={4}
              required
              placeholder="Write your comments here"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full p-3.5 rounded-md border border-slate-300 text-sm focus:border-emerald-600 focus:outline-none transition bg-white"
            />
          </div>

          {/* Picture/Video Upload Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Picture/Video (optional)
            </label>
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition">
              <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
              <span className="text-xs text-slate-500 font-medium">Click to upload photo of received product</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {previewImage && (
              <div className="mt-2.5 flex items-center gap-2">
                <img src={previewImage} alt="Preview" className="w-14 h-14 object-cover rounded-md border border-slate-200" />
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Remove picture
                </button>
              </div>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Display name (displayed publicly like john smith ...)
            </label>
            <input
              type="text"
              required
              placeholder="Display name"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className="w-full h-11 px-3.5 rounded-md border border-slate-300 text-sm focus:border-emerald-600 focus:outline-none transition bg-white"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-md border border-slate-300 text-sm focus:border-emerald-600 focus:outline-none transition bg-white"
            />
          </div>

          {/* Privacy Terms Disclaimer */}
          <p className="text-[11px] text-slate-400 leading-relaxed">
            How we use your data: We&apos;ll only contact you about the review you left, and only if necessary. By submitting your review you agree to Judge.me terms, privacy and content policies.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsWriting(false)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-md border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel review
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-2.5 rounded-md bg-[#2d7d32] hover:bg-[#256b2a] disabled:bg-slate-400 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isSubmitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {/* Review List & Sorting */}
      {totalReviews > 0 && !isWriting && (
        <div className="mt-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {totalReviews} Customer Review{totalReviews > 1 ? 's' : ''}
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="appearance-none bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 pl-3 pr-8 rounded-md focus:outline-none cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {sortedReviews.map(r => (
              <div key={r.id} className="py-5 first:pt-0 last:pb-0 space-y-2.5">
                {/* Rating & Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${idx < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 tabular-nums">{r.date}</span>
                </div>

                {/* Author with Verified Badge */}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">
                    <User className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">{r.author}</span>
                  {r.verified && (
                    <span className="inline-flex items-center gap-0.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Title & Content */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{r.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.content}</p>
                </div>

                {r.image && (
                  <div className="pt-1">
                    <img src={r.image} alt="User review photo" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
