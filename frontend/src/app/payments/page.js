'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createCheckoutSession } from '@/lib/api';
import styles from './payments.module.scss';

const STRIPE_PRICE_ID = 'price_1SpsHRRf4ipOc26aE5FaWSMg';

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

const PaymentsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStripeCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { url } = await createCheckoutSession(STRIPE_PRICE_ID);
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.paymentsContainer}>
      <main className={styles.main}>
        <motion.div
          className={styles.hero}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className={styles.title} variants={itemVariants}>
            Payments
          </motion.h1>
          <motion.p className={styles.subtitle} variants={itemVariants}>
            Choose your preferred payment method
          </motion.p>
        </motion.div>

        <motion.div
          className={styles.paymentOptions}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className={styles.paymentCard}
            variants={cardVariants}
            whileHover={{ y: -4 }}
          >
            <div className={styles.cardIcon}>💳</div>
            <h2>Pay with Card</h2>
            <p>Secure payment via Stripe. All major credit and debit cards accepted.</p>
            {error && <p className={styles.error}>{error}</p>}
            <button
              className={styles.stripeButton}
              onClick={handleStripeCheckout}
              disabled={loading}
            >
              {loading ? 'Redirecting...' : 'Pay with Stripe'}
            </button>
          </motion.div>

          <motion.div
            className={styles.paymentCard}
            variants={cardVariants}
            whileHover={{ y: -4 }}
          >
            <div className={styles.cardIcon}>📱</div>
            <h2>Pay with Venmo</h2>
            <p>Send payment directly via Venmo for a quick and easy transaction.</p>
            <div className={styles.venmoInfo}>
              <span className={styles.venmoHandle}>@ysc_sports</span>
              <a
                href="https://venmo.com/ysc_sports"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.venmoButton}
              >
                Open Venmo
              </a>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.note}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <p>
            Questions about payments? Contact us at{' '}
            <a href="mailto:ysclunchsoccer@gmail.com">ysclunchsoccer@gmail.com</a>
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default PaymentsPage;
