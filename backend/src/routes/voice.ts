import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';

export const voiceRouter = Router();
voiceRouter.use(authenticate);

const translations: Record<string, Record<string, string>> = {
  en: {
    'welcome': 'Welcome to HealthBridge',
    'consult': 'Consult a doctor',
    'emergency': 'Emergency',
    'medication': 'Medication reminders',
    'chw': 'Contact a CHW',
    'appointment': 'Book appointment',
  },
  fr: {
    'welcome': 'Bienvenue sur HealthBridge',
    'consult': 'Consulter un médecin',
    'emergency': 'Urgence',
    'medication': 'Rappels de médicaments',
    'chw': 'Contacter un ASC',
    'appointment': 'Prendre rendez-vous',
  },
  ewo: {
    'welcome': 'Mvòlè nà HealthBridge',
    'consult': 'Kàl à ngi médecin',
    'emergency': 'Mvú tó',
    'medication': 'Mekúmà m\'ati',
    'chw': 'Kàl n\'à CHW',
    'appointment': 'Bì rendé-vous',
  },
  dua: {
    'welcome': 'Bònjò nà HealthBridge',
    'consult': 'Bia ndótèr a doktà',
    'emergency': 'Mulema',
    'medication': 'Mekèlè n\'édim',
    'chw': 'Pondè n\'à CHW',
    'appointment': 'Bia rendez-vous',
  },
  ful: {
    'welcome': 'Bismillah e HealthBridge',
    'consult': 'Jokkude dokto',
    'emergency': 'Doggol',
    'medication': 'Ceftorɗe',
    'chw': 'Jokkude CHW',
    'appointment': 'Jokkudi saa\'a',
  },
};

const ttsVoices: Record<string, string> = {
  en: 'en-US-JennyNeural',
  fr: 'fr-FR-DeniseNeural',
  ewo: 'fr-FR-DeniseNeural',
  dua: 'fr-FR-DeniseNeural',
  ful: 'fr-FR-DeniseNeural',
};

voiceRouter.get('/languages', (_req: Request, res: Response) => {
  res.json([
    { code: 'en', name: 'English', native: 'English', tts: true },
    { code: 'fr', name: 'French', native: 'Français', tts: true },
    { code: 'ewo', name: 'Ewondo', native: 'Kóló', tts: false },
    { code: 'dua', name: 'Duala', native: 'Bwambo ba Duálá', tts: false },
    { code: 'ful', name: 'Fulfulde', native: 'Fulfulde/Fufulde', tts: false },
  ]);
});

voiceRouter.get('/translate/:lang/:key', (req: Request, res: Response) => {
  const { lang, key } = req.params;
  const value = translations[lang]?.[key];
  if (!value) return res.status(404).json({ error: 'Translation not found' });
  res.json({ key, translation: value, lang, tts_voice: ttsVoices[lang] || 'en-US-JennyNeural' });
});

voiceRouter.post('/translate', (req: Request, res: Response) => {
  const { text, target_lang } = req.body;
  if (!text || !target_lang) return res.status(400).json({ error: 'Missing text or target_lang' });
  let translated = text;
  for (const [key, trans] of Object.entries(translations[target_lang] || {})) {
    translated = translated.replace(new RegExp(key, 'gi'), trans);
  }
  res.json({ original: text, translation: translated, target_lang, tts_voice: ttsVoices[target_lang] || 'en-US-JennyNeural' });
});

voiceRouter.get('/ussd-menu/:lang', (req: Request, res: Response) => {
  const { lang } = req.params;
  const t = translations[lang] || translations.en;
  res.json({
    menu: [
      { id: '1', text: t.consult },
      { id: '2', text: t.medication },
      { id: '3', text: t.chw },
      { id: '4', text: t.appointment },
      { id: '911', text: t.emergency },
    ],
    welcome: t.welcome,
  });
});
