'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
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

const faqs = [
  {
    question: 'Do I need to be an experienced player?',
    answer: 'Not at all! We welcome players of all skill levels.',
  },
  {
    question: 'What should I bring?',
    answer:
      'Just bring water, cleats, and a dark and white shirt! (Preferably not Gray)',
  },
  {
    question: 'How are teams formed?',
    answer:
      'Teams are balanced based on individuals skill levels to ensure fair and competitive games.',
  },
  {
    question: 'How many people usually show up?',
    answer:
      'Typically 30–40 players come out each session. We usually form 2–4 teams, although on some days there can be up to 6.',
  },
  {
    question: 'Can I bring friends?',
    answer:
      'Absolutely! Just make sure they sign up and reply yes for the session.',
  },
  {
    question: 'How much does it cost?',
    answer:
      'Each session is $5. You can pay with cash, Venmo, or on this site using credit card or Apple Pay.',
  },
];

const AboutUsPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

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
              <h3>Check</h3>
              <p>
                Check what team you are on and what color you&apos;ll be wearing
                the day of the session.
              </p>
            </motion.div>

            <motion.div className={styles.step} variants={cardVariants}>
              <div className={styles.stepNumber}>4</div>
              <h3>Play & Enjoy</h3>
              <p>Show up, lace up, and have fun!</p>
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
          <motion.div className={styles.faqList} variants={cardVariants}>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}
                >
                  <button
                    type='button'
                    className={styles.faqQuestion}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    id={`faq-question-${index}`}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={styles.faqChevron} aria-hidden />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${index}`}
                        role='region'
                        aria-labelledby={`faq-question-${index}`}
                        className={styles.faqAnswer}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <p>{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>

          <motion.div className={styles.faqMore} variants={itemVariants}>
            <h3>Still have questions?</h3>
            <p>
              Use the{' '}
              <a
                href='#contact'
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById('contact')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                contact form below
              </a>{' '}
              or text us directly at{' '}
              <a href='sms:+14848600997'>(484) 860-0997</a>.
            </p>
          </motion.div>
        </motion.section>

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
