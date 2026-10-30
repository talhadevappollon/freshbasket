import type { Category } from '@/types';

/** A top-level aisle on the phone home page: a parent category plus its sub-categories. */
export interface CatalogueGroup {
  /** url-safe key, used for in-page anchors (#cat-<key>) */
  key: string;
  name: string;
  emoji: string;
  tone: Tone;
  /** The category called exactly `name`, when the store has one */
  parent?: Category;
  /** Sub-categories ("Beverages/Juices" -> Juices) */
  children: Category[];
  /** Number of products, as reported by the store */
  total: number;
}

export interface Tone {
  /** gradient behind the section heading */
  header: string;
  /** tile in the category grid (soft pastel, product photos are multiplied into it) */
  tile: string;
  /** background of the picture area on product cards in this section */
  imageBg: string;
}

// Full class strings (not built dynamically) so Tailwind keeps them.
const TONES: Tone[] = [
  {
    header: 'from-fresh-600 via-fresh-700 to-fresh-900',
    tile: 'from-fresh-50 to-fresh-200/80 border-fresh-200',
    imageBg: 'rounded-2xl bg-gradient-to-b from-fresh-50 to-fresh-100/80',
  },
  {
    header: 'from-brand-500 via-brand-600 to-brand-800',
    tile: 'from-brand-50 to-brand-100 border-brand-200',
    imageBg: 'rounded-2xl bg-gradient-to-b from-brand-50 to-brand-100/70',
  },
  {
    header: 'from-fresh-800 via-fresh-900 to-fresh-950',
    tile: 'from-[#fff9e8] to-[#fdecb8] border-[#f4dd9c]',
    imageBg: 'rounded-2xl bg-gradient-to-b from-[#fffbef] to-[#fdf0c8]',
  },
  {
    header: 'from-brand-700 via-brand-800 to-brand-950',
    tile: 'from-slate-50 to-slate-200 border-slate-200',
    imageBg: 'rounded-2xl bg-gradient-to-b from-slate-50 to-slate-200/80',
  },
];

const BLURBS: [RegExp, string][] = [
  [/best/i, 'What Karachi is adding to basket this week'],
  [/produce|fruit|veg/i, 'Farm-fresh fruit and vegetables, picked daily'],
  [/meat|seafood/i, 'Fresh cuts, chilled and packed daily'],
  [/dairy.*bakery|bakery.*dairy/i, 'Breads, milk, cheese and everyday bakes'],
  [/dairy/i, 'Milk, yogurt, butter and imported cheeses'],
  [/bakery/i, 'Breads, rolls, croissants and cookies'],
  [/beverage/i, 'Juices, coconut water, iced coffee and more'],
  [/baby/i, 'Organic purees, cereals and toddler snacks'],
  [/snack|confection/i, 'Chips, chocolates and sweet treats'],
  [/household/i, 'Cleaning and everyday home essentials'],
  [/personal/i, 'Care and hygiene basics'],
  [/sauce/i, 'Cooking sauces and seasonings'],
  [/ingredient/i, 'Everyday cooking ingredients'],
  [/cooking|pantry/i, 'Oils, sauces, honey and kitchen staples'],
  [/breakfast/i, 'Cereals, spreads and morning essentials'],
  [/school/i, 'Lunchbox and school-bag favourites'],
  [/crafted/i, 'Small-batch, home-style favourites'],
  [/almarai/i, 'Almarai dairy, juices and more'],
];

export const blurbFor = (name: string) => BLURBS.find(([re]) => re.test(name))?.[1] ?? 'Fresh picks delivered across Karachi';

const EMOJI: [RegExp, string][] = [
  [/best/i, '🔥'],
  [/produce|fruit|veg/i, '🥬'],
  [/meat|seafood|fish|chicken/i, '🥩'],
  [/dairy.*bakery|bakery.*dairy/i, '🧀'],
  [/dairy|milk|cheese/i, '🥛'],
  [/bakery|bread/i, '🥐'],
  [/beverage|drink|juice/i, '🥤'],
  [/baby/i, '🍼'],
  [/snack|confection|chocolate|sweet/i, '🍫'],
  [/household|clean/i, '🧽'],
  [/personal|care|beauty/i, '🧴'],
  [/sauce/i, '🥫'],
  [/cooking|pantry|ingredient/i, '🫒'],
  [/breakfast|cereal/i, '🥞'],
  [/school/i, '🎒'],
  [/crafted|home/i, '🏡'],
  [/almarai/i, '🐄'],
];

// Aisles people shop most come first; anything the store adds later follows alphabetically.
const PRIORITY = [
  'best selling',
  'fresh produce',
  'dairy',
  'bakery',
  'beverages',
  'meat & seafood',
  'snacks & confectionery',
  'breakfast',
  'cooking & pantry',
  'baby food',
  'household essentials',
  'personal care',
];

export const emojiFor = (name: string) => EMOJI.find(([re]) => re.test(name))?.[1] ?? '🛒';

/** The store's names can contain non-breaking spaces, which stop headings from wrapping. */
const clean = (s: string) => s.replace(/\s+/g, ' ').trim(); // JS \s covers U+00A0 and the other odd spaces

export const lastSegment = (name: string) => clean(name.split('/').pop()!);

const toKey = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Groups the store's flat category list into top-level aisles, whatever it contains. */
export function buildCatalogueGroups(categories: Category[]): CatalogueGroup[] {
  const byHead = new Map<string, { head: string; parent?: Category; children: Category[] }>();

  for (const c of categories) {
    const head = clean(c.name.split('/')[0]);
    const id = head.toLowerCase();
    const entry = byHead.get(id) ?? { head, children: [] };
    if (c.name.includes('/')) entry.children.push(c);
    else entry.parent = c;
    byHead.set(id, entry);
  }

  const rank = (id: string) => {
    const i = PRIORITY.indexOf(id);
    return i === -1 ? PRIORITY.length : i;
  };

  return Array.from(byHead.entries())
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([, g], i) => ({
      key: toKey(g.head),
      name: g.head,
      emoji: emojiFor(g.head),
      tone: TONES[i % TONES.length],
      parent: g.parent,
      children: g.children,
      total: g.parent?.products_count ?? g.children.reduce((sum, c) => sum + (c.products_count ?? 0), 0),
    }));
}
