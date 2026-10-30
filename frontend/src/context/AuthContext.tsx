'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  Account,
  AccountError,
  fetchAccount,
  getToken,
  loginAccount,
  logoutAccount,
  registerAccount,
  setToken,
} from '@/lib/account';

export type AuthView = 'login' | 'register' | 'account';

interface AuthContextType {
  account: Account | null;
  /** false until the saved sign-in has been checked, so pages do not flash "signed out" */
  ready: boolean;
  modalOpen: boolean;
  view: AuthView;
  setView: (view: AuthView) => void;
  /** Opens the sign-in window, or the account window when already signed in */
  openAuth: (view?: AuthView) => void;
  closeAuth: () => void;
  signIn: (login: string, password: string) => Promise<void>;
  signUp: (data: { name: string; phone: string; email?: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState<AuthView>('login');

  const refreshAccount = useCallback(async () => {
    if (!getToken()) {
      setAccount(null);
      return;
    }
    try {
      const { account: me } = await fetchAccount();
      setAccount(me);
    } catch (e) {
      // an expired or revoked sign-in is cleared; a network blip keeps whatever we had
      if (e instanceof AccountError && e.status === 401) {
        setToken(null);
        setAccount(null);
      }
    }
  }, []);

  useEffect(() => {
    refreshAccount().finally(() => setReady(true));
  }, [refreshAccount]);

  const openAuth = useCallback(
    (next?: AuthView) => {
      setView(next ?? (account ? 'account' : 'login'));
      setModalOpen(true);
    },
    [account]
  );

  const closeAuth = useCallback(() => setModalOpen(false), []);

  const signIn = useCallback(async (login: string, password: string) => {
    const res = await loginAccount({ login, password });
    setToken(res.token);
    setAccount(res.account);
  }, []);

  const signUp = useCallback(async (data: { name: string; phone: string; email?: string; password: string }) => {
    const res = await registerAccount(data);
    setToken(res.token);
    setAccount(res.account);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutAccount();
    } catch {
      // the token is dropped locally either way
    }
    setToken(null);
    setAccount(null);
  }, []);

  return (
    <AuthContext.Provider value={{ account, ready, modalOpen, view, setView, openAuth, closeAuth, signIn, signUp, signOut, refreshAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
