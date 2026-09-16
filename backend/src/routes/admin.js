import { Router } from 'express';
import prisma from '../db/client.js';
import { supabaseAdmin } from '../lib/supabase.js';
import {
  authenticateUser,
  loadDbUser,
  requireAdmin,
} from '../middleware/auth.js';
import { normalizeAdminPosition } from '../lib/positions.js';

const router = Router();

const userSelect = {
  id: true,
  email: true,
  phone: true,
  name: true,
  smsOptIn: true,
  skill: true,
  position: true,
  isAdmin: true,
  ogGroup: true,
  wedGroup: true,
  createdAt: true,
};

function parseUserFields(body) {
  const {
    name,
    email,
    phone,
    skill,
    position,
    isAdmin,
    smsOptIn,
    ogGroup,
    wedGroup,
  } = body;
  const updateData = {};

  if (name !== undefined) {
    updateData.name = name;
  }

  if (email !== undefined) {
    updateData.email = email;
  }

  if (phone !== undefined) {
    updateData.phone = phone;
  }

  if (skill !== undefined) {
    const skillNumber = parseInt(skill, 10);
    if (isNaN(skillNumber) || skillNumber < 1 || skillNumber > 10) {
      return { error: 'Skill level must be between 1 and 10' };
    }
    updateData.skill = skillNumber;
  }

  if (position !== undefined) {
    const parsedPosition = normalizeAdminPosition(position);
    if (!parsedPosition.ok) {
      return { error: 'Position must be DEF, MID, FWD, ALL, or empty' };
    }
    if (!parsedPosition.omitted) {
      updateData.position = parsedPosition.position;
    }
  }

  if (isAdmin !== undefined) {
    updateData.isAdmin = Boolean(isAdmin);
  }

  if (smsOptIn !== undefined) {
    updateData.smsOptIn = Boolean(smsOptIn);
  }

  if (ogGroup !== undefined) {
    updateData.ogGroup = Boolean(ogGroup);
  }

  if (wedGroup !== undefined) {
    updateData.wedGroup = Boolean(wedGroup);
  }

  return { updateData };
}

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
  '/bulk',
  authenticateUser,
  loadDbUser,
  requireAdmin,
  async (req, res) => {
    try {
      const { updates } = req.body;
      if (!Array.isArray(updates) || updates.length === 0) {
        return res
          .status(400)
          .json({ error: 'updates must be a non-empty array' });
      }
      if (updates.length > 500) {
        return res
          .status(400)
          .json({ error: 'Cannot update more than 500 users at once' });
      }

      const ids = updates.map((item) => item?.id).filter(Boolean);
      if (ids.length !== updates.length) {
        return res.status(400).json({ error: 'Each update needs an id' });
      }

      const existingUsers = await prisma.user.findMany({
        where: { id: { in: ids } },
      });
      const existingById = Object.fromEntries(
        existingUsers.map((u) => [u.id, u]),
      );

      const prepared = [];
      const batchEmails = new Map();
      const batchPhones = new Map();

      for (const item of updates) {
        const targetUser = existingById[item.id];
        if (!targetUser) {
          return res.status(404).json({ error: `User not found: ${item.id}` });
        }

        const parsed = parseUserFields(item);
        if (parsed.error) {
          return res.status(400).json({ error: parsed.error });
        }

        const updateData = { ...parsed.updateData };
        if (updateData.email === targetUser.email) {
          delete updateData.email;
        }
        if (updateData.phone === targetUser.phone) {
          delete updateData.phone;
        }

        if (Object.keys(updateData).length === 0) {
          continue;
        }

        if (updateData.email) {
          if (batchEmails.has(updateData.email)) {
            return res
              .status(409)
              .json({ error: `Duplicate email in batch: ${updateData.email}` });
          }
          batchEmails.set(updateData.email, item.id);
        }
        if (updateData.phone) {
          if (batchPhones.has(updateData.phone)) {
            return res
              .status(409)
              .json({ error: `Duplicate phone in batch: ${updateData.phone}` });
          }
          batchPhones.set(updateData.phone, item.id);
        }

        prepared.push({ id: item.id, updateData });
      }

      if (!prepared.length) {
        return res.json({ users: [] });
      }

      const emailConflicts = [...batchEmails.keys()];
      const phoneConflicts = [...batchPhones.keys()];
      if (emailConflicts.length || phoneConflicts.length) {
        const taken = await prisma.user.findMany({
          where: {
            AND: [
              { id: { notIn: ids } },
              {
                OR: [
                  emailConflicts.length ? { email: { in: emailConflicts } } : undefined,
                  phoneConflicts.length ? { phone: { in: phoneConflicts } } : undefined,
                ].filter(Boolean),
              },
            ],
          },
          select: { email: true, phone: true },
        });
        if (taken.length) {
          return res.status(409).json({
            error: `Email or phone already in use: ${taken
              .map((u) => u.email || u.phone)
              .join(', ')}`,
          });
        }
      }

      const updatedUsers = await prisma.$transaction(
        prepared.map(({ id, updateData }) =>
          prisma.user.update({
            where: { id },
            data: updateData,
            select: userSelect,
          }),
        ),
      );

      return res.json({ users: updatedUsers });
    } catch (error) {
      console.error('Bulk update users error:', error);
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

      const parsed = parseUserFields(req.body);
      if (parsed.error) {
        return res.status(400).json({ error: parsed.error });
      }

      const updateData = { ...parsed.updateData };

      if (updateData.email && updateData.email !== targetUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: updateData.email },
        });
        if (emailExists) {
          return res.status(409).json({ error: 'Email is already in use' });
        }
      } else {
        delete updateData.email;
      }

      if (updateData.phone && updateData.phone !== targetUser.phone) {
        const phoneExists = await prisma.user.findUnique({
          where: { phone: updateData.phone },
        });
        if (phoneExists) {
          return res
            .status(409)
            .json({ error: 'Phone number is already in use' });
        }
      } else {
        delete updateData.phone;
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

router.delete(
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
        return res.status(404).json({ error: 'User not found' });
      }

      if (targetUser.isAdmin) {
        return res.status(403).json({ error: 'Cannot delete an admin user' });
      }

      await prisma.user.delete({ where: { id: userId } });

      if (targetUser.supabaseUserId) {
        const { error: authError } =
          await supabaseAdmin.auth.admin.deleteUser(targetUser.supabaseUserId);
        if (authError) {
          console.error('Failed to delete Supabase Auth user:', authError);
        }
      }

      return res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

export default router;
