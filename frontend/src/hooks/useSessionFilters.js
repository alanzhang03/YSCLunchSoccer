'use client';
import { useState, useMemo } from 'react';

const parseSessionDate = (session) => {
  if (
    typeof session.date === 'string' &&
    session.date.match(/^\d{4}-\d{2}-\d{2}/)
  ) {
    const [year, month, day] = session.date.split('T')[0].split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  return new Date(session.date);
};

export const useSessionFilters = (sessions, userId) => {
  const [filter, setFilter] = useState('thisWeek');
  const [sortBy, setSortBy] = useState('date');
  const [wordFilter, setWordFilter] = useState('this week');
  const [dayFilter, setDayFilter] = useState('all');

  const handleFilterClick = (time, words) => {
    setFilter(time);
    setWordFilter(words);
  };

  const filteredAndSortedSessions = useMemo(() => {
    let filtered = [...sessions];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    if (filter === 'today') {
      filtered = filtered.filter((session) => {
        const sessionDate = parseSessionDate(session);
        const sessionDateOnly = new Date(
          sessionDate.getFullYear(),
          sessionDate.getMonth(),
          sessionDate.getDate()
        );
        return sessionDateOnly.getTime() === today.getTime();
      });
    } else if (filter === 'thisWeek') {
      filtered = filtered.filter((session) => {
        const sessionDate = parseSessionDate(session);
        return sessionDate >= today && sessionDate < nextWeek;
      });
    } else if (filter === 'nextWeek') {
      filtered = filtered.filter((session) => {
        const sessionDate = parseSessionDate(session);
        return sessionDate >= nextWeek && sessionDate < nextMonth;
      });
    } else if (filter === 'thisMonth') {
      filtered = filtered.filter((session) => {
        const sessionDate = parseSessionDate(session);
        return sessionDate >= today && sessionDate < nextMonth;
      });
    }

    if (dayFilter !== 'all') {
      filtered = filtered.filter((session) => session.dayOfWeek === dayFilter);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'attendance') {
        const aCount =
          a.attendances?.filter((at) => at.status === 'yes').length || 0;
        const bCount =
          b.attendances?.filter((at) => at.status === 'yes').length || 0;
        return bCount - aCount;
      }
      return 0;
    });

    return filtered;
  }, [sessions, filter, sortBy, dayFilter]);

  const stats = useMemo(() => {
    const filteredSessions = filteredAndSortedSessions;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const upcomingSessions = filteredSessions.filter((s) => {
      const sessionDate = parseSessionDate(s);
      return sessionDate >= today;
    }).length;

    const userRSVPs = filteredSessions.filter((s) => {
      if (!userId || !s.attendances) return false;
      return s.attendances.some(
        (a) => a.userId === userId && a.status === 'yes'
      );
    }).length;

    const totalAttendees = filteredSessions.reduce((sum, s) => {
      return (
        sum + (s.attendances?.filter((a) => a.status === 'yes').length || 0)
      );
    }, 0);

    const totalSessions = filteredSessions.length;

    return { totalSessions, upcomingSessions, userRSVPs, totalAttendees };
  }, [filteredAndSortedSessions, userId]);

  const nonAttendingSessions = useMemo(() => {
    return filteredAndSortedSessions.filter(
      (session) =>
        !session.attendances.some((attendance) => attendance.userId === userId)
    );
  }, [filteredAndSortedSessions, userId]);

  return {
    filter,
    setFilter,
    sortBy,
    setSortBy,
    dayFilter,
    setDayFilter,
    wordFilter,
    handleFilterClick,
    filteredAndSortedSessions,
    stats,
    nonAttendingSessions,
  };
};
