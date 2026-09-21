import Link from 'next/link';
import { BsSignpostSplit } from 'react-icons/bs';
import styles from '@/components/ui/StatusPanel.module.css';

export default function NotFound() {
  return <section className={styles.panel}>
    <BsSignpostSplit className={styles.icon} size={48} aria-hidden="true" />
    <h1>Page not found</h1>
    <p>Looks like this road leads somewhere else. Explore our catalog to find your next car.</p>
    <Link href="/catalog" className="button">View Catalog</Link>
  </section>;
}
