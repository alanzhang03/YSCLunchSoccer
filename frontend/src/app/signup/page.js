"use client";
import React, { useState } from "react";
import styles from "./signup.module.scss";
import { signup } from "@/lib/auth";
import { useRouter } from "next/navigation";
const page = () => {
  const [phoneNum, setPhoneNum] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

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
    await signup(phoneNum, email, name, password);
    console.log("signup successful");
    router.push("/");
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Sign Up</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                value={name}
                onChange={handleNameChange}
                required
                placeholder="Name"
              />
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
