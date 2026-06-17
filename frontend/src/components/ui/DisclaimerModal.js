'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DisclaimerModal.module.scss';
import { getDisclaimerInfo } from '@/lib/api';

export default function DisclaimerModal() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const disclaimer = await getDisclaimerInfo();
        if (disclaimer?.enabled) {
          setMessage(disclaimer.message);
          setVisible(true);
        }
      } catch {}
    };
    load();
  }, []);

  const dismiss = () => setVisible(false);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className={styles.iconRow}>
              <span className={styles.icon}>📢</span>
            </div>
            <h2 className={styles.title}>Heads Up</h2>
            <p className={styles.message}>{message}</p>
            <button className={styles.okButton} onClick={dismiss}>
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
