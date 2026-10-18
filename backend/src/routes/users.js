import { Router } from 'express';
import prisma from '../db/client.js';
import { authenticateUser, loadDbUser } from '../middleware/auth.js';

const router = Router();

const UPCOMING_LIMIT = 5;

function visibleGroupsFor(viewer) {
  if (viewer.isAdmin) return null;
  const groups = [''];
  if (viewer.wedGroup) groups.push('wedGroup');
  if (viewer.ogGroup) groups.push('ogGroup');
  if (viewer.testingGroup) groups.push('testingGroup');
  return groups;
}

router.get('/:id/profile', authenticateUser, loadDbUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        position: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const visibleGroups = visibleGroupsFor(req.dbUser);

    const upcoming = await prisma.attendance.findMany({
      where: {
        userId: user.id,
        status: 'yes',
        session: {
          date: { gte: today },
          ...(visibleGroups && { group: { in: visibleGroups } }),
        },
      },
      orderBy: { session: { date: 'asc' } },
      take: UPCOMING_LIMIT,
      select: {
        session: {
          select: {
            id: true,
            date: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            timezone: true,
            fieldLocation: true,
          },
        },
      },
    });

    return res.json({
      user,
      upcomingSessions: upcoming.map((a) => a.session),
    });
  } catch (error) {
    console.error('Fetch player profile error:', error);
    return res.status(500).json({ error: 'Failed to load profile' });
  }
});

export default router;
