'use client';
import { motion } from 'framer-motion';
import styles from './SessionList.module.scss';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Sessions', word: '' },
  { value: 'today', label: 'Today', word: 'today' },
  { value: 'thisWeek', label: 'This Week', word: 'this week' },
  { value: 'nextWeek', label: 'Next Week', word: 'next week' },
  { value: 'thisMonth', label: 'This Month', word: 'this month' },
];

const SessionControls = ({
  filter,
  onFilterClick,
  dayFilter,
  onDayFilterChange,
  sortBy,
  onSortChange,
  user,
  isAdmin,
  isSubmitting,
  nonAttendingCount,
  onRSVPAll,
  onAddSession,
}) => {
  const handleFilterChange = (e) => {
    const value = e.target.value;
    const option = FILTER_OPTIONS.find((o) => o.value === value);
    onFilterClick(value, option?.word || '');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={styles.controlsBar}
    >
      <div className={styles.filtersRow}>
        <select
          className={styles.filterSelect}
          value={filter}
          onChange={handleFilterChange}
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
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

        <select
          className={styles.filterSelect}
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value='date'>Sort: Date</option>
          <option value='attendance'>Sort: Attendance</option>
        </select>
      </div>

      <div className={styles.actionsRow}>
        {user && nonAttendingCount > 0 && (
          <button
            className={styles.rsvpAllButton}
            onClick={onRSVPAll}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Replying...'
              : `Reply Yes to ${nonAttendingCount} session${nonAttendingCount !== 1 ? 's' : ''}`}
          </button>
        )}
        {isAdmin && (
          <button className={styles.addSessionButton} onClick={onAddSession}>
            <span className={styles.addIcon}>+</span>
            <span>Add Session</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default SessionControls;
