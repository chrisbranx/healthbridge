import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { insertOne, select, selectOne, updateOne } from '../lib/db';
import { devDb } from '../lib/devDb';

export const bloodDonorRouter = Router();
bloodDonorRouter.use(authenticate);

const registerSchema = z.object({
  blood_type: z.enum(['A', 'B', 'AB', 'O']),
  rh_factor: z.enum(['positive', 'negative']),
  phone: z.string().min(5).max(20),
  region: z.string().min(1).max(200),
  last_donation_date: z.string().optional(),
});

const requestSchema = z.object({
  blood_type: z.enum(['A', 'B', 'AB', 'O']),
  region: z.string().min(1).max(200),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  patient_name: z.string().max(200).optional(),
  hospital: z.string().max(300).optional(),
});

bloodDonorRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = (await select('blood_donors', { eq: ['user_id', req.user!.userId] })) as any[];
    if (existing.length > 0) return res.status(409).json({ error: 'Already registered as donor' });

    const donor = await insertOne('blood_donors', {
      user_id: req.user!.userId,
      blood_type: data.blood_type,
      rh_factor: data.rh_factor,
      phone: data.phone,
      region: data.region,
      last_donation_date: data.last_donation_date || null,
      is_available: true,
    });

    res.status(201).json(donor);
  } catch (error) { next(error); }
});

bloodDonorRouter.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { blood_type, region } = req.query;
    const donors = await select('blood_donors', {});

    let filtered = donors.filter((d: any) => d.is_available !== false);
    if (blood_type) filtered = filtered.filter((d: any) => d.blood_type === blood_type);
    if (region) filtered = filtered.filter((d: any) => d.region?.toLowerCase().includes((region as string).toLowerCase()));

    res.json(filtered);
  } catch (error) { next(error); }
});

bloodDonorRouter.get('/my-profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const donors = await select('blood_donors', { eq: ['user_id', req.user!.userId] });
    const profile = (donors as any[])[0] || null;
    if (!profile) return res.status(404).json({ error: 'Donor profile not found' });
    res.json(profile);
  } catch (error) { next(error); }
});

bloodDonorRouter.patch('/my-profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const donors = await select('blood_donors', { eq: ['user_id', req.user!.userId] });
    const profile = (donors as any[])[0];
    if (!profile) return res.status(404).json({ error: 'Donor profile not found' });

    const updated = await updateOne('blood_donors', profile.id, req.body);
    res.json(updated);
  } catch (error) { next(error); }
});

bloodDonorRouter.post('/request', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = requestSchema.parse(req.body);

    const request = await insertOne('blood_requests', {
      requested_by: req.user!.userId,
      blood_type: data.blood_type,
      region: data.region,
      urgency: data.urgency,
      patient_name: data.patient_name || '',
      hospital: data.hospital || '',
      status: 'open',
    });

    const matchedDonors = (await select('blood_donors', {}))
      .filter((d: any) => d.blood_type === data.blood_type && d.region?.toLowerCase().includes(data.region.toLowerCase()) && d.is_available !== false);

    res.status(201).json({ request, matched_donors_count: matchedDonors.length });
  } catch (error) { next(error); }
});

bloodDonorRouter.get('/requests', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await select('blood_requests', { order: ['created_at', false] });
    res.json(requests);
  } catch (error) { next(error); }
});
