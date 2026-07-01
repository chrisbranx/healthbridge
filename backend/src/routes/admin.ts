import { Router, Request, Response, NextFunction } from 'express';
import { select, selectOne, insertOne } from '../lib/db';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(authorize('admin'));

adminRouter.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let users = await select('users', { order: ['created_at', false] });

    if (req.query.role) {
      users = users.filter((u: any) => u.role === req.query.role);
    }
    if (req.query.region) {
      users = users.filter((u: any) => u.region === req.query.region);
    }

    const sanitized = users.map((u: any) => {
      const { password_hash, ...rest } = u;
      return rest;
    });

    res.json(sanitized);
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/clinics', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const clinics = await select('clinics', { order: ['name', true] });
    res.json(clinics);
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/clinics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, region, district, phone, email, address } = req.body;
    const clinic = await insertOne('clinics', { name, region, district, phone, email, address, is_active: true });
    res.status(201).json(clinic);
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await select('users');
    const patients = await select('patients');
    const consultations = await select('consultations');
    const chws = users.filter((u: any) => u.role === 'chw');
    const clinics = await select('clinics');
    const tasks = await select('chw_tasks');
    const escalations = await select('escalation_alerts');

    res.json({
      total_users: users.length,
      total_patients: patients.length,
      total_consultations: consultations.length,
      total_chws: chws.length,
      total_clinics: clinics.length,
      pending_tasks: tasks.filter((t: any) => t.status === 'pending').length,
      pending_escalations: escalations.filter((e: any) => e.status === 'pending').length,
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/regions', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const patients = await select('patients');
    const regionCounts: Record<string, number> = {};
    patients.forEach((p: any) => {
      if (p.region) {
        regionCounts[p.region] = (regionCounts[p.region] || 0) + 1;
      }
    });
    res.json(regionCounts);
  } catch (error) {
    next(error);
  }
});
