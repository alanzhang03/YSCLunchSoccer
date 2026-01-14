'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './page.module.scss';
import UpcomingSessions from '@/components/ui/UpcomingSessions';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
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
          <motion.h1 className={styles.title} variants={itemVariants}>
            YSC Lunch Soccer
          </motion.h1>
          <motion.p className={styles.subtitle} variants={itemVariants}>
            Join your friends for lunchtime soccer sessions
          </motion.p>
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
                href='/login'
                className={styles.loginButton}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                Log In
              </motion.a>
              <motion.a
                href='/signup'
                className={styles.signupButton}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                Sign Up
              </motion.a>
            </motion.div>
          )}
        </motion.div>

        <UpcomingSessions />

        <motion.div
          className={styles.ctaSection}
          variants={itemVariants}
          initial='hidden'
          animate='visible'
          transition={{ delay: 0.3 }}
        >
          <motion.a
            href='/sessions'
            className={styles.ctaButton}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <span>View Sessions</span>
          </motion.a>
        </motion.div>

        <motion.div
          className={styles.featuresSection}
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          <motion.div className={styles.feature} variants={itemVariants}>
            <h2>Play together.</h2>
            <p>
              Join your friends for lunchtime soccer. RSVP to sessions, see who&apos;s
              playing, and get ready for kickoff.
            </p>
          </motion.div>

          <motion.div className={styles.feature} variants={itemVariants}>
            <h2>Stay organized.</h2>
            <p>
              Automatic team formation. Real-time attendance tracking. Everything
              you need, all in one place.
            </p>
          </motion.div>

          <motion.div className={styles.feature} variants={itemVariants}>
            <h2>Build community.</h2>
            <p>
              Connect with fellow players. Make new friends. Strengthen bonds
              through the beautiful game.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.ctaSection}
          variants={itemVariants}
          initial='hidden'
          animate='visible'
        >
          {!user && (
            <>
              <h3>Ready to play?</h3>
              <div className={styles.ctaButtons}>
                <Link href='/signup' className={styles.primaryButton}>
                  Get started
                </Link>
                <Link href='/about-us' className={styles.secondaryLink}>
                  Learn more
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
