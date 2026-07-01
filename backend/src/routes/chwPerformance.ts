import { Router, Request, Response, NextFunction } from 'express';
import { select } from '../lib/db';
import { authenticate } from '../middleware/auth';

export const chwPerformanceRouter = Router();
chwPerformanceRouter.use(authenticate);

chwPerformanceRouter.get('/leaderboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { region, days } = req.query;
    const chws = await select('chws', {});
    const tasks = await select('chw_tasks', {});
    const patients = await select('patients', {});
    const assignments = await select('chw_patient_assignments', {});
    const adherence = await select('chw_adherence_logs', {});

    const now = Date.now();
    const dayFilter = parseInt(days as string) || 30;
    const cutoff = new Date(now - dayFilter * 86400000).toISOString();

    const scored: any[] = chws.map((chw: any) => {
      const chwTasks = tasks.filter((t: any) => t.chw_id === chw.id);
      const chwAssignments = assignments.filter((a: any) => a.chw_id === chw.id);
      const chwAdherence = adherence.filter((a: any) => a.chw_id === chw.id && a.created_at >= cutoff);
      const chwPatients = patients.filter((p: any) => chwAssignments.some((a: any) => a.patient_id === p.id));

      const completed = chwTasks.filter((t: any) => t.status === 'completed').length;
      const total = chwTasks.length || 1;
      const completionRate = Math.round((completed / total) * 100);

      const recentVisits = chwAdherence.filter((a: any) => a.status === 'visited' || a.status === 'medication_taken').length;
      const totalVisits = chwAdherence.length || 1;
      const adherenceRate = Math.round((recentVisits / totalVisits) * 100);

      const onTimeTasks = chwTasks.filter((t: any) => t.due_date && new Date(t.due_date) >= new Date()).length;
      const punctuality = total > 0 ? Math.round((onTimeTasks / total) * 100) : 100;

      const score = Math.round(completionRate * 0.4 + adherenceRate * 0.35 + punctuality * 0.25);
      const level = score >= 90 ? 'Gold' : score >= 75 ? 'Silver' : score >= 60 ? 'Bronze' : 'Needs Improvement';

      return {
        chw_id: chw.id,
        name: chw.name,
        phone: chw.phone,
        region: chw.region,
        village: chw.village,
        active_patients: chwPatients.length,
        tasks_completed: completed,
        total_tasks: total,
        completion_rate: completionRate,
        adherence_rate: adherenceRate,
        punctuality_score: punctuality,
        overall_score: score,
        level,
        patients_served: chwPatients.length,
      };
    });

    const filtered = region ? scored.filter((s: any) => s.region?.toLowerCase().includes((region as string).toLowerCase())) : scored;
    filtered.sort((a, b) => b.overall_score - a.overall_score);

    res.json({
      leaderboard: filtered.map((s, i) => ({ ...s, rank: i + 1, badge: getBadge(s.level) })),
      summary: {
        total_chws: filtered.length,
        average_score: Math.round(filtered.reduce((a: number, b: any) => a + b.overall_score, 0) / (filtered.length || 1)),
        gold_count: filtered.filter((s: any) => s.level === 'Gold').length,
        silver_count: filtered.filter((s: any) => s.level === 'Silver').length,
        bronze_count: filtered.filter((s: any) => s.level === 'Bronze').length,
      },
    });
  } catch (error) { next(error); }
});

function getBadge(level: string): string {
  switch (level) {
    case 'Gold': return '🏆';
    case 'Silver': return '🥈';
    case 'Bronze': return '🥉';
    default: return '📈';
  }
}
