import { Router } from 'express';
import prisma from '../db/client.js';
import {
  authenticateUser,
  loadDbUser,
  requireAdmin,
} from '../middleware/auth.js';

const router = Router();

const userSelect = {
  id: true,
  email: true,
  phone: true,
  name: true,
  smsOptIn: true,
  skill: true,
  isAdmin: true,
  createdAt: true,
};

router.get(
  '/',
  authenticateUser,
  loadDbUser,
  requireAdmin,
  async (_req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: userSelect,
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ users });
    } catch (error) {
      console.error('Fetch all users error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

router.get(
  '/sms-opt-ins',
  authenticateUser,
  loadDbUser,
  requireAdmin,
  async (_req, res) => {
    try {
      const users = await prisma.user.findMany({
        where: { smsOptIn: true },
        select: { id: true, name: true, phone: true, email: true },
        orderBy: { name: 'asc' },
      });

      return res.json({ users });
    } catch (error) {
      console.error('Fetch SMS opt-ins error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

router.patch(
  '/:userId',
  authenticateUser,
  loadDbUser,
  requireAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!targetUser) {
        return res.status(404).json({ error: 'Target user not found' });
      }

      const { name, email, phone, skill, isAdmin, smsOptIn } = req.body;
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
          return res
            .status(409)
            .json({ error: 'Phone number is already in use' });
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

      if (smsOptIn !== undefined) {
        updateData.smsOptIn = Boolean(smsOptIn);
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
  },
);

export default router;
