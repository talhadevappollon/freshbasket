import initialCatalog from '@/data/initialCatalog.json';
import ProductDetailClient from './ProductDetailClient';

export async function generateStaticParams() {
  return (initialCatalog.products as any[]).map(p => ({
    slug: p.slug,
  }));
}

export default function Page() {
  return <ProductDetailClient />;
}
