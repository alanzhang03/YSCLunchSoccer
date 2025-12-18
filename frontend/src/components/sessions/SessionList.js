'use client';
import { useState, useEffect, useMemo } from 'react';
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
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
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

  const filteredAndSortedSessions = useMemo(() => {
    let filtered = [...sessions];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    if (filter === 'thisWeek') {
      filtered = filtered.filter((session) => {
        const sessionDate = new Date(session.date);
        return sessionDate >= today && sessionDate < nextWeek;
      });
    } else if (filter === 'nextWeek') {
      filtered = filtered.filter((session) => {
        const sessionDate = new Date(session.date);
        return sessionDate >= nextWeek && sessionDate < nextMonth;
      });
    } else if (filter === 'thisMonth') {
      filtered = filtered.filter((session) => {
        const sessionDate = new Date(session.date);
        return sessionDate >= today && sessionDate < nextMonth;
      });
    }
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'attendance') {
        const aCount =
          a.attendances?.filter((at) => at.status === 'yes').length || 0;
        const bCount =
          b.attendances?.filter((at) => at.status === 'yes').length || 0;
        return bCount - aCount;
      }
      return 0;
    });

    return filtered;
  }, [sessions, filter, sortBy]);

  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const upcomingSessions = sessions.filter((s) => {
      const sessionDate = new Date(s.date);
      return sessionDate >= new Date();
    }).length;

    const userRSVPs = sessions.filter((s) => {
      if (!user || !s.attendances) return false;
      return s.attendances.some(
        (a) => a.userId === user.id && a.status === 'yes'
      );
    }).length;

    const totalAttendees = sessions.reduce((sum, s) => {
      return (
        sum + (s.attendances?.filter((a) => a.status === 'yes').length || 0)
      );
    }, 0);

    return { totalSessions, upcomingSessions, userRSVPs, totalAttendees };
  }, [sessions, user]);

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
        <div className={styles.loadingSpinner}></div>
        <p>Loading sessions...</p>
      </motion.div>
    );
  if (error)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.error}
      >
        <div className={styles.errorIcon}>⚠️</div>
        <p className={styles.errorTitle}>Error loading sessions</p>
        <p className={styles.errorMessage}>{error}</p>
        <button className={styles.retryButton} onClick={() => fetchSessions()}>
          Try Again
        </button>
      </motion.div>
    );

  if (sessions.length === 0)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.empty}
      >
        <div className={styles.emptyIcon}>⚽</div>
        <p className={styles.emptyTitle}>No sessions found</p>
        <p className={styles.emptySubtext}>
          Sessions will appear here once they're created.
        </p>
        {isAdmin && (
          <button
            className={styles.emptyActionButton}
            onClick={() => setShowAddSession(true)}
          >
            Create Your First Session
          </button>
        )}
      </motion.div>
    );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.statsBar}
      >
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.upcomingSessions}</span>
          <span className={styles.statLabel}>Upcoming</span>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.userRSVPs}</span>
          <span className={styles.statLabel}>Your RSVPs</span>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.totalAttendees}</span>
          <span className={styles.statLabel}>Total Attendees</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={styles.controlsBar}
      >
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${
              filter === 'all' ? styles.active : ''
            }`}
            onClick={() => setFilter('all')}
          >
            All Sessions
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === 'thisWeek' ? styles.active : ''
            }`}
            onClick={() => setFilter('thisWeek')}
          >
            This Week
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === 'nextWeek' ? styles.active : ''
            }`}
            onClick={() => setFilter('nextWeek')}
          >
            Next Week
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === 'thisMonth' ? styles.active : ''
            }`}
            onClick={() => setFilter('thisMonth')}
          >
            This Month
          </button>
        </div>
        <div className={styles.sortControls}>
          <label className={styles.sortLabel}>Sort by:</label>
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value='date'>Date</option>
            <option value='attendance'>Attendance</option>
          </select>
        </div>
        {isAdmin && (
          <button
            className={styles.addSessionButton}
            onClick={() => setShowAddSession(true)}
          >
            <span className={styles.addIcon}>+</span>
            <span>Add Session</span>
          </button>
        )}
      </motion.div>

      {showAddSession && (
        <AddSessionModal
          retrieveNewSession={handleNewSession}
          onClose={() => setShowAddSession(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {filteredAndSortedSessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={styles.empty}
        >
          <div className={styles.emptyIcon}>🔍</div>
          <p className={styles.emptyTitle}>No sessions match your filter</p>
          <p className={styles.emptySubtext}>
            Try adjusting your filter settings to see more sessions.
          </p>
          <button
            className={styles.emptyActionButton}
            onClick={() => setFilter('all')}
          >
            Show All Sessions
          </button>
        </motion.div>
      ) : (
        <motion.div
          className={styles.sessionList}
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          key={`sessions-${filteredAndSortedSessions.length}-${filter}-${sortBy}`}
        >
          {filteredAndSortedSessions.map((session, index) => (
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
      )}
    </>
  );
};

export default SessionList;
