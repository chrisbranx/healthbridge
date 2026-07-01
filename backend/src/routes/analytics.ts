import { Router, Request, Response, NextFunction } from 'express';
import { select } from '../lib/db';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const analyticsRouter = Router();

analyticsRouter.use(authenticate);
analyticsRouter.use(authorize('admin'));

analyticsRouter.get('/overview', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [users, patients, consultations, allConsultations] = await Promise.all([
      select('users'),
      select('patients'),
      select('consultations'),
      select('consultations'),
    ]);

    const recentConsultations = allConsultations.filter(
      (c: any) => c.created_at >= thirtyDaysAgo
    );

    const channelCounts: Record<string, number> = {};
    recentConsultations.forEach((c: any) => {
      channelCounts[c.channel] = (channelCounts[c.channel] || 0) + 1;
    });

    const regionCounts: Record<string, number> = {};
    patients.forEach((p: any) => {
      if (p.region) regionCounts[p.region] = (regionCounts[p.region] || 0) + 1;
    });

    const consultationsByDay: Record<string, number> = {};
    recentConsultations.forEach((c: any) => {
      const day = new Date(c.created_at).toISOString().split('T')[0];
      consultationsByDay[day] = (consultationsByDay[day] || 0) + 1;
    });

    res.json({
      total_users: users.length,
      total_patients: patients.length,
      total_consultations: consultations.length,
      consultations_30d: recentConsultations.length,
      consultations_by_channel: channelCounts,
      consultations_by_region: regionCounts,
      consultations_by_day: consultationsByDay,
      triage_distribution: {
        low: recentConsultations.filter((c: any) => c.triage_level === 'low').length,
        medium: recentConsultations.filter((c: any) => c.triage_level === 'medium').length,
        high: recentConsultations.filter((c: any) => c.triage_level === 'high').length,
        critical: recentConsultations.filter((c: any) => c.triage_level === 'critical').length,
      },
    });
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/adherence', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const adherence = await select('medication_adherence', { order: ['taken_at', false] });

    const total = adherence.length;
    const taken = adherence.filter((a: any) => a.was_taken).length;

    res.json({
      total_logs: total,
      medication_taken: taken,
      medication_missed: total - taken,
      adherence_rate: total > 0 ? Math.round((taken / total) * 100) : 0,
    });
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/chw-performance', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await select('users');
    const chws = users.filter((u: any) => u.role === 'chw');

    const performance = await Promise.all(chws.map(async (chw: any) => {
      const tasks = await select('chw_tasks', { eq: ['chw_id', chw.id] });
      const assignments = await select('chw_patient_assignments', { eq: ['chw_id', chw.id] });
      const adherence = await select('medication_adherence', { eq: ['logged_by', chw.id] });

      const totalAdherence = adherence.length;
      const positiveAdherence = adherence.filter((a: any) => a.was_taken).length;

      return {
        id: chw.id,
        name: chw.name,
        region: chw.region,
        patient_count: assignments.length,
        task_count: tasks.length,
        adherence_rate: totalAdherence > 0 ? Math.round((positiveAdherence / totalAdherence) * 100) : 0,
      };
    }));

    res.json(performance);
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const events = await select('analytics_events', { order: ['created_at', false] });
    const filtered = events.filter((e: any) => e.created_at >= since);

    const eventCounts: Record<string, number> = {};
    filtered.forEach((e: any) => {
      eventCounts[e.event_type] = (eventCounts[e.event_type] || 0) + 1;
    });

    res.json({ events: eventCounts, total: filtered.length });
  } catch (error) {
    next(error);
  }
});
