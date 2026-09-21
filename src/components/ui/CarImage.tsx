'use client';

import Image from 'next/image';
import { useState } from 'react';
import { BsCarFront } from 'react-icons/bs';
import styles from './CarImage.module.css';

type CarImageProps = {
  src: string;
  alt: string;
  variant?: 'card' | 'detail';
  loading?: 'eager' | 'lazy';
};

export function CarImage({
  src,
  alt,
  variant = 'card',
  loading = variant === 'detail' ? 'eager' : 'lazy',
}: CarImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return (
    <div className={`${styles.wrapper} ${styles[variant]}`}>
      {!src || failedSrc === src ? (
        <div className={styles.fallback} role="img" aria-label={`${alt}. Photo unavailable`}>
          <BsCarFront size={40} aria-hidden="true" />
          <span>Photo unavailable</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          loading={loading}
          sizes={variant === 'detail' ? '(max-width: 767px) calc(100vw - 32px), (max-width: 1200px) 55vw, 640px' : '(max-width: 600px) calc(100vw - 64px), (max-width: 900px) 42vw, (max-width: 1150px) 27vw, 244px'}
          className={styles.image}
          onError={() => setFailedSrc(src)}
        />
      )}
    </div>
  );
}

export default CarImage;
