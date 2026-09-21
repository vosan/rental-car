import type { IconType } from 'react-icons';
import {
  BsCalendar2Week,
  BsCarFront,
  BsCheckCircle,
  BsFuelPump,
  BsGear,
  BsGeoAlt,
} from 'react-icons/bs';
import { PiRoadHorizon } from 'react-icons/pi';
import { CarImage } from '@/components/ui/CarImage';
import { formatMileage, formatPrice } from '@/lib/formatters';
import type { Car } from '@/types/car';
import { BookingForm } from './BookingForm';
import styles from './CarDetails.module.css';

interface CarDetailsProps {
  car: Car;
}

interface Specification {
  label: string;
  value: string | number;
  icon: IconType;
}

export function CarDetails({ car }: CarDetailsProps) {
  const title = `${car.brand} ${car.model}, ${car.year}`;
  const specifications: Specification[] = [
    { label: 'Year', value: car.year, icon: BsCalendar2Week },
    { label: 'Type', value: car.type, icon: BsCarFront },
    { label: 'Fuel Consumption', value: car.fuelConsumption, icon: BsFuelPump },
    { label: 'Engine', value: car.engine, icon: BsGear },
    { label: 'Mileage', value: formatMileage(car.mileage), icon: PiRoadHorizon },
  ];

  return (
    <div className={`container ${styles.layout}`}>
      <div className={styles.leftColumn}>
        <div className={styles.image}>
          <CarImage src={car.img} alt={title} variant="detail" />
        </div>
        <BookingForm carId={car.id} />
      </div>

      <article className={styles.information} aria-labelledby="car-title">
        <div className={styles.overview}>
          <div className={styles.identity}>
            <h1 id="car-title">{title}</h1>
            <p className={styles.article}>Article: {car.stockNumber}</p>
          </div>
          <p className={styles.location}>
            <BsGeoAlt size={16} aria-hidden="true" />
            <span>{car.location.city}, {car.location.country}</span>
          </p>
          <p className={styles.price}>{formatPrice(car.rentalPrice)}</p>
          <p className={styles.description}>{car.description}</p>
        </div>

        <div className={styles.sections}>
          <section className={styles.section} aria-labelledby="rental-conditions">
            <h2 id="rental-conditions">Rental Conditions:</h2>
            <ul className={styles.list}>
              {car.rentalConditions.map((condition, index) => (
                <li key={`${condition}-${index}`}>
                  <BsCheckCircle size={16} aria-hidden="true" />
                  <span>{condition}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="car-specifications">
            <h2 id="car-specifications">Car Specifications:</h2>
            <ul className={styles.list}>
              {specifications.map(({ label, value, icon: Icon }) => (
                <li key={label}>
                  <Icon size={16} aria-hidden="true" />
                  <span>{label}: {value}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="car-features">
            <h2 id="car-features">Features</h2>
            <ul className={styles.list}>
              {car.features.map((feature, index) => (
                <li key={`${feature}-${index}`}>
                  <BsCheckCircle size={16} aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
}
