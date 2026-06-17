import { Router } from 'express';
import express from 'express';
import {
  authenticateUser,
  loadDbUser,
  requireAdmin,
} from '../middleware/auth.js';
import sendSms from '../lib/twilio.js';
import { gamedayMessage, deleteSessionMessage, helpMessage } from '../utils/smsTemplates.js';
import { getAttendees } from '../utils/getAttendees.js';
import { getSession } from '../utils/getSession.js';
import prisma from '../db/client.js';
const router = Router();

router.post(
  '/:sessionId/send',
  authenticateUser,
  loadDbUser,
  requireAdmin,
  async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const session = await getSession(sessionId);
      if (!session) return res.status(404).json({ error: 'Session not found' });

      const recipients = await getAttendees(sessionId);
      const { teams, matchups } = req.body;
      for (const recipient of recipients) {
        const team = teams.find((t) => t.playerIds.includes(recipient.id));
        const teamNum = team.teamNum;

        const matchup = matchups?.find((m) => m.teams.includes(teamNum));
        const opponentNums = matchup ? matchup.teams.filter((t) => t !== teamNum) : [];
        const fieldName = matchup?.field || null;

        const opponentTeam =
          opponentNums.length === 0
            ? 'TBD'
            : opponentNums.map((n) => `Team ${n}`).join(' & ');

        const teammates = team.playerNames;
        const message = gamedayMessage(session, {
          teamNum,
          teamColor: team.color,
          teammates,
          opponentTeam,
          fieldName,
        });
        await sendSms([recipient], message);
      }

      res.json(recipients);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  '/:sessionId/notify-deletion',
  authenticateUser,
  loadDbUser,
  requireAdmin,
  async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const session = await getSession(sessionId);
      if (!session) return res.status(404).json({ error: 'Session not found' });
      const recipients = await getAttendees(sessionId);

      for (const recipient of recipients) {
        const message = deleteSessionMessage(session);
        await sendSms([recipient], message);
      }
      res.json(recipients);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post('/incoming', express.urlencoded({ extended: false }), async (req, res) => {
  const from = req.body.From; 
  const body = req.body.Body?.trim().toUpperCase();

  const phone = from?.replace(/^\+1/, '');

  const STOP_KEYWORDS = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'];
  const START_KEYWORDS = ['START', 'UNSTOP', 'YES'];
  const HELP_KEYWORDS = ['HELP', 'INFO'];

  let reply = '';

  if (phone) {
    if (STOP_KEYWORDS.includes(body)) {
      await prisma.user.updateMany({ where: { phone }, data: { smsOptIn: false } });
    } else if (START_KEYWORDS.includes(body)) {
      await prisma.user.updateMany({ where: { phone }, data: { smsOptIn: true } });
    } else if (HELP_KEYWORDS.includes(body)) {
      reply = helpMessage();
    }
  }

  res.set('Content-Type', 'text/xml');
  res.send(`<Response>${reply ? `<Message>${reply}</Message>` : ''}</Response>`);
});

export default router;
