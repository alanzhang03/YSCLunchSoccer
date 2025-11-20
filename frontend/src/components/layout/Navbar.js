import React from "react";
import Link from "next/link";
import styles from "./Navbar.module.scss";

const Navbar = () => {
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
          <Link href="/" className={styles.link}>
            Sessions
          </Link>
        </nav>

        <div className={styles.authLinks}>
          <Link href="/login" className={styles.loginLink}>
            Log In
          </Link>
          <Link href="/signup" className={styles.signupButton}>
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;


