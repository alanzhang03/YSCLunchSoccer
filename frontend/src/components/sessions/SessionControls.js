'use client';
import { motion } from 'framer-motion';
import styles from './SessionList.module.scss';

const SessionControls = ({
  filter,
  onFilterClick,
  onFilterChange,
  dayFilter,
  onDayFilterChange,
  sortBy,
  onSortChange,
  user,
  isAdmin,
  isSubmitting,
  wordFilter,
  nonAttendingCount,
  onRSVPAll,
  onAddSession,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={styles.controlsBar}
    >
      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => onFilterChange('all')}
        >
          All Sessions
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'today' ? styles.active : ''}`}
          onClick={() => onFilterClick('today', 'today')}
        >
          Today
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'thisWeek' ? styles.active : ''}`}
          onClick={() => onFilterClick('thisWeek', 'this week')}
        >
          This Week
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'nextWeek' ? styles.active : ''}`}
          onClick={() => onFilterClick('nextWeek', 'next week')}
        >
          Next Week
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'thisMonth' ? styles.active : ''}`}
          onClick={() => onFilterClick('thisMonth', 'this month')}
        >
          This Month
        </button>
        <select
          className={styles.dayFilterSelect}
          value={dayFilter}
          onChange={(e) => onDayFilterChange(e.target.value)}
        >
          <option value='all'>All Days</option>
          <option value='Monday'>Monday</option>
          <option value='Tuesday'>Tuesday</option>
          <option value='Wednesday'>Wednesday</option>
          <option value='Thursday'>Thursday</option>
          <option value='Friday'>Friday</option>
          <option value='Saturday'>Saturday</option>
          <option value='Sunday'>Sunday</option>
        </select>
      </div>
      {user && (
        <button
          className={styles.rsvpAllButton}
          onClick={onRSVPAll}
          disabled={isSubmitting || nonAttendingCount === 0}
        >
          {isSubmitting
            ? 'Replying...'
            : `Reply Yes to upcoming sessions ${wordFilter} (${nonAttendingCount})`}
        </button>
      )}
      <div className={styles.sortControls}>
        <label className={styles.sortLabel}>Sort by:</label>
        <select
          className={styles.sortSelect}
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value='date'>Date</option>
          <option value='attendance'>Attendance</option>
        </select>
      </div>
      {isAdmin && (
        <button className={styles.addSessionButton} onClick={onAddSession}>
          <span className={styles.addIcon}>+</span>
          <span>Add Session</span>
        </button>
      )}
    </motion.div>
  );
};

export default SessionControls;
