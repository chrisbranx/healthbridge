import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { insertOne, select, selectOne } from '../lib/db';
import { devDb } from '../lib/devDb';

export const labResultsRouter = Router();
labResultsRouter.use(authenticate);

const uploadSchema = z.object({
  patient_id: z.string().uuid(),
  test_type: z.string().min(1).max(200),
  results_text: z.string().min(1).max(10000),
  image_url: z.string().url().max(1000).optional(),
  notes: z.string().max(2000).optional(),
});

labResultsRouter.post('/upload', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = uploadSchema.parse(req.body);

    const result = await insertOne('lab_results', {
      uploaded_by: req.user!.userId,
      patient_id: data.patient_id,
      test_type: data.test_type,
      results_text: data.results_text,
      image_url: data.image_url || '',
      notes: data.notes || '',
      status: 'completed',
    });

    res.status(201).json(result);
  } catch (error) { next(error); }
});

labResultsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.userId;

    let results: any[];
    if (userRole === 'patient') {
      const patient = await selectOne('patients', 'user_id', userId);
      if (!patient) return res.json([]);
      results = await select('lab_results', { eq: ['patient_id', patient.id], order: ['created_at', false] });
    } else if (userRole === 'doctor') {
      results = await select('lab_results', { order: ['created_at', false] });
    } else {
      results = await select('lab_results', { eq: ['uploaded_by', userId], order: ['created_at', false] });
    }

    res.json(results);
  } catch (error) { next(error); }
});

labResultsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await selectOne('lab_results', 'id', req.params.id);
    if (!result) return res.status(404).json({ error: 'Lab result not found' });

    const patient = await selectOne('patients', 'id', result.patient_id);
    res.json({ ...result, patient });
  } catch (error) { next(error); }
});

labResultsRouter.post('/:id/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await selectOne('lab_results', 'id', req.params.id);
    if (!result) return res.status(404).json({ error: 'Lab result not found' });

    const text = result.results_text.toLowerCase();
    const criticalKeywords = ['positive', 'abnormal', 'high', 'low', 'elevated', 'infection', 'malignant'];
    const normalKeywords = ['negative', 'normal', 'within range', 'clear'];

    const criticalMatches = criticalKeywords.filter((k: string) => text.includes(k));
    const normalMatches = normalKeywords.filter((k: string) => text.includes(k));

    const interpretation = criticalMatches.length > normalMatches.length
      ? 'Abnormal results detected. Further medical evaluation recommended.'
      : normalMatches.length > 0
        ? 'Results appear within normal ranges.'
        : 'No clear indicators found. Please consult a doctor for interpretation.';

    res.json({
      id: result.id,
      test_type: result.test_type,
      interpretation,
      keywords_found: [...criticalMatches, ...normalMatches],
      flagged: criticalMatches.length > 0,
      recommendation: criticalMatches.length > 0
        ? 'Schedule a follow-up consultation with a specialist.'
        : 'Routine monitoring is sufficient.',
    });
  } catch (error) { next(error); }
});
