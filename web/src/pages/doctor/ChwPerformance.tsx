import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import { HiOutlineStar, HiOutlineUserGroup, HiOutlineFilter } from 'react-icons/hi';

interface ChwScore {
  rank: number;
  chw_id: string;
  name: string;
  phone: string;
  region: string;
  active_patients: number;
  completion_rate: number;
  adherence_rate: number;
  punctuality_score: number;
  overall_score: number;
  level: string;
  badge: string;
}

interface Summary {
  total_chws: number;
  average_score: number;
  gold_count: number;
  silver_count: number;
  bronze_count: number;
}

export default function ChwPerformance() {
  const { language } = useLanguage();
  const [leaderboard, setLeaderboard] = useState<ChwScore[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [region, setRegion] = useState('');

  useEffect(() => { loadData(); }, [region]);

  async function loadData() {
    try {
      const { data } = await api.get('/chw-performance/leaderboard', { params: { region: region || undefined, days: 30 } });
      setLeaderboard(data.leaderboard || []);
      setSummary(data.summary || null);
    } catch (err) { console.error(err); }
  }

  const levelColor: Record<string, string> = {
    Gold: 'text-yellow-500',
    Silver: 'text-gray-400',
    Bronze: 'text-orange-600',
    'Needs Improvement': 'text-secondary-400',
  };

  const levelBg: Record<string, string> = {
    Gold: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-300 dark:border-yellow-700',
    Silver: 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600',
    Bronze: 'bg-orange-50 dark:bg-orange-900/10 border-orange-300 dark:border-orange-700',
    'Needs Improvement': 'bg-secondary-50 dark:bg-secondary-800 border-secondary-300 dark:border-secondary-600',
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
          {language === 'fr' ? 'Performance des ASC' : 'CHW Performance'}
        </h1>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          {language === 'fr' ? 'Classement et scores des agents de santé communautaire' : 'Leaderboard and scoring for community health workers'}
        </p>
      </motion.div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: language === 'fr' ? 'Score moyen' : 'Avg Score', value: `${summary.average_score}%`, color: 'text-primary-600', icon: HiOutlineStar },
            { label: language === 'fr' ? 'Or' : 'Gold', value: summary.gold_count, color: 'text-yellow-500', icon: HiOutlineStar },
            { label: language === 'fr' ? 'Argent' : 'Silver', value: summary.silver_count, color: 'text-gray-400', icon: HiOutlineStar },
            { label: language === 'fr' ? 'Bronze' : 'Bronze', value: summary.bronze_count, color: 'text-orange-600', icon: HiOutlineStar },
          ].map((stat, i) => (
            <div key={i} className="card text-center dark:bg-secondary-800 dark:border-secondary-700">
              <stat.icon className={`h-6 w-6 mx-auto mb-1 ${stat.color}`} />
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-3">
        <HiOutlineFilter className="h-4 w-4 text-secondary-400" />
        <input
          className="input max-w-xs dark:bg-secondary-700 dark:text-white dark:border-secondary-600"
          placeholder={language === 'fr' ? 'Filtrer par région...' : 'Filter by region...'}
          value={region} onChange={(e) => setRegion(e.target.value)}
        />
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12 text-secondary-400">
          <HiOutlineUserGroup className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>{language === 'fr' ? 'Aucun score disponible' : 'No scores available'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((chw) => (
            <motion.div
              key={chw.chw_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-xl border-2 ${levelBg[chw.level] || 'bg-secondary-50'} flex items-center justify-between`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-secondary-300 dark:text-secondary-500 w-8 text-center">#{chw.rank}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{chw.badge}</span>
                    <h3 className="font-semibold dark:text-white">{chw.name}</h3>
                    <span className={`text-xs font-bold ${levelColor[chw.level] || ''}`}>{chw.level}</span>
                  </div>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">{chw.region} • {chw.phone} • {chw.active_patients} {language === 'fr' ? 'patients' : 'patients'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold ${levelColor[chw.level] || ''}`}>{chw.overall_score}%</p>
                <div className="flex items-center space-x-3 text-xs text-secondary-400 mt-1">
                  <span title={language === 'fr' ? 'Taux d\'achèvement' : 'Completion'} className={chw.completion_rate >= 80 ? 'text-green-500' : ''}>{chw.completion_rate}%</span>
                  <span title={language === 'fr' ? 'Observance' : 'Adherence'} className={chw.adherence_rate >= 80 ? 'text-green-500' : ''}>{chw.adherence_rate}%</span>
                  <span title={language === 'fr' ? 'Ponctualité' : 'Punctuality'} className={chw.punctuality_score >= 80 ? 'text-green-500' : ''}>{chw.punctuality_score}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
