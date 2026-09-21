import Link from 'next/link';
import Navigation from './Navigation';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo} aria-label="RentalCar home">Rental<span>Car</span></Link>
        <Navigation />
      </div>
    </header>
  );
}
