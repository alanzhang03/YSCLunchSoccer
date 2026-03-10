import { Router } from 'express';
import prisma from '../db/client.js';
import { authenticateUser } from '../middleware/auth.js';
import sendSms from '../lib/twilio.js';
import { gamedayMessage } from '../utils/smsTemplates.js';

const router = Router();

router.post('/:sessionId/send', authenticateUser, async (req, res) => {
    try {
        const supabaseUser = req.user
        const dbUser = await prisma.user.findUnique({
            where: { supabaseUserId: supabaseUser.id }
        })

        if (!dbUser) {
            return res.status(404).json({ error: 'User not found in database' });
        }

        if (!dbUser.isAdmin) {
            return res.status(403).json({ error: 'Only admins can delete sessions' });
        }
        const sessionId = req.params.sessionId
        const session = await prisma.session.findUnique({
            where: {
                id: sessionId,
            }
        })
        const attendances = await prisma.attendance.findMany({
            where: { sessionId: sessionId },
            include: {
                user: true,
            },
        })
        const filteredAttendances = attendances.filter((a) => a.user && a.status === 'yes' && a.user.smsOptIn === true)

        const recipients = filteredAttendances.map((a) => a.user)
        await sendSms(recipients, gamedayMessage(session))

        res.json(filteredAttendances)

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

export default router;