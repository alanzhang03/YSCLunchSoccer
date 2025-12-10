import React from "react";
import Link from "next/link";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import styles from "./Footer.module.scss";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandSection}>
          <Link href="/" className={styles.brand}>
            <span className={styles.logoCircle}>YSC</span>
            <span className={styles.brandText}>YSC Lunch Soccer</span>
          </Link>
          <p className={styles.tagline}>
            Organizing lunchtime pickup soccer sessions
          </p>
        </div>

        <div className={styles.linksSection}>
          <div className={styles.linksGroup}>
            <h3 className={styles.linksTitle}>Navigation</h3>
            <nav className={styles.links}>
              <Link href="/" className={styles.link}>
                Home
              </Link>
              <Link href="/sessions" className={styles.link}>
                Sessions
              </Link>
            </nav>
          </div>
          <div className={styles.linksGroup}>
            <h3 className={styles.linksTitle}>Connect</h3>
            <nav className={styles.links}>
              <a
                href="https://www.yscsports.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                YSC Sports
              </a>
              <a
                href="https://www.facebook.com/yscsports"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                <FaFacebook className={styles.icon} />
                Facebook
              </a>
              <a
                href="https://www.instagram.com/yscsports/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                <FaInstagram className={styles.icon} />
                Instagram
              </a>
            </nav>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <p className={styles.copy}>
            © {currentYear} YSC Lunch Soccer. All rights reserved.
          </p>
          <p className={styles.meta}>Built for lunchtime pickup soccer ⚽</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
