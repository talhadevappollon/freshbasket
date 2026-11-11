'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import ProductCard from '@/components/ProductCard';
import ScrollUI from '@/components/ScrollUI';
import { useCart } from '@/context/CartContext';
import { fetchCategories, fetchProductBySlug } from '@/lib/api';
import { unavailableLabel } from '@/lib/availability';
import { Category, Product } from '@/types';
import recipes from '@/data/recipes.json';
import { ChevronRight, Clock, Users, ShoppingBasket, Check, ArrowLeft, Loader2 } from 'lucide-react';

export default function RecipeClient({ slug }: { slug: string }) {
  const recipe = recipes.find(r => r.slug === slug);
  const { addMultipleToCart, setIsCartOpen } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!recipe) return;
    let off = false;
    Promise.all(recipe.products.map(s => fetchProductBySlug(s).then(r => r?.product ?? null))).then(list => {
      if (!off) setProducts(list.filter((p): p is Product => !!p));
    });
    return () => {
      off = true;
    };
  }, [recipe]);

  const orderable = (products ?? []).filter(p => !unavailableLabel(p));

  const addAll = () => {
    if (orderable.length === 0 || isAdding) return;
    setIsAdding(true);
    setTimeout(() => {
      addMultipleToCart(orderable.map(p => ({ product: p, quantity: 1 })));
      setIsAdding(false);
      setAdded(orderable.length);
    }, 350);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header categories={categories} />
      <ScrollUI />
      <main id="main-content" className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-6 sm:py-10 pb-24 md:pb-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-slate-500 mb-5">
          <Link href="/" className="hover:text-fresh-700">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          <Link href="/recipes" className="hover:text-fresh-700">
            Recipes
          </Link>
        </nav>

        {!recipe ? (
          <div className="text-center py-20">
            <h1 className="text-2xl font-black text-slate-900">Recipe not found</h1>
            <Link href="/recipes" className="inline-flex items-center gap-2 mt-4 text-fresh-700 font-bold">
              <ArrowLeft className="w-4 h-4" /> All recipes
            </Link>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="rounded-3xl overflow-hidden bg-slate-100 aspect-[4/3]">
                {recipe.image && <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />}
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-fresh-950">{recipe.title}</h1>
                <p className="mt-3 text-slate-600 leading-relaxed">{recipe.description}</p>
                <dl className="mt-6 flex flex-wrap gap-4">
                  <div className="rounded-2xl bg-white border border-slate-200 px-5 py-3">
                    <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Cook Time
                    </dt>
                    <dd className="font-bold text-slate-900">{recipe.cook_time}</dd>
                  </div>
                  {recipe.servings && (
                    <div className="rounded-2xl bg-white border border-slate-200 px-5 py-3">
                      <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Servings
                      </dt>
                      <dd className="font-bold text-slate-900">{recipe.servings}</dd>
                    </div>
                  )}
                </dl>
                {recipe.nutrition.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-sm font-bold text-slate-900 mb-2">Nutrition values</h2>
                    <ul className="grid grid-cols-4 gap-3">
                      {recipe.nutrition.map(([k, v]) => (
                        <li key={k} className="rounded-2xl bg-fresh-50 border border-fresh-100 text-center py-3">
                          <span className="block text-xs text-slate-600">{k}</span>
                          <span className="block font-black text-fresh-900">{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mt-12">
              <section aria-labelledby="steps">
                <h2 id="steps" className="text-2xl font-black text-fresh-950 mb-4">
                  Recipe Instructions
                </h2>
                {recipe.steps.length > 0 ? (
                  <ol className="space-y-4">
                    {recipe.steps.map((s, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-8 h-8 rounded-full bg-fresh-600 text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <p className="text-slate-700 leading-relaxed pt-0.5">{s}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-slate-600">Instructions are on their way.</p>
                )}
              </section>

              <section aria-labelledby="ingredients">
                <h2 id="ingredients" className="text-2xl font-black text-fresh-950 mb-4">
                  Ingredients list
                </h2>
                {recipe.ingredients.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                    {recipe.ingredients.map(i => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={addAll}
                  disabled={orderable.length === 0 || isAdding}
                  className="mt-6 h-12 px-7 rounded-xl bg-fresh-600 hover:bg-fresh-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold flex items-center gap-2 active:scale-95 transition cursor-pointer shadow-sm shadow-fresh-600/30"
                >
                  {isAdding ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : added !== null ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <ShoppingBasket className="w-5 h-5" />
                  )}
                  {isAdding
                    ? 'Adding to Cart…'
                    : `Add All to Cart${orderable.length > 0 ? ` (${orderable.length})` : ''}`}
                </button>
                {added !== null && (
                  <p className="mt-2 text-sm font-semibold text-fresh-800" role="status">
                    {added} ingredient{added === 1 ? '' : 's'} added to your basket.
                  </p>
                )}
                <p className="mt-4 text-xs text-slate-500">*Disclaimer: Some items may not be available. Please check the basket before completing the order.</p>
              </section>
            </div>

            <section className="mt-12" aria-labelledby="ing-products">
              <h2 id="ing-products" className="text-2xl font-black text-fresh-950 mb-4">
                Ingredients
              </h2>
              {products === null ? (
                <p className="text-slate-500">Loading ingredients…</p>
              ) : products.length === 0 ? (
                <p className="text-slate-600">We don’t stock the ingredients of this recipe yet.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {products.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <Footer />
    </div>
  );
}
