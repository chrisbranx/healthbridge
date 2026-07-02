import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { insertOne, select } from '../lib/db';

export const epidemicRouter = Router();
epidemicRouter.use(authenticate);

const reportSchema = z.object({
  disease: z.string().min(1).max(200),
  region: z.string().min(1).max(200),
  district: z.string().min(1).max(200),
  cases_count: z.number().int().positive(),
  source: z.string().max(500).optional(),
});

epidemicRouter.get('/cases', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { region, disease, days = '30' } = req.query;
    const dayFilter = parseInt(days as string);

    let cases = await select('disease_cases', { order: ['created_at', false] });

    if (region) cases = cases.filter((c: any) => c.region?.toLowerCase().includes((region as string).toLowerCase()));
    if (disease) cases = cases.filter((c: any) => c.disease?.toLowerCase().includes((disease as string).toLowerCase()));
    if (dayFilter > 0) {
      const cutoff = new Date(Date.now() - dayFilter * 86400000).toISOString();
      cases = cases.filter((c: any) => c.created_at >= cutoff);
    }

    const total = cases.reduce((sum: number, c: any) => sum + (c.cases_count || 0), 0);
    res.json({ cases, total_cases: total, filter: { region: region || 'all', disease: disease || 'all', days: dayFilter } });
  } catch (error) { next(error); }
});

epidemicRouter.post('/report', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = reportSchema.parse(req.body);

    const report = await insertOne('disease_cases', {
      reported_by: req.user!.userId,
      disease: data.disease,
      region: data.region,
      district: data.district,
      cases_count: data.cases_count,
      source: data.source || '',
      report_date: new Date().toISOString(),
    });

    res.status(201).json(report);
  } catch (error) { next(error); }
});

epidemicRouter.get('/hotspots', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cases = await select('disease_cases', {});

    const grouped: Record<string, { region: string; disease: string; total_cases: number; districts: string[]; latest_report: string }> = {};

    for (const c of cases as any[]) {
      const key = `${c.region}|${c.disease}`;
      if (!grouped[key]) {
        grouped[key] = { region: c.region, disease: c.disease, total_cases: 0, districts: [], latest_report: c.created_at };
      }
      grouped[key].total_cases += c.cases_count || 0;
      if (c.district && !grouped[key].districts.includes(c.district)) {
        grouped[key].districts.push(c.district);
      }
      if (c.created_at > grouped[key].latest_report) grouped[key].latest_report = c.created_at;
    }

    const hotspots = Object.values(grouped).sort((a, b) => b.total_cases - a.total_cases);
    res.json({ hotspots, total_hotspots: hotspots.length });
  } catch (error) { next(error); }
});

epidemicRouter.get('/alerts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = await select('epidemic_alerts', { order: ['created_at', false] });
    res.json(alerts);
  } catch (error) { next(error); }
});
