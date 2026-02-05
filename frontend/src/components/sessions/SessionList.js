'use client';
import { motion } from 'framer-motion';
import styles from './SessionList.module.scss';
import SessionCard from './SessionCard';
import AddSessionModal from './AddSessionModal';
import StatsBar from './StatsBar';
import SessionControls from './SessionControls';
import { containerVariants, cardVariants } from './animationVariants';
import { useSessions } from '@/hooks/useSessions';
import { useSessionFilters } from '@/hooks/useSessionFilters';
import { useAuth } from '@/contexts/AuthContext';

const SessionList = () => {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;

  const {
    sessions,
    loading,
    error,
    isSubmitting,
    fetchSessions,
    updateSession,
    handleNewSession,
    showAddSession,
    setShowAddSession,
    rsvpToSessions,
  } = useSessions(user?.id);

  const {
    filter,
    setFilter,
    sortBy,
    setSortBy,
    dayFilter,
    setDayFilter,
    wordFilter,
    handleFilterClick,
    filteredAndSortedSessions,
    stats,
    nonAttendingSessions,
  } = useSessionFilters(sessions, user?.id);

  const handleRSVPAll = () => {
    if (nonAttendingSessions.length === 0) return;
    const sessionIds = nonAttendingSessions.map((s) => s.id);
    rsvpToSessions(sessionIds);
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
      <StatsBar stats={stats} />

      <SessionControls
        filter={filter}
        onFilterClick={handleFilterClick}
        onFilterChange={setFilter}
        dayFilter={dayFilter}
        onDayFilterChange={setDayFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        user={user}
        isAdmin={isAdmin}
        isSubmitting={isSubmitting}
        wordFilter={wordFilter}
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
