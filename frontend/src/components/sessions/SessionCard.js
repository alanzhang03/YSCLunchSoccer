"use client";
import React from "react";
import { useState, useEffect } from "react";
import styles from "./SessionCard.module.scss";
import Card from "../ui/Card";
import AttendanceButton from "./AttendanceButton";

const SessionCard = () => {
  const [attendanceFromChild, setAttendanceFromChild] = useState(null);
  const [currentAttendance, setCurrentAttendance] = useState(0);
  const [previousSelection, setPreviousSelection] = useState(null);

  useEffect(() => {
    if (attendanceFromChild === null) return;

    if (previousSelection === attendanceFromChild) return;

    if (previousSelection === "yes" && attendanceFromChild === "no") {
      setCurrentAttendance((prev) => prev - 1);
    } else if (previousSelection === "no" && attendanceFromChild === "yes") {
      setCurrentAttendance((prev) => prev + 1);
    } else if (previousSelection === null && attendanceFromChild === "yes") {
      setCurrentAttendance((prev) => prev + 1);
    } else if (previousSelection === "yes" && attendanceFromChild === "maybe") {
      setCurrentAttendance((prev) => prev - 1);
    } else if (previousSelection === "maybe" && attendanceFromChild === "yes") {
      setCurrentAttendance((prev) => prev + 1);
    }

    setPreviousSelection(attendanceFromChild);
  }, [attendanceFromChild, previousSelection]);

  const testingSessionData = {
    date: "1/28/2004",
    weekday: "Friday",
    time: "11:30 am - 1:05 pm EST",
    available: `${currentAttendance}/100`,
  };

  function handleChildAttendanceData(data) {
    setAttendanceFromChild(data);
  }

  return (
    <>
      <Card sessionData={testingSessionData}></Card>
      <h1>Hi Testing</h1>
      <h1>{attendanceFromChild}</h1>
      <AttendanceButton onSend={handleChildAttendanceData}></AttendanceButton>
    </>
  );
};
export default SessionCard;
