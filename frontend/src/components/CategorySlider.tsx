'use client';

import React from 'react';
import { Category } from '@/types';
import { Apple, Milk, Coffee, Cookie, Sparkles, Flame, Tag } from 'lucide-react';

interface CategorySliderProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  'fresh-produce': Apple,
  'bakery-dairy': Milk,
  'beverages': Coffee,
  'snacks-confectionery': Cookie,
  'default': Tag,
};

export default function CategorySlider({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySliderProps) {
  const displayCats = categories.slice(0, 12);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-fresh-600" />
            <span>Shop By Aisles</span>
          </h2>
          <p className="text-xs text-gray-500">Pick from our authentic grocery selections</p>
        </div>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory('')}
            className="text-xs font-bold text-fresh-600 hover:text-white bg-fresh-50 hover:bg-fresh-600 px-3.5 py-1.5 rounded-xl border border-fresh-200 hover:border-fresh-600 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            Clear Filter &times;
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {displayCats.map(cat => {
          const isSelected = selectedCategory === cat.slug;
          const Icon = CATEGORY_ICONS[cat.slug] || CATEGORY_ICONS['default'];

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? '' : cat.slug)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 group cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-fresh-600 to-emerald-700 text-white border-fresh-600 shadow-xl shadow-fresh-600/30 scale-[1.03]'
                  : 'bg-white hover:bg-emerald-50/50 text-slate-800 border-slate-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-xl hover:-translate-y-1.5'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg transition-transform duration-300 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-50 text-fresh-700 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-fresh-100 shadow-2xs'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors duration-200 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-fresh-600 group-hover:text-white'
                  }`}
                >
                  Fresh
                </span>
              </div>
              <div>
                <h4
                  className={`text-xs font-bold leading-snug line-clamp-2 transition-colors duration-200 ${
                    isSelected ? 'text-white' : 'text-slate-900 group-hover:text-fresh-700'
                  }`}
                >
                  {cat.name}
                </h4>
                <p
                  className={`text-[10px] mt-1 font-semibold flex items-center gap-1 transition-all duration-200 ${
                    isSelected
                      ? 'text-emerald-100'
                      : 'text-slate-400 group-hover:text-fresh-600 group-hover:translate-x-1'
                  }`}
                >
                  <span>Explore aisle</span>
                  <span>&rarr;</span>
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

