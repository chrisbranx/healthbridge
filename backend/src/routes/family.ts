import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { insertOne, select, selectOne, updateOne } from '../lib/db';
import { devDb } from '../lib/devDb';

export const familyRouter = Router();
familyRouter.use(authenticate);

const addMemberSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(5).max(20),
  relationship: z.string().min(1).max(100),
  blood_type: z.string().max(10).optional(),
  allergies: z.string().max(500).optional(),
});

const updateMemberSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().min(5).max(20).optional(),
  relationship: z.string().min(1).max(100).optional(),
  blood_type: z.string().max(10).optional(),
  allergies: z.string().max(500).optional(),
  is_emergency_contact: z.boolean().optional(),
});

familyRouter.post('/members', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = addMemberSchema.parse(req.body);

    const member = await insertOne('family_members', {
      user_id: req.user!.userId,
      name: data.name,
      phone: data.phone,
      relationship: data.relationship,
      blood_type: data.blood_type || '',
      allergies: data.allergies || '',
      is_emergency_contact: false,
    });

    res.status(201).json(member);
  } catch (error) { next(error); }
});

familyRouter.get('/members', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await select('family_members', { eq: ['user_id', req.user!.userId], order: ['created_at', true] });
    res.json(members);
  } catch (error) { next(error); }
});

familyRouter.patch('/members/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateMemberSchema.parse(req.body);

    const member = await selectOne('family_members', 'id', req.params.id);
    if (!member) return res.status(404).json({ error: 'Family member not found' });
    if (member.user_id !== req.user!.userId) return res.status(403).json({ error: 'Not authorized' });

    const updated = await updateOne('family_members', req.params.id, data);
    res.json(updated);
  } catch (error) { next(error); }
});

familyRouter.delete('/members/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await selectOne('family_members', 'id', req.params.id);
    if (!member) return res.status(404).json({ error: 'Family member not found' });
    if (member.user_id !== req.user!.userId) return res.status(403).json({ error: 'Not authorized' });

    (devDb as any).delete('family_members', req.params.id);
    res.json({ message: 'Family member removed' });
  } catch (error) { next(error); }
});

familyRouter.post('/members/:id/emergency-contact', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await selectOne('family_members', 'id', req.params.id);
    if (!member) return res.status(404).json({ error: 'Family member not found' });
    if (member.user_id !== req.user!.userId) return res.status(403).json({ error: 'Not authorized' });

    const updated = await updateOne('family_members', req.params.id, { is_emergency_contact: true });
    res.json(updated);
  } catch (error) { next(error); }
});
