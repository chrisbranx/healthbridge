import { Router, Request, Response, NextFunction } from 'express';
import { select, selectOne, insertOne, updateOne } from '../lib/db';
import { authenticate, authorize } from '../middleware/auth';
import { getIO } from '../services/socket';
import { z } from 'zod';

export const videoRouter = Router();
videoRouter.use(authenticate);

const createRoomSchema = z.object({
  patient_id: z.string().uuid(),
  consultation_id: z.string().uuid().optional(),
  scheduled_at: z.string().optional(),
});

videoRouter.post('/rooms', authorize('doctor'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createRoomSchema.parse(req.body);
    const room = await insertOne('video_rooms', {
      doctor_id: req.user!.userId,
      patient_id: data.patient_id,
      consultation_id: data.consultation_id,
      status: 'pending',
      room_name: `hb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      scheduled_at: data.scheduled_at || new Date().toISOString(),
    });

    getIO().to(`user:${data.patient_id}`).emit('video:invite', { room });
    getIO().to(`user:${req.user!.userId}`).emit('video:room-created', { room });

    res.status(201).json(room);
  } catch (error) { next(error); }
});

videoRouter.get('/rooms', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const field = role === 'doctor' ? 'doctor_id' : 'patient_id';
    const rooms = await select('video_rooms', { eq: [field, userId], order: ['created_at', false] });
    res.json(rooms.slice(0, 50));
  } catch (error) { next(error); }
});

videoRouter.post('/rooms/:id/signal', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, sdp, candidate } = req.body;
    const room = await selectOne('video_rooms', 'id', req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const event = type === 'offer' ? 'video:offer' : type === 'answer' ? 'video:answer' : 'video:ice-candidate';
    const targetId = room.doctor_id === req.user!.userId ? room.patient_id : room.doctor_id;
    getIO().to(`user:${targetId}`).emit(event, { roomId: req.params.id, sdp, candidate });

    res.json({ ok: true });
  } catch (error) { next(error); }
});

videoRouter.patch('/rooms/:id/status', authorize('doctor', 'patient'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!['pending', 'active', 'completed', 'missed'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const room = await updateOne('video_rooms', req.params.id, { status });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    getIO().to(`consultation:${room.consultation_id || ''}`).emit('video:status', { roomId: req.params.id, status });
    res.json(room);
  } catch (error) { next(error); }
});
