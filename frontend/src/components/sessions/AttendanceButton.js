"use client";
import React from "react";
import { useState, useEffect } from "react";
import styles from "./AttendanceButton.module.scss";

const AttendanceButton = ({ onSend, currentStatus: propStatus, disabled }) => {
  const [currentStatus, setCurrentStatus] = useState(propStatus || null);

  useEffect(() => {
    if (propStatus !== undefined) {
      setCurrentStatus(propStatus);
    }
  }, [propStatus]);

  const handleClick = (status) => {
    if (disabled) return;

    setCurrentStatus(status);
    if (onSend) {
      onSend(status);
    }
  };

  return (
    <div className={styles.attendanceButtonContainer}>
      <button
        className={`${styles.button} ${styles.buttonYes} ${
          currentStatus === "yes" ? styles.active : ""
        }`}
        onClick={() => handleClick("yes")}
        disabled={disabled}
      >
        <span className={styles.icon}>✅</span>
        <span className={styles.text}>Yes, I'm in!</span>
      </button>
      <button
        className={`${styles.button} ${styles.buttonNo} ${
          currentStatus === "no" ? styles.active : ""
        }`}
        onClick={() => handleClick("no")}
        disabled={disabled}
      >
        <span className={styles.icon}>❌</span>
        <span className={styles.text}>Can't make it</span>
      </button>
      <button
        className={`${styles.button} ${styles.buttonMaybe} ${
          currentStatus === "maybe" ? styles.active : ""
        }`}
        onClick={() => handleClick("maybe")}
        disabled={disabled}
      >
        <span className={styles.icon}>🤔</span>
        <span className={styles.text}>Maybe</span>
      </button>
    </div>
  );
};

export default AttendanceButton;
