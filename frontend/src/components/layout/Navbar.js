"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./Navbar.module.scss";

const Navbar = () => {
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {}
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.logoCircle}>YS</span>
          <span className={styles.brandText}>YSC Lunch Soccer</span>
        </Link>

        <nav className={styles.navLinks} aria-label="Main navigation">
          <Link href="/" className={styles.link}>
            Home
          </Link>
          <Link href="/sessions" className={styles.link}>
            Sessions
          </Link>
        </nav>

        <div className={styles.authLinks}>
          {loading ? (
            <span className={styles.loading}>Loading...</span>
          ) : user ? (
            <>
              <span className={styles.userName}>Welcome, {user.name}!</span>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.loginLink}>
                Log In
              </Link>
              <Link href="/signup" className={styles.signupButton}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
