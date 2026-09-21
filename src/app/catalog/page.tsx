import type { Metadata } from 'next';
import Catalog from '@/components/catalog/Catalog';

export const metadata: Metadata = {
  title: 'Car catalog',
  description: 'Find your next rental car. Filter available cars by brand, price per hour, and mileage.',
};

export default function CatalogPage() {
  return <Catalog />;
}
