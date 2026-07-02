import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { insertOne, select } from '../lib/db';
import { devDb } from '../lib/devDb';

export const sosRouter = Router();
sosRouter.use(authenticate);

const sosSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  message: z.string().max(1000).optional(),
  patient_name: z.string().max(200).optional(),
});

sosRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = sosSchema.parse(req.body);

    const sos = await insertOne('sos_alerts', {
      user_id: req.user!.userId,
      latitude: data.latitude,
      longitude: data.longitude,
      message: data.message || '',
      patient_name: data.patient_name || '',
      status: 'active',
    });

    const clinics = devDb.get('clinics') as any[];
    const nearest = clinics.length > 0 ? clinics[0] : null;

    res.status(201).json({
      sos,
      nearest_clinic: nearest ? {
        name: nearest.name,
        phone: nearest.phone,
        region: nearest.region,
        district: nearest.district,
      } : null,
      message: 'SOS alert sent. Help is on the way.',
    });
  } catch (error) { next(error); }
});

sosRouter.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = await select('sos_alerts', { eq: ['user_id', req.user!.userId], order: ['created_at', false] });
    res.json(alerts);
  } catch (error) { next(error); }
});
