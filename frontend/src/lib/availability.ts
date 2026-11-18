import { Product } from '@/types';

/**
 * "Out of season" / "Out of stock" when the admin switched the product off or its tracked stock ran out;
 * null while it can be ordered.
 */
export function unavailableLabel(product: Pick<Product, 'availability' | 'sold_out'>): string | null {
  if (product.availability === 'out_of_season') return 'Out of season';
  if (product.availability === 'out_of_stock') return 'Out of stock';
  if (product.sold_out) return 'Out of stock';
  return null;
}

/**
 * The most of a product one basket can hold: what is on the shelf when stock is tracked, otherwise 99.
 * The number itself is never shown to shoppers.
 */
export function maxOrderQuantity(product: Pick<Product, 'track_stock' | 'stock_quantity'>): number {
  return product.track_stock && product.stock_quantity > 0 ? Math.min(product.stock_quantity, 99) : 99;
}
