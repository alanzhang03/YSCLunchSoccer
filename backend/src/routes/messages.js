import { Router } from 'express';
import prisma from '../db/client.js';
import { authenticateUser, loadDbUser } from '../middleware/auth.js';
import { getSession } from '../utils/getSession.js';

const router = Router();

router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const messages = await prisma.message.findMany({
      where: { sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateUser, loadDbUser, async (req, res) => {
  try {
    const { sessionId, content } = req.body;
    const dbUser = req.dbUser;

    if (!sessionId || !content || content.trim() === '') {
      return res
        .status(400)
        .json({ error: 'Session ID and message content are required' });
    }

    const session = await getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const message = await prisma.message.create({
      data: {
        sessionId,
        userId: dbUser.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
