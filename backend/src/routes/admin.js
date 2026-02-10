import { Router } from 'express';
import prisma from '../db/client.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

const userSelect = {
  id: true,
  email: true,
  phone: true,
  name: true,
  skill: true,
  isAdmin: true,
  createdAt: true,
};

router.get('/', authenticateUser, async (req, res) => {
  try {
    const supabaseUser = req.user;

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    if (!dbUser.isAdmin) {
      return res.status(403).json({ error: 'Only admins can view all users' });
    }

    const users = await prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ users });
  } catch (error) {
    console.error('Fetch all users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:userId', authenticateUser, async (req, res) => {
  try {
    const supabaseUser = req.user;
    const { userId } = req.params;

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    if (!dbUser.isAdmin) {
      return res.status(403).json({ error: 'Only admins can update users' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found' });
    }

    const { name, email, phone, skill, isAdmin } = req.body;
    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (email !== undefined && email !== targetUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return res.status(409).json({ error: 'Email is already in use' });
      }
      updateData.email = email;
    }

    if (phone !== undefined && phone !== targetUser.phone) {
      const phoneExists = await prisma.user.findUnique({ where: { phone } });
      if (phoneExists) {
        return res.status(409).json({ error: 'Phone number is already in use' });
      }
      updateData.phone = phone;
    }

    if (skill !== undefined) {
      const skillNumber = parseInt(skill, 10);
      if (isNaN(skillNumber) || skillNumber < 1 || skillNumber > 10) {
        return res
          .status(400)
          .json({ error: 'Skill level must be between 1 and 10' });
      }
      updateData.skill = skillNumber;
    }

    if (isAdmin !== undefined) {
      updateData.isAdmin = Boolean(isAdmin);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: userSelect,
    });

    return res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
