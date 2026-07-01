import { Router, Request, Response, NextFunction } from 'express';
import { select, selectOne, insertOne, updateOne } from '../lib/db';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const notifications = await select('notifications', { eq: ['user_id', userId], order: ['created_at', false] });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

notificationsRouter.get('/unread-count', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const notifications = await select('notifications', { eq: ['user_id', userId] });
    const unread = notifications.filter((n: any) => !n.read).length;
    res.json({ count: unread });
  } catch (error) {
    next(error);
  }
});

notificationsRouter.patch('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const notifications = await select('notifications', { eq: ['user_id', userId] });
    for (const n of notifications) {
      await updateOne('notifications', n.id, { read: true });
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

notificationsRouter.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await updateOne('notifications', req.params.id, { read: true });
    if (!notification) throw new AppError('Notification not found', 404);
    res.json(notification);
  } catch (error) {
    next(error);
  }
});
