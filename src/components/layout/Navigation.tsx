'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className={styles.navigation}>
      <Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>Home</Link>
      <Link href="/catalog" aria-current={pathname.startsWith('/catalog') ? 'page' : undefined}>Catalog</Link>
    </nav>
  );
}
