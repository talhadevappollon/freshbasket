import { Product } from '@/types';

/** "Out of season" / "Out of stock" when the admin switched the product off; null while it can be ordered. */
export function unavailableLabel(product: Pick<Product, 'availability'>): string | null {
  if (product.availability === 'out_of_season') return 'Out of season';
  if (product.availability === 'out_of_stock') return 'Out of stock';
  return null;
}
