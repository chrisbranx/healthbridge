import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { select, selectOne, insertOne, updateOne } from '../lib/db';
import { devDb } from '../lib/devDb';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

import { supabase } from '../lib/supabase';

function getDb() {
  return supabase;
}

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

adminRouter.get('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await selectOne('users', 'id', req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    const { password_hash, ...rest } = user;
    res.json(rest);
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/users/:id/role', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    if (!['patient', 'doctor', 'chw', 'admin'].includes(role)) {
      return next(new AppError('Invalid role', 400));
    }
    const user = await updateOne('users', req.params.id, { role });
    if (!user) return next(new AppError('User not found', 404));
    const { password_hash, ...rest } = user;
    res.json(rest);
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/users/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') {
      return next(new AppError('is_active must be a boolean', 400));
    }
    const user = await updateOne('users', req.params.id, { is_active });
    if (!user) return next(new AppError('User not found', 404));
    const { password_hash, ...rest } = user;
    res.json(rest);
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await updateOne('users', req.params.id, { is_active: false });
    if (!user) return next(new AppError('User not found', 404));
    res.json({ message: 'User deactivated' });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/activity', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await select('analytics_events', { order: ['created_at', false] });
    const filtered = (events as any[]).filter((e: any) =>
      ['user_login', 'user_registered', 'user_logout', 'password_reset'].includes(e.event_type)
    ).slice(0, 50);
    res.json(filtered);
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/system', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await select('analytics_events', { order: ['created_at', false] });
    const apiCalls = (events as any[]).filter((e: any) => e.event_type === 'api_call');
    const today = new Date().toISOString().split('T')[0];
    const todayLogins = (events as any[]).filter((e: any) => {
      if (e.event_type !== 'user_login') return false;
      const d = new Date(e.created_at).toISOString().split('T')[0];
      return d === today;
    });
    const uniqueActiveUsers = new Set(todayLogins.map((e: any) => e.entity_id)).size;
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;
    res.json({
      total_api_calls: apiCalls.length,
      active_users_today: uniqueActiveUsers,
      server_uptime: uptimeStr,
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

adminRouter.patch('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, email, region, language, role } = req.body;
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (region !== undefined) updates.region = region;
    if (language !== undefined) updates.language = language;
    if (role !== undefined) {
      if (!['patient', 'doctor', 'chw', 'admin'].includes(role)) {
        return next(new AppError('Invalid role', 400));
      }
      updates.role = role;
    }
    if (Object.keys(updates).length === 0) {
      return next(new AppError('No fields to update', 400));
    }
    const user = await updateOne('users', req.params.id, updates);
    if (!user) return next(new AppError('User not found', 404));
    const { password_hash, ...rest } = user;
    res.json(rest);
  } catch (error) {
    next(error);
  }
});

async function findRoleRequest(id: string) {
  const db = getDb();
  if (db) {
    const { data, error } = await db.from('role_requests').select('*').eq('id', id).single();
    if (!error && data) return data;
  }
  return devDb.findById('role_requests' as any, id);
}

async function updateRoleRequest(id: string, updates: any) {
  const db = getDb();
  if (db) {
    const { error } = await db.from('role_requests').update(updates).eq('id', id);
    if (!error) return;
  }
  devDb.update('role_requests' as any, id, updates);
}

async function listRoleRequests(status?: string) {
  const db = getDb();
  if (db) {
    let q = db.from('role_requests').select('*').order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (!error && data) return data;
  }
  let requests = devDb.get('role_requests' as any) as any[];
  requests = [...requests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  if (status) requests = requests.filter((r: any) => r.status === status);
  return requests;
}

adminRouter.get('/role-requests', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await listRoleRequests(req.query.status as string);
    res.json(requests);
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/role-requests/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await findRoleRequest(req.params.id);

    if (!request) return next(new AppError('Role request not found', 404));
    if (request.status !== 'pending') return next(new AppError('Request already processed', 400));

    const existing = await selectOne('users', 'phone', request.phone);
    if (existing) return next(new AppError('Phone number already registered', 409));

    const assignedRole = request.role === 'doctor' ? 'admin' : request.role;

    const user = await insertOne('users', {
      phone: request.phone,
      password_hash: request.password_hash,
      name: request.name,
      role: assignedRole,
      email: request.email || null,
      language: request.language || 'en',
      region: request.region || null,
      phone_verified: true,
      is_active: true,
    });

    if (assignedRole === 'patient') {
      await insertOne('patients', {
        user_id: user.id,
        name: request.name,
        phone: request.phone,
        region: request.region || null,
      });
    }

    const notes = req.body.admin_notes || null;
    await updateRoleRequest(req.params.id, {
      status: 'approved',
      admin_notes: notes,
      reviewed_by: req.user!.userId,
      reviewed_at: new Date().toISOString(),
    });

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ message: 'Request approved, user created', user: userWithoutPassword });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/role-requests/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await findRoleRequest(req.params.id);

    if (!request) return next(new AppError('Role request not found', 404));
    if (request.status !== 'pending') return next(new AppError('Request already processed', 400));

    const reason = req.body.reason || 'No reason provided';
    await updateRoleRequest(req.params.id, {
      status: 'rejected',
      admin_notes: reason,
      reviewed_by: req.user!.userId,
      reviewed_at: new Date().toISOString(),
    });

    res.json({ message: 'Request rejected', reason });
  } catch (error) {
    next(error);
  }
});
