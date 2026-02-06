import styles from './Card.module.scss';
import Link from 'next/link';
import { AddToCalendarButton } from 'add-to-calendar-button-react';

const getCalendarEventData = (rawSessionData) => {
  if (!rawSessionData?.date || !rawSessionData?.startTime || !rawSessionData?.endTime) {
    return null;
  }

  const [startHours, startMins] = rawSessionData.startTime.replace(' AM', '').split(':');
  const [endHours, endMins] = rawSessionData.endTime.replace(' PM', '').split(':');

  const formattedStartTime = `${(startHours === '12' ? '00' : startHours.padStart(2, '0'))}:${startMins}`;
  const formattedEndTime = `${(endHours === '12' ? '12' : (parseInt(endHours) + 12))}:${endMins}`;

  return {
    name: 'YSC Lunch Soccer',
    description: 'YSC lunch time soccer session',
    startDate: rawSessionData.date.split('T')[0],
    startTime: formattedStartTime,
    endTime: formattedEndTime,
    timeZone: 'America/New_York',
    location: 'YSC Sports: 24 County Line Rd, Wayne, PA 19087',
  };
};


export default function Card({ sessionData, children, sessionId, rawSessionData }) {
  const date = sessionData.date;
  const weekday = sessionData.weekday;
  const time = sessionData.time;
  const available = sessionData.available;
  const today = sessionData.today;
  const tomorrow = sessionData.tomorrow;
  const relativeDate = sessionData.relativeDate;

  const calendarData = getCalendarEventData(rawSessionData);

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

      {calendarData && (
        <div className={styles.calendarButtonWrapper}>
          <AddToCalendarButton
            name={calendarData.name}
            description={calendarData.description}
            startDate={calendarData.startDate}
            startTime={calendarData.startTime}
            endTime={calendarData.endTime}
            timeZone={calendarData.timeZone}
            location={calendarData.location}
            options={['Apple', 'Google', 'Outlook.com', 'Yahoo']}
            buttonStyle="round"
            lightMode="bodyScheme"
            size='1'
            hideBackground
            forceOverlay
          />
        </div>
      )}

      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
