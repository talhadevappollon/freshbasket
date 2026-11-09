/**
 * Content for the home page's membership, bundle and gift-basket rows (from "Fresh House WebData Updates").
 * These are offers, not catalogue products: every card opens a WhatsApp chat with the offer name filled in.
 * Edit names, prices and pictures here.
 */

export const WHATSAPP_NUMBER = '923001234567';

export const whatsappLink = (message: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export interface Offer {
  key: string;
  name: string;
  price: number;
  /** price before the discount, if any */
  was?: number;
  /** shown under the price, e.g. "monthly bill · 4 weekly boxes" */
  note?: string;
  image: string;
  kind: 'plan' | 'bundle' | 'gift';
}

const pct = (o: Offer) => (o.was && o.was > o.price ? Math.floor(((o.was - o.price) / o.was) * 100) : null);
export const discountOf = pct;

export const PLANS: Offer[] = [
  { key: 'plan-fruit-sabzi', name: 'Fruit & Sabzi Plan – Weekly Family Membership', price: 14996, was: 17244, note: 'monthly bill · 4 weekly boxes', image: '/home/plan-fruit-sabzi.webp', kind: 'plan' },
  { key: 'plan-family-premium', name: 'Family Premium Plan – Fruit, Sabzi & Dry Fruits Membership', price: 26495, was: 30789, note: 'monthly bill · 4 weekly boxes', image: '/home/plan-family-premium.webp', kind: 'plan' },
  { key: 'plan-kitchen', name: 'Kitchen Plan – Weekly Vegetable Membership', price: 6196, was: 7116, note: 'monthly bill · 4 weekly boxes', image: '/home/plan-kitchen.webp', kind: 'plan' },
  // sample plans (placeholders until the real line-up is confirmed)
  { key: 'plan-fruit-lover', name: 'Fruit Lover Plan – Weekly Fruit Membership', price: 9496, was: 10880, note: 'monthly bill · 4 weekly boxes', image: '/home/gift-5.webp', kind: 'plan' },
  { key: 'plan-breakfast', name: 'Breakfast Plan – Fruit & Dairy Membership', price: 7996, was: 9140, note: 'monthly bill · 4 weekly boxes', image: '/home/plan-fruit-sabzi.webp', kind: 'plan' },
  { key: 'plan-dry-fruit', name: 'Dry Fruit Plan – Monthly Nuts & Dates Membership', price: 11499, was: 13200, note: 'monthly bill · 1 monthly box', image: '/home/bundle-dry-fruits-box.webp', kind: 'plan' },
];

export const BUNDLES: Offer[] = [
  ...PLANS,
  { key: 'bundle-platter', name: 'Get Well Soon Fruit Platter', price: 2299, was: 2600, image: '/home/bundle-fruit-platter.webp', kind: 'bundle' },
  { key: 'bundle-dry-box', name: 'Monthly Family Dry Fruits Box', price: 12199, was: 13545, image: '/home/bundle-dry-fruits-box.webp', kind: 'bundle' },
  // sample bundles
  { key: 'bundle-bbq', name: 'Weekend BBQ Veggie Box', price: 3499, was: 3990, image: '/home/plan-kitchen.webp', kind: 'bundle' },
  { key: 'bundle-juice', name: 'Fresh Juice Fruit Box', price: 2799, was: 3150, image: '/home/gift-5.webp', kind: 'bundle' },
  { key: 'bundle-snacking', name: 'Healthy Snacking Nuts Bundle', price: 4299, was: 4890, image: '/home/tile-mixed-nuts.webp', kind: 'bundle' },
];

export const GIFTS: Offer[] = [
  { key: 'gift-1', name: 'Customise Chocolate & Snacks Gift Basket', price: 850, note: 'Sizes: Small · Medium · Large · Extra Large', image: '/home/gift-1.webp', kind: 'gift' },
  { key: 'gift-2', name: 'Royal Deepavali Dry Fruit Basket', price: 11299, image: '/home/gift-2.webp', kind: 'gift' },
  { key: 'gift-3', name: 'Roshni Dry Fruit Basket', price: 6599, image: '/home/gift-3.webp', kind: 'gift' },
  { key: 'gift-4', name: 'Shubh Deepavali Dry Fruit Basket', price: 9499, image: '/home/gift-4.webp', kind: 'gift' },
  { key: 'gift-5', name: 'Royal Deepavali Fresh Fruit Basket', price: 10299, image: '/home/gift-5.webp', kind: 'gift' },
  // sample gift baskets
  { key: 'gift-eid', name: 'Eid Mubarak Dry Fruit Basket', price: 8999, image: '/home/gift-3.webp', kind: 'gift' },
  { key: 'gift-exotic', name: 'Premium Exotic Fruit Basket', price: 12499, image: '/home/gift-5.webp', kind: 'gift' },
  { key: 'gift-corporate', name: 'Corporate Gift Hamper', price: 15999, image: '/home/gift-4.webp', kind: 'gift' },
];

/** Nuts · Dates · Mixed Nuts · Seeds · Snack Pack tiles (category slugs from the catalogue) */
export const NUT_TILES = [
  { name: 'Nuts', slug: 'nuts', blurb: 'Crunch into healthy goodness! Discover a variety of nuts to fuel your day with nature’s best.', bg: '#f3c24b', ink: '#fbd45a', image: '/home/tile-nuts.webp' },
  { name: 'Dates', slug: 'dates', blurb: 'Sweeten your snack time with premium dates, perfect for a natural energy boost.', bg: '#f4775a', ink: '#ffc2a8', image: '/home/tile-dates.webp' },
  { name: 'Mixed Nuts', slug: 'mixed-nuts', blurb: 'The best of both worlds! Indulge in a delicious mix of your favourite nuts.', bg: '#ffa500', ink: '#ffd27a', image: '/home/tile-mixed-nuts.webp' },
  { name: 'Seeds', slug: 'seeds', blurb: 'Small but mighty! Power up with nutrient-rich seeds, packed with goodness.', bg: '#6bcdad', ink: '#9ff0d2', image: '/home/tile-seeds.webp' },
  {
    name: 'Snack Pack',
    slug: 'karachi-nuts-and-dates-snack-packs',
    blurb: 'Snack smart, snack tasty! Grab convenient snack packs for all your cravings.',
    bg: '#c1f21a',
    ink: '#d9ff63',
    image: 'https://cdn.shopify.com/s/files/1/0742/6591/9805/files/BrazilianNuts-SnackPack.jpg?v=1721741423',
  },
];

export const COMMITMENTS = [
  { label: 'Same-Day Delivery', icon: 'MapPin' },
  { label: 'Order and pick up', icon: 'Smartphone' },
  { label: 'Authentic goods', icon: 'PackageCheck' },
  { label: 'Farm-to-Table', icon: 'Sprout' },
  { label: 'Handcrafted Products', icon: 'HandHeart' },
  { label: 'Loyalty Rewards', icon: 'Gift' },
  { label: 'Multiple Payment Options', icon: 'CreditCard' },
  { label: 'Order & Collect', icon: 'Store' },
] as const;
