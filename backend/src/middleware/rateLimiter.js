import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redis from '../lib/redis.js';

const globalStore = new RedisStore({
  sendCommand: (...args) => redis.call(...args),
  prefix: 'rl:global:',
});

const strictStore = new RedisStore({
  sendCommand: (...args) => redis.call(...args),
  prefix: 'rl:strict:',
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  store: globalStore,
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 6,
  message: { error: 'Too many requests, please slow down.' },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  store: strictStore,
});

export default globalLimiter;
