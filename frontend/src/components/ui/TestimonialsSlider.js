'use client';

import { useState, useRef } from 'react';
import { useAnimationFrame } from 'framer-motion';
import Image from 'next/image';
import styles from './TestimonialsSlider.module.scss';

const testimonials = [
  {
    id: 1,
    name: 'Lei Zhang',
    role: 'Player',
    rating: 5,
    date: 'A year ago',
    text: 'Top Quality indoor soccer facility, lunchtime pick up game is fun.',
    avatar: '/testimonials/Lei.png',
  },
  {
    id: 2,
    name: 'Burstyerbubble',
    role: 'Local Guide',
    rating: 5,
    date: 'A year ago',
    text: 'Excellent outdoor and indoor soccer facilities. We play here all year long.',
    avatar: '/testimonials/burstyerbubble.png',
  },
  {
    id: 3,
    name: 'Kyle Milbrand',
    role: 'Local Guide',
    rating: 5,
    date: 'A year ago',
    text: 'Really nice indoor fields (3) with plenty of spectator areas.',
    avatar: '/testimonials/kyle.png',
  },
  {
    id: 4,
    name: 'Phil DiAntonio',
    role: 'Local Guide',
    rating: 5,
    date: 'A month ago',
    text: 'Always a good spot for a game or tournament.',
    avatar: '/testimonials/phil.png',
  },
  {
    id: 5,
    name: 'MoovementINC Djz',
    role: 'Local Guide',
    rating: 5,
    date: 'A month ago',
    text: 'Great facility for indoor and outdoor soccer!',
    avatar: '/testimonials/MoovementINC.png',
  },
];

const duplicatedTestimonials = [...testimonials, ...testimonials];

const SCROLL_SPEED = 20;

export default function TestimonialsSlider() {
  const [isPaused, setIsPaused] = useState(false);
  const xPos = useRef(0);
  const containerRef = useRef(null);
  const singleSetWidthRef = useRef(0);

  useAnimationFrame((_, delta) => {
    if (!isPaused && containerRef.current) {
      if (singleSetWidthRef.current === 0 && containerRef.current.firstChild) {
        const firstChild = containerRef.current.firstChild;
        const nextSibling = firstChild.nextSibling;
        if (nextSibling) {
          const rect1 = firstChild.getBoundingClientRect();
          let currentChild = firstChild;
          let count = 0;
          while (currentChild && count < testimonials.length) {
            currentChild = currentChild.nextSibling;
            count++;
          }
          if (currentChild) {
            const rect2 = currentChild.getBoundingClientRect();
            singleSetWidthRef.current = Math.abs(rect2.left - rect1.left);
          }
        }
      }

      xPos.current -= delta / SCROLL_SPEED;

      if (
        singleSetWidthRef.current > 0 &&
        Math.abs(xPos.current) >= singleSetWidthRef.current
      ) {
        xPos.current = xPos.current % singleSetWidthRef.current;
      }

      containerRef.current.style.transform = `translateX(${xPos.current}px)`;
    }
  });

  const renderStars = (rating) => {
    return (
      <div className={styles.stars}>
        {[...Array(rating)].map((_, i) => (
          <svg
            key={i}
            width='20'
            height='20'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path d='M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z' />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.testimonials}>
      <div className={styles.header}>
        <h2>What Players Say</h2>
        <div className={styles.googleBadge}>
          <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
            <path
              d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              fill='#4285F4'
            />
            <path
              d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              fill='#34A853'
            />
            <path
              d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              fill='#FBBC05'
            />
            <path
              d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              fill='#EA4335'
            />
          </svg>
          <span>Google Reviews</span>
        </div>
      </div>

      <div className={styles.sliderWrapper}>
        <div
          className={styles.sliderTrack}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div ref={containerRef} className={styles.sliderContent}>
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${index}`}
                className={styles.testimonial}
              >
                <div className={styles.content}>
                  {renderStars(testimonial.rating)}
                  <p className={styles.text}>{testimonial.text}</p>
                  <div className={styles.author}>
                    <div className={styles.avatar}>
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                      />
                    </div>
                    <div className={styles.authorInfo}>
                      <div className={styles.name}>{testimonial.name}</div>
                      <div className={styles.meta}>
                        {testimonial.role} · {testimonial.date}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
