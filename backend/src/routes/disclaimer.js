import { Router } from 'express';
import prisma from '../db/client.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const disclaimer = await prisma.disclaimer.findUnique({
      where: { id: 1 },
    });
    res.json(disclaimer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { enabled, message } = req.body;
    const disclaimer = await prisma.disclaimer.upsert({
      where: { id: 1 },
      update: { enabled, message },
      create: { id: 1, enabled, message },
    });
    res.json(disclaimer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
