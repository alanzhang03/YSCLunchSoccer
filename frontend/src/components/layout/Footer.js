import React from "react";
import styles from "./Footer.module.scss";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copy}>
          © {currentYear} YSC Lunch Soccer. All rights reserved.
        </p>
        <div className={styles.meta}>
          <span>Built for lunchtime pickup soccer.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
