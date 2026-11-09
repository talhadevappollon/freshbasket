import type { Metadata } from 'next';
import OfferGroupPage from '@/components/offers/OfferGroupPage';

export const metadata: Metadata = { title: 'Bundle Boxes — Fresh House' };

export default function Page() {
  return <OfferGroupPage group="bundles" />;
}
