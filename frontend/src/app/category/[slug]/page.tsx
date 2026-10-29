import type { Metadata } from 'next';
import initialCatalog from '@/data/initialCatalog.json';
import CategoryPageClient from './CategoryPageClient';

type Params = { params: { slug: string } };

// Static export: one HTML page per category known at build time (same approach as /products/[slug]).
export async function generateStaticParams() {
  return (initialCatalog.categories as any[]).map(c => ({ slug: c.slug }));
}

const findCategory = (slug: string) =>
  (initialCatalog.categories as any[]).find(c => c.slug === slug);

export function generateMetadata({ params }: Params): Metadata {
  const cat = findCategory(params.slug);
  const name = cat ? String(cat.name).split('/').pop()!.trim() : 'Category';
  return {
    title: `${name} — Fresh Basket Pakistan`,
    description: `Shop ${name} online in Karachi with same-day express delivery and Cash on Delivery from Fresh Basket.`,
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
