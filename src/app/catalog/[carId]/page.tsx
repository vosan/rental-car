import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCar } from '@/lib/api/cars';
import { ApiError } from '@/lib/api/client';
import { CarDetails } from '@/components/car-details/CarDetails';

export const dynamic = 'force-dynamic';
const loadCar = cache(getCar);
type Props = { params: Promise<{ carId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { carId } = await params;
  try {
    const car = await loadCar(carId);
    return { title: `${car.brand} ${car.model}, ${car.year}`, description: car.description };
  } catch {
    return { title: 'Car details' };
  }
}

export default async function CarDetailsPage({ params }: Props) {
  const { carId } = await params;
  let car;
  try {
    car = await loadCar(carId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  return <CarDetails car={car} />;
}
