import { API_BASE } from '@/lib/api';

export interface Account {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  delivery_city?: string | null;
  delivery_area?: string | null;
  delivery_address?: string | null;
}

export interface AccountOrder {
  order_number: string;
  order_status: string;
  total: number;
  items_count: number;
  delivery_date?: string | null;
  delivery_window_label?: string | null;
  created_at: string;
}

const TOKEN_KEY = 'fb_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // private mode: the shopper simply stays signed in for this page view only
  }
}

/** An error from the store, with a message per form field when the store gave them. */
export class AccountError extends Error {
  fields: Record<string, string>;
  status: number;
  constructor(message: string, fields: Record<string, string> = {}, status = 0) {
    super(message);
    this.fields = fields;
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}) };
  if (init.auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/account${path}`, { ...init, headers, cache: 'no-store' });
  } catch {
    throw new AccountError('We could not reach the store. Check your connection and try again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fields: Record<string, string> = {};
    Object.entries((data.errors ?? {}) as Record<string, string[]>).forEach(([k, v]) => {
      fields[k] = v[0];
    });
    const message = res.status === 429 ? 'Too many attempts. Please wait a minute and try again.' : data.message || 'Something went wrong. Please try again.';
    throw new AccountError(message, fields, res.status);
  }
  return data as T;
}

export const registerAccount = (body: { name: string; phone: string; email?: string; password: string }) =>
  request<{ token: string; account: Account }>('/register', { method: 'POST', body: JSON.stringify(body) });

export const loginAccount = (body: { login: string; password: string }) =>
  request<{ token: string; account: Account }>('/login', { method: 'POST', body: JSON.stringify(body) });

export const fetchAccount = () => request<{ account: Account }>('/me', { auth: true });

export const logoutAccount = () => request<{ success: boolean }>('/logout', { method: 'POST', auth: true });

export const fetchAccountOrders = () => request<{ orders: AccountOrder[] }>('/orders', { auth: true });
