import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase';
import { devDb } from '../lib/devDb';
import { AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';

export const authRouter = Router();

const registerSchema = z.object({
  phone: z.string().min(9).max(15),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(100),
  role: z.enum(['patient', 'doctor', 'chw']).default('patient'),
  email: z.string().email().optional(),
  language: z.enum(['en', 'fr']).default('en'),
  region: z.string().optional(),
});

const loginSchema = z.object({
  phone: z.string().min(9).max(15),
  password: z.string(),
});

function getDb() {
  const isSupabaseConfigured = process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'https://your-project.supabase.co';
  return isSupabaseConfigured ? supabase : null;
}

async function findUserByPhone(phone: string) {
  const db = getDb();
  if (db) {
    const { data } = await db.from('users').select('*').eq('phone', phone).single();
    return data;
  }
  return devDb.findWhere('users', (u: any) => u.phone === phone)[0] || null;
}

async function createUser(data: any) {
  const db = getDb();
  if (db) {
    const { data: user, error } = await db.from('users').insert(data).select('id, name, phone, role, language, created_at').single();
    if (error) throw new AppError(error.message, 400);
    return user;
  }
  return devDb.insert('users', data);
}

async function createPatient(data: any) {
  const db = getDb();
  if (db) {
    const { error } = await db.from('patients').insert(data);
    if (error) console.error('Failed to create patient:', error);
    return;
  }
  devDb.insert('patients', data);
}

async function logEvent(event: any) {
  const db = getDb();
  if (db) {
    await db.from('analytics_events').insert(event);
    return;
  }
  devDb.insert('analytics_events', event);
}

authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await findUserByPhone(data.phone);
    if (existing) {
      throw new AppError('Phone number already registered', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await createUser({
      phone: data.phone,
      password_hash: passwordHash,
      name: data.name,
      role: data.role,
      email: data.email || null,
      language: data.language,
      region: data.region || null,
      phone_verified: true,
      is_active: true,
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role, phone: user.phone },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: 604800 }
    );

    if (data.role === 'patient') {
      await createPatient({
        user_id: user.id,
        name: data.name,
        phone: data.phone,
        region: data.region || null,
      });
    }

    await logEvent({
      event_type: 'user_registered',
      entity_type: 'user',
      entity_id: user.id,
      metadata: { role: data.role },
    });

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await findUserByPhone(data.phone);
    if (!user) {
      throw new AppError('Invalid phone or password', 401);
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid phone or password', 401);
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, phone: user.phone },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: 604800 }
    );

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    next(error);
  }
});

// OAuth routes (return info about configuring OAuth)
authRouter.get('/google', (_req: Request, res: Response) => {
  res.json({
    message: 'Google OAuth is being configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.',
    configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    redirect_url: `/api/auth/google/callback`,
  });
});

authRouter.get('/facebook', (_req: Request, res: Response) => {
  res.json({
    message: 'Facebook OAuth is being configured. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in your .env file.',
    configured: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
    redirect_url: `/api/auth/facebook/callback`,
  });
});

authRouter.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getDb();
    let user;

    if (db) {
      const { data } = await db.from('users')
        .select('id, name, phone, email, role, language, region, village, is_active, created_at, updated_at')
        .eq('id', req.user!.userId)
        .single();
      user = data;
    } else {
      user = devDb.findById('users', req.user!.userId);
    }

    if (!user) throw new AppError('User not found', 404);

    if (user.role === 'patient') {
      let patient;
      if (db) {
        const { data } = await db.from('patients').select('*').eq('user_id', user.id).single();
        patient = data;
      } else {
        patient = devDb.findWhere('patients', (p: any) => p.user_id === user.id)[0] || null;
      }
      return res.json({ ...user, patient_profile: patient });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});
