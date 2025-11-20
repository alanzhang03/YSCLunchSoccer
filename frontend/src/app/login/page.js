"use client";
import React from "react";
import { useState } from "react";
import styles from "./login.module.scss";

const page = () => {
  const [phoneNum, setPhoneNum] = useState("444-444-4444");
  const [password, setPassword] = useState("Password");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(
      `Submitted ${phoneNum} as phone Number and ${password} as password!`
    );
  };
  return (
    <>
      <div>
        <h1>Login Page</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Phone Number:
            <input
              type="text"
              value={phoneNum}
              onChange={(e) => setPhoneNum(e.target.value)}
            />
          </label>
          <br></br>
          <label>
            Password
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <br></br>
          <button type="submit" onClick={handleSubmit}>
            Submit
          </button>
        </form>
      </div>
    </>
  );
};

export default page;
