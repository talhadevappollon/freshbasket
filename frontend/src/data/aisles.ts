import catalogue from '@/data/initialCatalog.json';
import type { Category } from '@/types';

// Curated storefront aisles. `slug` values are REAL category slugs (see initialCatalog.json /
// the categories API) so every banner, menu entry and chip lands on a populated product grid.

export interface Aisle {
  slug: string;
  name: string;
  emoji: string;
  blurb: string;
}

export const AISLES: Record<string, Aisle> = {
  fruits: { slug: 'fruits', name: 'Fruits', emoji: '🍎', blurb: 'Seasonal and imported fruit, delivered fresh' },
  vegetables: { slug: 'vegetables', name: 'Vegetables', emoji: '🥕', blurb: 'Farm vegetables, leafy greens and herbs' },
  nuts: { slug: 'karachi-nuts-and-dates', name: 'Nuts & Dates', emoji: '🥜', blurb: 'Nuts, dates, dried fruit and seeds' },
  bakery: { slug: 'bakery-items', name: 'Bakery', emoji: '🥖', blurb: 'Breads, rolls and bakes' },
  dairy: { slug: 'dairy', name: 'Dairy', emoji: '🧀', blurb: 'Milk, yogurt, butter and cheese' },
  pantry: { slug: 'karachi-pantry', name: 'Pantry', emoji: '🫒', blurb: 'Sauces, spreads, snacks and kitchen staples' },
  gift: { slug: 'karachi-gift-baskets', name: 'Gift Basket', emoji: '🎁', blurb: 'Fruit and dry-fruit gift baskets' },
  frozen: { slug: 'karachi-frozen', name: 'Frozen', emoji: '🧊', blurb: 'Frozen meat, veg, breakfast and ice cream' },
  baby: { slug: 'karachi-baby-food', name: 'Baby Food', emoji: '👶', blurb: 'Organic purees and toddler snacks' },
  tea: { slug: 'karachi-tea-coffee', name: 'Tea & Coffee', emoji: '☕', blurb: 'Coffee, coffee pods, tea and sweeteners' },
  beverages: { slug: 'karachi-beverages', name: 'Beverages', emoji: '🧃', blurb: 'Juices, coconut water, kombucha and more' },
};

/** The store's categories in the order the reference store shows them (menus, footer, "other categories"). */
export const FEATURED_AISLES = [
  AISLES.fruits,
  AISLES.vegetables,
  AISLES.nuts,
  AISLES.bakery,
  AISLES.dairy,
  AISLES.pantry,
  AISLES.gift,
  AISLES.frozen,
  AISLES.baby,
  AISLES.tea,
  AISLES.beverages,
];

/** Name of a category in the bundled catalogue file, looked up by its slug. */
export function catalogueCategoryName(slug: string): string {
  const hit = (catalogue.categories as { slug: string; name: string }[]).find(c => c.slug === slug);
  return hit ? hit.name : '';
}

/**
 * Find the category a URL slug refers to. The bundled catalogue and the live API describe the same
 * categories with different slugs (karachi-beverages vs beverages) but identical names, so try the
 * slug first and then the name.
 */
export function resolveCategory(categories: Category[], slug: string): Category | undefined {
  const direct = categories.find(c => c.slug === slug);
  if (direct) return direct;
  const name = catalogueCategoryName(slug).toLowerCase();
  return name ? categories.find(c => c.name.toLowerCase() === name) : undefined;
}
