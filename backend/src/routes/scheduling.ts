import { Router, Request, Response, NextFunction } from 'express';
import { select, selectOne, insertOne, updateOne } from '../lib/db';
import { authenticate, authorize } from '../middleware/auth';
import { z } from 'zod';

export const schedulingRouter = Router();
schedulingRouter.use(authenticate);

const createSlotSchema = z.object({
  date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  max_patients: z.number().int().min(1).default(10),
});

const bookAppointmentSchema = z.object({
  doctor_id: z.string().uuid(),
  slot_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  reason: z.string().optional(),
});

schedulingRouter.post('/slots', authorize('doctor'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createSlotSchema.parse(req.body);
    const slot = await insertOne('appointment_slots', {
      doctor_id: req.user!.userId,
      ...data,
      booked_count: 0,
    });
    res.status(201).json(slot);
  } catch (error) { next(error); }
});

schedulingRouter.get('/slots', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctor_id, date } = req.query;
    const opts: any = { order: ['date', true] };
    if (doctor_id) opts.eq = ['doctor_id', doctor_id as string];
    const slots = await select('appointment_slots', opts);
    const filtered = date ? slots.filter((s: any) => s.date === date) : slots;
    res.json(filtered);
  } catch (error) { next(error); }
});

schedulingRouter.post('/appointments', authorize('patient', 'doctor', 'chw'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = bookAppointmentSchema.parse(req.body);
    const slot = await selectOne('appointment_slots', 'id', data.slot_id);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.booked_count >= slot.max_patients) return res.status(400).json({ error: 'Slot is full' });

    const appointment = await insertOne('appointments', {
      ...data,
      status: 'confirmed',
    });

    await updateOne('appointment_slots', data.slot_id, { booked_count: slot.booked_count + 1 });

    const { getIO } = await import('../services/socket');
    getIO().to(`user:${data.doctor_id}`).emit('scheduling:new-appointment', { appointment });

    res.status(201).json(appointment);
  } catch (error) { next(error); }
});

schedulingRouter.get('/appointments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const field = role === 'doctor' ? 'doctor_id' : 'patient_id';
    const appointments = await select('appointments', { eq: [field, userId], order: ['created_at', false] });
    res.json(appointments.slice(0, 50));
  } catch (error) { next(error); }
});

schedulingRouter.patch('/appointments/:id/status', authorize('doctor', 'patient'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'completed', 'cancelled', 'rescheduled'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const appointment = await updateOne('appointments', req.params.id, { status });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (error) { next(error); }
});
