'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './BackgroundSlideshow.module.scss';
import { galleryUrl } from '@/lib/gallery';

const defaultImages = [
  '7.jpg',
  '1.jpg',
  '21.jpg',
  '2.jpg',
  '18.jpg',
  '20.jpg',
].map(galleryUrl);

const INTERVAL = 8000;

export default function BackgroundSlideshow({ images = defaultImages }) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loadedUpTo, setLoadedUpTo] = useState(2);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setCurrentIndex(0));
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      setLoadedUpTo((prev) => Math.min(prev + 1, images.length));
    }, INTERVAL);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(timer);
    };
  }, [images.length]);

  return (
    <div className={styles.background} aria-hidden='true'>
      {images.slice(0, loadedUpTo).map((src, index) => (
        <div
          key={src}
          className={`${styles.slide} ${
            index === currentIndex ? styles.active : ''
          }`}
        >
          <Image
            src={src}
            alt=''
            fill
            sizes='100vw'
            quality={70}
            priority={index === 0}
            className={styles.image}
          />
        </div>
      ))}
    </div>
  );
}
