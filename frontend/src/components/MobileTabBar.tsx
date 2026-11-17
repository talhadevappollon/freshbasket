'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Crown, House, LayoutList, UserRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Props {
  /** Opens the category menu (it lives in the header) */
  onCategories: () => void;
  categoriesOpen: boolean;
}

/**
 * Phone navigation: a floating, rounded bar with Home, Categories, Account and Membership.
 * It is solid at the top of the page and turns into see-through glass once the page scrolls;
 * the selected entry's icon is filled with the theme green.
 */
export default function MobileTabBar({ onCategories, categoriesOpen }: Props) {
  const pathname = usePathname() || '/';
  const { account, openAuth, modalOpen: authOpen } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const item =
    'relative w-full h-full flex flex-col items-center justify-center gap-1 rounded-full text-[12px] leading-none font-semibold cursor-pointer transition-colors duration-200 active:scale-95';
  const tone = (on: boolean) => (on ? 'text-fresh-600' : 'text-slate-500 hover:text-fresh-700');
  const icon = (on: boolean) => `w-[22px] h-[22px] transition-[fill] duration-200 ${on ? 'fill-current' : 'fill-transparent'}`;
  const dot = <span aria-hidden="true" className="absolute top-[11px] left-1/2 ml-[7px] w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white" />;

  return (
    <nav aria-label="Quick navigation" className="md:hidden fixed inset-x-0 bottom-0 z-[45] px-4 pb-[max(10px,env(safe-area-inset-bottom))] pointer-events-none">
      <ul className={`pointer-events-auto mx-auto max-w-md h-[66px] grid grid-cols-4 items-stretch rounded-full border shadow-[2px_2px_32px_rgba(0,0,0,0.28)] px-1.5 transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled ? 'bg-white/55 backdrop-blur-xl border-white/60' : 'bg-white border-white/70'
        }`}>
        <li>
          <Link
            href="/"
            aria-current={pathname === '/' ? 'page' : undefined}
            onClick={e => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className={`${item} ${tone(pathname === '/')}`}
          >
            <House className={icon(pathname === '/')} aria-hidden="true" />
            Home
          </Link>
        </li>

        <li>
          <button type="button" onClick={onCategories} aria-haspopup="dialog" className={`${item} ${tone(categoriesOpen || pathname.startsWith('/category'))}`}>
            <LayoutList className={icon(categoriesOpen || pathname.startsWith('/category'))} aria-hidden="true" />
            Categories
          </button>
        </li>

        <li>
          <button
            type="button"
            onClick={() => openAuth()}
            aria-haspopup="dialog"
            aria-label={account ? `Account, signed in as ${account.name}` : 'Account, sign in or create one'}
            className={`${item} ${tone(authOpen || pathname === '/account')}`}
          >
            <UserRound className={icon(authOpen || pathname === '/account')} aria-hidden="true" />
            Account
            {account && dot}
          </button>
        </li>

        <li>
          <Link
            href="/membership-plans"
            aria-current={pathname.startsWith('/membership-plans') ? 'page' : undefined}
            aria-label="Membership plans"
            className={`${item} ${tone(pathname.startsWith('/membership-plans'))}`}
          >
            <Crown className={icon(pathname.startsWith('/membership-plans'))} aria-hidden="true" />
            Membership
          </Link>
        </li>
      </ul>
    </nav>
  );
}
