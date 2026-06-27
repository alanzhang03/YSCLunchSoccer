import { Worker } from 'bullmq';
import Redis from 'ioredis';
import sendSms from '../lib/twilio.js';
import { sendPasswordResetEmail, sendContactFormEmail } from '../lib/email.js';

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  'notifications',
  async (job) => {
    if (job.name === 'send-sms') {
      const { recipient, message } = job.data;
      await sendSms([recipient], message);
    }

    if (job.name === 'send-contact-email') {
      const { name, email, message } = job.data;
      await sendContactFormEmail(name, email, message);
    }

    if (job.name === 'send-password-reset-email') {
      const { email, resetLink } = job.data;
      await sendPasswordResetEmail(email, resetLink);
    }
  },
  { connection },
);

worker.on('completed', (job) =>
  console.log(`Job ${job.id} (${job.name}) completed`),
);
worker.on('failed', (job, err) =>
  console.error(`Job ${job.id} (${job.name}) failed:`, err.message),
);

export default worker;
