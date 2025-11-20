"use client";
import React from "react";
import { useState } from "react";
import styles from "./signup.module.scss";

const page = () => {
  const [phoneNum, setPhoneNum] = useState("ex. 123-456-7890");
  const [password, setPassword] = useState("Password");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleName = () => {
    console.log("hi");
  };

  const handlePhoneNum = (e) => {
    setPhoneNum(e.target.value);
  };
  const handlePassword = (e) => {
    setPassword(e.target.value);
  };
  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("testing");
    // call signup api function
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Sign Up</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>First Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <label>Phone Number</label>
              <input
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                required
              />
              <label>Password</label>
              <input
                value={password}
                type="password"
                onChange={(e) => setPhoneNum(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.button}>
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default page;
