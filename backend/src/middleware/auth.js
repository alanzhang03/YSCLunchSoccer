import { supabaseAdmin } from '../lib/supabase.js';

export async function authenticateUser(req, res, next) {
  try {
    const token = req.cookies?.sb_access_token;

    if (process.env.NODE_ENV === 'production') {
      console.log('Auth middleware - Cookies received:', {
        hasToken: !!token,
        cookieNames: Object.keys(req.cookies || {}),
        userAgent: req.get('user-agent')?.includes('Safari')
          ? 'Safari'
          : 'Other',
      });
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      if (process.env.NODE_ENV === 'production') {
        console.log('Token validation error:', error?.message || 'No user');
      }
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Auth middleware error:', error.message);
    }
    return res.status(401).json({ error: 'Authentication failed' });
  }
}
