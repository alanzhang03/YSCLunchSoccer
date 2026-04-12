'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './page.module.scss';
import UpcomingSessions from '@/components/ui/UpcomingSessions';
import TestimonialsSlider from '@/components/ui/TestimonialsSlider';

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
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <motion.div
          className={styles.hero}
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          <motion.div className={styles.scheduleTag} variants={itemVariants}>
            Mon · Fri &nbsp;·&nbsp; 11:30 AM – 1:05 PM
          </motion.div>

          <motion.h1 className={styles.title} variants={itemVariants}>
            YSC Lunch Soccer
          </motion.h1>

          <motion.p className={styles.subtitle} variants={itemVariants}>
            Join your friends for lunchtime soccer sessions
          </motion.p>

          <motion.a
            href='https://www.google.com/maps/place/YSC+Sports/@40.0773687,-75.4039779,1694m/data=!3m2!1e3!4b1!4m6!3m5!1s0x89c6945bbbf66627:0xc51da4623125fd8e!8m2!3d40.0773687!4d-75.4039779!16s%2Fg%2F1txnqdnh?entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoASAFQAw%3D%3D'
            target='_blank'
            rel='noopener noreferrer'
            className={styles.location}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            📍 224 County Line Rd, Wayne, PA
          </motion.a>

          {!loading && user && (
            <motion.p
              className={styles.welcomeMessage}
              variants={itemVariants}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              Welcome back, <strong>{user.name}</strong>!
            </motion.p>
          )}

          {!loading && !user && (
            <motion.div
              className={styles.authButtons}
              variants={itemVariants}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <motion.a
                href='/signup'
                className={styles.signupButton}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                Sign Up
              </motion.a>
              <motion.a
                href='/login'
                className={styles.loginButton}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                Log In
              </motion.a>
            </motion.div>
          )}
        </motion.div>

        <UpcomingSessions />

        <motion.div
          className={styles.howItWorks}
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.h2 className={styles.sectionTitle} variants={itemVariants}>
            How it works
          </motion.h2>

          <div className={styles.steps}>
            <motion.div className={styles.step} variants={itemVariants}>
              <span className={styles.stepNumber}>01</span>
              <div className={styles.stepContent}>
                <h3>RSVP to a session</h3>
                <p>
                  Browse upcoming Monday and Friday sessions. Hit Yes before
                  10:45 AM and you&apos;re in.
                </p>
              </div>
            </motion.div>

            <motion.div
              className={styles.stepDivider}
              variants={itemVariants}
            />

            <motion.div className={styles.step} variants={itemVariants}>
              <span className={styles.stepNumber}>02</span>
              <div className={styles.stepContent}>
                <h3>Get your team assignment</h3>
                <p>
                  Teams are skill-balanced automatically. You&apos;ll get an SMS
                  with your team, jersey color, and opponents before kickoff.
                </p>
              </div>
            </motion.div>

            <motion.div
              className={styles.stepDivider}
              variants={itemVariants}
            />

            <motion.div className={styles.step} variants={itemVariants}>
              <span className={styles.stepNumber}>03</span>
              <div className={styles.stepContent}>
                <h3>Show up and play</h3>
                <p>Arrive at YSC Sports, find your team, and play!</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {!loading && !user && (
          <motion.div
            className={styles.ctaSection}
            variants={itemVariants}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-80px' }}
          >
            <h3>Ready to play?</h3>
            <div className={styles.ctaButtons}>
              <Link href='/signup' className={styles.primaryButton}>
                Get started
              </Link>
              <Link href='/about-us' className={styles.secondaryLink}>
                Learn more
              </Link>
            </div>
          </motion.div>
        )}
        <TestimonialsSlider />
      </main>
    </div>
  );
}
