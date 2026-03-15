import React from 'react';
import styles from './terms.module.scss';

export const metadata = {
  title: 'Terms of Service | YSC Lunch Soccer',
};

const TermsPage = () => {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.subtitle}>Last updated: March 2026</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By creating an account or using the YSC Lunch Soccer website
              (ysclunchsoccer.com), you agree to these Terms of Service. If you
              do not agree, please do not use the site.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Use of the Service</h2>
            <p>YSC Lunch Soccer provides a platform to:</p>
            <ul>
              <li>Browse and RSVP for lunchtime pickup soccer sessions</li>
              <li>View team assignments and session details</li>
              <li>Pay for sessions online</li>
              <li>Receive SMS reminders and updates</li>
            </ul>
            <p>
              You agree to use the service only for its intended purpose and not
              to misuse, disrupt, or attempt to gain unauthorized access to any
              part of the platform.
            </p>
          </section>

          <section className={styles.section}>
            <h2>3. SMS Messaging Terms</h2>
            <p>
              By providing your phone number during registration, you expressly
              consent to receive recurring automated text messages from YSC
              Lunch Soccer regarding session reminders, confirmations, schedule
              changes, and related announcements.
            </p>
            <ul>
              <li>
                <strong>Message frequency:</strong> Varies; up to a few messages
                per week during active sessions.
              </li>
              <li>
                <strong>Message and data rates may apply.</strong>
              </li>
              <li>
                <strong>To opt out:</strong> Reply <strong>STOP</strong> to any
                message. You will receive a confirmation and no further messages
                will be sent.
              </li>
              <li>
                <strong>To opt back in:</strong> Reply <strong>START</strong>.
              </li>
              <li>
                <strong>For help:</strong> Reply <strong>HELP</strong> or
                contact{' '}
                <a href='mailto:ysclunchsoccer@gmail.com'>
                  ysclunchsoccer@gmail.com
                </a>
                .
              </li>
            </ul>
            <p>
              Consent to receive SMS messages is not a condition of
              participation. You may opt out at any time without affecting your
              ability to use the platform.
            </p>
          </section>

          <section className={styles.section}>
            <h2>4. Account Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials. You agree to provide accurate information
              when registering and to keep your profile up to date.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Payments</h2>
            <p>
              Sessions are priced at $5 per session. Online payments are
              processed securely through Stripe. By making a payment, you agree
              to Stripe&apos;s terms of service. All sales are final unless a
              session is cancelled by the organizer.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. Participation and Liability</h2>
            <p>
              Participation in YSC Lunch Soccer sessions is voluntary. By
              attending, you acknowledge that soccer involves physical activity
              and accept any associated risks. YSC Lunch Soccer and its
              organizers are not responsible for any injury, loss, or damage
              arising from participation in sessions.
            </p>
          </section>

          <section className={styles.section}>
            <h2>7. Session Cancellations</h2>
            <p>
              Sessions may be cancelled due to weather, insufficient
              participation, or other circumstances. Registered participants
              will be notified via email or SMS. We are not liable for any
              inconvenience caused by cancellations.
            </p>
          </section>

          <section className={styles.section}>
            <h2>8. Intellectual Property</h2>
            <p>
              All content on this site, including text, images, and design, is
              the property of YSC Lunch Soccer. You may not reproduce or
              redistribute any content without express written permission.
            </p>
          </section>

          <section className={styles.section}>
            <h2>9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate
              these terms or engage in conduct disruptive to the community.
            </p>
          </section>

          <section className={styles.section}>
            <h2>10. Changes to Terms</h2>
            <p>
              We may update these Terms of Service at any time. Updates will be
              posted on this page with a revised date. Continued use of the
              service after changes are posted constitutes acceptance.
            </p>
          </section>

          <section className={styles.section}>
            <h2>11. Contact</h2>
            <p>For questions about these terms, contact us:</p>
            <ul>
              <li>
                Email:{' '}
                <a href='mailto:ysclunchsoccer@gmail.com'>
                  ysclunchsoccer@gmail.com
                </a>
              </li>
              <li>
                Phone: <a href='tel:+14848600997'>(484) 860-0997</a>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
