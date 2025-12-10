"use client";
import React, { useState, useEffect } from "react";
import styles from "./TeamDisplay.module.scss";
import { useAuth } from "@/contexts/AuthContext";
import { getSessionAttendances } from "@/lib/api";
import { DUMMY_ATTENDEES } from "@/lib/constants";
import { randomizeTeams } from "@/lib/teamRandomizer";
const TeamDisplay = ({ sessionId }) => {
  const { user } = useAuth();
  const [attendes, setAttendes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eror, setError] = useState(null);
  const [teamsArray, setTeamsArray] = useState([]);

  const isAdmin = user?.isAdmin || false;
  const teamColors = ["Black", "White", "Red", "Blue"];

  // const attendancesArray = getSessionAttendances(sessionId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getSessionAttendances(sessionId);
        setAttendes(result.attendances);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch attendances:", err);
        setError(err.message || "Failed to fetch attendances");
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
    (attendes) => attendes.status === "yes"
  );

  const calculateTeams = () => {
    if (!yesAttendances || yesAttendances.length === 0) {
      setTeamsArray([]);
      return;
    }
    let numTeams = 2;
    if (yesAttendances.length >= 23 && yesAttendances.length <= 28) {
      numTeams = 3;
    } else if (yesAttendances.length > 28) {
      numTeams = 4;
    }
    const teams = randomizeTeams(yesAttendances, numTeams);
    setTeamsArray(teams);
  };

  useEffect(() => {
    calculateTeams();
  }, [attendes]);

  if (loading) {
    return (
      <div className={styles.displayTeamsContainer}>
        <div className={styles.loading}>Loading teams...</div>
      </div>
    );
  }

  return (
    <div className={styles.displayTeamsContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Teams</h1>
        {isAdmin && (
          <button className={styles.randomizeButton} onClick={calculateTeams}>
            🔄 Randomize Teams
          </button>
        )}
      </div>

      {teamsArray.length === 0 ? (
        <div className={styles.emptyState}>
          <p>
            No players attending yet. Teams will appear here once players RSVP.
          </p>
        </div>
      ) : (
        <div className={styles.teamsGrid}>
          {teamsArray.map((team, teamIndex) => (
            <div key={teamIndex} className={styles.teamCard}>
              <div className={styles.teamHeader}>
                <h3 className={styles.teamTitle}>
                  Team {teamIndex + 1} ({teamColors[teamIndex]})
                </h3>
                <span className={styles.teamCount}>{team.length} players</span>
              </div>
              <ul className={styles.playerList}>
                {team.map((player) => (
                  <li key={player?.id} className={styles.playerItem}>
                    <span className={styles.playerName}>
                      {player?.user?.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamDisplay;
