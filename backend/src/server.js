import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import sessionsRouter from './routes/sessions.js';
import authRouter from './routes/auth.js';
import messagesRouter from './routes/messages.js';
import checkoutRouter from './routes/checkout.js';
import adminRouter from './routes/admin.js';
import smsRouter from './routes/sms.js';
import disclaimerRouter from './routes/disclaimer.js';
import { sessionGenerator } from './utils/sessionGenerator.js';
import rateLimiter from './middleware/rateLimiter.js';
import './workers/notificationWorker.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  /^https:\/\/.*\.vercel\.app$/,
  process.env.PRODUCTION_URL,
  'https://ysclunchsoccer.com',
  'https://www.ysclunchsoccer.com',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowedOrigin) => {
        if (typeof allowedOrigin === 'string') {
          return origin === allowedOrigin;
        }
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200,
  }),
);

app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cookieParser());
app.use(rateLimiter);

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.use('/api/sessions', sessionsRouter);
app.use('/api/auth', authRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/admin/users', adminRouter);
app.use('/api/sms', smsRouter);
app.use('/api/disclaimer', disclaimerRouter);

setTimeout(async () => {
  try {
    await sessionGenerator();
  } catch (error) {
    console.error(
      '⚠️  Initial session generation failed. Will retry on next scheduled run.',
    );
  }
}, 2000);

cron.schedule('0 0 * * *', async () => {
  console.log('🔄 Running scheduled session generation...');
  try {
    await sessionGenerator();
  } catch (error) {
    console.error('❌ Scheduled session generation failed:', error.message);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📅 Session generation scheduled for every day at midnight');
});
