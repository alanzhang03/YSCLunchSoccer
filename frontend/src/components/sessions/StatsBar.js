'use client';
import { motion } from 'framer-motion';
import styles from './SessionList.module.scss';
import { FcCalendar, FcCheckmark } from 'react-icons/fc';

const StatsBar = ({ stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.statsBar}
    >
      <div className={styles.statItem}>
        <span className={styles.statIcon}>
          <FcCalendar />
        </span>
        <span className={styles.statValue}>{stats.upcomingSessions}</span>
        <span className={styles.statLabel}>Upcoming</span>
      </div>
      <div className={styles.statDivider}></div>
      <div className={styles.statItem}>
        <span className={styles.statIcon}>
          <FcCheckmark />
        </span>
        <span className={styles.statValue}>{stats.userRSVPs}</span>
        <span className={styles.statLabel}>Your RSVPs</span>
      </div>
      <div className={styles.statDivider}></div>
      <div className={styles.statItem}>
        <span className={styles.statIcon}>👥</span>
        <span className={styles.statValue}>{stats.totalAttendees}</span>
        <span className={styles.statLabel}>Total Attendees</span>
      </div>
    </motion.div>
  );
};

export default StatsBar;
