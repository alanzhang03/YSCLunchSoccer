import { Router } from "express";
import prisma from "../db/client.js";
import { authenticateUser } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { date: "asc" },
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

router.post("/:id/attend", authenticateUser, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { status } = req.body;
    const supabaseUser = req.user;

    if (!["yes", "no", "maybe"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Status must be yes, no, or maybe" });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: "User not found in database" });
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
    console.error("Error in attend route:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/attendances", async (req, res) => {
  try {
    const sessionId = req.params.id;

    const attendances = await prisma.attendance.findMany({
      where: { sessionId: sessionId },
      include: {
        user: true,
      },
    });

    const counts = {
      yes: attendances.filter((a) => a.status === "yes").length,
      no: attendances.filter((a) => a.status === "no").length,
      maybe: attendances.filter((a) => a.status === "maybe").length,
    };

    res.json({ attendances, counts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
