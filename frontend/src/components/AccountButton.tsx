'use client';

import React from 'react';
import { UserRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/** Sits beside the basket: opens sign in / create account, or the account window when signed in. */
export default function AccountButton() {
  const { account, openAuth } = useAuth();
  const label = account ? `Your account, ${account.name}` : 'Sign in or create an account';

  return (
    <button
      type="button"
      onClick={() => openAuth()}
      aria-label={label}
      title={label}
      aria-haspopup="dialog"
      className="flex items-center justify-center w-9 h-9 md:w-[34px] md:h-[34px] shrink-0 rounded-xl md:rounded-full border border-slate-200 bg-white hover:bg-fresh-50 hover:border-fresh-300 text-slate-700 hover:text-fresh-800 active:scale-95 shadow-xs transition-all duration-200 cursor-pointer"
    >
      {account ? (
        <span className="w-6 h-6 rounded-full bg-fresh-700 text-white text-[11px] font-black flex items-center justify-center" aria-hidden="true">
          {account.name.trim().charAt(0).toUpperCase()}
        </span>
      ) : (
        <UserRound className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  );
}
