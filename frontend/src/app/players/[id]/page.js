'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getPlayerProfile } from '@/lib/api';
import { POSITION_LABELS } from '@/lib/positions';
import Avatar from '@/components/ui/Avatar';
import styles from './page.module.scss';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

// Session dates are stored as calendar dates; parse the parts so the
// viewer's timezone can't shift them a day earlier.
function formatSessionDate(dateString) {
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function PlayerProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: viewer, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!viewer) {
      router.push('/login');
      return;
    }

    let cancelled = false;
    getPlayerProfile(id)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.status === 404 ? 'Player not found' : 'Failed to load profile',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, viewer, authLoading, router]);

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.status}>
          <p>{error}</p>
          <Link href='/sessions' className={styles.backLink}>
            ← Back to Sessions
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.page}>
        <div className={styles.status}>
          <div className={styles.spinner} />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const { user, upcomingSessions } = profile;
  const isOwnProfile = viewer?.id === user.id;
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
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
            {isOwnProfile && (
              <Link href='/my-profile' className={styles.editLink}>
                Edit profile
              </Link>
            )}
            <Avatar user={user} size={96} className={styles.avatar} />
            <h1>{user.name}</h1>
            <div className={styles.meta}>
              {user.position && (
                <span className={styles.positionBadge}>
                  {POSITION_LABELS[user.position] || user.position}
                </span>
              )}
              <span>Member since {memberSince}</span>
            </div>
          </motion.div>

          <motion.div className={styles.body} variants={itemVariants}>
            <h2>Upcoming sessions</h2>
            {upcomingSessions.length > 0 ? (
              <ul className={styles.sessionList}>
                {upcomingSessions.map((session) => (
                  <li key={session.id}>
                    <Link
                      href={`/sessions/${session.id}`}
                      className={styles.sessionRow}
                    >
                      <span className={styles.sessionDate}>
                        {formatSessionDate(session.date)}
                      </span>
                      <span className={styles.sessionDetails}>
                        {session.startTime} – {session.endTime} ·{' '}
                        {session.fieldLocation}
                      </span>
                      <span className={styles.chevron} aria-hidden='true'>
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>
                {isOwnProfile ? 'You haven’t' : `${user.name} hasn’t`} RSVP’d
                to any upcoming sessions yet.
              </p>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
