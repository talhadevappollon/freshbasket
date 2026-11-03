'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

/** Floating "order on WhatsApp" button on every page: a round icon above the phone bar, a labelled pill on larger screens. */
export default function WhatsAppFab() {
  // product pages have a sticky add-to-basket bar on phones: sit above it
  const lifted = (usePathname() || '').startsWith('/products/');
  return (
    <a
      href="https://wa.me/923001234567?text=Assalam-o-Alaikum!%20I%20want%20to%20order%20groceries%20from%20Fresh%20House."
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Fresh House support on WhatsApp"
      className={`fixed z-40 right-3 ${lifted ? 'bottom-[172px]' : 'bottom-[96px]'} md:right-6 md:bottom-6 h-[52px] w-[52px] md:h-12 md:w-auto md:px-5 rounded-full bg-fresh-600 hover:bg-fresh-700 active:scale-95 text-white shadow-xl shadow-black/25 flex items-center justify-center gap-2 transition-all duration-200`}
    >
      <MessageCircle className="w-6 h-6" aria-hidden="true" />
      <span className="hidden md:inline font-bold text-sm">WhatsApp order support</span>
    </a>
  );
}
