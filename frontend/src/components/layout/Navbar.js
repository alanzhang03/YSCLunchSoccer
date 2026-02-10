'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Navbar.module.scss';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const isAdmin = user?.isAdmin;
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {}
  };

  useEffect(() => {
    document.body.style.overflow = isMobileNavOpen ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [isMobileNavOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div
        className={`${styles.mobileBackdrop} ${
          isMobileNavOpen ? styles.open : ''
        }`}
        onClick={() => setIsMobileNavOpen(false)}
        aria-hidden='true'
      />

      <nav
        className={`${styles.mobileMenu} ${isMobileNavOpen ? styles.open : ''}`}
        aria-label='Mobile navigation'
      >
        <div className={styles.menuSection}>
          <Link href='/' onClick={() => setIsMobileNavOpen(false)}>
            Home
          </Link>
          <Link href='/sessions' onClick={() => setIsMobileNavOpen(false)}>
            Sessions
          </Link>
          <Link href='/payments' onClick={() => setIsMobileNavOpen(false)}>
            Payments
          </Link>
          <Link href='/about-us' onClick={() => setIsMobileNavOpen(false)}>
            About Us
          </Link>
          <Link href='/gallery' onClick={() => setIsMobileNavOpen(false)}>
            Gallery
          </Link>
        </div>

        <div className={styles.menuDivider} />

        <div className={styles.menuSection}>
          {loading ? (
            <span className={styles.mobileLoading}>Loading...</span>
          ) : user ? (
            <>
              <span className={styles.mobileUserName}>
                Welcome, {user.name}!
              </span>
              <Link
                href='/my-profile'
                className={styles.mobileViewProfile}
                onClick={() => setIsMobileNavOpen(false)}
              >
                View Profile
              </Link>
              {isAdmin && (
                <Link
                  href='/admin-page'
                  className={styles.mobileViewProfile}
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  Admin page
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileNavOpen(false);
                }}
                className={styles.mobileLogoutButton}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href='/login'
                className={styles.mobileAuthLink}
                onClick={() => setIsMobileNavOpen(false)}
              >
                Log In
              </Link>
              <Link
                href='/signup'
                className={styles.mobileSignupButton}
                onClick={() => setIsMobileNavOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className={styles.inner}>
        <button
          className={`${styles.hamburger} ${
            isMobileNavOpen ? styles.open : ''
          }`}
          aria-label={isMobileNavOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileNavOpen}
          onClick={() => setIsMobileNavOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <Link href='/' className={styles.brand}>
          <Image
            width={25}
            height={25}
            src='/favicon/favicon.svg'
            alt='YSC Logo'
            className={styles.logo}
          />
          <span className={styles.brandText}>YSC Lunch Soccer</span>
        </Link>

        <nav className={styles.navLinks} aria-label='Main navigation'>
          <Link href='/' className={styles.link}>
            Home
          </Link>
          <Link href='/sessions' className={styles.link}>
            Sessions
          </Link>
          <Link href='/payments' className={styles.link}>
            Payments
          </Link>
          <Link href='/about-us' className={styles.link}>
            About Us
          </Link>
          <Link href='/gallery' className={styles.link}>
            Gallery
          </Link>
        </nav>

        <div className={styles.authLinks}>
          {loading ? (
            <span className={styles.loading}>Loading...</span>
          ) : user ? (
            <div className={styles.profileWrapper} ref={profileRef}>
              <button
                className={styles.profileTrigger}
                onClick={() => setIsProfileOpen((prev) => !prev)}
              >
                {user.name}
                <svg
                  className={`${styles.chevron} ${isProfileOpen ? styles.open : ''}`}
                  width='12'
                  height='12'
                  viewBox='0 0 12 12'
                  fill='none'
                >
                  <path
                    d='M3 4.5L6 7.5L9 4.5'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>
              {isProfileOpen && (
                <div className={styles.profileDropdown}>
                  <Link
                    href='/my-profile'
                    className={styles.dropdownLink}
                    onClick={() => setIsProfileOpen(false)}
                  >
                    View Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      href='/admin-page'
                      className={styles.dropdownLink}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Admin Page
                    </Link>
                  )}
                  <div className={styles.dropdownDivider} />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileOpen(false);
                    }}
                    className={styles.dropdownLogout}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
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
