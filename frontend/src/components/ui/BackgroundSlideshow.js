'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './BackgroundSlideshow.module.scss';

const defaultImages = [
  '/gallery/7.png',
  '/gallery/1.png',
  '/gallery/21.jpg',
  '/gallery/2.png',
  '/gallery/18.jpg',
  '/gallery/20.jpg',
];

// Keep in sync with $slide-duration in BackgroundSlideshow.module.scss
const INTERVAL = 8000;

// Fixed, full-viewport background that crossfades between photos while
// each one slowly zooms in. Sits beneath the page's gradient overlay.
export default function BackgroundSlideshow({ images = defaultImages }) {
  // Start at -1 so the first slide fades and zooms in after mount
  const [currentIndex, setCurrentIndex] = useState(-1);
  // Only mount images as they're needed, so we don't fetch them all up front.
  // Stays one slide ahead of currentIndex so the next image is ready before it fades in.
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
