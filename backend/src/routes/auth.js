import { Router } from "express";
import prisma from "../db/client.js";
import bcrypt from "bcrypt";
import { supabaseAdmin } from "../lib/supabase.js";

const router = Router();

function setAuthCookies(res, accessToken, refreshToken) {
  const isProduction = process.env.NODE_ENV === "production";
  const frontendUrl = (process.env.FRONTEND_URL || "").trim();
  const isCrossOrigin =
    isProduction && frontendUrl.toLowerCase().includes("vercel");

  const cookieOptions = {
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
    path: "/",
    secure: isCrossOrigin ? true : isProduction,
    sameSite: isCrossOrigin ? "none" : "lax",
  };

  res.cookie("sb_access_token", accessToken, cookieOptions);

  res.cookie("sb_refresh_token", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res) {
  const isProduction = process.env.NODE_ENV === "production";
  const frontendUrl = (process.env.FRONTEND_URL || "").trim();
  const isCrossOrigin =
    isProduction && frontendUrl.toLowerCase().includes("vercel");

  const cookieOptions = {
    httpOnly: true,
    path: "/",
    secure: isCrossOrigin ? true : isProduction,
    sameSite: isCrossOrigin ? "none" : "lax",
  };

  res.clearCookie("sb_access_token", cookieOptions);
  res.clearCookie("sb_refresh_token", cookieOptions);
}

router.post("/signup", async (req, res) => {
  try {
    const { phoneNum, email, name, password, skill } = req.body;

    if (!phoneNum || !email || !name || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const skillNumber =
      skill !== undefined && skill !== null && skill !== ""
        ? parseInt(skill, 10)
        : 5;

    if (isNaN(skillNumber) || skillNumber < 1 || skillNumber > 10) {
      return res
        .status(400)
        .json({ error: "Skill level must be a number between 1 and 10" });
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

    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const orphanedAuthUser = authUsers?.users?.find((u) => u.email === email);

    if (orphanedAuthUser) {
      console.log(
        `Found orphaned Supabase Auth user for ${email}, deleting...`
      );
      await supabaseAdmin.auth.admin.deleteUser(orphanedAuthUser.id);
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          phone: phoneNum,
        },
      });

    if (authError) {
      return res
        .status(400)
        .json({ error: authError.message || "Failed to create user" });
    }

    const user = await prisma.user.create({
      data: {
        supabaseUserId: authData.user.id,
        email,
        phone: phoneNum,
        name,
        skill: skillNumber,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        skill: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    const { data: signInData, error: signInError } =
      await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError || !signInData.session) {
      return res.status(201).json({ user });
    }

    setAuthCookies(
      res,
      signInData.session.access_token,
      signInData.session.refresh_token
    );

    return res.status(201).json({ user });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
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
      return res
        .status(401)
        .json({ error: "Invalid phone number or password" });
    }

    let signInData = null;
    let signInError = null;

    try {
      const result = await supabaseAdmin.auth.signInWithPassword({
        email: user.email,
        password,
      });
      signInData = result.data;
      signInError = result.error;
    } catch (err) {
      signInError = err;
    }

    if (signInError || !signInData?.session) {
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password || ""
      );

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
        skill: user.skill,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      };
      return res.json({ message: "Login successful", user: safeUser });
    }

    try {
      setAuthCookies(
        res,
        signInData.session.access_token,
        signInData.session.refresh_token
      );
    } catch (cookieError) {
      console.error("Cookie setting error:", cookieError);
      console.error("Environment:", {
        NODE_ENV: process.env.NODE_ENV,
        FRONTEND_URL: process.env.FRONTEND_URL,
        isProduction: process.env.NODE_ENV === "production",
      });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      skill: user.skill,
      createdAt: user.createdAt,
    };

    return res.json({ message: "Login successful", user: safeUser });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.sb_access_token;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const {
      data: { user: supabaseUser },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !supabaseUser) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        skill: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies?.sb_access_token;

    if (token) {
      await supabaseAdmin.auth.signOut(token);
    }

    clearAuthCookies(res);

    return res.json({ message: "Logout successful" });
  } catch (error) {
    clearAuthCookies(res);
    return res.json({ message: "Logout successful" });
  }
});

export default router;
