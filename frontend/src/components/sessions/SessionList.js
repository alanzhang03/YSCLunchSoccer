import React from "react";
import styles from "./SessionList.module.scss";
import SessionCard from "./SessionCard";
import { getUpcomingSessions } from "@/lib/sessions";

const SessionList = ({ passedData }) => {
  const data = getUpcomingSessions(5);

  return (
    <div className={styles.sessionList}>
      {data.map((session) => (
        <SessionCard key={session.id} sessionData={session} />
      ))}
    </div>
  );
};

export default SessionList;
