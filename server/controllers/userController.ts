import { Request, Response } from 'express';
import { User } from '../models/index.ts';

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const userId = (req.query.userId as string) || 'user-primary-1';
    let user = await User.findByPk(userId);
    if (!user) {
      user = await User.findOne();
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}

export async function getAllUsers(_req: Request, res: Response) {
  try {
    const users = await User.findAll({ order: [['name', 'ASC']] });
    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function updateUserProfile(req: Request, res: Response) {
  try {
    const { id, name, targetExam, rollNumber } = req.body;
    const user = await User.findByPk(id || 'user-primary-1');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (name) user.name = name;
    if (targetExam) user.targetExam = targetExam;
    if (rollNumber) user.rollNumber = rollNumber;
    if (user.save) {
      await user.save();
    }
    return res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}
