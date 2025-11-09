"use client";
import React from "react";
import { useState, useEffect } from "react";
import styles from "./SessionCard.module.scss";
import Card from "../ui/Card";
import AttendanceButton from "./AttendanceButton";
import { attendSession } from "@/lib/api";

const SessionCard = ({ sessionData, onAttendanceUpdate }) => {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [yesCount, setYesCount] = useState(0);

  useEffect(() => {
    if (sessionData?.attendances) {
      const count = sessionData.attendances.filter(
        (a) => a.status === "yes"
      ).length;
      setYesCount(count);
    }
  }, [sessionData]);

  const transformSessionData = (session) => {
    if (!session) return null;

    const sessionDate = new Date(session.date);
    const formattedDate = sessionDate.toLocaleDateString("en-US", {
      weekday: "long",
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
      weekday: session.dayOfWeek,
      time: time,
      available: `${yesCount}/100`,
      today: isToday,
      tomorrow: isTomorrow,
    };
  };

  const transformedData = transformSessionData(sessionData);

  const handleAttendance = async (status) => {
    if (!sessionData || isSubmitting) return;

    setIsSubmitting(true);

    const previousStatus = currentStatus;
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

  return (
    <Card sessionData={transformedData}>
      <AttendanceButton
        onSend={handleAttendance}
        currentStatus={currentStatus}
        disabled={isSubmitting}
      />
    </Card>
  );
};

export default SessionCard;
