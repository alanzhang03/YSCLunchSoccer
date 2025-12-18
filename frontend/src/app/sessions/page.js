'use client';

import { motion } from 'framer-motion';
import styles from './sessions.module.scss';
import SessionList from '@/components/sessions/SessionList';

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const underlineVariants = {
  hidden: { width: 0, opacity: 0 },
  visible: {
    width: 80,
    opacity: 1,
    transition: {
      delay: 0.3,
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export default function SessionsPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <motion.div
          className={styles.header}
          variants={headerVariants}
          initial='hidden'
          animate='visible'
        >
          <motion.h1 className={styles.title}>Upcoming Sessions</motion.h1>
          <motion.div
            className={styles.titleUnderline}
            variants={underlineVariants}
            initial='hidden'
            animate='visible'
          ></motion.div>
        </motion.div>
        <SessionList />
      </main>
    </div>
  );
}
