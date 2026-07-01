import { Router, Request, Response, NextFunction } from 'express';
import { select, selectOne, insertOne, updateOne } from '../lib/db';
import { authenticate, authorize } from '../middleware/auth';
import { z } from 'zod';

export const remindersRouter = Router();
remindersRouter.use(authenticate);

const createReminderSchema = z.object({
  patient_id: z.string().uuid(),
  medication_name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().optional(),
  reminder_time: z.string(),
  channel: z.enum(['sms', 'whatsapp']).default('sms'),
  phone_number: z.string().optional(),
});

remindersRouter.post('/', authorize('doctor', 'chw'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createReminderSchema.parse(req.body);
    const reminder = await insertOne('medication_reminders', {
      ...data,
      created_by: req.user!.userId,
      status: 'active',
      next_reminder_at: getNextReminderTime(data.reminder_time, data.frequency),
    });

    const patient = await selectOne('patients', 'id', data.patient_id);
    if (patient) {
      const phone = data.phone_number || patient.phone;
      const msg = `HealthBridge Reminder: Take ${data.dosage} of ${data.medication_name} - ${data.frequency}. Reply 1 if taken, 0 if missed.`;
      await insertOne('sms_log', {
        phone_number: phone,
        message: msg,
        message_type: 'medication_reminder',
        related_entity_type: 'medication_reminder',
        related_entity_id: reminder.id,
      });
    }

    res.status(201).json(reminder);
  } catch (error) { next(error); }
});

remindersRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patient_id } = req.query;
    const opts: any = { order: ['created_at', false] };
    if (patient_id) opts.eq = ['patient_id', patient_id as string];
    const reminders = await select('medication_reminders', opts);
    res.json(reminders.slice(0, 100));
  } catch (error) { next(error); }
});

remindersRouter.patch('/:id/status', authorize('doctor', 'chw'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!['active', 'paused', 'completed'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const reminder = await updateOne('medication_reminders', req.params.id, { status });
    res.json(reminder);
  } catch (error) { next(error); }
});

function getNextReminderTime(time: string, _frequency: string): string {
  const [h, m] = time.split(':').map(Number);
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next <= new Date()) next.setDate(next.getDate() + 1);
  return next.toISOString();
}
