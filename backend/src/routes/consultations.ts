import { Router, Request, Response, NextFunction } from 'express';
import { select, selectOne, insertOne, updateOne } from '../lib/db';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { getIO } from '../services/socket';
import { z } from 'zod';

export const consultationsRouter = Router();

consultationsRouter.use(authenticate);

const createConsultationSchema = z.object({
  patient_id: z.string().uuid(),
  symptoms: z.string().min(1).max(2000),
  channel: z.enum(['ussd', 'web']),
  triage_level: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
});

const respondConsultationSchema = z.object({
  diagnosis: z.string().min(1),
  prescription: z.string().optional(),
  doctor_notes: z.string().optional(),
  requires_follow_up: z.boolean().default(false),
  follow_up_instructions: z.string().optional(),
});

consultationsRouter.post('/', authorize('patient', 'chw', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createConsultationSchema.parse(req.body);

    const consultation = await insertOne('consultations', {
      ...data,
      status: 'pending',
    });

    await insertOne('analytics_events', {
      event_type: 'consultation_created',
      entity_type: 'consultation',
      entity_id: consultation.id,
      metadata: { channel: data.channel, triage_level: data.triage_level },
    });

    await insertOne('sms_log', {
      phone_number: consultation.id,
      message: `HealthBridge: Your consultation request has been received (ID: ${consultation.id.slice(0, 8)}). A doctor will respond within 24 hours.`,
      message_type: 'consultation_ack',
      related_entity_type: 'consultation',
      related_entity_id: consultation.id,
    });

    getIO().emit('consultation:new', { consultation });

    res.status(201).json(consultation);
  } catch (error) {
    next(error);
  }
});

consultationsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.userId;
    let consultations;

    if (userRole === 'patient') {
      const patient = await selectOne('patients', 'user_id', userId);
      if (!patient) return res.json([]);
      consultations = await select('consultations', { eq: ['patient_id', patient.id], order: ['created_at', false] });
    } else if (userRole === 'doctor') {
      consultations = await select('consultations', { order: ['created_at', false] });
    } else {
      consultations = await select('consultations', { order: ['created_at', false] });
    }

    consultations = consultations.slice(0, 50);
    res.json(consultations);
  } catch (error) {
    next(error);
  }
});

consultationsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consultation = await selectOne('consultations', 'id', req.params.id);
    if (!consultation) throw new AppError('Consultation not found', 404);

    const patient = await selectOne('patients', 'id', consultation.patient_id);
    const prescriptions = await select('prescriptions', { eq: ['consultation_id', req.params.id] });

    res.json({ ...consultation, patient, prescriptions });
  } catch (error) {
    next(error);
  }
});

consultationsRouter.patch('/:id/respond', authorize('doctor'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = respondConsultationSchema.parse(req.body);

    const consultation = await updateOne('consultations', req.params.id, {
      doctor_id: req.user!.userId,
      diagnosis: data.diagnosis,
      prescription: data.prescription,
      doctor_notes: data.doctor_notes,
      requires_follow_up: data.requires_follow_up,
      follow_up_instructions: data.follow_up_instructions,
      status: 'resolved',
      responded_at: new Date().toISOString(),
      resolved_at: new Date().toISOString(),
    });

    if (!consultation) throw new AppError('Consultation not found', 404);

    if (data.prescription) {
      await insertOne('prescriptions', {
        consultation_id: consultation.id,
        patient_id: consultation.patient_id,
        doctor_id: req.user!.userId,
        medication_name: 'See prescription notes',
        dosage: 'As prescribed',
        frequency: 'As directed',
        duration: 'As directed',
        notes: data.prescription,
      });
    }

    await insertOne('sms_log', {
      phone_number: consultation.patient_id,
      message: `HealthBridge: Your consultation has been reviewed. Diagnosis: ${data.diagnosis}. ${data.prescription ? 'Prescription sent.' : ''}`,
      message_type: 'prescription',
      related_entity_type: 'consultation',
      related_entity_id: consultation.id,
    });

    if (data.requires_follow_up) {
      const assignments = await select('chw_patient_assignments', { eq: ['patient_id', consultation.patient_id] });
      for (const assignment of assignments) {
        await insertOne('chw_tasks', {
          chw_id: assignment.chw_id,
          patient_id: consultation.patient_id,
          consultation_id: consultation.id,
          title: 'Follow-up after consultation',
          description: data.follow_up_instructions || `Follow up on patient. Diagnosis: ${data.diagnosis}`,
          task_type: 'follow_up',
          priority: data.diagnosis.toLowerCase().includes('critical') || data.diagnosis.toLowerCase().includes('emergency') ? 'critical' : 'medium',
          status: 'pending',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    await insertOne('analytics_events', {
      event_type: 'consultation_responded',
      entity_type: 'consultation',
      entity_id: consultation.id,
      metadata: { doctor_id: req.user!.userId, requires_follow_up: data.requires_follow_up },
    });

    getIO().to(`user:${consultation.patient_id}`).emit('consultation:responded', { consultation });
    getIO().emit('consultation:updated', { consultation });

    res.json(consultation);
  } catch (error) {
    next(error);
  }
});

consultationsRouter.patch('/:id/status', authorize('doctor', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!['pending', 'active', 'resolved', 'escalated'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const consultation = await updateOne('consultations', req.params.id, { status });
    if (!consultation) throw new AppError('Consultation not found', 404);
    res.json(consultation);
  } catch (error) {
    next(error);
  }
});
