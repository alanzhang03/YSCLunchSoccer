"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./SessionCard.module.scss";
import Card from "../ui/Card";
import AttendanceButton from "./AttendanceButton";
import { attendSession } from "@/lib/api";

const SessionCard = ({ sessionData, onAttendanceUpdate }) => {
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [yesCount, setYesCount] = useState(0);
  const [optimisticStatus, setOptimisticStatus] = useState(null);

  useEffect(() => {
    if (sessionData?.attendances) {
      const count = sessionData.attendances.filter(
        (a) => a.status === "yes"
      ).length;
      setYesCount(count);

      if (user && sessionData.attendances) {
        const userAttendance = sessionData.attendances.find(
          (a) => a.userId === user.id
        );
        if (userAttendance) {
          if (optimisticStatus) {
            if (userAttendance.status === optimisticStatus) {
              setCurrentStatus(userAttendance.status);
              setOptimisticStatus(null);
            }
          } else {
            setCurrentStatus(userAttendance.status);
          }
        } else {
          if (!optimisticStatus) {
            setCurrentStatus(null);
          }
        }
      } else {
        if (!optimisticStatus) {
          setCurrentStatus(null);
        }
      }
    }
  }, [sessionData, user, optimisticStatus]);

  const transformSessionData = (session) => {
    if (!session) return null;

    const sessionDate = new Date(session.date);

    const weekday = sessionDate
      .toLocaleDateString("en-US", {
        weekday: "long",
      })
      .toUpperCase();

    const formattedDate = sessionDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const time = `${session.startTime} - ${session.endTime} ${session.timezone}`;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessionDateOnly = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate()
    );

    const isToday = sessionDateOnly.getTime() === today.getTime();
    const isTomorrow = sessionDateOnly.getTime() === tomorrow.getTime();

    return {
      date: formattedDate,
      weekday: weekday,
      time: time,
      available: `${yesCount}/100`,
      today: isToday,
      tomorrow: isTomorrow,
    };
  };

  const transformedData = transformSessionData(sessionData);

  const handleAttendance = async (status) => {
    if (!sessionData || isSubmitting || !user) return;

    setIsSubmitting(true);

    const previousStatus = currentStatus;

    setOptimisticStatus(status);
    setCurrentStatus(status);

    if (status === "yes" && previousStatus !== "yes") {
      setYesCount((prev) => prev + 1);
    } else if (previousStatus === "yes" && status !== "yes") {
      setYesCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await attendSession(sessionData.id, status);

      if (onAttendanceUpdate) {
        onAttendanceUpdate();
      }
    } catch (error) {
      console.error("Failed to RSVP:", error);
      setOptimisticStatus(null);
      setCurrentStatus(previousStatus);
      if (status === "yes" && previousStatus !== "yes") {
        setYesCount((prev) => Math.max(0, prev - 1));
      } else if (previousStatus === "yes" && status !== "yes") {
        setYesCount((prev) => prev + 1);
      }
      alert("Failed to save your RSVP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!transformedData) {
    return <div>Loading session...</div>;
  }

  const getStatusMessage = () => {
    if (!user) return null;
    if (!currentStatus) return null;

    const messages = {
      yes: "✅ You're attending!",
      no: "❌ You can't make it",
      maybe: "🤔 You're a maybe",
    };
    return messages[currentStatus];
  };

  const statusMessage = getStatusMessage();

  return (
    <Card sessionData={transformedData}>
      {statusMessage && (
        <div className={styles.statusIndicator}>
          <span className={styles.statusText}>{statusMessage}</span>
        </div>
      )}
      <AttendanceButton
        onSend={handleAttendance}
        currentStatus={currentStatus}
        disabled={isSubmitting || !user}
      />
      {!user && (
        <div className={styles.loginPrompt}>
          <a href="/login" className={styles.loginLink}>
            Log in to RSVP
          </a>
        </div>
      )}
    </Card>
  );
};

export default SessionCard;
