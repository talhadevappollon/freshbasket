// Curated storefront aisles. `slug` values are REAL category slugs (see initialCatalog.json /
// the categories API) so every banner, menu entry and chip lands on a populated product grid.

export interface Aisle {
  slug: string;
  name: string;
  emoji: string;
  blurb: string;
}

export const AISLES: Record<string, Aisle> = {
  dairy: {
    slug: 'dairy',
    name: 'Dairy & Cheese',
    emoji: '🧀',
    blurb: 'Milk, yogurt, butter & imported cheeses',
  },
  bakery: {
    slug: 'bakery-items',
    name: 'Bakery',
    emoji: '🥖',
    blurb: 'Breads, rolls, croissants & cookies',
  },
  beverages: {
    slug: 'karachi-beverages',
    name: 'Beverages',
    emoji: '🧃',
    blurb: 'Juices, coconut water, iced coffee & kombucha',
  },
  baby: {
    slug: 'karachi-baby-food',
    name: 'Baby Food',
    emoji: '👶',
    blurb: 'Organic purees, cereals & toddler snacks',
  },
  pantry: {
    slug: 'karachi-pantry-cooking-ingredients',
    name: 'Cooking & Pantry',
    emoji: '🫒',
    blurb: 'Oils, sauces, honey & kitchen staples',
  },
  breakfast: {
    slug: 'karachi-breakfast',
    name: 'Breakfast',
    emoji: '🥞',
    blurb: 'Cereals, spreads & morning essentials',
  },
  bestSelling: {
    slug: 'karachi-best-selling',
    name: 'Best Sellers',
    emoji: '🔥',
    blurb: 'What Karachi is adding to basket this week',
  },
};

export const FEATURED_AISLES = [
  AISLES.bestSelling,
  AISLES.dairy,
  AISLES.bakery,
  AISLES.beverages,
  AISLES.baby,
  AISLES.pantry,
  AISLES.breakfast,
];
