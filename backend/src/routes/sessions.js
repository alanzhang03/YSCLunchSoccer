import { Router } from 'express';
import prisma from '../db/client.js';
import { authenticateUser } from '../middleware/auth.js';

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

router.post('/:id/delete', authenticateUser, async (req, res) => {
  try {
    const supabaseUser = req.user;
    const sessionId = req.params.id;

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    if (!dbUser.isAdmin) {
      return res.status(403).json({ error: 'Only admins can delete sessions' });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

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

router.post('/', authenticateUser, async (req, res) => {
  try {
    const supabaseUser = req.user;

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    if (!dbUser.isAdmin) {
      return res.status(403).json({ error: 'Only admins can create sessions' });
    }

    const { date, dayOfWeek, startTime, endTime, timezone = 'EST' } = req.body;

    if (!date || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({
        error: 'Missing required fields: date, dayOfWeek, startTime, endTime',
      });
    }
    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);

    const session = await prisma.session.create({
      data: {
        date: sessionDate,
        dayOfWeek,
        startTime,
        endTime,
        timezone,
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

router.get('/sessionsByUser', authenticateUser, async (req, res) => {
  try {
    const supabaseUser = req.user;

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

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

router.post('/:id/attend', authenticateUser, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { status } = req.body;
    const supabaseUser = req.user;

    if (!['yes', 'no', 'maybe'].includes(status)) {
      return res
        .status(400)
        .json({ error: 'Status must be yes, no, or maybe' });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

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

router.post('/:id/attendances/delete', authenticateUser, async (req, res) => {
  try {
    const supabaseUser = req.user;
    const sessionId = req.params.id;
    const { attendanceIds } = req.body;

    if (!Array.isArray(attendanceIds) || attendanceIds.length === 0) {
      return res
        .status(400)
        .json({ error: 'attendanceIds must be a non-empty array' });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    if (!dbUser.isAdmin) {
      return res
        .status(403)
        .json({ error: 'Only admins can delete attendances' });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

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

router.patch('/:id/showTeams', authenticateUser, async (req, res) => {
  try {
    const supabaseUser = req.user;
    const sessionId = req.params.id;
    const { showTeams } = req.body;

    if (typeof showTeams !== 'boolean') {
      return res.status(400).json({ error: 'showTeams must be a boolean' });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    if (!dbUser.isAdmin) {
      return res
        .status(403)
        .json({ error: 'Only admins can update showTeams' });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { showTeams },
    });

    res.json({ success: true, session: updatedSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/teamsLocked', authenticateUser, async (req, res) => {
  try {
    const supabaseUser = req.user;
    const sessionId = req.params.id;
    const { teamsLocked } = req.body;

    if (typeof teamsLocked !== 'boolean') {
      return res.status(400).json({ error: 'teamsLocked must be a boolean' });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    if (!dbUser.isAdmin) {
      return res
        .status(403)
        .json({ error: 'Only admins can update teamsLocked' });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { teamsLocked },
    });

    res.json({ success: true, session: updatedSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/lockTeams', authenticateUser, async (req, res) => {
  try {
    const supabaseUser = req.user;
    const sessionId = req.params.id;
    const { teams, numOfTeams } = req.body;

    if (!Array.isArray(teams)) {
      return res.status(400).json({ error: 'teams must be an array' });
    }

    if (!numOfTeams || numOfTeams < 2) {
      return res.status(400).json({ error: 'numOfTeams must be at least 2' });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    if (!dbUser.isAdmin) {
      return res.status(403).json({ error: 'Only admins can lock teams' });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const lockedTeamsData = {
      teams: teams.map((team) =>
        team.map((player) => ({
          userId: player.user?.id || player.userId,
          attendanceId: player.id,
        }))
      ),
      numOfTeams,
      lockedAt: new Date().toISOString(),
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

export default router;
