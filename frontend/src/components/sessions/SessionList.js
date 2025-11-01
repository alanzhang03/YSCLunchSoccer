import React from "react";
import styles from "./SessionList.module.scss";
import SessionCard from "./SessionCard";

const SessionList = ({ passedData }) => {
  const data = [
    {
      id: 1,
      date: "1/28/2004",
      weekday: "Friday",
      time: "11:30 am - 1:05 pm EST",
      available: "0/100",
    },
    {
      id: 2,
      date: "2/1/2004",
      weekday: "Monday",
      time: "11:30 am - 1:05 pm EST",
      available: "0/100",
    },
    {
      id: 3,
      date: "2/4/2004",
      weekday: "Friday",
      time: "11:30 am - 1:05 pm EST",
      available: "0/100",
    },
  ];

  return (
    <div className={styles.sessionList}>
      <h1>Session list Testing</h1>
      {data.map((session) => (
        <SessionCard key={session.id} sessionData={session} />
      ))}
    </div>
  );
};

export default SessionList;
