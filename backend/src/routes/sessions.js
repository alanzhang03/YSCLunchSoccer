import { Router } from "express";
import prisma from "../db/client.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany();
    res.json({ message: "Database connected!", posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
