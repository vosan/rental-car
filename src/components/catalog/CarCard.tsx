import type { Car } from '@/types/car';
import { CarImage } from '@/components/ui/CarImage';
import { formatMileage, formatPrice } from '@/lib/formatters';
import styles from './CarCard.module.css';

export function CarCard({ car }: { car: Car }) {
  const name = `${car.brand} ${car.model}, ${car.year}`;

  return (
    <article className={styles.card}>
      <CarImage src={car.img} alt={name} variant="card" />
      <div className={styles.content}>
        <div className={styles.heading}>
          <h2>{car.brand} <span>{car.model}</span>, {car.year}</h2>
          <p className={styles.price}>{formatPrice(car.rentalPrice)}</p>
        </div>
        <div className={styles.metadata}>
          <p>
            <span>{car.location.city}</span>
            <span>{car.location.country}</span>
            <span>{car.rentalCompany}</span>
          </p>
          <p>
            <span>{car.type}</span>
            <span>{formatMileage(car.mileage)}</span>
          </p>
        </div>
      </div>
      <a href={`/catalog/${car.id}`} target="_blank" rel="noopener noreferrer" className={`button ${styles.link}`}>
        Read more<span className="srOnly"> about {name} (opens in a new tab)</span>
      </a>
    </article>
  );
}
