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
  {
    id: 5,
    name: 'Jerry DeRosa',
    role: 'Local Guide',
    rating: 5,
    date: 'A month ago',
    text: 'Great place to work on your soccer skills, nice facilities for both indoor and outdoor practices and games. Lots of leagues!',
    avatar: '/testimonials/jerry.png',
  },
];

const duplicatedTestimonials = [
  ...testimonials,
  ...testimonials,
  ...testimonials,
];

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
          <Image src='/logos/Google.svg' alt='Google' width={20} height={20} />
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
