'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, LayoutList, MapPin, UserRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDelivery } from '@/context/DeliveryContext';

interface Props {
  /** Opens the category menu (it lives in the header) */
  onCategories: () => void;
  categoriesOpen: boolean;
}

/**
 * Phone navigation: a floating, rounded, blurred bar with Home, Categories, Account and Deliver to,
 * the same four entries and look as the reference store's.
 */
export default function MobileTabBar({ onCategories, categoriesOpen }: Props) {
  const pathname = usePathname() || '/';
  const { account, openAuth, modalOpen: authOpen } = useAuth();
  const { openDeliver, modalOpen: deliverOpen, location } = useDelivery();

  const item =
    'relative w-full h-full flex flex-col items-center justify-center gap-1 rounded-full text-[12px] leading-none font-semibold cursor-pointer transition-colors duration-200 active:scale-95';
  const tone = (on: boolean) => (on ? 'text-fresh-600' : 'text-slate-500 hover:text-fresh-700');
  const icon = 'w-[22px] h-[22px]';
  const dot = <span aria-hidden="true" className="absolute top-[11px] left-1/2 ml-[7px] w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white" />;

  return (
    <nav aria-label="Quick navigation" className="md:hidden fixed inset-x-0 bottom-0 z-[45] px-4 pb-[max(10px,env(safe-area-inset-bottom))] pointer-events-none">
      <ul className="pointer-events-auto mx-auto max-w-md h-[66px] grid grid-cols-4 items-stretch rounded-full bg-white/75 backdrop-blur-[14px] border border-white/70 shadow-[2px_2px_32px_rgba(0,0,0,0.28)] px-1.5">
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
            <House className={icon} aria-hidden="true" />
            Home
          </Link>
        </li>

        <li>
          <button type="button" onClick={onCategories} aria-haspopup="dialog" className={`${item} ${tone(categoriesOpen || pathname.startsWith('/category'))}`}>
            <LayoutList className={icon} aria-hidden="true" />
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
            <UserRound className={icon} aria-hidden="true" />
            Account
            {account && dot}
          </button>
        </li>

        <li>
          <button
            type="button"
            onClick={openDeliver}
            aria-haspopup="dialog"
            aria-label={location ? `Deliver to ${location.area}. Change` : 'Deliver to. Choose your area'}
            className={`${item} ${tone(deliverOpen)}`}
          >
            <MapPin className={icon} aria-hidden="true" />
            Deliver to
            {location && dot}
          </button>
        </li>
      </ul>
    </nav>
  );
}
