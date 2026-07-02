import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { insertOne, select } from '../lib/db';
import { getTriageLevel } from './aiTriage';

export const voiceTriageRouter = Router();
voiceTriageRouter.use(authenticate);

const symptomsDB = [
  { keywords: ['fever', 'high temperature', 'hot', 'chills', 'sweating'], triage: { level: 'medium', label: 'Fever - possible infection' }, suggested_specialty: 'General Medicine' },
  { keywords: ['chest pain', 'chest tightness', 'heart pain', 'palpitations'], triage: { level: 'critical', label: 'Chest pain - possible cardiac event' }, suggested_specialty: 'Cardiology' },
  { keywords: ['headache', 'migraine', 'head pain', 'dizziness'], triage: { level: 'low', label: 'Headache - possible tension or migraine' }, suggested_specialty: 'Neurology' },
  { keywords: ['difficulty breathing', 'shortness of breath', 'wheezing', "can't breathe"], triage: { level: 'critical', label: 'Respiratory distress - urgent care needed' }, suggested_specialty: 'Pulmonology' },
  { keywords: ['bleeding', 'hemorrhage', 'blood', 'wound', 'cut'], triage: { level: 'high', label: 'Active bleeding - requires immediate attention' }, suggested_specialty: 'Emergency Medicine' },
  { keywords: ['broken', 'fracture', 'sprain', 'swelling', 'pain', 'injury'], triage: { level: 'medium', label: 'Possible fracture or sprain' }, suggested_specialty: 'Orthopedics' },
  { keywords: ['abdominal pain', 'stomach ache', 'nausea', 'vomiting', 'diarrhea'], triage: { level: 'medium', label: 'Gastrointestinal issue' }, suggested_specialty: 'Gastroenterology' },
  { keywords: ['unconscious', 'faint', 'passed out', 'seizure', 'convulsion'], triage: { level: 'critical', label: 'Loss of consciousness - emergency' }, suggested_specialty: 'Emergency Medicine' },
  { keywords: ['burn', 'scald', 'fire', 'chemical'], triage: { level: 'high', label: 'Burn injury - requires assessment' }, suggested_specialty: 'Emergency Medicine' },
  { keywords: ['cough', 'cold', 'flu', 'sore throat', 'runny nose'], triage: { level: 'low', label: 'Common cold or flu symptoms' }, suggested_specialty: 'General Medicine' },
];

const transcribeSchema = z.object({
  audio_text: z.string().min(1).max(5000),
});

voiceTriageRouter.post('/transcribe', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = transcribeSchema.parse(req.body);
    const text = data.audio_text.toLowerCase();

    let matchedConditions: { condition: typeof symptomsDB[0]; score: number }[] = [];
    for (const condition of symptomsDB) {
      let score = 0;
      for (const keyword of condition.keywords) {
        if (text.includes(keyword.toLowerCase())) score++;
      }
      if (score > 0) matchedConditions.push({ condition, score });
    }
    matchedConditions.sort((a, b) => b.score - a.score);

    const topMatch = matchedConditions[0] || null;
    const triageLevel = topMatch ? topMatch.condition.triage.level : getTriageLevel(text);

    const session = await insertOne('voice_triage_sessions', {
      user_id: req.user!.userId,
      audio_text: data.audio_text,
      triage_level: triageLevel,
      matched_condition: topMatch?.condition.triage.label || 'Unrecognized symptoms',
      suggested_specialty: topMatch?.condition.suggested_specialty || 'General Medicine',
    });

    const urgencyScore = { critical: 4, high: 3, medium: 2, low: 1 } as const;
    const score = urgencyScore[triageLevel as keyof typeof urgencyScore] || 1;

    res.json({
      session_id: session.id,
      transcript: data.audio_text,
      triage_level: triageLevel,
      urgency_score: score,
      primary_condition: topMatch?.condition.triage.label || 'General check-up recommended',
      suggested_specialty: topMatch?.condition.suggested_specialty || 'General Medicine',
      matched_keywords: topMatch?.condition.keywords.filter(k => text.includes(k.toLowerCase())) || [],
      recommendations: score >= 3
        ? ['Seek immediate medical attention', 'Call emergency services if symptoms worsen']
        : score === 2
          ? ['Schedule a consultation within 24-48 hours', 'Monitor symptoms']
          : ['Schedule a routine consultation', 'Rest and stay hydrated'],
    });
  } catch (error) { next(error); }
});

voiceTriageRouter.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await select('voice_triage_sessions', { eq: ['user_id', req.user!.userId], order: ['created_at', false] });
    res.json(sessions);
  } catch (error) { next(error); }
});
