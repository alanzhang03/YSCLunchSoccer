'use client';
import React, { useState, useEffect } from 'react';
import styles from './TeamDisplay.module.scss';
import { useAuth } from '@/contexts/AuthContext';
import {
  getSessionAttendances,
  getSessionById,
  updateShowTeams,
  lockTeams,
} from '@/lib/api';
import { DUMMY_ATTENDEES } from '@/lib/constants';
import { randomizeTeams, fillTeamsRoundRobin } from '@/lib/teamRandomizer';
const TeamDisplay = ({ sessionId }) => {
  const { user } = useAuth();
  const [attendes, setAttendes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eror, setError] = useState(null);
  const [teamsArray, setTeamsArray] = useState([]);
  const [numOfTeams, setNumOfTeams] = useState();
  const [customNumTeams, setCustomNumTeams] = useState(null);
  const [showTeams, setShowTeams] = useState(false);
  const [teamsLocked, setTeamsLocked] = useState(false);
  const [lockedTeamsData, setLockedTeamsData] = useState(null);

  const isAdmin = user?.isAdmin || false;
  const teamColors = ['Black', 'White', 'Red', 'Blue', 'Yellow'];

  // const attendancesArray = getSessionAttendances(sessionId);

  function handleNumOfTeamChange(e) {
    if (teamsLocked) {
      return;
    }
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 2 && value <= 5) {
      setCustomNumTeams(value);
      setNumOfTeams(value);
    } else if (e.target.value === '') {
      setCustomNumTeams(null);
      setNumOfTeams(undefined);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [attendancesResult, sessionResult] = await Promise.all([
          getSessionAttendances(sessionId),
          getSessionById(sessionId),
        ]);
        setAttendes(attendancesResult.attendances);
        setShowTeams(sessionResult.showTeams === true);
        setTeamsLocked(sessionResult.teamsLocked === true);
        setLockedTeamsData(sessionResult.lockedTeams);
        if (sessionResult.lockedTeams?.numOfTeams) {
          setNumOfTeams(sessionResult.lockedTeams.numOfTeams);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  const allAttendances = attendes
    ? [...attendes, ...DUMMY_ATTENDEES]
    : DUMMY_ATTENDEES;

  const yesAttendances = allAttendances?.filter(
    (attendes) => attendes.status === 'yes'
  );

  const showTeamsSection = async () => {
    const newShowTeams = !showTeams;
    try {
      await updateShowTeams(sessionId, newShowTeams);
      setShowTeams(newShowTeams);
    } catch (err) {
      console.error('Failed to update showTeams:', err);
      setError(err.message || 'Failed to update showTeams');
    }
  };

  const calculateTeams = () => {
    if (!yesAttendances || yesAttendances.length === 0) {
      setTeamsArray([]);
      return;
    }

    let numTeams;
    if (customNumTeams !== null) {
      numTeams = customNumTeams;
    } else if (teamsLocked && lockedTeamsData?.numOfTeams) {
      numTeams = lockedTeamsData.numOfTeams;
    } else {
      numTeams = 2;
      if (yesAttendances.length >= 23 && yesAttendances.length <= 28) {
        numTeams = 3;
      } else if (yesAttendances.length > 28) {
        numTeams = 4;
      }
      setNumOfTeams(numTeams);
    }

    if (teamsLocked && lockedTeamsData?.teams) {
      const attendanceMap = new Map();
      yesAttendances.forEach((attendance) => {
        const key = attendance.user?.id || attendance.userId || attendance.id;
        if (key) {
          attendanceMap.set(key, attendance);
        }
      });

      const reconstructedTeams = lockedTeamsData.teams.map((team) =>
        team
          .map((lockedPlayer) => {
            const key = lockedPlayer.userId || lockedPlayer.attendanceId;
            return attendanceMap.get(key);
          })
          .filter(Boolean)
      );

      const lockedPlayerIds = new Set();
      lockedTeamsData.teams.forEach((team) => {
        team.forEach((lockedPlayer) => {
          const key = lockedPlayer.userId || lockedPlayer.attendanceId;
          if (key) {
            lockedPlayerIds.add(key);
          }
        });
      });

      const newPlayers = yesAttendances.filter((attendance) => {
        const key = attendance.user?.id || attendance.userId || attendance.id;
        return key && !lockedPlayerIds.has(key);
      });

      const teams = fillTeamsRoundRobin(
        reconstructedTeams,
        newPlayers,
        numTeams
      );
      setTeamsArray(teams);
    } else {
      const teams = randomizeTeams(yesAttendances, numTeams);
      setTeamsArray(teams);
    }
  };

  const handleRandomizeTeams = async () => {
    let numTeams;
    if (customNumTeams !== null) {
      numTeams = customNumTeams;
    } else {
      numTeams = 2;
      if (yesAttendances.length >= 23 && yesAttendances.length <= 28) {
        numTeams = 3;
      } else if (yesAttendances.length > 28) {
        numTeams = 4;
      }
      setNumOfTeams(numTeams);
    }

    const teams = randomizeTeams(yesAttendances, numTeams);
    setTeamsArray(teams);

    if (isAdmin) {
      try {
        await lockTeams(sessionId, teams, numTeams);
        await updateShowTeams(sessionId, true);
        setShowTeams(true);
        setTeamsLocked(true);
        const lockedData = {
          teams: teams.map((team) =>
            team.map((player) => ({
              userId: player.user?.id || player.userId,
              attendanceId: player.id,
            }))
          ),
          numOfTeams: numTeams,
          lockedAt: new Date().toISOString(),
        };
        setLockedTeamsData(lockedData);
      } catch (err) {
        console.error('Failed to lock teams:', err);
        setError(err.message || 'Failed to lock teams');
      }
    }
  };

  useEffect(() => {
    calculateTeams();
  }, [attendes, teamsLocked, lockedTeamsData, customNumTeams]);

  if (loading) {
    return (
      <div className={styles.displayTeamsContainer}>
        <div className={styles.loading}>Loading teams...</div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.displayTeamsContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Teams</h1>
          {isAdmin && (
            <div className={styles.adminControls}>
              <div className={styles.inputGroup}>
                <label htmlFor='numTeams' className={styles.label}>
                  Number of Teams:
                </label>
                <input
                  id='numTeams'
                  value={numOfTeams || ''}
                  onChange={handleNumOfTeamChange}
                  type='number'
                  min='2'
                  max='5'
                  required
                  className={styles.numTeamsInput}
                  placeholder='2-4'
                  disabled={teamsLocked}
                  title={
                    teamsLocked
                      ? 'Teams are locked. Randomize again to change number of teams.'
                      : ''
                  }
                />
              </div>
              <button
                className={styles.showTeamsButton}
                onClick={showTeamsSection}
              >
                {showTeams ? 'Hide Teams' : 'Show Teams'}
              </button>
              <button
                className={styles.randomizeButton}
                onClick={handleRandomizeTeams}
              >
                🔄 Randomize Teams
              </button>
              <div className={styles.lockStatus}>
                <span
                  className={`${styles.lockBadge} ${
                    teamsLocked ? styles.locked : styles.unlocked
                  }`}
                >
                  {teamsLocked ? '🔒 Teams Locked' : '🔓 Teams Unlocked'}
                </span>
              </div>
            </div>
          )}
        </div>

        {teamsArray.length === 0 ? (
          <div className={styles.emptyState}>
            <p>
              No players attending yet. Teams will appear here once players
              RSVP.
            </p>
          </div>
        ) : showTeams ? (
          <div className={styles.teamsGrid}>
            {teamsArray.map((team, teamIndex) => (
              <div key={teamIndex} className={styles.teamCard}>
                <div className={styles.teamHeader}>
                  <h3 className={styles.teamTitle}>
                    Team {teamIndex + 1} ({teamColors[teamIndex]})
                  </h3>
                  <span className={styles.teamCount}>
                    {team.length} players
                  </span>
                </div>

                <ul className={styles.playerList}>
                  {team.map((player) => (
                    <li key={player.id} className={styles.playerItem}>
                      {player.user.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>
              Teams will be revealed on the day of the session. Please check
              back then!
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default TeamDisplay;
