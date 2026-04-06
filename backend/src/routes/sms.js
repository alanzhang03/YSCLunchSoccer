import { Router } from 'express';
import {
  authenticateUser,
  loadDbUser,
  requireAdmin,
} from '../middleware/auth.js';
import sendSms from '../lib/twilio.js';
import { gamedayMessage, deleteSessionMessage } from '../utils/smsTemplates.js';
import { getAttendees } from '../utils/getAttendees.js';
import { getSession } from '../utils/getSession.js';
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
      const { teams } = req.body;
      for (const recipient of recipients) {
        const team = teams.find((t) => t.playerIds.includes(recipient.id));
        const teamNum = team.teamNum;
        let opponentNum;

        switch (teamNum) {
          case 1:
            opponentNum = 2;
            break;
          case 2:
            opponentNum = 1;
            break;
          case 3:
            opponentNum = 4;
            break;
          case 4:
            opponentNum = 3;
            break;
          case 5:
            opponentNum = 6;
            break;
          case 6:
            opponentNum = 5;
            break;
        }

        const opponentTeamData = teams.find((t) => t.teamNum === opponentNum);
        const opponentTeam = opponentTeamData
          ? `Team ${opponentNum} (${opponentTeamData.color})`
          : `Team ${opponentNum}`;

        let fieldNumber;

        switch (teamNum) {
          case 1:
          case 2:
            fieldNumber = 1;
            break;
          case 3:
          case 4:
            fieldNumber = 2;
          case 5:
          case 6:
            fieldNumber = 3;
        }
        const teammates = team.playerNames;
        const message = gamedayMessage(session, {
          teamNum,
          teamColor: team.color,
          teammates,
          opponentTeam,
          fieldNumber,
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
export default router;
