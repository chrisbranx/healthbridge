import { Router, Request, Response, NextFunction } from 'express';
import { select, selectOne, updateOne } from '../lib/db';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

export const patientsRouter = Router();

patientsRouter.use(authenticate);

const updatePatientSchema = z.object({
  name: z.string().min(1).optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  village: z.string().optional(),
  region: z.string().optional(),
  chronic_conditions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  blood_type: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

patientsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.userId;

    if (userRole === 'patient') {
      const patient = await selectOne('patients', 'user_id', userId);
      return res.json(patient ? [patient] : []);
    }

    if (userRole === 'chw') {
      const assignments = await select('chw_patient_assignments', { eq: ['chw_id', userId] });
      if (assignments.length > 0) {
        const patientIds = assignments.map((a: any) => a.patient_id);
        const allPatients = await select('patients');
        return res.json(allPatients.filter((p: any) => patientIds.includes(p.id)));
      }
      return res.json([]);
    }

    const allPatients = await select('patients');
    res.json(allPatients);
  } catch (error) {
    next(error);
  }
});

patientsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patient = await selectOne('patients', 'id', req.params.id);
    if (!patient) throw new AppError('Patient not found', 404);
    res.json(patient);
  } catch (error) {
    next(error);
  }
});

patientsRouter.patch('/:id', authorize('patient', 'chw', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = updatePatientSchema.parse(req.body);
    const patient = await updateOne('patients', req.params.id, updates);
    if (!patient) throw new AppError('Patient not found', 404);
    res.json(patient);
  } catch (error) {
    next(error);
  }
});

patientsRouter.get('/:id/consultations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consultations = await select('consultations', { eq: ['patient_id', req.params.id], order: ['created_at', false] });
    res.json(consultations);
  } catch (error) {
    next(error);
  }
});

patientsRouter.get('/:id/prescriptions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prescriptions = await select('prescriptions', { eq: ['patient_id', req.params.id], order: ['created_at', false] });
    res.json(prescriptions);
  } catch (error) {
    next(error);
  }
});
