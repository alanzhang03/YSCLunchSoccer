import styles from './Card.module.scss';
import Link from 'next/link';

export default function Card({ sessionData, children, sessionId }) {
  const date = sessionData.date;
  const weekday = sessionData.weekday;
  const time = sessionData.time;
  const available = sessionData.available;
  const today = sessionData.today;
  const tomorrow = sessionData.tomorrow;
  const relativeDate = sessionData.relativeDate;
  const teamsLocked = sessionData.teamsLocked;

  return (
    <div className={styles.card}>
      <div className={styles.cardAvailContainer}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>Lunch Soccer</h1>
          {sessionId && (
            <Link href={`/sessions/${sessionId}`} className={styles.moreInfo}>
              More info
            </Link>
          )}
          {(today || tomorrow || relativeDate) && (
            <span
              className={`${styles.dateLabel} ${
                today
                  ? styles.today
                  : tomorrow
                  ? styles.tomorrow
                  : styles.upcoming
              }`}
            >
              {today ? 'Today' : tomorrow ? 'Tomorrow' : relativeDate}
            </span>
          )}
        </div>
        <div className={styles.availBubble}>{available}</div>
      </div>

      <div className={styles.details}>
        <div className={styles.weekday}>{weekday}</div>
        <div className={styles.date}>{date}</div>
        <div className={styles.time}>{time}</div>
      </div>

      {!teamsLocked && children && (
        <div className={styles.actions}>{children}</div>
      )}
    </div>
  );
}
