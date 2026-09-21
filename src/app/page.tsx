import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <Image src="/images/hero.webp" alt="" fill preload sizes="100vw" className={styles.image} />
      <div className={styles.shade} />
      <div className={`container ${styles.content}`}>
        <h1 id="hero-title">Find your perfect rental car</h1>
        <p>Reliable and budget-friendly rentals for any journey</p>
        <Link href="/catalog" className={`button ${styles.cta}`}>View Catalog</Link>
      </div>
    </section>
  );
}
