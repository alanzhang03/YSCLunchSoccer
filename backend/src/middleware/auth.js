import { supabaseAdmin } from "../lib/supabase.js";

export async function authenticateUser(req, res, next) {
  try {
    const token = req.cookies?.sb_access_token;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
}
