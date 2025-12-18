'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import styles from './SessionList.module.scss';
import SessionCard from './SessionCard';
import { getUpcomingSessions } from '@/lib/sessions';
import { getSessions, createSession } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import AddSessionModal from './AddSessionModal';

const SessionList = ({ passedData }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  // const data = getUpcomingSessions(8);
  const isAdmin = user?.isAdmin || false;

  const handleNewSession = async (sessionData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createSession({
        date: sessionData.date,
        dayOfWeek: sessionData.dayOfWeek,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        timezone: sessionData.timezone || 'EST',
      });
      await fetchSessions(false);
      setShowAddSession(false);
    } catch (err) {
      setError(err.message || 'Failed to create session');
      console.error('Error creating session:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchSessions = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const data = await getSessions();
      console.log('Fetched sessions:', data);
      setSessions(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setSessions([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const updateSession = async (sessionId) => {
    try {
      const data = await getSessions();
      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id === sessionId) {
            const updated = data.find((s) => s.id === sessionId);
            return updated || session;
          }
          return session;
        })
      );
    } catch (err) {}
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      fetchSessions(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!loading && sessions.length > 0) {
      fetchSessions(false);
    }
  }, [user?.id]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
        when: 'beforeChildren',
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  if (loading)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.loading}
      >
        Loading sessions...
      </motion.div>
    );
  if (error)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.error}
      >
        Error: {error}
      </motion.div>
    );

  if (sessions.length === 0)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.empty}
      >
        <p>No sessions found.</p>
        <p className={styles.emptySubtext}>
          Sessions will appear here once they're created.
        </p>
      </motion.div>
    );

  return (
    <>
      {isAdmin && (
        <button
          className={styles.addSessionButton}
          onClick={() => setShowAddSession(true)}
        >
          <span className={styles.addIcon}>+</span>
          <span>Add Session</span>
        </button>
      )}

      {showAddSession && (
        <AddSessionModal
          retrieveNewSession={handleNewSession}
          onClose={() => setShowAddSession(false)}
          isSubmitting={isSubmitting}
        />
      )}

      <motion.div
        className={styles.sessionList}
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        key={`sessions-${sessions.length}`}
      >
        {sessions.map((session, index) => (
          <motion.div
            key={session.id}
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <SessionCard
              sessionData={session}
              onAttendanceUpdate={() => updateSession(session.id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
};

export default SessionList;
