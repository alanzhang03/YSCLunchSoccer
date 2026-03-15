import React from 'react';
import styles from './privacy.module.scss';

export const metadata = {
  title: 'Privacy Policy | YSC Lunch Soccer',
};

const PrivacyPage = () => {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>Last updated: March 2026</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Information We Collect</h2>
            <p>
              When you register for YSC Lunch Soccer, we collect the following
              personal information:
            </p>
            <ul>
              <li>Name</li>
              <li>Email address</li>
              <li>
                Phone number (used to send SMS session reminders and updates)
              </li>
              <li>Skill level (self-reported)</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>2. How We Use Your Information</h2>
            <p>We use the information you provide to:</p>
            <ul>
              <li>Manage your account and session registrations</li>
              <li>Send session reminders and important updates via SMS</li>
              <li>Balance teams based on skill levels to ensure fair play</li>
              <li>Communicate schedule changes or cancellations</li>
              <li>Process payments for sessions</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. SMS Communications</h2>
            <p>
              By providing your phone number, you consent to receive text
              messages from YSC Lunch Soccer at the number provided. These
              messages may include:
            </p>
            <ul>
              <li>Session reminders and confirmations</li>
              <li>Schedule changes or cancellations</li>
              <li>Team assignments</li>
              <li>General announcements related to YSC Lunch Soccer</li>
            </ul>
            <p>
              <strong>Message frequency:</strong> Message frequency varies. You
              may receive up to a few messages per week during active sessions.
            </p>
            <p>
              <strong>Message and data rates may apply.</strong> Check with your
              carrier for details.
            </p>
            <p>
              <strong>To opt out:</strong> Reply <strong>STOP</strong> to any
              text message to unsubscribe from SMS communications at any time.
              After opting out, you will receive one final confirmation message.
              To re-subscribe, reply <strong>START</strong>.
            </p>
            <p>
              <strong>For help:</strong> Reply <strong>HELP</strong> to any
              message or contact us at{' '}
              <a href='mailto:ysclunchsoccer@gmail.com'>
                ysclunchsoccer@gmail.com
              </a>
              .
            </p>
          </section>

          <section className={styles.section}>
            <h2>4. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information with:
            </p>
            <ul>
              <li>
                <strong>Twilio:</strong> Our SMS service provider, used solely
                to deliver text messages on our behalf.
              </li>
              <li>
                <strong>Supabase:</strong> Our database and authentication
                provider.
              </li>
              <li>
                <strong>Stripe:</strong> Our payment processor for session fees.
              </li>
            </ul>
            <p>
              These third-party providers are bound by their own privacy
              policies and are not permitted to use your data for any purpose
              other than providing services to us.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Data Security</h2>
            <p>
              We take reasonable measures to protect your personal information
              from unauthorized access, disclosure, or misuse. Your password is
              encrypted and never stored in plain text.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is
              active or as needed to provide services. You may request deletion
              of your account and associated data by contacting us at{' '}
              <a href='mailto:ysclunchsoccer@gmail.com'>
                ysclunchsoccer@gmail.com
              </a>
              .
            </p>
          </section>

          <section className={styles.section}>
            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>
                Opt out of SMS communications at any time by replying STOP
              </li>
            </ul>
            <p>
              To exercise these rights, contact us at{' '}
              <a href='mailto:ysclunchsoccer@gmail.com'>
                ysclunchsoccer@gmail.com
              </a>
              .
            </p>
          </section>

          <section className={styles.section}>
            <h2>8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will
              be posted on this page with an updated date. Continued use of the
              site after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className={styles.section}>
            <h2>9. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact
              us:
            </p>
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

export default PrivacyPage;
