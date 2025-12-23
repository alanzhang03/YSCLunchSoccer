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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DraggablePlayer = ({ player, isAdmin, teamsLocked }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isDraggingItem,
  } = useSortable({
    id: `player-${player.id}`,
    disabled: !isAdmin || !teamsLocked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDraggingItem ? 'none' : transition,
    opacity: isDraggingItem ? 0.3 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${styles.playerItem} ${
        isAdmin && teamsLocked ? styles.draggable : ''
      } ${isDraggingItem ? styles.dragging : ''}`}
      {...attributes}
      {...listeners}
    >
      <span className={styles.playerName}>
        {player.user?.name || player.name}
      </span>
      {isAdmin && teamsLocked && <span className={styles.dragHandle}>⋮⋮</span>}
    </li>
  );
};

const DroppableTeam = ({
  team,
  teamIndex,
  teamColor,
  isAdmin,
  players,
  teamsLocked,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `team-${teamIndex}`,
    disabled: !isAdmin || !teamsLocked,
  });

  const playerIds = players.map((p) => `player-${p.id}`);

  return (
    <div
      ref={setNodeRef}
      className={`${styles.teamCard} ${isOver ? styles.teamOver : ''} ${
        isOver ? styles.teamOverPulse : ''
      }`}
    >
      {isOver && (
        <div className={styles.dropIndicator}>
          <div className={styles.dropIndicatorLine}></div>
          <span className={styles.dropIndicatorText}>Drop here</span>
          <div className={styles.dropIndicatorLine}></div>
        </div>
      )}
      <div className={styles.teamHeader}>
        <h3 className={styles.teamTitle}>
          Team {teamIndex + 1} ({teamColor})
        </h3>
        <span className={styles.teamCount}>{players.length} players</span>
      </div>
      <SortableContext items={playerIds} strategy={verticalListSortingStrategy}>
        <ul className={styles.playerList}>
          {players.map((player) => (
            <DraggablePlayer
              key={player.id}
              player={player}
              isAdmin={isAdmin}
              teamsLocked={teamsLocked}
            />
          ))}
        </ul>
      </SortableContext>
    </div>
  );
};

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
  const [activeId, setActiveId] = useState(null);

  const isAdmin = user?.isAdmin || false;
  const teamColors = ['Black', 'White', 'Red', 'Blue', 'Yellow'];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !isAdmin || !showTeams || !teamsLocked) {
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const activePlayerMatch = activeId.match(/^player-(.+)$/);
    const overTeamMatch = overId.match(/^team-(\d+)$/);
    const overPlayerMatch = overId.match(/^player-(.+)$/);

    if (!activePlayerMatch) {
      return;
    }

    const playerId = activePlayerMatch[1];

    let sourceTeamIndex = -1;
    let playerIndex = -1;
    let player = null;

    for (let i = 0; i < teamsArray.length; i++) {
      const index = teamsArray[i].findIndex((p) => {
        return String(p.id) === String(playerId);
      });
      if (index !== -1) {
        sourceTeamIndex = i;
        playerIndex = index;
        player = teamsArray[i][index];
        break;
      }
    }

    if (sourceTeamIndex === -1 || !player) {
      return;
    }

    let targetTeamIndex = sourceTeamIndex;

    if (overTeamMatch) {
      targetTeamIndex = parseInt(overTeamMatch[1]);
    } else if (overPlayerMatch) {
      const targetPlayerId = overPlayerMatch[1];
      for (let i = 0; i < teamsArray.length; i++) {
        const found = teamsArray[i].some(
          (p) => String(p.id) === String(targetPlayerId)
        );
        if (found) {
          targetTeamIndex = i;
          break;
        }
      }
    }

    if (sourceTeamIndex === targetTeamIndex) {
      const newTeams = [...teamsArray];
      const team = [...newTeams[sourceTeamIndex]];
      const [removed] = team.splice(playerIndex, 1);

      if (overPlayerMatch && overPlayerMatch[1] !== playerId) {
        const targetPlayerId = overPlayerMatch[1];
        const targetIndex = team.findIndex(
          (p) => String(p.id) === String(targetPlayerId)
        );
        if (targetIndex !== -1) {
          team.splice(targetIndex, 0, removed);
        } else {
          team.push(removed);
        }
      } else {
        team.push(removed);
      }

      newTeams[sourceTeamIndex] = team;
      setTeamsArray(newTeams);

      if (isAdmin && teamsLocked) {
        try {
          await lockTeams(sessionId, newTeams, numOfTeams);
          const lockedData = {
            teams: newTeams.map((team) =>
              team.map((p) => ({
                userId: p.user?.id || p.userId,
                attendanceId: p.id,
              }))
            ),
            numOfTeams: numOfTeams,
            lockedAt: new Date().toISOString(),
          };
          setLockedTeamsData(lockedData);
        } catch (err) {
          console.error('Failed to save team changes:', err);
          setError(err.message || 'Failed to save team changes');
        }
      }
      return;
    }

    const newTeams = [...teamsArray];
    const sourceTeam = [...newTeams[sourceTeamIndex]];
    const targetTeam = [...newTeams[targetTeamIndex]];

    const [movedPlayer] = sourceTeam.splice(playerIndex, 1);
    targetTeam.push(movedPlayer);

    newTeams[sourceTeamIndex] = sourceTeam;
    newTeams[targetTeamIndex] = targetTeam;

    setTeamsArray(newTeams);

    if (isAdmin && teamsLocked) {
      try {
        await lockTeams(sessionId, newTeams, numOfTeams);
        const lockedData = {
          teams: newTeams.map((team) =>
            team.map((p) => ({
              userId: p.user?.id || p.userId,
              attendanceId: p.id,
            }))
          ),
          numOfTeams: numOfTeams,
          lockedAt: new Date().toISOString(),
        };
        setLockedTeamsData(lockedData);
      } catch (err) {
        console.error('Failed to save team changes:', err);
        setError(err.message || 'Failed to save team changes');
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };
  const activePlayer = activeId
    ? (() => {
        const playerId = activeId.toString().replace('player-', '');
        for (const team of teamsArray) {
          const player = team.find((p) => String(p.id) === String(playerId));
          if (player) return player;
        }
        return null;
      })()
    : null;

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className={styles.teamsGrid}>
              {teamsArray.map((team, teamIndex) => (
                <DroppableTeam
                  key={teamIndex}
                  team={team}
                  teamIndex={teamIndex}
                  teamColor={teamColors[teamIndex]}
                  isAdmin={isAdmin}
                  players={team}
                  teamsLocked={teamsLocked}
                />
              ))}
            </div>
            <DragOverlay dropAnimation={null}>
              {activePlayer ? (
                <div className={styles.dragOverlay}>
                  <div className={styles.dragOverlayContent}>
                    <span className={styles.dragOverlayName}>
                      {activePlayer.user?.name || activePlayer.name}
                    </span>
                    <div className={styles.dragOverlayBadge}>Moving...</div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
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
