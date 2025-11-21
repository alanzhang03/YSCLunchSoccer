"use client";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./login.module.scss";

const Page = () => {
  const [phoneNum, setPhoneNum] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(phoneNum, password);
      console.log("login successful");
      router.push("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
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

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Logging in..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Page;
