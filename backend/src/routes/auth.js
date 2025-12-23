import { Router } from 'express';
import prisma from '../db/client.js';
import bcrypt from 'bcrypt';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

function setAuthCookies(res, accessToken, refreshToken, rememberMe = false) {
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrl = (
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ).trim();

  const getRootDomain = (url) => {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
      return hostname;
    } catch {
      return url;
    }
  };

  const frontendRoot = getRootDomain(frontendUrl);
  const backendHost = res.req?.get?.('host') || '';
  const backendRoot = getRootDomain(`https://${backendHost}`);

  const isSameSite =
    frontendRoot === backendRoot && frontendRoot !== 'localhost';

  const isLocalhostCrossOrigin =
    frontendUrl.includes('localhost') &&
    !frontendUrl.includes('localhost:5001');

  const isCrossOrigin =
    isProduction &&
    !isSameSite &&
    (frontendUrl.startsWith('https://') || !frontendUrl.includes('localhost'));

  const useSameSiteNone = isCrossOrigin || isLocalhostCrossOrigin;

  const useSecure =
    (isProduction && frontendUrl.startsWith('https://')) ||
    (useSameSiteNone && !isLocalhostCrossOrigin);

  const accessTokenMaxAge = rememberMe
    ? 7 * 24 * 60 * 60 * 1000
    : 60 * 60 * 1000;


  const refreshTokenMaxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000
    : 7 * 24 * 60 * 60 * 1000;

  const cookieOptions = {
    httpOnly: true,
    maxAge: accessTokenMaxAge,
    path: '/',
    secure: useSecure,
    sameSite: useSameSiteNone ? 'none' : 'lax',
  };

  if (
    cookieOptions.sameSite === 'none' &&
    !cookieOptions.secure &&
    isProduction
  ) {
    console.warn(
      'WARNING: sameSite: "none" requires secure: true in production!'
    );
    cookieOptions.secure = true;
  }

  res.cookie('sb_access_token', accessToken, cookieOptions);

  res.cookie('sb_refresh_token', refreshToken, {
    ...cookieOptions,
    maxAge: refreshTokenMaxAge,
  });

  res.cookie('sb_remember_me', rememberMe ? 'true' : 'false', {
    ...cookieOptions,
    maxAge: refreshTokenMaxAge,
  });
}

function clearAuthCookies(res) {
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrl = (
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ).trim();

  const getRootDomain = (url) => {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
      return hostname;
    } catch {
      return url;
    }
  };

  const frontendRoot = getRootDomain(frontendUrl);
  const backendHost = res.req?.get?.('host') || '';
  const backendRoot = getRootDomain(`https://${backendHost}`);
  const isSameSite =
    frontendRoot === backendRoot && frontendRoot !== 'localhost';

  const isLocalhostCrossOrigin =
    frontendUrl.includes('localhost') &&
    !frontendUrl.includes('localhost:5001');

  const isCrossOrigin =
    isProduction &&
    !isSameSite &&
    (frontendUrl.startsWith('https://') || !frontendUrl.includes('localhost'));

  const useSameSiteNone = isCrossOrigin || isLocalhostCrossOrigin;

  const useSecure =
    (isProduction && frontendUrl.startsWith('https://')) ||
    (useSameSiteNone && !isLocalhostCrossOrigin);

  const cookieOptions = {
    httpOnly: true,
    path: '/',
    secure: useSecure,
    sameSite: useSameSiteNone ? 'none' : 'lax',
  };

  if (
    cookieOptions.sameSite === 'none' &&
    !cookieOptions.secure &&
    isProduction
  ) {
    cookieOptions.secure = true;
  }

  res.clearCookie('sb_access_token', cookieOptions);
  res.clearCookie('sb_refresh_token', cookieOptions);
  res.clearCookie('sb_remember_me', cookieOptions);
}

router.post('/signup', async (req, res) => {
  try {
    const { phoneNum, email, name, password, skill } = req.body;

    if (!phoneNum || !email || !name || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const skillNumber =
      skill !== undefined && skill !== null && skill !== ''
        ? parseInt(skill, 10)
        : 5;

    if (isNaN(skillNumber) || skillNumber < 1 || skillNumber > 10) {
      return res
        .status(400)
        .json({ error: 'Skill level must be a number between 1 and 10' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone: phoneNum }],
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: 'User with this email or phone already exists' });
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
        .json({ error: authError.message || 'Failed to create user' });
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
      signInData.session.refresh_token,
      false
    );

    return res.status(201).json({ user });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phoneNum, password, rememberMe } = req.body;

    if (!phoneNum || !password) {
      return res
        .status(400)
        .json({ error: 'Phone number and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { phone: phoneNum },
    });

    if (!user) {
      return res
        .status(401)
        .json({ error: 'Invalid phone number or password' });
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
        user.password || ''
      );

      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ error: 'Invalid phone number or password' });
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
      return res.json({ message: 'Login successful', user: safeUser });
    }

    try {
      setAuthCookies(
        res,
        signInData.session.access_token,
        signInData.session.refresh_token,
        rememberMe === true
      );
    } catch (cookieError) {
      console.error('Cookie setting error:', cookieError);
      console.error('Environment:', {
        NODE_ENV: process.env.NODE_ENV,
        FRONTEND_URL: process.env.FRONTEND_URL,
        isProduction: process.env.NODE_ENV === 'production',
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

    return res.json({ message: 'Login successful', user: safeUser });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.get('/me', async (req, res) => {
  try {
    let token = req.cookies?.sb_access_token;
    const refreshToken = req.cookies?.sb_refresh_token;

    if (!token && !refreshToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Try to get user with access token
    let supabaseUser = null;
    let error = null;

    if (token) {
      const result = await supabaseAdmin.auth.getUser(token);
      supabaseUser = result.data?.user;
      error = result.error;
    }

    // If access token is invalid/expired, try to refresh using refresh token
    if ((error || !supabaseUser) && refreshToken) {
      try {
        const {
          data: { session: newSession },
          error: refreshError,
        } = await supabaseAdmin.auth.refreshSession({
          refresh_token: refreshToken,
        });

        if (!refreshError && newSession) {
          // Set new tokens in cookies, preserving remember me status
          const rememberMe = req.cookies?.sb_remember_me === 'true';
          setAuthCookies(
            res,
            newSession.access_token,
            newSession.refresh_token,
            rememberMe
          );
          token = newSession.access_token;

          // Get user with new access token
          const userResult = await supabaseAdmin.auth.getUser(
            newSession.access_token
          );
          supabaseUser = userResult.data?.user;
          error = userResult.error;
        }
      } catch (refreshErr) {
        console.error('Token refresh error:', refreshErr);
        error = refreshErr;
      }
    }

    if (error || !supabaseUser) {
      return res.status(401).json({ error: 'Invalid or expired token' });
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
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Error in /auth/me:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.sb_refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const {
      data: { session: newSession },
      error: refreshError,
    } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (refreshError || !newSession) {
      return res
        .status(401)
        .json({ error: 'Invalid or expired refresh token' });
    }


    const rememberMe = req.cookies?.sb_remember_me === 'true';
    setAuthCookies(
      res,
      newSession.access_token,
      newSession.refresh_token,
      rememberMe
    );

    return res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.sb_access_token;

    if (token) {
      await supabaseAdmin.auth.signOut(token);
    }

    clearAuthCookies(res);

    return res.json({ message: 'Logout successful' });
  } catch (error) {
    clearAuthCookies(res);
    return res.json({ message: 'Logout successful' });
  }
});

export default router;
