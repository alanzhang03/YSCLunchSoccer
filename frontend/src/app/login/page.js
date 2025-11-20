"use client";
import React from "react";
import { useState } from "react";
import styles from "./login.module.scss";
import { login } from "@/lib/auth";

const page = () => {
  const [phoneNum, setPhoneNum] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(
      `Submitted ${phoneNum} as phone Number and ${password} as password!`
    );
    await login(phoneNum, password);
    console.log("login successful");
    router.push("/");
  };

  const handlePhoneNum = (e) => {
    setPhoneNum(e.target.value);
  };
  const handlePassword = (e) => {
    setPassword(e.target.value);
  };
  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Login</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <input
                value={phoneNum}
                onChange={handlePhoneNum}
                required
                placeholder="ex. 123-456-7890"
              />
              <label>Password</label>
              <input
                value={password}
                type="password"
                onChange={handlePassword}
                required
                placeholder="Password"
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
