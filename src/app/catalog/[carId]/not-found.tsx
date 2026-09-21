import Link from 'next/link';
import { BsCarFront } from 'react-icons/bs';
import styles from '@/components/ui/StatusPanel.module.css';

export default function CarNotFound() {
  return <section className={styles.panel}>
    <BsCarFront className={styles.icon} size={48} aria-hidden="true" />
    <h1>Car not found</h1>
    <p>This car is no longer available, or the link is incorrect. Find another car in our catalog.</p>
    <Link href="/catalog" className="button">Back to catalog</Link>
  </section>;
}
