'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionsByUser } from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './UpcomingSessions.module.scss';

const UpcomingSessions = () => {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchSessions();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await getSessionsByUser();
      setSessions(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return { weekday, formattedDate };
  };

  const getStatusBadge = (attendance) => {
    if (!attendance || !attendance.length) return null;
    const status = attendance[0]?.status;
    if (!status) return null;
    const statusColors = {
      yes: '#10b981',
      maybe: '#f59e0b',
      no: '#ef4444',
    };
    return (
      <span
        className={styles.statusBadge}
        style={{ backgroundColor: statusColors[status] || '#6b7280' }}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className={styles.upcomingSessionsContainer}>
        <h2>Your Upcoming Sessions</h2>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className={styles.upcomingSessionsContainer}>
        <h2>Your Upcoming Sessions</h2>
        <p className={styles.error}>Error: {error}</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className={styles.upcomingSessionsContainer}>
        <h2>Your Upcoming Sessions</h2>
        <p className={styles.empty}>
          You haven't RSVP'd to any upcoming sessions yet.{' '}
          <Link href="/sessions" className={styles.link}>
            Browse sessions
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.upcomingSessionsContainer}>
      <h2>Your Upcoming Sessions</h2>
      <div className={styles.sessionsList}>
        {sessions.map((session, index) => {
          const { weekday, formattedDate } = formatDate(session.date);
          const time = `${session.startTime} - ${session.endTime} ${session.timezone}`;
          return (
            <motion.div
              key={session.id}
              className={styles.sessionItem}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Link
                href={`/sessions/${session.id}`}
                className={styles.sessionLink}
              >
                <div className={styles.sessionContent}>
                  <div className={styles.sessionHeader}>
                    <span className={styles.weekday}>{weekday}</span>
                    {getStatusBadge(session.attendances)}
                  </div>
                  <div className={styles.sessionDate}>{formattedDate}</div>
                  <div className={styles.sessionTime}>{time}</div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingSessions;
