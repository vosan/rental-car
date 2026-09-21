import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Providers from './providers';
import './globals.css';
// Next.js preloads fallback-route CSS even when the fallback is not rendered.
// Load these small shared styles here so that preload is always consumed.
import '@/components/ui/StatusPanel.module.css';

export const metadata: Metadata = {
  title: { default: 'RentalCar — Find your perfect rental car', template: '%s | RentalCar' },
  description: 'Explore reliable, budget-friendly rental cars. Compare brands, prices and mileage, find your ideal car, and send a booking request.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      {/* Extensions such as Grammarly add body attributes before React hydrates.
          Suppress that shallow mismatch only; descendants still get checked. */}
      <body suppressHydrationWarning>
        <a className="skipLink" href="#main-content">Skip to content</a>
        <Providers>
          <Header />
          <main id="main-content">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
