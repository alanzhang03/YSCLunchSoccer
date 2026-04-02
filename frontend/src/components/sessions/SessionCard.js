'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './SessionCard.module.scss';
import Card from '../ui/Card';
import AttendanceButton from './AttendanceButton';
import AttendanceSection from './AttendanceSection';
import PaymentSection from './PaymentSection';
import {
  attendSession,
  deleteSession,
  getSessionPaymentStatus,
  createCheckoutSession,
  getAllSessionPaymentStatuses,
  updateUserPaymentStatus,
  sendSmsAfterDeleteSession,
} from '@/lib/api';
import Link from 'next/link';

const MAX_ATTENDANCE = 50;
const STRIPE_PRICE_ID = 'price_1SpsHRRf4ipOc26aE5FaWSMg';

const transformSessionData = (session, yesCount) => {
  if (!session) return null;

  let sessionDate;
  if (
    typeof session.date === 'string' &&
    session.date.match(/^\d{4}-\d{2}-\d{2}/)
  ) {
    const [year, month, day] = session.date.split('T')[0].split('-');
    sessionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else {
    sessionDate = new Date(session.date);
  }

  if (isNaN(sessionDate.getTime())) {
    console.error('Invalid date for session:', session);
    return null;
  }

  const weekday = session.dayOfWeek
    ? session.dayOfWeek.toUpperCase()
    : sessionDate
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toUpperCase();

  const formattedDate = sessionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const time = `${session.startTime} - ${session.endTime} ${session.timezone}`;
  const fieldLocation = session.fieldLocation;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sessionDateOnly = new Date(
    sessionDate.getFullYear(),
    sessionDate.getMonth(),
    sessionDate.getDate(),
  );

  const isToday = sessionDateOnly.getTime() === today.getTime();
  const isTomorrow = sessionDateOnly.getTime() === tomorrow.getTime();

  const daysDiff = Math.ceil(
    (sessionDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  let relativeDate = null;
  if (isToday) {
    relativeDate = 'Today';
  } else if (isTomorrow) {
    relativeDate = 'Tomorrow';
  } else if (daysDiff > 0 && daysDiff <= 7) {
    relativeDate = `In ${daysDiff} ${daysDiff === 1 ? 'day' : 'days'}`;
  } else if (daysDiff > 7 && daysDiff <= 14) {
    const weeks = Math.floor(daysDiff / 7);
    relativeDate = `In ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  }

  return {
    date: formattedDate,
    weekday,
    time,
    available: `${yesCount}/${MAX_ATTENDANCE}`,
    fieldLocation,
    today: isToday,
    tomorrow: isTomorrow,
    relativeDate,
    daysUntil: daysDiff,
    teamsLocked: session.teamsLocked,
  };
};

const getStatusMessage = (user, currentStatus) => {
  if (!user || !currentStatus) return null;
  const messages = {
    yes: "You're attending!",
    no: "You can't make it",
    maybe: "You're a maybe",
  };
  return messages[currentStatus];
};

const SessionCard = ({ sessionData, onAttendanceUpdate, onDelete }) => {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;

  const [currentStatus, setCurrentStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [yesCount, setYesCount] = useState(0);
  const [optimisticStatus, setOptimisticStatus] = useState(null);

  const [hasPaid, setHasPaid] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [allPaymentStatuses, setAllPaymentStatuses] = useState({});

  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    if (sessionData?.attendances) {
      const count = sessionData.attendances.filter(
        (a) => a.status === 'yes',
      ).length;
      setYesCount(count);

      if (user && sessionData.attendances) {
        const userAttendance = sessionData.attendances.find(
          (a) => a.userId === user.id,
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

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!user || !sessionData?.id) return;

      try {
        setIsLoadingPayment(true);
        const { hasPaid: paidStatus } = await getSessionPaymentStatus(
          sessionData.id,
        );
        setHasPaid(paidStatus);

        if (isAdmin) {
          const { paymentStatusMap } = await getAllSessionPaymentStatuses(
            sessionData.id,
          );
          setAllPaymentStatuses(paymentStatusMap);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      } finally {
        setIsLoadingPayment(false);
      }
    };

    checkPaymentStatus();
  }, [sessionData?.id, user, isAdmin]);

  const handleAttendance = async (status) => {
    if (!sessionData || isSubmitting || !user) return;

    if (
      status === 'yes' &&
      currentStatus !== 'yes' &&
      yesCount >= MAX_ATTENDANCE
    ) {
      alert(`This session is full. Maximum capacity is ${MAX_ATTENDANCE}.`);
      return;
    }

    setIsSubmitting(true);
    const previousStatus = currentStatus;

    setOptimisticStatus(status);
    setCurrentStatus(status);

    if (status === 'yes' && previousStatus !== 'yes') {
      setYesCount((prev) => prev + 1);
    } else if (previousStatus === 'yes' && status !== 'yes') {
      setYesCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await attendSession(sessionData.id, status);
      setTimeout(() => {
        if (onAttendanceUpdate) onAttendanceUpdate();
      }, 100);
    } catch (error) {
      setOptimisticStatus(null);
      setCurrentStatus(previousStatus);
      if (status === 'yes' && previousStatus !== 'yes') {
        setYesCount((prev) => Math.max(0, prev - 1));
      } else if (previousStatus === 'yes' && status !== 'yes') {
        setYesCount((prev) => prev + 1);
      }
      alert('Failed to save your RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!sessionData?.id || isPaymentProcessing) return;

    try {
      setIsPaymentProcessing(true);
      const { url } = await createCheckoutSession(
        STRIPE_PRICE_ID,
        sessionData.id,
      );
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message || 'Failed to initiate payment');
      setIsPaymentProcessing(false);
    }
  };

  const handleTogglePaymentStatus = async (userId, currentPaymentStatus) => {
    if (!isAdmin) return;

    const newStatus = !currentPaymentStatus;
    const statusText = newStatus ? 'paid' : 'unpaid';

    const confirmed = window.confirm(
      `Are you sure you want to mark this user as ${statusText}?`,
    );
    if (!confirmed) return;

    try {
      await updateUserPaymentStatus(sessionData.id, userId, newStatus);
      setAllPaymentStatuses((prev) => ({ ...prev, [userId]: newStatus }));
      if (onAttendanceUpdate) {
        setTimeout(() => onAttendanceUpdate(), 100);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert(error.message || 'Failed to update payment status');
    }
  };

  const handleDelete = async () => {
    if (!isAdmin || !sessionData?.id) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this session? This action cannot be undone.',
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await sendSmsAfterDeleteSession(sessionData.id);
      await deleteSession(sessionData.id);
      if (onDelete) onDelete(sessionData.id);
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const transformedData = transformSessionData(sessionData, yesCount);
  const statusMessage = getStatusMessage(user, currentStatus);

  if (!transformedData) {
    return <div>Loading session...</div>;
  }

  return (
    <Card
      sessionData={transformedData}
      sessionId={sessionData.id}
      rawSessionData={sessionData}
      onTimeUpdate={onAttendanceUpdate}
    >
      {statusMessage && (
        <div className={styles.statusIndicator}>
          <span className={styles.statusText}>{statusMessage}</span>
        </div>
      )}
      {transformedData.teamsLocked && (
        <Link
          href={`/sessions/${sessionData.id}`}
          className={styles.viewTeamsLink}
        >
          <span>View Teams</span>
          <span className={styles.arrow}>→</span>
        </Link>
      )}

      <AttendanceSection
        sessionData={sessionData}
        isAdmin={isAdmin}
        allPaymentStatuses={allPaymentStatuses}
        onTogglePaymentStatus={handleTogglePaymentStatus}
        onAttendanceUpdate={onAttendanceUpdate}
      />

      <AttendanceButton
        onSend={handleAttendance}
        currentStatus={currentStatus}
        disabled={isSubmitting || !user}
        yesDisabled={yesCount >= MAX_ATTENDANCE && currentStatus !== 'yes'}
      />

      {!user && (
        <div className={styles.loginPrompt}>
          <a href='/login' className={styles.loginLink}>
            Log in to RSVP
          </a>
        </div>
      )}

      {/* {user && (
        <PaymentSection
          hasPaid={hasPaid}
          isLoadingPayment={isLoadingPayment}
          isPaymentProcessing={isPaymentProcessing}
          onPayment={handlePayment}
        />
      )} */}

      {isAdmin && (
        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          disabled={isDeleting}
          type='button'
          title='Delete session'
        >
          {isDeleting ? 'Deleting...' : '🗑️'}
        </button>
      )}
    </Card>
  );
};

export default SessionCard;
