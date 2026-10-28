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
            className="text-xs font-bold text-fresh-600 hover:text-fresh-700 bg-fresh-50 px-3 py-1.5 rounded-xl border border-fresh-200 transition"
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
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all group ${
                isSelected
                  ? 'bg-fresh-600 text-white border-fresh-600 shadow-lg shadow-fresh-600/20 scale-[1.02]'
                  : 'bg-white hover:bg-fresh-50/50 text-gray-800 border-gray-100 hover:border-fresh-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-50 text-fresh-700 group-hover:bg-fresh-100 transition'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  Fresh
                </span>
              </div>
              <div>
                <h4
                  className={`text-xs font-bold leading-snug line-clamp-2 ${
                    isSelected ? 'text-white' : 'text-gray-900 group-hover:text-fresh-700'
                  }`}
                >
                  {{ ...cat }.name}
                </h4>
                <p
                  className={`text-[10px] mt-0.5 font-medium ${
                    isSelected ? 'text-emerald-100' : 'text-gray-400'
                  }`}
                >
                  Explore aisle &rarr;
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
