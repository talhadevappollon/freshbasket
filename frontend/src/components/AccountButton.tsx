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
      className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl border border-slate-200 bg-white hover:bg-fresh-50 hover:border-fresh-300 text-slate-700 hover:text-fresh-800 active:scale-95 shadow-xs transition-all duration-200 cursor-pointer"
    >
      {account ? (
        <span className="w-7 h-7 rounded-full bg-fresh-700 text-white text-[13px] font-black flex items-center justify-center" aria-hidden="true">
          {account.name.trim().charAt(0).toUpperCase()}
        </span>
      ) : (
        <UserRound className="w-5 h-5" aria-hidden="true" />
      )}
    </button>
  );
}
