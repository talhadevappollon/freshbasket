/** Line icons for the reference store's top-level categories, keyed by category name. Files live in public/category-icons. */
export const CATEGORY_ICONS: Record<string, string> = {
  Fruits: '/category-icons/fruits.webp',
  Vegetables: '/category-icons/vegetables.webp',
  'Nuts & Dates': '/category-icons/nuts-and-dates.webp',
  Bakery: '/category-icons/bakery.webp',
  Dairy: '/category-icons/dairy.webp',
  Pantry: '/category-icons/pantry.webp',
  'Gift Basket': '/category-icons/gift-basket.webp',
  Frozen: '/category-icons/frozen.webp',
  'Baby Food': '/category-icons/baby-food.webp',
  'Tea & Coffee': '/category-icons/tea-and-coffee.webp',
};

/** The ten categories the reference store shows on its home page, in its order. */
export const ICON_CATEGORIES = Object.keys(CATEGORY_ICONS);
