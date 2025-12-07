"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./SessionCard.module.scss";
import Card from "../ui/Card";
import AttendanceButton from "./AttendanceButton";
import { attendSession } from "@/lib/api";
import Link from "next/link";
// import { useRouter } from "next/router";

const SessionCard = ({ sessionData, onAttendanceUpdate }) => {
  const { user } = useAuth();
  // const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [yesCount, setYesCount] = useState(0);
  const [optimisticStatus, setOptimisticStatus] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    yes: false,
    maybe: false,
    no: false,
  });

  const maxAttendance = 45;

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
      available: `${yesCount}/${maxAttendance}`,
      today: isToday,
      tomorrow: isTomorrow,
    };
  };

  const transformedData = transformSessionData(sessionData);

  const handleAttendance = async (status) => {
    if (!sessionData || isSubmitting || !user) return;

    if (
      status === "yes" &&
      currentStatus !== "yes" &&
      yesCount >= maxAttendance
    ) {
      alert(`This session is full. Maximum capacity is ${maxAttendance}.`);
      return;
    }

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

      setTimeout(() => {
        if (onAttendanceUpdate) {
          onAttendanceUpdate();
        }
      }, 100);
    } catch (error) {
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

  const getAttendanceList = () => {
    if (!sessionData?.attendances || sessionData.attendances.length === 0) {
      return null;
    }

    const yesAttendances = sessionData.attendances.filter(
      (a) => a.status === "yes"
    );
    const noAttendances = sessionData.attendances.filter(
      (a) => a.status === "no"
    );
    const maybeAttendances = sessionData.attendances.filter(
      (a) => a.status === "maybe"
    );

    return {
      yes: yesAttendances,
      no: noAttendances,
      maybe: maybeAttendances,
    };
  };

  const USE_DUMMY_DATA = false;

  const generateDummyAttendances = () => {
    const dummyUsers = [
      { id: 1, name: "Peepee" },
      { id: 2, name: "Sarah Johnson" },
      { id: 3, name: "Michael Chen" },
      { id: 4, name: "Emily Rodriguez" },
      { id: 5, name: "David Kim" },
      { id: 6, name: "Jessica Martinez" },
      { id: 7, name: "Ryan Thompson" },
      { id: 8, name: "Amanda Lee" },
      { id: 9, name: "Chris Wilson" },
      { id: 10, name: "Lisa Anderson" },
      { id: 11, name: "James Brown" },
      { id: 12, name: "Maria Garcia" },
      { id: 13, name: "Robert Taylor" },
      { id: 14, name: "Jennifer White" },
      { id: 15, name: "Daniel Moore" },
      { id: 16, name: "Nicole Davis" },
      { id: 17, name: "Kevin Miller" },
      { id: 18, name: "Rachel Adams" },
      { id: 19, name: "Brandon Scott" },
      { id: 20, name: "Megan Parker" },
      { id: 21, name: "Tyler Brooks" },
      { id: 22, name: "Olivia Bennett" },
      { id: 23, name: "Nathan Reed" },
      { id: 24, name: "Sophia Rivera" },
      { id: 25, name: "Ethan Murphy" },
      { id: 26, name: "Ava Hughes" },
      { id: 27, name: "Zachary Cooper" },
      { id: 28, name: "Hannah Foster" },
      { id: 29, name: "Joshua Collins" },
      { id: 30, name: "Chloe Peterson" },
      { id: 31, name: "Matthew Phillips" },
      { id: 32, name: "Isabella Ward" },
      { id: 33, name: "Samuel Turner" },
      { id: 34, name: "Victoria Morgan" },
      { id: 35, name: "Benjamin Evans" },
      { id: 36, name: "Ella Ramirez" },
      { id: 37, name: "Jason Campbell" },
      { id: 38, name: "Grace Sanders" },
      { id: 39, name: "Dylan Mitchell" },
      { id: 40, name: "Natalie Brooks" },
      { id: 41, name: "Alex Murphy" },
      { id: 42, name: "Lauren Price" },
      { id: 43, name: "Cameron Simmons" },
      { id: 44, name: "Abigail Cox" },
      { id: 45, name: "Logan Bailey" },
      { id: 46, name: "Morgan Hughes" },
      { id: 47, name: "Jake Ramirez" },
      { id: 48, name: "Elena Flores" },
      { id: 49, name: "Aaron Bennett" },
      { id: 50, name: "Kayla Scott" },
      { id: 51, name: "Trevor Phillips" },
      { id: 52, name: "Zoe Campbell" },
      { id: 53, name: "Connor Reyes" },
      { id: 54, name: "Samantha Ward" },
      { id: 55, name: "Ian Jenkins" },
      { id: 56, name: "Paige Armstrong" },
      { id: 57, name: "Kyle Martinez" },
      { id: 58, name: "Madison Stone" },
      { id: 59, name: "Hunter Fisher" },
      { id: 60, name: "Lily Parker" },
      { id: 61, name: "Eric Gomez" },
      { id: 62, name: "Natalia Ruiz" },
      { id: 63, name: "Chase Gardner" },
      { id: 64, name: "Jasmine Elliott" },
      { id: 65, name: "Colin Spencer" },
      { id: 66, name: "Brooke Howard" },
      { id: 67, name: "Tristan Wallace" },
      { id: 68, name: "Maya Hernandez" },
      { id: 69, name: "Christian Boyd" },
    ];

    const dummyYes = dummyUsers.slice(0, 10).map((user, index) => ({
      id: `dummy-yes-${index + 1}`,
      userId: user.id,
      user: user,
      status: "yes",
    }));

    const dummyMaybe = dummyUsers.slice(8, 14).map((user, index) => ({
      id: `dummy-maybe-${index + 1}`,
      userId: user.id,
      user: user,
      status: "maybe",
    }));

    const dummyNo = dummyUsers.slice(12, 18).map((user, index) => ({
      id: `dummy-no-${index + 1}`,
      userId: user.id,
      user: user,
      status: "no",
    }));

    return {
      yes: dummyYes,
      maybe: dummyMaybe,
      no: dummyNo,
    };
  };

  const attendanceList = USE_DUMMY_DATA
    ? generateDummyAttendances()
    : getAttendanceList();

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderAttendanceList = (attendances, section) => {
    if (!attendances || attendances.length === 0) return null;

    const shouldTruncate = attendances.length > 3;
    const isExpanded = expandedSections[section];
    const displayCount = shouldTruncate && !isExpanded ? 3 : attendances.length;
    const displayedAttendances = attendances.slice(0, displayCount);
    const remainingCount = attendances.length - 5;

    return (
      <>
        {displayedAttendances.map((attendance) => (
          <div key={attendance.id} className={styles.attendanceItem}>
            {attendance.user
              ? attendance.user.name
              : `User ${attendance.userId || "Unknown"}`}
          </div>
        ))}
        {shouldTruncate && (
          <button
            className={styles.viewMoreButton}
            onClick={() => toggleSection(section)}
            type="button"
          >
            {isExpanded ? `View Less` : `View More (${remainingCount} more)`}
          </button>
        )}
      </>
    );
  };

  return (
    <Card sessionData={transformedData} sessionId={sessionData.id}>
      {statusMessage && (
        <div className={styles.statusIndicator}>
          <span className={styles.statusText}>{statusMessage}</span>
        </div>
      )}

      {attendanceList && (
        <div className={styles.attendanceList}>
          <h3 className={styles.attendanceListTitle}>
            Attendees (
            {USE_DUMMY_DATA
              ? attendanceList.yes.length +
                attendanceList.maybe.length +
                attendanceList.no.length
              : sessionData.attendances?.length || 0}
            )
          </h3>

          {attendanceList.yes.length > 0 && (
            <div className={styles.attendanceGroup}>
              <div className={styles.attendanceGroupHeader}>
                <span className={styles.statusBadgeYes}>
                  Yes ({attendanceList.yes.length})
                </span>
              </div>
              <div className={styles.attendanceNames}>
                {renderAttendanceList(attendanceList.yes, "yes")}
              </div>
            </div>
          )}

          {attendanceList.maybe.length > 0 && (
            <div className={styles.attendanceGroup}>
              <div className={styles.attendanceGroupHeader}>
                <span className={styles.statusBadgeMaybe}>
                  Maybe ({attendanceList.maybe.length})
                </span>
              </div>
              <div className={styles.attendanceNames}>
                {renderAttendanceList(attendanceList.maybe, "maybe")}
              </div>
            </div>
          )}

          {attendanceList.no.length > 0 && (
            <div className={styles.attendanceGroup}>
              <div className={styles.attendanceGroupHeader}>
                <span className={styles.statusBadgeNo}>
                  Can't Make It ({attendanceList.no.length})
                </span>
              </div>
              <div className={styles.attendanceNames}>
                {renderAttendanceList(attendanceList.no, "no")}
              </div>
            </div>
          )}

          {!USE_DUMMY_DATA && sessionData.attendances?.length === 0 && (
            <div className={styles.noAttendances}>No RSVPs yet</div>
          )}
        </div>
      )}

      <AttendanceButton
        onSend={handleAttendance}
        currentStatus={currentStatus}
        disabled={isSubmitting || !user}
        yesDisabled={yesCount >= maxAttendance && currentStatus !== "yes"}
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
