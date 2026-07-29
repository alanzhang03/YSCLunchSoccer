'use client';
import React from 'react';
import styles from './RosterPreview.module.scss';
import { getInitials, avatarColor } from '@/lib/avatar';

const MAX_AVATARS = 4;

const RosterPreview = ({ attendances = [], expanded, onToggle }) => {
  const yes = attendances.filter((a) => a.status === 'yes');
  const maybeCount = attendances.filter((a) => a.status === 'maybe').length;

  const shown = yes.slice(0, MAX_AVATARS);
  const overflow = yes.length - shown.length;

  return (
    <button
      type='button'
      className={styles.roster}
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={`${yes.length} going${
        maybeCount > 0 ? `, ${maybeCount} maybe` : ''
      }. Show attendee list.`}
    >
      {yes.length > 0 && (
        <span className={styles.avatars} aria-hidden='true'>
          {shown.map((a) => {
            const name = a.user?.name ?? `User ${a.userId}`;
            return (
              <span
                key={a.id}
                className={styles.avatar}
                style={{ backgroundColor: avatarColor(a.userId) }}
                title={name}
              >
                {getInitials(name)}
              </span>
            );
          })}
          {overflow > 0 && (
            <span className={`${styles.avatar} ${styles.more}`}>
              +{overflow}
            </span>
          )}
        </span>
      )}

      <span className={styles.label}>
        {yes.length > 0 ? (
          <>
            <strong>{yes.length} going</strong>
            {maybeCount > 0 && ` · ${maybeCount} maybe`}
          </>
        ) : (
          'No attendees yet'
        )}
      </span>

      <span className={styles.chevron} aria-hidden='true'>
        <svg
          width='12'
          height='12'
          viewBox='0 0 12 12'
          fill='none'
          className={expanded ? styles.chevronOpen : ''}
        >
          <path
            d='M3 4.5L6 7.5L9 4.5'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </span>
    </button>
  );
};

export default RosterPreview;
