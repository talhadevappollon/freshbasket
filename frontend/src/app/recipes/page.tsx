'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import ScrollUI from '@/components/ScrollUI';
import { fetchCategories } from '@/lib/api';
import { Category } from '@/types';
import recipes from '@/data/recipes.json';
import { Clock, Users } from 'lucide-react';

export default function RecipesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header categories={categories} />
      <ScrollUI />
      <main id="main-content" className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-8 sm:py-12 pb-24 md:pb-12">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-fresh-950">Recipe Ideas</h1>
        <p className="mt-2 text-slate-600 max-w-2xl">Pick a recipe, see what goes in it and add every ingredient we stock to your basket in one tap.</p>
        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recipes.map(r => (
            <li key={r.slug}>
              <Link href={`/recipes/${r.slug}`} className="group block bg-white rounded-3xl border border-slate-200/80 overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition duration-300">
                <span className="block aspect-[4/3] bg-slate-100 overflow-hidden">
                  {r.image && <img src={r.image} alt={r.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                </span>
                <span className="block p-4">
                  <span className="block font-bold text-slate-900 group-hover:text-fresh-700 leading-snug">{r.title}</span>
                  <span className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" aria-hidden="true" />
                      {r.cook_time}
                    </span>
                    {r.servings && (
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" aria-hidden="true" />
                        {r.servings}
                      </span>
                    )}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <Footer />
    </div>
  );
}
