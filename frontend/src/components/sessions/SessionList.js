'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './SessionList.module.scss';
import SessionCard from './SessionCard';
import AddSessionModal from './AddSessionModal';
import StatsBar from './StatsBar';
import SessionControls from './SessionControls';
import { getSessions, createSession, attendMultipleSessions } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

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
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

const parseSessionDate = (session) => {
  if (
    typeof session.date === 'string' &&
    session.date.match(/^\d{4}-\d{2}-\d{2}/)
  ) {
    const [year, month, day] = session.date.split('T')[0].split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  return new Date(session.date);
};

const SessionList = () => {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;

  let currentFilter = 'thisWeek';

  const todayDayOfWeek = new Date().getDay();
  if (todayDayOfWeek === 6 || todayDayOfWeek === 0) {
    currentFilter = 'nextWeek';
  }

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);

  const [filter, setFilter] = useState(currentFilter);
  const [sortBy, setSortBy] = useState('date');
  const [dayFilter, setDayFilter] = useState('all');

  const fetchSessions = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getSessions();
      setSessions(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setSessions([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

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
        group: sessionData.group || '',
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
        }),
      );
    } catch (err) {}
  };

  const rsvpToSessions = async (sessionIds) => {
    if (sessionIds.length === 0) return;
    try {
      setIsSubmitting(true);
      await attendMultipleSessions(sessionIds, 'yes');
      await fetchSessions(false);
    } catch (err) {
      setError(err.message || 'Failed to RSVP to sessions');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      fetchSessions(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [loading, fetchSessions]);

  useEffect(() => {
    if (!loading && sessions.length > 0) {
      fetchSessions(false);
    }
  }, [user?.id]);

  const handleFilterClick = (time) => {
    setFilter(time);
  };

  const filteredAndSortedSessions = useMemo(() => {
    let filtered = [...sessions];

    if (!user?.isAdmin) {
      filtered = filtered.filter((session) => {
        if (!session.group || session.group === '') return true;
        if (session.group === 'wedGroup') return user?.wedGroup;
        if (session.group === 'ogGroup') return user?.ogGroup;
        if (session.group === 'testingGroup') return user?.testingGroup;
        return false;
      });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const thisWeekEnd = new Date(today);
    thisWeekEnd.setDate(thisWeekEnd.getDate() + daysUntilMonday);

    const nextWeekStart = new Date(thisWeekEnd);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    if (filter === 'today') {
      filtered = filtered.filter((session) => {
        const sessionDate = parseSessionDate(session);
        const sessionDateOnly = new Date(
          sessionDate.getFullYear(),
          sessionDate.getMonth(),
          sessionDate.getDate(),
        );
        return sessionDateOnly.getTime() === today.getTime();
      });
    } else if (filter === 'thisWeek') {
      filtered = filtered.filter((session) => {
        const sessionDate = parseSessionDate(session);
        return sessionDate >= today && sessionDate < thisWeekEnd;
      });
    } else if (filter === 'nextWeek') {
      filtered = filtered.filter((session) => {
        const sessionDate = parseSessionDate(session);
        return sessionDate >= nextWeekStart && sessionDate < nextWeekEnd;
      });
    } else if (filter === 'thisMonth') {
      filtered = filtered.filter((session) => {
        const sessionDate = parseSessionDate(session);
        return sessionDate >= today && sessionDate < thisMonthEnd;
      });
    }

    if (dayFilter !== 'all') {
      filtered = filtered.filter((session) => session.dayOfWeek === dayFilter);
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
  }, [
    sessions,
    filter,
    sortBy,
    dayFilter,
    user?.isAdmin,
    user?.ogGroup,
    user?.wedGroup,
  ]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const upcomingSessions = filteredAndSortedSessions.filter((s) => {
      const sessionDate = parseSessionDate(s);
      return sessionDate >= today;
    }).length;

    const userRSVPs = filteredAndSortedSessions.filter((s) => {
      if (!user?.id || !s.attendances) return false;
      return s.attendances.some(
        (a) => a.userId === user.id && a.status === 'yes',
      );
    }).length;

    const totalAttendees = filteredAndSortedSessions.reduce((sum, s) => {
      return (
        sum + (s.attendances?.filter((a) => a.status === 'yes').length || 0)
      );
    }, 0);

    return {
      totalSessions: filteredAndSortedSessions.length,
      upcomingSessions,
      userRSVPs,
      totalAttendees,
    };
  }, [filteredAndSortedSessions, user?.id]);

  const nonAttendingSessions = useMemo(() => {
    return filteredAndSortedSessions.filter(
      (session) =>
        !session.attendances.some(
          (attendance) => attendance.userId === user?.id,
        ),
    );
  }, [filteredAndSortedSessions, user?.id]);

  const handleRSVPAll = () => {
    if (nonAttendingSessions.length === 0) return;
    rsvpToSessions(nonAttendingSessions.map((s) => s.id));
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
      <StatsBar className={styles.statsBar} stats={stats} />

      <SessionControls
        filter={filter}
        onFilterClick={handleFilterClick}
        dayFilter={dayFilter}
        onDayFilterChange={setDayFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        user={user}
        isAdmin={isAdmin}
        isSubmitting={isSubmitting}
        nonAttendingCount={nonAttendingSessions.length}
        onRSVPAll={handleRSVPAll}
        onAddSession={() => setShowAddSession(true)}
      />

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
          {filteredAndSortedSessions.map((session) => (
            <motion.div
              key={session.id}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <SessionCard
                sessionData={session}
                onAttendanceUpdate={() => updateSession(session.id)}
                onDelete={async () => {
                  await fetchSessions(false);
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
};

export default SessionList;
