import { Router, Request, Response, NextFunction } from 'express';
import { select, selectOne, insertOne, updateOne } from '../lib/db';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

export const chwRouter = Router();

chwRouter.use(authenticate);
chwRouter.use(authorize('chw', 'admin'));

chwRouter.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chwId = req.user!.userId;

    const assignments = await select('chw_patient_assignments', { eq: ['chw_id', chwId] });
    const tasks = await select('chw_tasks', { eq: ['chw_id', chwId], order: ['created_at', false] });
    const escalations = await select('escalation_alerts', { eq: ['chw_id', chwId], order: ['created_at', false] });
    const adherenceLogs = await select('medication_adherence', { eq: ['logged_by', chwId] });

    const totalAdherence = adherenceLogs.length;
    const positiveAdherence = adherenceLogs.filter((a: any) => a.was_taken).length;

    const patientIds = assignments.filter((a: any) => a.is_active !== false).map((a: any) => a.patient_id);
    const allPatients = await select('patients');
    const patientsList = allPatients.filter((p: any) => patientIds.includes(p.id));

    res.json({
      total_patients: patientsList.length,
      patients_list: patientsList,
      tasks: tasks,
      pending_tasks: tasks.filter((t: any) => t.status === 'pending').length,
      escalations: escalations,
      adherence_rate: totalAdherence > 0 ? Math.round((positiveAdherence / totalAdherence) * 100) : 0,
    });
  } catch (error) {
    next(error);
  }
});

chwRouter.get('/patients', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignments = await select('chw_patient_assignments', { eq: ['chw_id', req.user!.userId] });
    const patientIds = assignments.filter((a: any) => a.is_active !== false).map((a: any) => a.patient_id);
    const allPatients = await select('patients');
    res.json(allPatients.filter((p: any) => patientIds.includes(p.id)));
  } catch (error) {
    next(error);
  }
});

chwRouter.post('/patients', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patient_id } = req.body;
    await insertOne('chw_patient_assignments', {
      chw_id: req.user!.userId,
      patient_id,
      is_active: true,
    });
    res.status(201).json({ message: 'Patient assigned successfully' });
  } catch (error) {
    next(error);
  }
});

chwRouter.get('/tasks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let tasks = await select('chw_tasks', { eq: ['chw_id', req.user!.userId], order: ['created_at', false] });

    if (req.query.status) {
      tasks = tasks.filter((t: any) => t.status === req.query.status);
    }

    const enriched = await Promise.all(tasks.map(async (t: any) => {
      const patient = t.patient_id ? await selectOne('patients', 'id', t.patient_id) : null;
      const consultation = t.consultation_id ? await selectOne('consultations', 'id', t.consultation_id) : null;
      return { ...t, patient, consultation };
    }));

    res.json(enriched);
  } catch (error) {
    next(error);
  }
});

const updateTaskSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  notes: z.string().optional(),
});

chwRouter.patch('/tasks/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = updateTaskSchema.parse(req.body);

    const updateData: any = { status: updates.status };
    if (updates.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    if (updates.notes) {
      updateData.notes = updates.notes;
    }

    const task = await updateOne('chw_tasks', req.params.id, updateData);
    if (!task) throw new AppError('Task not found', 404);
    res.json(task);
  } catch (error) {
    next(error);
  }
});

chwRouter.post('/adherence', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prescription_id, patient_id, was_taken, notes } = req.body;

    const adherence = await insertOne('medication_adherence', {
      prescription_id: prescription_id || null,
      patient_id,
      logged_by: req.user!.userId,
      taken_at: new Date().toISOString(),
      was_taken: !!was_taken,
      notes: notes || '',
    });

    res.status(201).json(adherence);
  } catch (error) {
    next(error);
  }
});

const escalationSchema = z.object({
  patient_id: z.string().uuid(),
  clinic_id: z.string().uuid().optional(),
  consultation_id: z.string().uuid().optional(),
  reason: z.string().min(1).max(2000),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('high'),
});

chwRouter.post('/escalations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = escalationSchema.parse(req.body);

    const escalation = await insertOne('escalation_alerts', {
      chw_id: req.user!.userId,
      patient_id: data.patient_id,
      clinic_id: data.clinic_id || null,
      consultation_id: data.consultation_id || null,
      reason: data.reason,
      severity: data.severity,
      status: 'pending',
    });

    const patient = await selectOne('patients', 'id', data.patient_id);

    if (data.clinic_id) {
      const clinic = await selectOne('clinics', 'id', data.clinic_id);
      if (clinic?.phone) {
        await insertOne('sms_log', {
          phone_number: clinic.phone,
          message: `HEALTHBRIDGE ESCALATION: Patient ${patient?.name || 'Unknown'} requires urgent attention. Severity: ${data.severity}. Reason: ${data.reason}`,
          message_type: 'escalation',
          related_entity_type: 'escalation_alert',
          related_entity_id: escalation.id,
        });
      }
    }

    await insertOne('analytics_events', {
      event_type: 'escalation_created',
      entity_type: 'escalation_alert',
      entity_id: escalation.id,
      metadata: { severity: data.severity, chw_id: req.user!.userId },
    });

    res.status(201).json({ ...escalation, patient });
  } catch (error) {
    next(error);
  }
});

chwRouter.get('/escalations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const escalations = await select('escalation_alerts', { eq: ['chw_id', req.user!.userId], order: ['created_at', false] });

    const enriched = await Promise.all(escalations.map(async (e: any) => {
      const patient = e.patient_id ? await selectOne('patients', 'id', e.patient_id) : null;
      const clinic = e.clinic_id ? await selectOne('clinics', 'id', e.clinic_id) : null;
      return { ...e, patient, clinic };
    }));

    res.json(enriched);
  } catch (error) {
    next(error);
  }
});
