import { Router } from "express";
import prisma from "../db/client.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { date: "asc" },
      include: {
        attendances: true,
      },
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/attend", async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { status } = req.body;

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

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        sessionId: sessionId,
        userId: null,
      },
    });

    let attendance;
    if (existingAttendance) {
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: { status: status },
      });
    } else {
      attendance = await prisma.attendance.create({
        data: {
          sessionId: sessionId,
          userId: null,
          status: status,
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
