import styles from '@/components/ui/StatusPanel.module.css';

export default function Loading() {
  return <div className={styles.panel} role="status" aria-live="polite">
    <span className={styles.spinner} aria-hidden="true" />
    <p>Loading car details…</p>
  </div>;
}
