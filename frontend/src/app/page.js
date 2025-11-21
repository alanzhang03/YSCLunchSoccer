"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Welcome to YSC Lunch Soccer!</h1>
          <p className={styles.subtitle}>
            Join your colleagues for lunchtime soccer sessions
          </p>
          {!loading && user && (
            <p className={styles.welcomeMessage}>
              Welcome back, <strong>{user.name}</strong>!
            </p>
          )}
        </div>

        <div className={styles.ctaSection}>
          <Link href="/sessions" className={styles.ctaButton}>
            View Upcoming Sessions
          </Link>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h2>How it works</h2>
            <p>
              Browse upcoming lunch soccer sessions and RSVP to let others know
              if you're attending, can't make it, or are a maybe.
            </p>
          </div>
          <div className={styles.infoCard}>
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
          </div>
        </div>
      </main>
    </div>
  );
}
