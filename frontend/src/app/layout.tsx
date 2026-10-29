import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'Fresh Basket Pakistan — Fresh Produce, Organic Grocery & Supermarket',
  description:
    'Order fresh organic fruits, vegetables, imported dairy, bakery, beverages and pantry staples online in Karachi with same-day express delivery and Cash on Delivery.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-800 bg-slate-50 selection:bg-fresh-500 selection:text-white">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
