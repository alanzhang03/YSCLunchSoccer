"use client";
import React, { useState } from "react";
import styles from "./signup.module.scss";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const Page = () => {
  const [phoneNum, setPhoneNum] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  const handlePhoneNum = (e) => {
    setPhoneNum(e.target.value);
  };
  const handlePassword = (e) => {
    setPassword(e.target.value);
  };
  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(phoneNum, email, name, password);
      console.log("signup successful");
      router.push("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
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
              <label>Email</label>
              <input
                value={email}
                type="email"
                onChange={handleEmailChange}
                required
                placeholder="Email"
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

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Signing up..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Page;
