import { Router } from "express";
import prisma from "../db/client.js";
import bcrypt from "bcrypt";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { phoneNum, email, name, password } = req.body;

    if (!phoneNum || !email || !name || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone: phoneNum }],
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email or phone already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        phone: phoneNum,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ user });
  } catch (error) {
    console.error("Error in signup:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { phoneNum, password } = req.body;

    if (!phoneNum || !password) {
      return res
        .status(400)
        .json({ error: "Phone number and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { phone: phoneNum },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid phone number or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "Invalid phone number or password" });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      createdAt: user.createdAt,
    };

    return res.json({ message: "Login successful", user: safeUser });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", async (_req, res) => {
  return res.json({ message: "Logout successful" });
});

export default router;
