'use client';

import React from 'react';
import Link from 'next/link';
import { Category } from '@/types';
import Reveal from '@/components/Reveal';
import {
  ArrowRight,
  Milk,
  Croissant,
  CupSoda,
  Baby,
  Flame,
  Soup,
  Utensils,
  GraduationCap,
  Sandwich,
  ShoppingBasket,
  Sparkles,
} from 'lucide-react';

interface CategorySliderProps {
  categories: Category[];
}

type IconType = React.ComponentType<{ className?: string }>;

function iconFor(cat: Category): IconType {
  const s = cat.slug;
  if (s.includes('baby')) return Baby;
  if (s.includes('bakery') || s.includes('croissant')) return Croissant;
  if (s.includes('bever') || s.includes('juice')) return CupSoda;
  if (s.includes('dairy') || s === 'almarai') return Milk;
  if (s.includes('best')) return Flame;
  if (s.includes('breakfast')) return Sandwich;
  if (s.includes('sauce')) return Soup;
  if (s.includes('cooking') || s.includes('pantry')) return Utensils;
  if (s.includes('school')) return GraduationCap;
  if (s.includes('crafted')) return Sparkles;
  return ShoppingBasket;
}

export default function CategorySlider({ categories }: CategorySliderProps) {
  // Top-level aisles only; sub-categories live in the header menu and on each category page
  const displayCats = categories.filter(c => !c.name.includes('/')).slice(0, 12);

  return (
    <Reveal className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Shop by aisle</h2>
        <p className="text-sm text-slate-600 mt-0.5">Every aisle has its own page, with filters and sorting.</p>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {displayCats.map((cat, i) => {
          const Icon = iconFor(cat);
          return (
            <li key={cat.id}>
              <Link
                href={`/category/${cat.slug}`}
                className="group h-full p-4 rounded-2xl border bg-white border-slate-200 hover:border-fresh-400 hover:bg-fresh-50/60 hover:shadow-card-hover active:scale-[0.98] flex flex-col justify-between transition-all duration-300 ease-out-expo animate-card-entrance"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="w-11 h-11 rounded-xl bg-fresh-50 text-fresh-700 group-hover:bg-fresh-600 group-hover:text-white flex items-center justify-center transition-colors duration-300">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="mt-4 block">
                  <span className="block text-sm font-bold text-slate-900 group-hover:text-fresh-800 leading-snug line-clamp-2 transition-colors">
                    {cat.name}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-fresh-700 transition-colors">
                    Shop aisle
                    <ArrowRight className="w-3.5 h-3.5 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Reveal>
  );
}
