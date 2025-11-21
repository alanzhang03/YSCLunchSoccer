"use client";
import { useState, useEffect } from "react";
import React from "react";
import styles from "./SessionList.module.scss";
import SessionCard from "./SessionCard";
import { getUpcomingSessions } from "@/lib/sessions";
import { getSessions } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const SessionList = ({ passedData }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  // const data = getUpcomingSessions(8);

  const fetchSessions = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const data = await getSessions();
      setSessions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const updateSession = async (sessionId) => {
    try {
      const data = await getSessions();
      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id === sessionId) {
            const updated = data.find((s) => s.id === sessionId);
            return updated || session;
          }
          return session;
        })
      );
    } catch (err) {}
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      fetchSessions(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!loading && sessions.length > 0) {
      fetchSessions(false);
    }
  }, [user?.id]);

  if (loading) return <div>Loading sessions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.sessionList}>
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          sessionData={session}
          onAttendanceUpdate={() => updateSession(session.id)}
        />
      ))}
    </div>
  );
};

export default SessionList;
