'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Navbar.module.scss';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {}
  };

  useEffect(() => {
    document.body.style.overflow = isMobileNavOpen ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [isMobileNavOpen]);

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <nav
          className={`${styles.mobileMenu} ${
            isMobileNavOpen ? styles.open : ''
          }`}
          aria-label='Mobile navigation'
        >
          <Link href='/' onClick={() => setIsMobileNavOpen(false)}>
            Home
          </Link>
          <Link href='/sessions' onClick={() => setIsMobileNavOpen(false)}>
            Sessions
          </Link>
        </nav>

        <div className={styles.mobileNav}>
          <button
            className={styles.hamburger}
            aria-label='Toggle menu'
            aria-expanded={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <Link href='/' className={styles.brand}>
          <img src='/favicon.svg' alt='YSC Logo' className={styles.logo} />
          <span className={styles.brandText}>YSC Lunch Soccer</span>
        </Link>

        <nav className={styles.navLinks} aria-label='Main navigation'>
          <Link href='/' className={styles.link}>
            Home
          </Link>
          <Link href='/sessions' className={styles.link}>
            Sessions
          </Link>
          {user && (
            <Link href='/payments' className={styles.link}>
              Payments
            </Link>
          )}
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
              <Link href='/login' className={styles.loginLink}>
                Log In
              </Link>
              <Link href='/signup' className={styles.signupButton}>
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
