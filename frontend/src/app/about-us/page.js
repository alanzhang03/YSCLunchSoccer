'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaFutbol, FaUsers, FaClock, FaHeart } from 'react-icons/fa';
import styles from './aboutus.module.scss';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const AboutUsPage = () => {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <motion.div
          className={styles.hero}
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          <motion.h1 className={styles.title} variants={itemVariants}>
            About YSC Lunch Soccer
          </motion.h1>
          <motion.p className={styles.subtitle} variants={itemVariants}>
            Bringing the community together through the beautiful game
          </motion.p>
        </motion.div>

        <motion.section
          className={styles.section}
          variants={itemVariants}
          initial='hidden'
          animate='visible'
          transition={{ delay: 0.2 }}
        >
          <div className={styles.content}>
            <motion.div
              className={styles.textBlock}
              variants={cardVariants}
              whileHover={{ y: -4 }}
            >
              <h2>Our Mission</h2>
              <p>
                YSC Lunch Soccer is dedicated to organizing and facilitating
                lunchtime pickup soccer sessions for our community. We believe
                that soccer is more than just a game, it's a way to build
                friendships, stay active, and create lasting memories during
                your lunch break.
              </p>
            </motion.div>

            <motion.div
              className={styles.textBlock}
              variants={cardVariants}
              whileHover={{ y: -4 }}
            >
              <h2>What We Do</h2>
              <p>
                We coordinate regular lunchtime soccer sessions where players of
                all skill levels can come together to enjoy the game. Our
                platform makes it easy to see upcoming sessions, RSVP, and
                connect with fellow players. Whether you're a seasoned player or
                just looking to have some fun, there's a place for you on the
                field.
              </p>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className={styles.featuresSection}
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          <motion.h2
            className={styles.sectionTitle}
            variants={itemVariants}
            transition={{ delay: 0.3 }}
          >
            Why Join Us?
          </motion.h2>
          <div className={styles.featuresGrid}>
            <motion.div
              className={styles.featureCard}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className={styles.iconWrapper}>
                <FaFutbol className={styles.icon} />
              </div>
              <h3>Regular Sessions</h3>
              <p>
                Join us for organized lunchtime soccer sessions throughout the
                week. Easy to find, easy to join.
              </p>
            </motion.div>

            <motion.div
              className={styles.featureCard}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className={styles.iconWrapper}>
                <FaUsers className={styles.icon} />
              </div>
              <h3>All Skill Levels</h3>
              <p>
                Whether you're a beginner or experienced player, everyone is
                welcome. We celebrate the love of the game above all.
              </p>
            </motion.div>

            <motion.div
              className={styles.featureCard}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className={styles.iconWrapper}>
                <FaClock className={styles.icon} />
              </div>
              <h3>Convenient Timing</h3>
              <p>
                Perfect for your lunch break. Get some exercise, have fun, and
                still make it back to work on time.
              </p>
            </motion.div>

            <motion.div
              className={styles.featureCard}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className={styles.iconWrapper}>
                <FaHeart className={styles.icon} />
              </div>
              <h3>Community First</h3>
              <p>
                Build connections with fellow players. It's about more than just
                soccer, it's about community.
              </p>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className={styles.contactSection}
          variants={itemVariants}
          initial='hidden'
          animate='visible'
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className={styles.contactCard}
            variants={cardVariants}
            whileHover={{ y: -4 }}
          >
            <h2>Get in Touch</h2>
            <p>
              Have questions, suggestions, or want to learn more? We'd love to
              hear from you!
            </p>
            <div className={styles.contactInfo}>
              <a href='mailto:ysclunchsoccer@gmail.com' className={styles.link}>
                ysclunchsoccer@gmail.com
              </a>
              <a href='tel:+14848600997' className={styles.link}>
                (484) 860-0997
              </a>
            </div>
            <div className={styles.socialLinks}>
              <a
                href='https://www.yscsports.com/'
                target='_blank'
                rel='noopener noreferrer'
                className={styles.socialLink}
              >
                Visit YSC Sports
              </a>
            </div>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
};

export default AboutUsPage;
