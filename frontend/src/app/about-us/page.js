'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './aboutus.module.scss';
import ContactForm from '@/components/ui/ContactForm';

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
          <motion.p
            className={styles.subtitle}
            variants={itemVariants}
          ></motion.p>
        </motion.div>

        <motion.section
          className={styles.howItWorksSection}
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          viewport={{ once: true }}
        >
          <motion.h2 className={styles.sectionTitle} variants={itemVariants}>
            How It Works
          </motion.h2>
          <div className={styles.stepsGrid}>
            <motion.div className={styles.step} variants={cardVariants}>
              <div className={styles.stepNumber}>1</div>
              <h3>Browse Sessions</h3>
              <p>
                Check out upcoming games and find a time that works for your
                schedule.
              </p>
            </motion.div>

            <motion.div className={styles.step} variants={cardVariants}>
              <div className={styles.stepNumber}>2</div>
              <h3>RSVP</h3>
              <p>
                Reserve your spot by updating your status. See who else is
                playing.
              </p>
            </motion.div>

            <motion.div className={styles.step} variants={cardVariants}>
              <div className={styles.stepNumber}>3</div>
              <h3>Play & Enjoy</h3>
              <p>
                Show up, lace up, and have fun playing the beautiful game with
                great people.
              </p>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className={styles.faqSection}
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
        >
          <motion.h2 className={styles.sectionTitle} variants={itemVariants}>
            Frequently Asked Questions
          </motion.h2>
          <div className={styles.faqGrid}>
            <motion.div className={styles.faqItem} variants={cardVariants}>
              <h3>Do I need to be an experienced player?</h3>
              <p>Not at all! We welcome players of all skill levels.</p>
            </motion.div>

            <motion.div className={styles.faqItem} variants={cardVariants}>
              <h3>What should I bring?</h3>
              <p>
                Just bring water, cleats, and a dark and white shirt!
                (Preferably not Gray)
              </p>
            </motion.div>

            <motion.div className={styles.faqItem} variants={cardVariants}>
              <h3>How are teams formed?</h3>
              <p>
                Teams are balanced based on RSVPs to ensure fair and competitive
                games.
              </p>
            </motion.div>

            <motion.div className={styles.faqItem} variants={cardVariants}>
              <h3>Can I bring friends?</h3>
              <p>
                Absolutely! Just make sure they sign up and RSVP for the
                session.
              </p>
            </motion.div>

            <motion.div className={styles.faqItem} variants={cardVariants}>
              <h3>How much does it cost?</h3>
              <p>
                Each session is $5. You can pay with cash, Venmo, or on this
                site using credit card or Apple Pay.
              </p>
            </motion.div>
          </div>
        </motion.section>

        <motion.div
          className={styles.statsBar}
          variants={itemVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
        >
          <div className={styles.stat}>
            <span className={styles.statValue}>100+</span>
            <span className={styles.statLabel}>Sessions</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>50+</span>
            <span className={styles.statLabel}>Players</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>Weekly</span>
            <span className={styles.statLabel}>Games</span>
          </div>
        </motion.div>

        <motion.div
          className={styles.ctaBlock}
          variants={itemVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
        >
          <h3>Ready to play?</h3>
          <div className={styles.ctaButtons}>
            <Link href='/sessions' className={styles.primaryButton}>
              View sessions
            </Link>
            <Link href='/signup' className={styles.secondaryButton}>
              Sign up
            </Link>
          </div>
        </motion.div>

        <motion.section
          className={styles.contactSection}
          variants={itemVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
        >
          <motion.div
            className={styles.contactCard}
            variants={cardVariants}
            whileHover={{ y: -4 }}
          >
            <h2>Get in Touch</h2>
            <p>
              Have questions, suggestions, or want to learn more? We&apos;d love
              to hear from you!
            </p>
            <div id='contact'>
              <ContactForm />
            </div>

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
