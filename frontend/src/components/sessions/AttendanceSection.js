'use client';
import { useState } from 'react';
import styles from './SessionCard.module.scss';
import { deleteAttendances } from '@/lib/api';
import { DUMMY_USERS } from '@/lib/constants';

const USE_DUMMY_DATA = false;

const generateDummyAttendances = () => {
  const dummyYes = DUMMY_USERS.slice(0, 10).map((user, index) => ({
    id: `dummy-yes-${index + 1}`,
    userId: user.id,
    user: user,
    status: 'yes',
  }));

  const dummyMaybe = DUMMY_USERS.slice(8, 14).map((user, index) => ({
    id: `dummy-maybe-${index + 1}`,
    userId: user.id,
    user: user,
    status: 'maybe',
  }));

  const dummyNo = DUMMY_USERS.slice(12, 18).map((user, index) => ({
    id: `dummy-no-${index + 1}`,
    userId: user.id,
    user: user,
    status: 'no',
  }));

  return { yes: dummyYes, maybe: dummyMaybe, no: dummyNo };
};

const getAttendanceList = (sessionData) => {
  if (USE_DUMMY_DATA) {
    return generateDummyAttendances();
  }

  if (!sessionData?.attendances || sessionData.attendances.length === 0) {
    return null;
  }

  return {
    yes: sessionData.attendances.filter((a) => a.status === 'yes'),
    no: sessionData.attendances.filter((a) => a.status === 'no'),
    maybe: sessionData.attendances.filter((a) => a.status === 'maybe'),
  };
};

const AttendanceSection = ({
  sessionData,
  isAdmin,
  allPaymentStatuses,
  onTogglePaymentStatus,
  onAttendanceUpdate,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    yes: false,
    maybe: false,
    no: false,
  });
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [selectedAttendanceIds, setSelectedAttendanceIds] = useState(new Set());
  const [isDeletingAttendances, setIsDeletingAttendances] = useState(false);

  const attendanceList = getAttendanceList(sessionData);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleSelectAttendance = (attendanceId) => {
    setSelectedAttendanceIds((prev) => {
      const next = new Set(prev);
      next.has(attendanceId)
        ? next.delete(attendanceId)
        : next.add(attendanceId);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (!isAdmin || !sessionData?.id || selectedAttendanceIds.size === 0)
      return;

    const count = selectedAttendanceIds.size;
    const confirmed = window.confirm(
      `Are you sure you want to remove ${count} ${
        count === 1 ? 'attendee' : 'attendees'
      }? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setIsDeletingAttendances(true);
      const attendanceIdsArray = Array.from(selectedAttendanceIds);
      await deleteAttendances(sessionData.id, attendanceIdsArray);

      setSelectedAttendanceIds(new Set());
      setIsRemoveMode(false);

      if (onAttendanceUpdate) {
        setTimeout(() => {
          onAttendanceUpdate();
        }, 100);
      }
    } catch (error) {
      console.error('Error deleting attendances:', error);
      alert(error.message || 'Failed to delete attendees. Please try again.');
    } finally {
      setIsDeletingAttendances(false);
    }
  };

  const renderAttendanceItems = (attendances, section) => {
    if (!attendances || attendances.length === 0) return null;

    const shouldTruncate = attendances.length > 3;
    const isExpanded = expandedSections[section];
    const displayCount = shouldTruncate && !isExpanded ? 3 : attendances.length;
    const displayedAttendances = attendances.slice(0, displayCount);
    const remainingCount = attendances.length - displayCount;

    return (
      <>
        {displayedAttendances.map((attendance) => {
          const userHasPaid = isAdmin && allPaymentStatuses[attendance.userId];

          return (
            <div
              key={attendance.id}
              className={`${styles.attendanceItem} ${
                isRemoveMode && selectedAttendanceIds.has(attendance.id)
                  ? styles.selected
                  : ''
              } ${isRemoveMode ? styles.clickable : ''}`}
              onClick={() =>
                isRemoveMode && toggleSelectAttendance(attendance.id)
              }
            >
              {isRemoveMode && (
                <input
                  type='checkbox'
                  checked={selectedAttendanceIds.has(attendance.id)}
                  readOnly
                />
              )}

              <span className={styles.attendeeName}>
                {attendance.user?.name ?? `User ${attendance.userId}`}
              </span>
              {isAdmin && (
                <span
                  className={
                    userHasPaid ? styles.userPaidBadge : styles.userUnpaidBadge
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePaymentStatus(attendance.userId, userHasPaid);
                  }}
                  style={{ cursor: 'pointer' }}
                  title='Click to toggle payment status'
                >
                  {userHasPaid ? 'Paid ✓' : 'Not paid ✗'}
                </span>
              )}
            </div>
          );
        })}
        {shouldTruncate && (
          <button
            className={styles.viewMoreButton}
            onClick={() => toggleSection(section)}
            type='button'
          >
            {isExpanded ? `View Less` : `View More (${remainingCount} more)`}
          </button>
        )}
      </>
    );
  };

  if (!attendanceList) {
    if (!USE_DUMMY_DATA && sessionData.attendances?.length === 0) {
      return (
        <div className={styles.attendanceList}>
          <div className={styles.noAttendances}>No RSVPs yet</div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={styles.attendanceList}>
      <div className={styles.attendeRemoveCont}>
        <h3 className={styles.attendanceListTitle}>
          Attendees ({attendanceList.yes.length || 0})
        </h3>
        {isAdmin && (
          <div className={styles.removeControls}>
            {isRemoveMode && selectedAttendanceIds.size > 0 && (
              <button
                className={styles.deleteSelectedButton}
                onClick={handleDeleteSelected}
                disabled={isDeletingAttendances}
                type='button'
              >
                {isDeletingAttendances
                  ? 'Deleting...'
                  : `Delete Selected (${selectedAttendanceIds.size})`}
              </button>
            )}
            <button
              className={styles.removeAttendesButton}
              onClick={() => {
                setIsRemoveMode((prev) => !prev);
                setSelectedAttendanceIds(new Set());
              }}
              type='button'
            >
              {isRemoveMode ? 'Cancel' : 'Remove Attendees'}
            </button>
          </div>
        )}
      </div>

      {attendanceList.yes.length > 0 && (
        <div className={styles.attendanceGroup}>
          <div className={styles.attendanceGroupHeader}>
            <span className={styles.statusBadgeYes}>
              Yes ({attendanceList.yes.length})
            </span>
          </div>
          <div className={styles.attendanceNames}>
            {renderAttendanceItems(attendanceList.yes, 'yes')}
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
            {renderAttendanceItems(attendanceList.maybe, 'maybe')}
          </div>
        </div>
      )}

      {attendanceList.no.length > 0 && (
        <div className={styles.attendanceGroup}>
          <div className={styles.attendanceGroupHeader}>
            <span className={styles.statusBadgeNo}>
              Can&apos;t Make It ({attendanceList.no.length})
            </span>
          </div>
          <div className={styles.attendanceNames}>
            {renderAttendanceItems(attendanceList.no, 'no')}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceSection;
