'use client';
import { useState, useEffect, useCallback } from 'react';
import { getSessions, createSession, attendMultipleSessions } from '@/lib/api';

export const useSessions = (userId) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);

  const fetchSessions = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const data = await getSessions();
      setSessions(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setSessions([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  const handleNewSession = async (sessionData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createSession({
        date: sessionData.date,
        dayOfWeek: sessionData.dayOfWeek,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        timezone: sessionData.timezone || 'EST',
      });
      await fetchSessions(false);
      setShowAddSession(false);
    } catch (err) {
      setError(err.message || 'Failed to create session');
      console.error('Error creating session:', err);
    } finally {
      setIsSubmitting(false);
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

  const rsvpToSessions = async (sessionIds) => {
    if (sessionIds.length === 0) return;
    try {
      setIsSubmitting(true);
      await attendMultipleSessions(sessionIds, 'yes');
      await fetchSessions(false);
    } catch (err) {
      setError(err.message || 'Failed to RSVP to sessions');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      fetchSessions(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [loading, fetchSessions]);

  useEffect(() => {
    if (!loading && sessions.length > 0) {
      fetchSessions(false);
    }
  }, [userId]);

  return {
    sessions,
    loading,
    error,
    isSubmitting,
    fetchSessions,
    updateSession,
    handleNewSession,
    showAddSession,
    setShowAddSession,
    rsvpToSessions,
  };
};
