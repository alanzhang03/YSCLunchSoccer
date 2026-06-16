import styles from './Card.module.scss';
import Link from 'next/link';
import { AddToCalendarButton } from 'add-to-calendar-button-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateSessionTime, updateSessionFieldLocation } from '@/lib/api';

const getCalendarEventData = (rawSessionData) => {
  if (
    !rawSessionData?.date ||
    !rawSessionData?.startTime ||
    !rawSessionData?.endTime
  ) {
    return null;
  }

  const [startHours, startMins] = rawSessionData.startTime
    .replace(' AM', '')
    .split(':');
  const [endHours, endMins] = rawSessionData.endTime
    .replace(' PM', '')
    .split(':');

  const formattedStartTime = `${startHours === '12' ? '00' : startHours.padStart(2, '0')}:${startMins}`;
  const formattedEndTime = `${endHours === '12' ? '12' : parseInt(endHours) + 12}:${endMins}`;

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

const to24Hour = (time12) => {
  const [timePart, period] = time12.split(' ');
  let [hours, mins] = timePart.split(':');
  hours = parseInt(hours);
  if (period === 'AM' && hours === 12) hours = 0;
  else if (period === 'PM' && hours !== 12) hours += 12;
  return `${String(hours).padStart(2, '0')}:${mins}`;
};

const to12Hour = (time24) => {
  const [hours, mins] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${String(mins).padStart(2, '0')} ${period}`;
};

export default function Card({
  sessionData,
  children,
  sessionId,
  rawSessionData,
  onTimeUpdate,
}) {
  const date = sessionData.date;
  const weekday = sessionData.weekday;
  const time = sessionData.time;
  const available = sessionData.available;
  const today = sessionData.today;
  const tomorrow = sessionData.tomorrow;
  const relativeDate = sessionData.relativeDate;

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [startTime, setStartTime] = useState(() =>
    rawSessionData?.startTime ? to24Hour(rawSessionData.startTime) : '',
  );
  const [endTime, setEndTime] = useState(() =>
    rawSessionData?.endTime ? to24Hour(rawSessionData.endTime) : '',
  );

  const [fieldLocation, setFieldLocation] = useState(sessionData.fieldLocation);
  const [isEditingFieldLocation, setIsEditingFieldLocation] = useState(false);
  const [isSavingFieldLocation, setIsSavingFieldLocation] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  const calendarData = getCalendarEventData(rawSessionData);

  const handleCancel = () => {
    setStartTime(
      rawSessionData?.startTime ? to24Hour(rawSessionData.startTime) : '',
    );
    setEndTime(rawSessionData?.endTime ? to24Hour(rawSessionData.endTime) : '');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!startTime || !endTime) return;
    setIsSaving(true);
    try {
      await updateSessionTime(
        sessionId,
        to12Hour(startTime),
        to12Hour(endTime),
      );
      setIsEditing(false);
      if (onTimeUpdate) onTimeUpdate();
    } catch (error) {
      alert('Failed to update time. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldLocationChange = async () => {
    setIsSavingFieldLocation(true);
    try {
      await updateSessionFieldLocation(sessionId, fieldLocation);
      setIsEditingFieldLocation(false);
    } catch (error) {
      alert('Failed to update field location. Please try again.');
    } finally {
      setIsSavingFieldLocation(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.dateHeader}>
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
          <div className={styles.weekday}>{weekday}</div>
          <div className={styles.date}>{date}</div>
          {isEditingFieldLocation ? (
            <div className={styles.editLocationForm}>
              <input
                type='text'
                value={fieldLocation}
                className={styles.editLocationInput}
                onChange={(e) => setFieldLocation(e.target.value)}
                disabled={isSavingFieldLocation}
              />
              <div className={styles.editLocationActions}>
                <button
                  onClick={handleFieldLocationChange}
                  disabled={isSavingFieldLocation}
                >
                  {isSavingFieldLocation ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setIsEditingFieldLocation(false)}
                  disabled={isSavingFieldLocation}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.fieldLocationContainer}>
              <div>{fieldLocation}</div>
              {isAdmin && (
                <button
                  className={styles.editFieldLocation}
                  onClick={() => setIsEditingFieldLocation(true)}
                >
                  Edit Location
                </button>
              )}
            </div>
          )}
          {isEditing ? (
            <div className={styles.editTimeForm}>
              <div className={styles.timeInputs}>
                <input
                  type='time'
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={isSaving}
                />
                <span>-</span>
                <input
                  type='time'
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className={styles.editTimeActions}>
                <button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.timeContainer}>
              <div className={styles.time}>{time}</div>
              {isAdmin && (
                <button
                  className={styles.editTimeButton}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Time
                </button>
              )}
            </div>
          )}
        </div>
        <div className={styles.availBubble}>{available}</div>
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
            buttonStyle='round'
            lightMode='bodyScheme'
            size='1'
            hideBackground
            forceOverlay
          />
        </div>
      )}

      <div className={styles.titleRow}>
        <span className={styles.title}>Lunch Soccer</span>
        {sessionId && (
          <Link href={`/sessions/${sessionId}`} className={styles.moreInfo}>
            More info
          </Link>
        )}
      </div>

      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
