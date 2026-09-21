'use client';

import Link from 'next/link';
import { BsExclamationCircle } from 'react-icons/bs';
import styles from '@/components/ui/StatusPanel.module.css';

export default function CarError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className={styles.panel} role="alert">
    <BsExclamationCircle className={styles.icon} size={40} aria-hidden="true" />
    <h1>We couldn’t load this car</h1>
    <p>Please check your connection and try again.</p>
    <button type="button" className="button" onClick={reset}>Try again</button>
    <Link href="/catalog" className="buttonSecondary">Back to catalog</Link>
  </section>;
}
