import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
  display: 'swap',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Fresh Basket Pakistan — Fresh Produce, Organic Grocery & Supermarket',
  description:
    'Order fresh organic fruits, vegetables, imported dairy, bakery, beverages and pantry staples online in Karachi with same-day express delivery and Cash on Delivery.',
  openGraph: {
    title: 'Fresh Basket Pakistan — Fresh Produce & Organic Grocery',
    description:
      'Same-day express grocery delivery in Karachi. Fresh produce, imported dairy, bakery and pantry staples with Cash on Delivery.',
    type: 'website',
    locale: 'en_PK',
    siteName: 'Fresh Basket Pakistan',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Fresh House' }],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#10240f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-slate-800 bg-slate-50 selection:bg-fresh-500 selection:text-white`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
