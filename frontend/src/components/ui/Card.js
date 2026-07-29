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
  footerAction,
}) {
  const date = sessionData.date;
  const weekday = sessionData.weekday;
  const weekdayDisplay = weekday
    ? weekday.charAt(0).toUpperCase() + weekday.slice(1).toLowerCase()
    : weekday;
  const time = sessionData.time;
  const today = sessionData.today;
  const tomorrow = sessionData.tomorrow;
  const relativeDate = sessionData.relativeDate;

  const capacity = sessionData.capacity || 50;
  const spotsFilled = sessionData.spotsFilled ?? 0;
  const spotsLeft = Math.max(0, capacity - spotsFilled);
  const isAlmostFull = spotsLeft > 0 && spotsLeft <= 5;

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
    <div
      className={`${styles.card} ${isAlmostFull ? styles.almost : ''} ${
        sessionData.teamsLocked ? styles.locked : ''
      }`}
    >
      <div className={styles.accent} />

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
          <div className={styles.weekday}>{weekdayDisplay}</div>
          <div className={styles.date}>{date}</div>
        </div>

        {isAlmostFull && (
          <span className={styles.almostFull}>
            {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
          </span>
        )}
      </div>

      <div className={styles.cMeta}>
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
          <span className={styles.metaItem}>
            <svg
              width='15'
              height='15'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'
            >
              <circle cx='12' cy='12' r='9' />
              <path d='M12 7v5l3 2' />
            </svg>
            <span>{time}</span>
            {isAdmin && (
              <button
                className={styles.metaEdit}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            )}
          </span>
        )}

        {isEditingFieldLocation ? (
          <div className={styles.editLocationForm}>
            <select
              value={fieldLocation}
              className={styles.editLocationInput}
              onChange={(e) => setFieldLocation(e.target.value)}
              disabled={isSavingFieldLocation}
            >
              <option value='Indoor Fields'>Indoor Fields</option>
              <option value='Outdoor Fields'>Outdoor Fields</option>
            </select>
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
          <span className={styles.metaItem}>
            <svg
              width='15'
              height='15'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'
            >
              <path d='M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z' />
              <circle cx='12' cy='10' r='2.5' />
            </svg>
            <span>{fieldLocation}</span>
            {isAdmin && (
              <button
                className={styles.metaEdit}
                onClick={() => setIsEditingFieldLocation(true)}
              >
                Edit
              </button>
            )}
          </span>
        )}
      </div>

      {children && <div className={styles.actions}>{children}</div>}

      {(calendarData || sessionId || footerAction) && (
        <div className={styles.cFoot}>
          {calendarData ? (
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
                buttonStyle='text'
                label='Add to calendar'
                lightMode='bodyScheme'
                size='1'
                hideBackground
                hideCheckmark
                forceOverlay
              />
            </div>
          ) : (
            <span />
          )}
          {footerAction ? (
            <div className={styles.footAction}>{footerAction}</div>
          ) : (
            <span />
          )}
          {sessionId ? (
            <Link href={`/sessions/${sessionId}`} className={styles.moreInfo}>
              More info →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
