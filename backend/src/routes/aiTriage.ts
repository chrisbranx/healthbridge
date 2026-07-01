import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';

export const aiRouter = Router();
aiRouter.use(authenticate);

interface SymptomKeyword {
  keywords: string[];
  triage: { level: 'low' | 'medium' | 'high' | 'critical'; label: string };
  suggested_specialty: string;
}

const symptomDB: SymptomKeyword[] = [
  { keywords: ['fever', 'high temperature', 'hot', 'chills', 'sweating'], triage: { level: 'medium', label: 'Fever - possible infection' }, suggested_specialty: 'General Medicine' },
  { keywords: ['chest pain', 'chest tightness', 'heart pain', 'palpitations'], triage: { level: 'critical', label: 'Chest pain - possible cardiac event' }, suggested_specialty: 'Cardiology' },
  { keywords: ['headache', 'migraine', 'head pain', 'dizziness'], triage: { level: 'low', label: 'Headache - possible tension or migraine' }, suggested_specialty: 'Neurology' },
  { keywords: ['difficulty breathing', 'shortness of breath', 'wheezing', 'can\'t breathe'], triage: { level: 'critical', label: 'Respiratory distress - urgent care needed' }, suggested_specialty: 'Pulmonology' },
  { keywords: ['bleeding', 'hemorrhage', 'blood', 'wound', 'cut'], triage: { level: 'high', label: 'Active bleeding - requires immediate attention' }, suggested_specialty: 'Emergency Medicine' },
  { keywords: ['broken', 'fracture', 'sprain', 'swelling', 'pain', 'injury'], triage: { level: 'medium', label: 'Possible fracture or sprain' }, suggested_specialty: 'Orthopedics' },
  { keywords: ['abdominal pain', 'stomach ache', 'nausea', 'vomiting', 'diarrhea'], triage: { level: 'medium', label: 'Gastrointestinal issue' }, suggested_specialty: 'Gastroenterology' },
  { keywords: ['rash', 'skin', 'itch', 'burning', 'hives'], triage: { level: 'low', label: 'Skin condition - likely non-urgent' }, suggested_specialty: 'Dermatology' },
  { keywords: ['pregnancy', 'pregnant', 'contraction', 'labor', 'baby'], triage: { level: 'high', label: 'Pregnancy-related - requires evaluation' }, suggested_specialty: 'Obstetrics' },
  { keywords: ['malaria', 'mosquito', 'fever', 'headache', 'body ache'], triage: { level: 'high', label: 'Possible malaria - test required' }, suggested_specialty: 'Infectious Disease' },
  { keywords: ['cough', 'cold', 'flu', 'sore throat', 'runny nose'], triage: { level: 'low', label: 'Common cold or flu symptoms' }, suggested_specialty: 'General Medicine' },
  { keywords: ['unconscious', 'faint', 'passed out', 'seizure', 'convulsion'], triage: { level: 'critical', label: 'Loss of consciousness - emergency' }, suggested_specialty: 'Emergency Medicine' },
  { keywords: ['mental health', 'depressed', 'anxiety', 'suicidal', 'panic'], triage: { level: 'high', label: 'Mental health crisis' }, suggested_specialty: 'Mental Health' },
  { keywords: ['burn', 'scald', 'fire', 'chemical'], triage: { level: 'high', label: 'Burn injury - requires assessment' }, suggested_specialty: 'Emergency Medicine' },
  { keywords: ['eye pain', 'vision', 'blurred', 'red eye', 'injury eye'], triage: { level: 'medium', label: 'Eye condition - needs evaluation' }, suggested_specialty: 'Ophthalmology' },
  { keywords: ['urinary', 'urine', 'kidney', 'back pain', 'uti'], triage: { level: 'medium', label: 'Possible urinary tract issue' }, suggested_specialty: 'Urology' },
  { keywords: ['ear pain', 'hearing', 'ear infection', 'earache'], triage: { level: 'low', label: 'Ear condition - non-urgent' }, suggested_specialty: 'ENT' },
  { keywords: ['diabetes', 'sugar', 'blood sugar', 'insulin'], triage: { level: 'medium', label: 'Diabetes-related - needs monitoring' }, suggested_specialty: 'Endocrinology' },
  { keywords: ['hypertension', 'high blood pressure', 'bp'], triage: { level: 'medium', label: 'Hypertension - needs assessment' }, suggested_specialty: 'Cardiology' },
];

const triageSchema = z.object({
  symptoms: z.string().min(1).max(5000),
  age: z.number().optional(),
  gender: z.string().optional(),
  duration: z.string().optional(),
});

aiRouter.post('/triage', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = triageSchema.parse(req.body);
    const symptoms = data.symptoms.toLowerCase();

    let matchedConditions: { condition: SymptomKeyword; score: number }[] = [];

    for (const condition of symptomDB) {
      let score = 0;
      for (const keyword of condition.keywords) {
        if (symptoms.includes(keyword.toLowerCase())) score++;
      }
      if (score > 0) matchedConditions.push({ condition, score });
    }

    matchedConditions.sort((a, b) => b.score - a.score);
    const topMatch = matchedConditions[0];
    const allMatches = matchedConditions.slice(0, 5);

    if (topMatch && topMatch.score > 0) {
      const urgencyScore = { critical: 4, high: 3, medium: 2, low: 1 };
      const maxUrgency = Math.max(...allMatches.map(m => urgencyScore[m.condition.triage.level]));
      const finalLevel = Object.entries(urgencyScore).find(([, v]) => v === maxUrgency)![0] as 'low' | 'medium' | 'high' | 'critical';

      res.json({
        triage_level: finalLevel,
        primary_condition: topMatch.condition.triage.label,
        suggested_specialty: topMatch.condition.suggested_specialty,
        confidence: Math.round((topMatch.score / topMatch.condition.keywords.length) * 100),
        matched_conditions: allMatches.map(m => ({
          condition: m.condition.triage.label,
          score: m.score,
          specialty: m.condition.suggested_specialty,
        })),
        recommendations: getRecommendations(finalLevel, data),
      });
    } else {
      res.json({
        triage_level: 'low',
        primary_condition: 'Unrecognized symptoms - general evaluation recommended',
        suggested_specialty: 'General Medicine',
        confidence: 10,
        matched_conditions: [],
        recommendations: ['Schedule a general consultation with a physician'],
      });
    }
  } catch (error) { next(error); }
});

function getRecommendations(level: string, data: z.infer<typeof triageSchema>): string[] {
  const recs: string[] = [];
  if (level === 'critical') {
    recs.push('IMMEDIATE ACTION REQUIRED: Call emergency services or go to the nearest hospital');
    recs.push('Do not wait for a consultation response - seek urgent care');
  } else if (level === 'high') {
    recs.push('Schedule a consultation within the next 24 hours');
    recs.push('Monitor symptoms closely and seek emergency care if they worsen');
  } else if (level === 'medium') {
    recs.push('Schedule a consultation within 48-72 hours');
    recs.push('Rest and monitor your symptoms');
  } else {
    recs.push('Schedule a routine consultation when convenient');
    recs.push('Over-the-counter remedies may help manage symptoms');
  }
  if (data.duration && parseInt(data.duration) > 7) recs.push('Chronic symptoms - please provide detailed history during consultation');
  return recs;
}

export const getTriageLevel = (symptoms: string): 'low' | 'medium' | 'high' | 'critical' => {
  const s = symptoms.toLowerCase();
  for (const condition of symptomDB) {
    for (const keyword of condition.keywords) {
      if (s.includes(keyword.toLowerCase())) return condition.triage.level;
    }
  }
  return 'low';
};
