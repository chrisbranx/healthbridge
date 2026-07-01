import { Router, Request, Response, NextFunction } from 'express';
import { select, selectOne, insertOne } from '../lib/db';
import { authenticate, authorize } from '../middleware/auth';
import { z } from 'zod';

export const healthAlertsRouter = Router();
healthAlertsRouter.use(authenticate);

const createAlertSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(['info', 'warning', 'high', 'critical']),
  disease: z.string().optional(),
  regions: z.array(z.string()).min(1),
  instructions: z.string().optional(),
  source: z.string().default('Ministry of Health'),
});

healthAlertsRouter.post('/', authorize('admin', 'doctor'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createAlertSchema.parse(req.body);
    const alert = await insertOne('health_alerts', {
      ...data,
      created_by: req.user!.userId,
      status: 'active',
    });

    const chws = await select('chws', {});
    const patients = await select('patients', {});
    for (const chw of chws) {
      if (data.regions.some((r: string) => chw.region?.toLowerCase().includes(r.toLowerCase()))) {
        await insertOne('sms_log', {
          phone_number: chw.phone,
          message: `[HEALTH ALERT] ${data.title}: ${data.description}. ${data.instructions || ''}`,
          message_type: 'health_alert',
          related_entity_type: 'health_alert',
          related_entity_id: alert.id,
        });
      }
    }

    const { getIO } = await import('../services/socket');
    getIO().emit('alert:new', { alert });

    res.status(201).json(alert);
  } catch (error) { next(error); }
});

healthAlertsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = await select('health_alerts', { order: ['created_at', false] });
    res.json(alerts.slice(0, 50));
  } catch (error) { next(error); }
});

healthAlertsRouter.patch('/:id/status', authorize('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!['active', 'resolved', 'expired'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const { updateOne } = await import('../lib/db');
    const alert = await updateOne('health_alerts', req.params.id, { status });
    res.json(alert);
  } catch (error) { next(error); }
});
