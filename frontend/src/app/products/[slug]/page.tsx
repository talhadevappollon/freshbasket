import initialCatalog from '@/data/initialCatalog.json';
import ProductDetailClient from './ProductDetailClient';

/**
 * `products/_.html` is a generic shell: the server rewrites any /products/<slug> without a pre-built page
 * to it (backend/public/.htaccess, frontend/vercel.json) and the client reads the real slug from the URL.
 * Products added or renamed in the admin panel after the last build therefore still get their page.
 */
const PRODUCT_SHELL_SLUG = '_';

export async function generateStaticParams() {
  return [{ slug: PRODUCT_SHELL_SLUG }, ...(initialCatalog.products as any[]).map(p => ({ slug: p.slug }))];
}

export default function Page() {
  return <ProductDetailClient />;
}
