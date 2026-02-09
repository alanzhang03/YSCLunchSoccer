'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from './my-profile.module.scss';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const MyProfilePage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <motion.div
          className={styles.profileCard}
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          <motion.div className={styles.header} variants={itemVariants}>
            <div className={styles.avatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h1>{user.name}</h1>
            <p className={styles.memberSince}>Member since {memberSince}</p>
          </motion.div>

          <motion.div className={styles.infoGrid} variants={itemVariants}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{user.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Phone</span>
              <span className={styles.value}>{user.phone}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Skill Level</span>
              <span className={styles.value}>{user.skill} / 10</span>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default MyProfilePage;
