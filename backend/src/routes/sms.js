import { Router } from 'express';
import prisma from '../db/client.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

