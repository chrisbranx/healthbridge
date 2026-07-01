import { Router, Request, Response, NextFunction } from 'express';
import { select, insertOne } from '../lib/db';
import { authenticate, authorize } from '../middleware/auth';
import { z } from 'zod';

export const insuranceRouter = Router();
insuranceRouter.use(authenticate);

const enrollSchema = z.object({
  patient_id: z.string().uuid(),
  provider: z.string().min(1),
  policy_number: z.string().min(1),
  coverage_type: z.enum(['basic', 'standard', 'premium', 'mutuelle']),
  start_date: z.string(),
  end_date: z.string(),
});

insuranceRouter.post('/enroll', authorize('patient', 'chw', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = enrollSchema.parse(req.body);
    const enrollment = await insertOne('insurance_enrollments', {
      ...data,
      status: 'active',
    });
    res.status(201).json(enrollment);
  } catch (error) { next(error); }
});

insuranceRouter.get('/enrollments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patient_id } = req.query;
    const opts: any = { order: ['created_at', false] };
    if (patient_id) opts.eq = ['patient_id', patient_id as string];
    const enrollments = await select('insurance_enrollments', opts);
    res.json(enrollments);
  } catch (error) { next(error); }
});

insuranceRouter.get('/providers', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const providers = [
      { id: 'cnps', name: 'CNPS', country: 'Cameroon', type: 'National', description: 'Caisse Nationale de Prévoyance Sociale' },
      { id: 'mutuelle', name: 'Mutuelle de Santé', country: 'Cameroon', type: 'Community', description: 'Community-based health insurance' },
      { id: 'mtn-momo', name: 'MTN MoMo Insurance', country: 'Cameroon', type: 'Mobile', description: 'Mobile money-based micro-insurance' },
      { id: 'orange-money', name: 'Orange Money Insurance', country: 'Cameroon', type: 'Mobile', description: 'Mobile money-based micro-insurance' },
    ];
    res.json(providers);
  } catch (error) { next(error); }
});

insuranceRouter.get('/claims', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claims = await select('insurance_claims', { order: ['created_at', false] });
    res.json(claims.slice(0, 50));
  } catch (error) { next(error); }
});

insuranceRouter.post('/claims', authorize('patient', 'chw'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await insertOne('insurance_claims', {
      ...req.body,
      status: 'submitted',
      submitted_by: req.user!.userId,
    });
    res.status(201).json(claim);
  } catch (error) { next(error); }
});
