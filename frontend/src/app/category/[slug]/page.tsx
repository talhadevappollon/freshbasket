import type { Metadata } from 'next';
import initialCatalog from '@/data/initialCatalog.json';
import CategoryPageClient from './CategoryPageClient';

type Params = { params: { slug: string } };

/**
 * Placeholder slug. `category/_.html` is exported as a generic shell: the server rewrites any
 * /category/<slug> that has no pre-built page to it (see backend/public/.htaccess and
 * frontend/vercel.json), and the client reads the real slug from the URL. That is how categories
 * created in the backend after the last build still get their own page without a rebuild.
 */
const SHELL_SLUG = '_';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

async function apiCategorySlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.map((c: { slug?: string }) => c.slug).filter(Boolean) as string[] : [];
  } catch {
    return []; // API not reachable at build time – the catalogue file + shell still cover everything
  }
}

// Static export: one HTML page per known category (catalogue file + API when reachable) plus the shell.
export async function generateStaticParams() {
  const slugs = new Set<string>([SHELL_SLUG]);
  (initialCatalog.categories as any[]).forEach(c => slugs.add(c.slug));
  (await apiCategorySlugs()).forEach(s => slugs.add(s));
  return Array.from(slugs).map(slug => ({ slug }));
}

const findCategory = (slug: string) =>
  (initialCatalog.categories as any[]).find(c => c.slug === slug);

export function generateMetadata({ params }: Params): Metadata {
  const cat = findCategory(params.slug);
  const name = cat ? String(cat.name).split('/').pop()!.trim() : 'Shop by category';
  return {
    title: `${name} — Fresh House`,
    description: `Shop ${name} online in Karachi with same-day express delivery and Cash on Delivery from Fresh House.`,
  };
}

export default function Page({ params }: Params) {
  const cat = findCategory(params.slug);
  return (
    <CategoryPageClient
      slug={params.slug}
      initialName={cat?.name ?? ''}
      initialDescription={cat?.description ?? ''}
    />
  );
}
