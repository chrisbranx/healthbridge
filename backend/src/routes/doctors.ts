import { Router, Request, Response, NextFunction } from 'express';
import { select, selectOne, insertOne } from '../lib/db';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

export const doctorsRouter = Router();

doctorsRouter.use(authenticate);
doctorsRouter.use(authorize('doctor', 'admin'));

doctorsRouter.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.userId;

    const pendingConsultations = await select('consultations', { eq: ['status', 'pending'] });
    const doctorConsultations = await select('consultations', { eq: ['doctor_id', doctorId] });
    const totalPatients = new Set(doctorConsultations.map((c: any) => c.patient_id)).size;

    const doctorPatients = doctorConsultations.slice(0, 10);
    const pendingTasks = await select('chw_tasks', { eq: ['status', 'pending'] });

    res.json({
      pending_count: pendingConsultations.length,
      total_patients: totalPatients,
      pending_consultations: pendingConsultations.slice(0, 10),
      recent_consultations: doctorPatients,
    });
  } catch (error) {
    next(error);
  }
});

doctorsRouter.get('/patients', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consultations = await select('consultations', { eq: ['doctor_id', req.user!.userId], order: ['created_at', false] });

    const patientMap = new Map();
    for (const c of consultations) {
      if (!patientMap.has(c.patient_id)) {
        const patient = await selectOne('patients', 'id', c.patient_id);
        if (patient) patientMap.set(c.patient_id, patient);
      }
    }

    res.json(Array.from(patientMap.values()));
  } catch (error) {
    next(error);
  }
});

// Doctor analytics dashboard
doctorsRouter.get('/analytics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.userId;
    const days = parseInt(req.query.days as string) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const allConsultations = await select('consultations', { eq: ['doctor_id', doctorId], order: ['created_at', false] });
    const recentConsultations = allConsultations.filter((c: any) => c.created_at >= since);

    const consultationsByDay: Record<string, number> = {};
    recentConsultations.forEach((c: any) => {
      const day = new Date(c.created_at).toISOString().split('T')[0];
      consultationsByDay[day] = (consultationsByDay[day] || 0) + 1;
    });

    const triageDistribution = { low: 0, medium: 0, high: 0, critical: 0 };
    recentConsultations.forEach((c: any) => {
      if (c.triage_level in triageDistribution) {
        triageDistribution[c.triage_level as keyof typeof triageDistribution]++;
      }
    });

    const statusCounts = { pending: 0, resolved: 0, escalated: 0 };
    allConsultations.forEach((c: any) => {
      if (c.status in statusCounts) {
        statusCounts[c.status as keyof typeof statusCounts]++;
      }
    });

    const resolved = allConsultations.filter((c: any) => c.status === 'resolved' && c.responded_at);
    const avgResponseTime = resolved.length > 0
      ? resolved.reduce((sum: number, c: any) => {
          const created = new Date(c.created_at).getTime();
          const responded = new Date(c.responded_at).getTime();
          return sum + (responded - created);
        }, 0) / resolved.length / (1000 * 60 * 60)
      : 0;

    const patientIds = [...new Set(allConsultations.map((c: any) => c.patient_id))];
    const chwAssignments = (await Promise.all(
      patientIds.map((pid: string) => select('chw_patient_assignments', { eq: ['patient_id', pid] }))
    )).flat();

    res.json({
      total_consultations: allConsultations.length,
      recent_count: recentConsultations.length,
      consultations_by_day: consultationsByDay,
      triage_distribution: triageDistribution,
      status_counts: statusCounts,
      avg_response_time_hours: Math.round(avgResponseTime * 10) / 10,
      total_patients: patientIds.length,
      active_chw_assignments: chwAssignments.filter((a: any) => a.is_active !== false).length,
    });
  } catch (error) {
    next(error);
  }
});

// Get all CHWs for doctor assignment
doctorsRouter.get('/chws', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allUsers = await select('users');
    const chws = allUsers.filter((u: any) => u.role === 'chw' && u.is_active !== false);

    const enriched = await Promise.all(chws.map(async (chw: any) => {
      const assignments = await select('chw_patient_assignments', { eq: ['chw_id', chw.id] });
      const activePatients = assignments.filter((a: any) => a.is_active !== false).length;
      const tasks = await select('chw_tasks', { eq: ['chw_id', chw.id] });
      const pendingTasks = tasks.filter((t: any) => t.status === 'pending').length;

      return {
        id: chw.id,
        name: chw.name,
        phone: chw.phone,
        email: chw.email,
        region: chw.region,
        village: chw.village,
        language: chw.language,
        active_patients: activePatients,
        pending_tasks: pendingTasks,
        total_tasks: tasks.length,
      };
    }));

    res.json(enriched);
  } catch (error) {
    next(error);
  }
});

// Assign patient to a CHW
const assignChwSchema = z.object({
  patient_id: z.string().uuid(),
  chw_id: z.string().uuid(),
});

doctorsRouter.post('/assign-chw', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patient_id, chw_id } = assignChwSchema.parse(req.body);

    const existing = await select('chw_patient_assignments', { eq: ['chw_id', chw_id] });
    const alreadyAssigned = existing.find((a: any) => a.patient_id === patient_id && a.is_active !== false);
    if (alreadyAssigned) {
      throw new AppError('Patient is already assigned to this CHW', 409);
    }

    const assignment = await insertOne('chw_patient_assignments', {
      chw_id,
      patient_id,
      is_active: true,
    });

    await insertOne('analytics_events', {
      event_type: 'patient_assigned_to_chw',
      entity_type: 'chw_patient_assignments',
      entity_id: assignment.id,
      metadata: { doctor_id: req.user!.userId, chw_id, patient_id },
    });

    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
});

// Get all clinics/hospitals
doctorsRouter.get('/clinics', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const clinics = await select('clinics');
    res.json(clinics);
  } catch (error) {
    next(error);
  }
});
