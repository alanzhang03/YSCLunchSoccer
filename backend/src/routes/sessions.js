import { Router } from 'express';
import prisma from '../db/client.js';
import { authenticateUser, loadDbUser, requireAdmin } from '../middleware/auth.js';
import { getSession } from '../utils/getSession.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { date: 'asc' },
      include: {
        attendances: {
          where: {
            userId: {
              not: null,
            },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                skill: true,
              },
            },
          },
        },
      },
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/delete', authenticateUser, loadDbUser, requireAdmin, async (req, res) => {
  try {
    const sessionId = req.params.id;

    const session = await getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const deletedSession = await prisma.session.delete({
      where: {
        id: sessionId,
      },
    });
    res.status(200).json({ success: true, deletedSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateUser, loadDbUser, requireAdmin, async (req, res) => {
  try {
    const { date, dayOfWeek, startTime, endTime, timezone = 'EST', group = '' } = req.body;

    if (!date || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({
        error: 'Missing required fields: date, dayOfWeek, startTime, endTime',
      });
    }
    const [year, month, day] = date.split('-').map(Number);
    const sessionDate = new Date(year, month - 1, day, 0, 0, 0, 0);

    const session = await prisma.session.create({
      data: {
        date: sessionDate,
        dayOfWeek,
        startTime,
        endTime,
        timezone,
        group,
      },
      include: {
        attendances: {
          where: {
            userId: {
              not: null,
            },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                skill: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/rsvp-multiple', authenticateUser, loadDbUser, async (req, res) => {
  try {
    const dbUser = req.dbUser;
    const { sessionIds, status } = req.body;

    const sessions = await prisma.session.findMany({
      where: { id: { in: sessionIds } },
    });

    const attendances = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const sessionId of sessionIds) {
        let existing = await tx.attendance.findFirst({
          where: { sessionId, userId: dbUser.id },
        });

        if (!existing) {
          const nullUserAttendance = await tx.attendance.findFirst({
            where: { sessionId, userId: null },
          });
          if (nullUserAttendance) {
            existing = nullUserAttendance;
          }
        }

        let attendance;
        if (existing) {
          attendance = await tx.attendance.update({
            where: { id: existing.id },
            data: { status, userId: dbUser.id },
            include: {
              user: {
                select: { id: true, name: true, email: true, skill: true },
              },
            },
          });
        } else {
          attendance = await tx.attendance.create({
            data: { sessionId, userId: dbUser.id, status },
            include: {
              user: {
                select: { id: true, name: true, email: true, skill: true },
              },
            },
          });
        }

        results.push(attendance);
      }

      return results;
    });

    res.json({ success: true, attendances });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sessionsByUser', authenticateUser, loadDbUser, async (req, res) => {
  try {
    const dbUser = req.dbUser;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessions = await prisma.session.findMany({
      where: {
        date: {
          gte: today,
        },
        attendances: {
          some: {
            userId: dbUser.id,
          },
        },
      },
      orderBy: { date: 'asc' },
      include: {
        attendances: {
          where: {
            userId: dbUser.id,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                skill: true,
              },
            },
          },
        },
        _count: {
          select: {
            attendances: {
              where: { status: 'yes' },
            },
          },
        },
      },
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/attend', authenticateUser, loadDbUser, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { status } = req.body;
    const dbUser = req.dbUser;

    if (!['yes', 'no', 'maybe'].includes(status)) {
      return res
        .status(400)
        .json({ error: 'Status must be yes, no, or maybe' });
    }

    const session = await getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    let existingAttendance = await prisma.attendance.findFirst({
      where: {
        sessionId: sessionId,
        userId: dbUser.id,
      },
    });

    if (!existingAttendance) {
      const nullUserIdAttendance = await prisma.attendance.findFirst({
        where: {
          sessionId: sessionId,
          userId: null,
        },
      });

      if (nullUserIdAttendance) {
        existingAttendance = nullUserIdAttendance;
      }
    }

    let attendance;
    if (existingAttendance) {
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          status: status,
          userId: dbUser.id,
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
    } else {
      attendance = await prisma.attendance.create({
        data: {
          sessionId: sessionId,
          userId: dbUser.id,
          status: status,
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
    }

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/attendances', async (req, res) => {
  try {
    const sessionId = req.params.id;

    const attendances = await prisma.attendance.findMany({
      where: { sessionId: sessionId },
      include: {
        user: true,
      },
    });

    const counts = {
      yes: attendances.filter((a) => a.status === 'yes').length,
      no: attendances.filter((a) => a.status === 'no').length,
      maybe: attendances.filter((a) => a.status === 'maybe').length,
    };

    res.json({ attendances, counts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        attendances: {
          where: {
            userId: {
              not: null,
            },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                skill: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/attendances/delete', authenticateUser, loadDbUser, requireAdmin, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { attendanceIds } = req.body;

    if (!Array.isArray(attendanceIds) || attendanceIds.length === 0) {
      return res
        .status(400)
        .json({ error: 'attendanceIds must be a non-empty array' });
    }

    const session = await getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const attendances = await prisma.attendance.findMany({
      where: {
        id: { in: attendanceIds },
        sessionId: sessionId,
      },
    });

    if (attendances.length !== attendanceIds.length) {
      return res.status(400).json({
        error: 'Some attendances not found or do not belong to this session',
      });
    }

    const result = await prisma.attendance.deleteMany({
      where: {
        id: { in: attendanceIds },
        sessionId: sessionId,
      },
    });

    res.json({
      success: true,
      deletedCount: result.count,
      deletedIds: attendanceIds,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/showTeams', authenticateUser, loadDbUser, requireAdmin, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { showTeams } = req.body;

    if (typeof showTeams !== 'boolean') {
      return res.status(400).json({ error: 'showTeams must be a boolean' });
    }

    const session = await getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { showTeams },
    });

    res.json({ success: true, session: updatedSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/teamsLocked', authenticateUser, loadDbUser, requireAdmin, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { teamsLocked } = req.body;

    if (typeof teamsLocked !== 'boolean') {
      return res.status(400).json({ error: 'teamsLocked must be a boolean' });
    }

    const session = await getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { teamsLocked },
    });

    res.json({ success: true, session: updatedSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/lockTeams', authenticateUser, loadDbUser, requireAdmin, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { teams, numOfTeams, matchups } = req.body;

    if (!Array.isArray(teams)) {
      return res.status(400).json({ error: 'teams must be an array' });
    }

    if (!numOfTeams || numOfTeams < 2) {
      return res.status(400).json({ error: 'numOfTeams must be at least 2' });
    }

    const session = await getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const lockedTeamsData = {
      teams: teams.map((team) =>
        team.map((player) => ({
          userId: player.user?.id || player.userId,
          attendanceId: player.id,
        })),
      ),
      numOfTeams,
      lockedAt: new Date().toISOString(),
      ...(matchups ? { matchups } : {}),
    };

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        teamsLocked: true,
        lockedTeams: lockedTeamsData,
      },
    });

    res.json({ success: true, session: updatedSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/fieldLocation', authenticateUser, loadDbUser, requireAdmin, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { fieldLocation } = req.body;

    if (!fieldLocation) {
      return res.status(400).json({ error: 'fieldLocation is required' });
    }

    const session = await getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { fieldLocation },
    });

    res.json({ success: true, session: updatedSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/time', authenticateUser, loadDbUser, requireAdmin, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res
        .status(400)
        .json({ error: 'startTime and endTime are required' });
    }

    const session = await getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { startTime, endTime },
    });

    res.json({ success: true, session: updatedSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
