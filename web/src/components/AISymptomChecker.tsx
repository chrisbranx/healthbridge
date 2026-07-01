import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { HiOutlineSparkles, HiOutlineShieldCheck, HiOutlineClipboardList } from 'react-icons/hi';

interface TriageResult {
  triage_level: string;
  primary_condition: string;
  suggested_specialty: string;
  confidence: number;
  matched_conditions: { condition: string; score: number; specialty: string }[];
  recommendations: string[];
}

const levelColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-700',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700',
};

export default function AISymptomChecker({ onTriageComplete }: { onTriageComplete?: (level: string) => void }) {
  const { language } = useLanguage();
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/ai/triage', { symptoms, age: age ? parseInt(age) : undefined, duration });
      setResult(data);
      onTriageComplete?.(data.triage_level);
    } catch (err) {
      console.error('Triage failed:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="label dark:text-secondary-200">{language === 'fr' ? 'Décrivez vos symptômes' : 'Describe your symptoms'}</label>
          <textarea
            className="input min-h-[100px] dark:bg-secondary-700 dark:text-white dark:border-secondary-600"
            placeholder={language === 'fr' ? 'Ex: J\'ai de la fièvre, des maux de tête et des courbatures...' : 'E.g., I have fever, headache, and body aches...'}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label dark:text-secondary-200">{language === 'fr' ? 'Âge (optionnel)' : 'Age (optional)'}</label>
            <input type="number" className="input dark:bg-secondary-700 dark:text-white dark:border-secondary-600" placeholder="30" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div>
            <label className="label dark:text-secondary-200">{language === 'fr' ? 'Durée (optionnel)' : 'Duration (optional)'}</label>
            <input type="text" className="input dark:bg-secondary-700 dark:text-white dark:border-secondary-600" placeholder={language === 'fr' ? '3 jours' : '3 days'} value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
        </div>
        <button type="submit" disabled={loading || !symptoms.trim()} className="btn-primary w-full justify-center">
          {loading ? (
            <span className="flex items-center"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> {language === 'fr' ? 'Analyse...' : 'Analyzing...'}</span>
          ) : (
            <span className="flex items-center"><HiOutlineSparkles className="h-5 w-5 mr-2" /> {language === 'fr' ? 'Analyser les symptômes' : 'Analyze Symptoms'}</span>
          )}
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className={`p-4 rounded-xl border-2 ${levelColors[result.triage_level] || 'bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg capitalize">{result.triage_level} {language === 'fr' ? 'Priorité' : 'Priority'}</span>
                <span className="text-sm font-medium">{result.confidence}% {language === 'fr' ? 'confiance' : 'confidence'}</span>
              </div>
              <p className="font-medium">{result.primary_condition}</p>
              <p className="text-sm opacity-80 mt-1"><HiOutlineShieldCheck className="inline h-4 w-4 mr-1" />{result.suggested_specialty}</p>
            </div>

            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <h4 className="font-semibold mb-2 flex items-center dark:text-white"><HiOutlineClipboardList className="h-5 w-5 mr-2" />{language === 'fr' ? 'Recommandations' : 'Recommendations'}</h4>
              <ul className="space-y-1">
                {result.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-sm text-secondary-700 dark:text-secondary-300 flex items-start">
                    <span className="text-primary-500 mr-2">•</span>{rec}
                  </li>
                ))}
              </ul>
            </div>

            {result.matched_conditions.length > 1 && (
              <div className="p-3 bg-secondary-50 dark:bg-secondary-800 rounded-xl">
                <h4 className="text-sm font-medium mb-2 dark:text-white">{language === 'fr' ? 'Conditions similaires détectées' : 'Similar conditions detected'}</h4>
                <div className="space-y-1">
                  {result.matched_conditions.filter((_, i) => i > 0).map((mc, i) => (
                    <div key={i} className="flex justify-between text-sm text-secondary-600 dark:text-secondary-400">
                      <span>{mc.condition}</span>
                      <span className="text-primary-500">{mc.specialty}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
