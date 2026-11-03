import type { Category } from '@/types';

/** A top-level category on the phone home page: a parent category plus its sub-categories. */
export interface CatalogueGroup {
  /** url-safe key, used for in-page anchors (#cat-<key>) */
  key: string;
  name: string;
  emoji: string;
  /** colours for the picture area of the product cards in this section */
  imageBg: string;
  /** The category called exactly `name`, when the store has one */
  parent?: Category;
  /** Sub-categories ("Fruits/Regular Fruits" -> Regular Fruits) */
  children: Category[];
  /** Products in the category and all its sub-categories */
  total: number;
}

// Full class strings (not built dynamically) so Tailwind keeps them.
const IMAGE_BGS = [
  'rounded-2xl bg-gradient-to-b from-fresh-50 to-fresh-100/80',
  'rounded-2xl bg-gradient-to-b from-brand-50 to-brand-100/70',
  'rounded-2xl bg-gradient-to-b from-[#fffbef] to-[#fdf0c8]',
  'rounded-2xl bg-gradient-to-b from-slate-50 to-slate-200/80',
];

const EMOJI: [RegExp, string][] = [
  [/^fruits/i, '🍎'],
  [/vegetable/i, '🥕'],
  [/nuts|dates/i, '🥜'],
  [/bakery|bread/i, '🥐'],
  [/dairy|milk|cheese/i, '🥛'],
  [/pantry|cooking/i, '🫒'],
  [/gift/i, '🎁'],
  [/frozen/i, '🧊'],
  [/baby/i, '🍼'],
  [/tea|coffee/i, '☕'],
  [/beverage|drink|juice/i, '🥤'],
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

/**
 * Groups the store's flat category list into top-level categories, in the order the store lists them
 * (the reference store's menu order), whatever the list contains.
 */
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

  return Array.from(byHead.values()).map((g, i) => {
    const own = g.parent?.products_count ?? 0;
    const inChildren = g.children.reduce((sum, c) => sum + (c.products_count ?? 0), 0);
    return {
      key: toKey(g.head),
      name: g.head,
      emoji: emojiFor(g.head),
      imageBg: IMAGE_BGS[i % IMAGE_BGS.length],
      parent: g.parent,
      children: g.children,
      total: g.parent?.total_products ?? own + inChildren,
    };
  });
}
