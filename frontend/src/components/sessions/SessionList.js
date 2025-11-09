"use client";
import { useState, useEffect } from "react";
import React from "react";
import styles from "./SessionList.module.scss";
import SessionCard from "./SessionCard";
import { getUpcomingSessions } from "@/lib/sessions";
import { getSessions } from "@/lib/api";

const SessionList = ({ passedData }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const data = getUpcomingSessions(8);

  const fetchSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  if (loading) return <div>Loading sessions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.sessionList}>
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          sessionData={session}
          onAttendanceUpdate={fetchSessions}
        />
      ))}
    </div>
  );
};

export default SessionList;
