import { Router } from 'express';
import prisma from '../db/client.js';
import { authenticateUser, loadDbUser, requireAdmin } from '../middleware/auth.js';
import sendSms from '../lib/twilio.js';
import { gamedayMessage, deleteSessionMessage } from '../utils/smsTemplates.js';
import { getAttendees } from '../utils/getAttendees.js';
const router = Router();

router.post('/:sessionId/send', authenticateUser, loadDbUser, requireAdmin, async (req, res) => {
    try {
        const sessionId = req.params.sessionId
        const session = await prisma.session.findUnique({
            where: {
                id: sessionId,
            }
        })
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const filteredAttendances = getAttendees(sessionId)

        const recipients = filteredAttendances.map((a) => a.user)
        const { teams } = req.body;
        for (const recipient of recipients) {
            const team = teams.find(t => t.playerIds.includes(recipient.id));
            if (!team) continue;
            const teammates = team.playerNames.filter(name => name !== recipient.name);
            const message = gamedayMessage(session, { teamColor: team.color, teammates });
            await sendSms([recipient], message);
        }

        res.json(filteredAttendances)

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.post('/:sessionId/notify-deletion', authenticateUser, loadDbUser, requireAdmin, async (_req, res) => {
    try {
        res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
export default router;