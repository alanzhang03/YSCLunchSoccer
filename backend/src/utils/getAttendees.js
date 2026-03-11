import prisma from '../db/client.js';

export async function getAttendees(sessionId) {
    const attendees = await prisma.attendance.findMany({
        where: { sessionId },
        include: { user: true }
    })
    return attendees.filter(a => a.user && a.status === 'yes' && a.user.smsOptIn === true).map(a => a.user);
}