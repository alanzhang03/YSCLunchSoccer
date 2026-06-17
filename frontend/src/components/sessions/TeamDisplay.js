'use client';
import React, { useState, useEffect } from 'react';
import styles from './TeamDisplay.module.scss';
import { useAuth } from '@/contexts/AuthContext';
import {
  getSessionAttendances,
  getSessionById,
  updateShowTeams,
  lockTeams,
  sendSmsToAttendees,
} from '@/lib/api';
import { DUMMY_ATTENDEES } from '@/lib/constants';
import {
  randomizeTeams,
  randomizeOgTeams,
  fillTeamsRoundRobin,
  shuffleArray,
} from '@/lib/teamRandomizer';
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

const USE_DUMMY_DATA = false;

const FIELD_OPTIONS = [
  'Indoor Upper Field A (Upper Left)',
  'Indoor Upper Field B (Upper Right)',
  'Indoor Lower Field C',
  'Upper Outdoor Field',
  'Lower Outdoor Field',
];

const DraggablePlayer = ({ player, isAdmin }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isDraggingItem,
  } = useSortable({
    id: `player-${player.id}`,
    disabled: !isAdmin,
  });

  const style = isDraggingItem
    ? { transition: 'none', opacity: 0.3 }
    : {
        ...(transform ? { transform: CSS.Transform.toString(transform) } : {}),
        ...(transition ? { transition } : {}),
      };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${styles.playerItem} ${
        isAdmin ? styles.draggable : ''
      } ${isDraggingItem ? styles.dragging : ''}`}
      {...attributes}
      {...listeners}
    >
      <span className={styles.playerInfo}>
        <span className={styles.playerName}>
          {player.user?.name || player.name}
        </span>
        {isAdmin && player.user?.skill != null && (
          <span className={styles.skillBadge}>{player.user.skill}</span>
        )}
      </span>
      {isAdmin && <span className={styles.dragHandle}>⋮⋮</span>}
    </li>
  );
};

const DroppableTeam = ({ team, teamIndex, teamColor, isAdmin, players }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `team-${teamIndex}`,
    disabled: !isAdmin,
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
  const [lockedTeamsData, setLockedTeamsData] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [matchups, setMatchups] = useState([]);
  const [randomizeByCore, setRandomizeByCore] = useState(false);
  const [sending, setSending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const buildDefaultMatchups = (numTeams) => {
    const defaultFields = [
      'Indoor Upper Field B (Upper Right)',
      'Indoor Upper Field A (Upper Left)',
      null,
    ];
    const result = [];
    for (let i = 1; i <= numTeams; i += 2) {
      if (i + 1 <= numTeams) {
        const matchupIndex = (i - 1) / 2;
        result.push({
          teams: [i, i + 1],
          field: defaultFields[matchupIndex] ?? null,
        });
      }
    }
    return result;
  };

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const isAdmin = user?.isAdmin || false;
  const teamColors = ['Dark', 'White', 'Dark', 'White', 'Dark', 'White'];

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
    }),
  );

  function handleNumOfTeamChange(e) {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 2 && value <= 6) {
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
        setLockedTeamsData(sessionResult.lockedTeams);
        if (sessionResult.lockedTeams?.numOfTeams) {
          setNumOfTeams(sessionResult.lockedTeams.numOfTeams);
        }
        if (sessionResult.lockedTeams?.matchups) {
          setMatchups(sessionResult.lockedTeams.matchups);
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

  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(async () => {
      try {
        const attendancesResult = await getSessionAttendances(sessionId);
        setAttendes(attendancesResult.attendances);
      } catch (err) {
        console.error('Failed to poll attendances:', err);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const allAttendances = USE_DUMMY_DATA
    ? attendes
      ? [...attendes, ...DUMMY_ATTENDEES]
      : DUMMY_ATTENDEES
    : attendes || [];

  const yesAttendances = allAttendances?.filter(
    (attendes) => attendes.status === 'yes',
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

  const calculateTeams = async () => {
    if (loading) return;
    if (!yesAttendances || yesAttendances.length === 0) {
      setTeamsArray([]);
      return;
    }

    let numTeams;
    if (customNumTeams !== null) {
      numTeams = customNumTeams;
    } else if (lockedTeamsData?.numOfTeams) {
      numTeams = lockedTeamsData.numOfTeams;
      setNumOfTeams(numTeams);
    } else {
      numTeams = 2;
      if (yesAttendances.length >= 23 && yesAttendances.length <= 28) {
        numTeams = 3;
      } else if (yesAttendances.length > 28) {
        numTeams = 4;
      }
      setNumOfTeams(numTeams);
    }

    if (lockedTeamsData?.teams) {
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
          .filter(Boolean),
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
        numTeams,
      );
      setTeamsArray(teams);

      if (newPlayers.length > 0 && isAdmin) {
        try {
          const currentMatchups =
            lockedTeamsData?.matchups || buildDefaultMatchups(numTeams);
          await lockTeams(sessionId, teams, numTeams, currentMatchups);
          const lockedData = {
            teams: teams.map((team) =>
              team.map((player) => ({
                userId: player.user?.id || player.userId,
                attendanceId: player.id,
              })),
            ),
            numOfTeams: numTeams,
            lockedAt: new Date().toISOString(),
            matchups: currentMatchups,
          };
          setLockedTeamsData(lockedData);
          setMatchups(currentMatchups);
        } catch (err) {
          console.error('Failed to auto-save new player:', err);
        }
      }
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
      if (yesAttendances.length >= 23 && yesAttendances.length <= 26) {
        numTeams = 3;
      } else if (yesAttendances.length > 26) {
        numTeams = 4;
      }
      setNumOfTeams(numTeams);
    }
    setShowTeams(true);

    let teams;
    if (randomizeByCore) {
      teams = randomizeOgTeams(yesAttendances, numTeams).map(shuffleArray);
    } else {
      teams = randomizeTeams(yesAttendances, numTeams).map(shuffleArray);
    }
    setTeamsArray(teams);

    if (isAdmin) {
      try {
        const defaultMatchups = buildDefaultMatchups(numTeams);
        await lockTeams(sessionId, teams, numTeams, defaultMatchups);
        await updateShowTeams(sessionId, true);
        setShowTeams(true);
        const lockedData = {
          teams: teams.map((team) =>
            team.map((player) => ({
              userId: player.user?.id || player.userId,
              attendanceId: player.id,
            })),
          ),
          numOfTeams: numTeams,
          lockedAt: new Date().toISOString(),
          matchups: defaultMatchups,
        };
        setLockedTeamsData(lockedData);
        setMatchups(defaultMatchups);
      } catch (err) {
        console.error('Failed to lock teams:', err);
        setError(err.message || 'Failed to lock teams');
      }
    }
  };

  const handleSendText = async () => {
    try {
      setSending(true);
      const teamsPayload = teamsArray.map((team, i) => ({
        teamNum: i + 1,
        color: teamColors[i],
        playerIds: team.map((p) => p.user?.id || p.userId),
        playerNames: team.map((p) => p.user?.name || p.name),
      }));
      await sendSmsToAttendees(sessionId, teamsPayload, matchups);
      alert(`Message Sent!`);
    } catch (err) {
      alert(`Failed to send messages: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    calculateTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendes, lockedTeamsData, customNumTeams]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !isAdmin || !showTeams) {
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
          (p) => String(p.id) === String(targetPlayerId),
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
          (p) => String(p.id) === String(targetPlayerId),
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

      if (isAdmin) {
        try {
          await lockTeams(sessionId, newTeams, numOfTeams, matchups);
          const lockedData = {
            teams: newTeams.map((team) =>
              team.map((p) => ({
                userId: p.user?.id || p.userId,
                attendanceId: p.id,
              })),
            ),
            numOfTeams: numOfTeams,
            lockedAt: new Date().toISOString(),
            matchups,
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

    if (isAdmin && lockedTeamsData) {
      try {
        await lockTeams(sessionId, newTeams, numOfTeams, matchups);
        const lockedData = {
          teams: newTeams.map((team) =>
            team.map((p) => ({
              userId: p.user?.id || p.userId,
              attendanceId: p.id,
            })),
          ),
          numOfTeams: numOfTeams,
          lockedAt: new Date().toISOString(),
          matchups,
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

  const handleFieldAssignment = async (matchupIndex, field) => {
    const updatedMatchups = matchups.map((m, i) =>
      i === matchupIndex ? { ...m, field: field || null } : m,
    );
    setMatchups(updatedMatchups);
    try {
      await lockTeams(sessionId, teamsArray, numOfTeams, updatedMatchups);
      setLockedTeamsData((prev) => ({ ...prev, matchups: updatedMatchups }));
    } catch (err) {
      console.error('Failed to save field assignment:', err);
    }
  };

  const handleMobileMove = async (player, sourceTeamIndex, targetTeamIndex) => {
    if (sourceTeamIndex === targetTeamIndex || !isAdmin) return;

    const prevTeams = teamsArray.map((t) => [...t]);
    const newTeams = teamsArray.map((t) => [...t]);
    const playerIndex = newTeams[sourceTeamIndex].findIndex(
      (p) => String(p.id) === String(player.id),
    );
    if (playerIndex === -1) return;

    const [moved] = newTeams[sourceTeamIndex].splice(playerIndex, 1);
    newTeams[targetTeamIndex].push(moved);
    setTeamsArray(newTeams);

    try {
      await lockTeams(sessionId, newTeams, numOfTeams, matchups);
      setLockedTeamsData({
        teams: newTeams.map((team) =>
          team.map((p) => ({
            userId: p.user?.id || p.userId,
            attendanceId: p.id,
          })),
        ),
        numOfTeams,
        lockedAt: new Date().toISOString(),
        matchups,
      });
    } catch (err) {
      setTeamsArray(prevTeams);
      console.error('Failed to save mobile move:', err);
    }
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
                  max='6'
                  required
                  className={styles.numTeamsInput}
                  placeholder='2-6'
                />
              </div>
              <button
                className={styles.showTeamsButton}
                onClick={showTeamsSection}
              >
                {showTeams ? 'Hide Teams' : 'Show Teams'}
              </button>
              <div className={styles.randomizeGroup}>
                <button
                  className={styles.randomizeButton}
                  onClick={handleRandomizeTeams}
                >
                  Randomize Teams
                </button>
                <select
                  className={styles.randomizeByBar}
                  value={randomizeByCore ? 'coreRandom' : 'default'}
                  onChange={(e) =>
                    setRandomizeByCore(e.target.value === 'coreRandom')
                  }
                >
                  <option value='default'>Default</option>
                  <option value='coreRandom'>OG Group Priority</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {teamsArray.length === 0 ? (
          <div className={styles.emptyState}>
            <p>
              No players attending yet. Teams will appear here once players
              reply.
            </p>
          </div>
        ) : showTeams ? (
          isMobile ? (
            matchups.length > 0 ? (
              <div className={styles.fieldGroups}>
                {matchups.map((matchup, matchupIdx) => {
                  const team1Idx = matchup.teams[0] - 1;
                  const team2Idx = matchup.teams[1] - 1;
                  return (
                    <div key={matchupIdx} className={styles.fieldGroup}>
                      <div className={styles.fieldGroupHeader}>
                        {matchup.field || `Game ${matchupIdx + 1}`}
                      </div>
                      <div className={styles.matchupTeamsGrid}>
                        {[team1Idx, team2Idx]
                          .filter((idx) => teamsArray[idx])
                          .map((teamIndex) => {
                            const team = teamsArray[teamIndex];
                            return (
                              <div key={teamIndex} className={styles.teamCard}>
                                <div className={styles.teamHeader}>
                                  <h3 className={styles.teamTitle}>
                                    Team {teamIndex + 1} (
                                    {teamColors[teamIndex]})
                                  </h3>
                                  <span className={styles.teamCount}>
                                    {team.length} players
                                  </span>
                                </div>
                                <ul className={styles.playerList}>
                                  {team.map((player) => (
                                    <li
                                      key={player.id}
                                      className={styles.playerItem}
                                    >
                                      <span className={styles.playerName}>
                                        {player.user?.name || player.name}
                                      </span>
                                      {isAdmin && (
                                        <span
                                          className={
                                            styles.mobilePlayerControls
                                          }
                                        >
                                          {player.user?.skill != null && (
                                            <span className={styles.skillBadge}>
                                              {player.user.skill}
                                            </span>
                                          )}
                                          <select
                                            className={styles.mobileTeamSelect}
                                            value={teamIndex}
                                            onChange={(e) =>
                                              handleMobileMove(
                                                player,
                                                teamIndex,
                                                parseInt(e.target.value),
                                              )
                                            }
                                          >
                                            {teamsArray.map((_, i) => (
                                              <option key={i} value={i}>
                                                T{i + 1}
                                              </option>
                                            ))}
                                          </select>
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
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
                          <span className={styles.playerName}>
                            {player.user?.name || player.name}
                          </span>
                          {isAdmin && (
                            <span className={styles.mobilePlayerControls}>
                              {player.user?.skill != null && (
                                <span className={styles.skillBadge}>
                                  {player.user.skill}
                                </span>
                              )}
                              <select
                                className={styles.mobileTeamSelect}
                                value={teamIndex}
                                onChange={(e) =>
                                  handleMobileMove(
                                    player,
                                    teamIndex,
                                    parseInt(e.target.value),
                                  )
                                }
                              >
                                {teamsArray.map((_, i) => (
                                  <option key={i} value={i}>
                                    T{i + 1}
                                  </option>
                                ))}
                              </select>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              {matchups.length > 0 ? (
                <div className={styles.fieldGroups}>
                  {matchups.map((matchup, matchupIdx) => {
                    const team1Idx = matchup.teams[0] - 1;
                    const team2Idx = matchup.teams[1] - 1;
                    return (
                      <div key={matchupIdx} className={styles.fieldGroup}>
                        <div className={styles.fieldGroupHeader}>
                          {matchup.field || `Game ${matchupIdx + 1}`}
                        </div>
                        <div className={styles.matchupTeamsGrid}>
                          {[team1Idx, team2Idx]
                            .filter((idx) => teamsArray[idx])
                            .map((teamIndex) => (
                              <DroppableTeam
                                key={teamIndex}
                                team={teamsArray[teamIndex]}
                                teamIndex={teamIndex}
                                teamColor={teamColors[teamIndex]}
                                isAdmin={isAdmin}
                                players={teamsArray[teamIndex]}
                              />
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.teamsGrid}>
                  {teamsArray.map((team, teamIndex) => (
                    <DroppableTeam
                      key={teamIndex}
                      team={team}
                      teamIndex={teamIndex}
                      teamColor={teamColors[teamIndex]}
                      isAdmin={isAdmin}
                      players={team}
                    />
                  ))}
                </div>
              )}
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
          )
        ) : (
          <div className={styles.emptyState}>
            <p>
              Teams will be revealed on the day of the session. Please check
              back then!
            </p>
          </div>
        )}
        {showTeams && matchups.length > 0 && (
          <div className={styles.matchupsSection}>
            <h2 className={styles.matchupsTitle}>Matchups</h2>
            <div className={styles.matchupsList}>
              {matchups.map((matchup, i) => {
                const assignedFields = matchups
                  .filter((_, idx) => idx !== i)
                  .map((m) => m.field)
                  .filter(Boolean);
                return (
                  <div key={i} className={styles.matchupRow}>
                    <span className={styles.matchupTeams}>
                      Team {matchup.teams[0]} vs Team {matchup.teams[1]}
                    </span>
                    {isAdmin ? (
                      <select
                        className={styles.fieldSelect}
                        value={matchup.field || ''}
                        onChange={(e) =>
                          handleFieldAssignment(i, e.target.value)
                        }
                      >
                        <option value=''>-- Select Field --</option>
                        {FIELD_OPTIONS.map((f) => (
                          <option
                            key={f}
                            value={f}
                            disabled={assignedFields.includes(f)}
                          >
                            {f}
                          </option>
                        ))}
                      </select>
                    ) : matchup.field ? (
                      <span className={styles.matchupField}>
                        {matchup.field}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {isAdmin && lockedTeamsData && showTeams && (
          <div className={styles.sendTextContainer}>
            <button className={styles.sendTextButton} onClick={handleSendText}>
              {sending ? `Sending Texts...` : `Send Texts To Players`}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default TeamDisplay;
