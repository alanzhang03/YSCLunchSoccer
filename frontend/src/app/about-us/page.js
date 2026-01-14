'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './aboutus.module.scss';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const AboutUsPage = () => {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <motion.div
          className={styles.hero}
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          <motion.h1 className={styles.title} variants={itemVariants}>
            About YSC Lunch Soccer
          </motion.h1>
          <motion.p className={styles.subtitle} variants={itemVariants}>
            Bringing the community together through the beautiful game
          </motion.p>
        </motion.div>

        <motion.section
          className={styles.contentSection}
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          <motion.div className={styles.contentBlock} variants={itemVariants}>
            <h2>Built for community.</h2>
            <p>
              YSC Lunch Soccer brings people together through the game we love.
              Every session is a chance to connect, compete, and build lasting
              friendships on the field.
            </p>
          </motion.div>

          <motion.div className={styles.contentBlock} variants={itemVariants}>
            <h2>Simple to use.</h2>
            <p>
              Browse upcoming sessions. RSVP with your status. See who&apos;s playing.
              When teams are locked, you&apos;re ready to go. Everything you need in
              one place.
            </p>
          </motion.div>

          <motion.div className={styles.contentBlock} variants={itemVariants}>
            <h2>Everyone plays.</h2>
            <p>
              From seasoned players to those just starting out, all skill levels
              are welcome. The only requirement is showing up ready to have fun.
            </p>
          </motion.div>
        </motion.section>

        <motion.div
          className={styles.statsBar}
          variants={itemVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
        >
          <div className={styles.stat}>
            <span className={styles.statValue}>100+</span>
            <span className={styles.statLabel}>Sessions</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>50+</span>
            <span className={styles.statLabel}>Players</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>Weekly</span>
            <span className={styles.statLabel}>Games</span>
          </div>
        </motion.div>

        <motion.div
          className={styles.ctaBlock}
          variants={itemVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
        >
          <h3>Ready to play?</h3>
          <div className={styles.ctaButtons}>
            <Link href='/sessions' className={styles.primaryButton}>
              View sessions
            </Link>
            <Link href='/signup' className={styles.secondaryButton}>
              Sign up
            </Link>
          </div>
        </motion.div>

        <motion.section
          className={styles.contactSection}
          variants={itemVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
        >
          <motion.div
            className={styles.contactCard}
            variants={cardVariants}
            whileHover={{ y: -4 }}
          >
            <h2>Get in Touch</h2>
            <p>
              Have questions, suggestions, or want to learn more? We&apos;d love to
              hear from you!
            </p>
            <div className={styles.contactInfo}>
              <a href='mailto:ysclunchsoccer@gmail.com' className={styles.link}>
                ysclunchsoccer@gmail.com
              </a>
              <a href='tel:+14848600997' className={styles.link}>
                (484) 860-0997
              </a>
            </div>
            <div className={styles.socialLinks}>
              <a
                href='https://www.yscsports.com/'
                target='_blank'
                rel='noopener noreferrer'
                className={styles.socialLink}
              >
                Visit YSC Sports
              </a>
            </div>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
};

export default AboutUsPage;
