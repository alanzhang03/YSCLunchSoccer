"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./page.module.scss";

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

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <motion.div
          className={styles.hero}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className={styles.title} variants={itemVariants}>
            Welcome to YSC Lunch Soccer!
          </motion.h1>
          <motion.p className={styles.subtitle} variants={itemVariants}>
            Join your colleagues for lunchtime soccer sessions
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
                href="/signup"
                className={styles.signupButton}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Sign Up
              </motion.a>
              <motion.a
                href="/login"
                className={styles.loginButton}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Log In
              </motion.a>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className={styles.ctaSection}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <motion.a
            href="/sessions"
            className={styles.ctaButton}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <span>View Upcoming Sessions</span>
          </motion.a>
        </motion.div>

        <motion.div
          className={styles.infoSection}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className={styles.infoCard}
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <h2>How it works</h2>
            <p>
              Browse upcoming lunch soccer sessions and RSVP to let others know
              if you're attending, can't make it, or are a maybe.
            </p>
          </motion.div>
          <motion.div
            className={styles.infoCard}
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <h2>Get started</h2>
            <p>
              {user ? (
                <>
                  You're all set! Head over to the{" "}
                  <Link href="/sessions" className={styles.link}>
                    Sessions
                  </Link>{" "}
                  page to see upcoming games.
                </>
              ) : (
                <>
                  <Link href="/signup" className={styles.link}>
                    Sign up
                  </Link>{" "}
                  or{" "}
                  <Link href="/login" className={styles.link}>
                    log in
                  </Link>{" "}
                  to start RSVPing to sessions.
                </>
              )}
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
