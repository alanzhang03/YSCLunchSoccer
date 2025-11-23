"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getSessionById } from "@/lib/api";
import SessionCard from "@/components/sessions/SessionCard";
import styles from "./page.module.scss";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
    },
  },
};

const contentVariants = {
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

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id;
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const data = await getSessionById(sessionId);
        setSession(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const handleAttendanceUpdate = async () => {
    try {
      const data = await getSessionById(sessionId);
      setSession(data);
    } catch (err) {}
  };

  if (loading) {
    return (
      <motion.div
        className={styles.page}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.loading}>Loading session...</div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className={styles.page}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.error}>
          <p>Error: {error}</p>
          <a href="/sessions" className={styles.backLink}>
            ← Back to Sessions
          </a>
        </div>
      </motion.div>
    );
  }

  if (!session) {
    return (
      <motion.div
        className={styles.page}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.error}>
          <p>Session not found</p>
          <a href="/sessions" className={styles.backLink}>
            ← Back to Sessions
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.page}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <main className={styles.main}>
        <motion.div
          className={styles.header}
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          <a href="/sessions" className={styles.backLink}>
            ← Back to Sessions
          </a>
          <h1 className={styles.title}>Session Details</h1>
        </motion.div>

        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <SessionCard
            sessionData={session}
            onAttendanceUpdate={handleAttendanceUpdate}
          />
        </motion.div>
      </main>
    </motion.div>
  );
}
