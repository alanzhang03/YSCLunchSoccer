import styles from "./Card.module.scss";

export default function Card({ sessionData, children }) {
  const date = sessionData.date;
  const weekday = sessionData.weekday;
  const time = sessionData.time;
  const available = sessionData.available;
  const today = sessionData.today;
  const tomorrow = sessionData.tomorrow;

  return (
    <div className={styles.card}>
      <div className={styles.cardAvailContainer}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>Lunch Soccer</h1>
          {(today || tomorrow) && (
            <span
              className={`${styles.dateLabel} ${
                today ? styles.today : styles.tomorrow
              }`}
            >
              {today ? "Today" : "Tomorrow"}
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

      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
