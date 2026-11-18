'use client';

import { useEffect, useState } from 'react';
import { fetchHomeBanners, HomeBannersData } from '@/lib/api';

const CACHE_KEY = 'fb_home_banners';
let pending: Promise<HomeBannersData | null> | null = null;

/**
 * The home page banners from the admin panel. Every banner on the page shares one request; the last
 * answer is remembered on this device so a returning visitor sees the current banners straight away.
 * null until known: callers then show the banners built into the site.
 */
export function useHomeBanners(): HomeBannersData | null {
  const [banners, setBanners] = useState<HomeBannersData | null>(null);

  useEffect(() => {
    let off = false;
    try {
      const saved = localStorage.getItem(CACHE_KEY);
      if (saved) setBanners(JSON.parse(saved));
    } catch {}
    pending ??= fetchHomeBanners();
    pending.then(fresh => {
      if (!fresh || off) return;
      setBanners(fresh);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
      } catch {}
    });
    return () => {
      off = true;
    };
  }, []);

  return banners;
}
