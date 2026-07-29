'use client';
import React from 'react';
import styles from './AttendanceButton.module.scss';

const CheckIcon = () => (
  <svg
    className={styles.checkIcon}
    width='16'
    height='16'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2.5'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
  >
    <path d='M20 6L9 17l-5-5' />
  </svg>
);

const AttendanceButton = ({
  onSend,
  currentStatus,
  disabled,
  yesDisabled,
  promptLabel,
}) => {
  const handleClick = (status) => {
    if (disabled) return;
    if (status === 'yes' && yesDisabled) return;

    if (onSend) {
      onSend(status);
    }
  };

  const isGoing = currentStatus === 'yes';

  return (
    <div className={styles.attendanceButtonContainer}>
      {promptLabel && <div className={styles.promptLabel}>{promptLabel}</div>}

      <div className={styles.buttonRow}>
        <button
          className={`${styles.button} ${styles.buttonYes} ${
            isGoing ? styles.active : ''
          }`}
          onClick={() => handleClick('yes')}
          disabled={disabled || yesDisabled}
        >
          {isGoing && <CheckIcon />}
          <span className={styles.text}>{isGoing ? 'Going' : "I'm in"}</span>
        </button>
        <button
          className={`${styles.button} ${styles.buttonMaybe} ${
            currentStatus === 'maybe' ? styles.active : ''
          }`}
          onClick={() => handleClick('maybe')}
          disabled={disabled}
        >
          <span className={styles.text}>Maybe</span>
        </button>
        <button
          className={`${styles.button} ${styles.buttonNo} ${
            currentStatus === 'no' ? styles.active : ''
          }`}
          onClick={() => handleClick('no')}
          disabled={disabled}
        >
          <span className={styles.text}>Can&apos;t</span>
        </button>
      </div>
    </div>
  );
};

export default AttendanceButton;
