import { supabaseAdmin } from '../lib/supabase.js';
import prisma from '../db/client.js';

export async function authenticateUser(req, res, next) {
  try {
    const token =
      req.cookies?.sb_access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

export async function loadDbUser(req, res, next) {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: req.user.id },
    });
    if (!dbUser) return res.status(404).json({ error: 'User not found in database' });
    req.dbUser = dbUser;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load user' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.dbUser?.isAdmin) {
    return res.status(403).json({ error: 'Admins only' });
  }
  next();
}
