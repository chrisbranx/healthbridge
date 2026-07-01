import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { doctorsApi } from '../../services/api';
import { HiOutlineClipboardList, HiOutlineUserGroup, HiOutlineClock, HiOutlineExclamationCircle } from 'react-icons/hi';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const { data } = await doctorsApi.dashboard();
      setData(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-secondary-400 dark:text-secondary-300">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>;
  if (!data) return <div className="text-center py-12 text-secondary-400 dark:text-secondary-300">{language === 'fr' ? 'Échec du chargement du tableau de bord' : 'Failed to load dashboard'}</div>;

  const stats = [
    { label: language === 'fr' ? 'Consultations en attente' : 'Pending Consultations', value: data.pending_count, icon: HiOutlineClock, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
    { label: language === 'fr' ? 'Total des patients' : 'Total Patients', value: data.total_patients, icon: HiOutlineUserGroup, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">{language === 'fr' ? 'Tableau de bord médecin' : 'Doctor Dashboard'}</h1>
        <p className="text-sm lg:text-base text-secondary-500 dark:text-secondary-400">{language === 'fr' ? 'Gérer les consultations et les soins aux patients' : 'Manage consultations and patient care'}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card flex items-center space-x-4 dark:bg-secondary-800 dark:border-secondary-700">
              <div className={`h-12 w-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card dark:bg-secondary-800 dark:border-secondary-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold dark:text-white">{language === 'fr' ? 'Consultations en attente' : 'Pending Consultations'}</h2>
          <button onClick={() => navigate('/doctor/consultations')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            {language === 'fr' ? 'Voir tout' : 'View All'}
          </button>
        </div>

        {data.pending_consultations?.length === 0 ? (
          <div className="text-center py-8 text-secondary-400 dark:text-secondary-500">
            <HiOutlineClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{language === 'fr' ? 'Aucune consultation en attente' : 'No pending consultations'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.pending_consultations?.map((c: any) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-secondary-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-secondary-700"
                onClick={() => navigate('/doctor/consultations')}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-secondary-900 dark:text-white truncate">
                    {c.symptoms?.slice(0, 60)}...
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                    <span>{c.patient?.name}</span>
                    <span>{c.patient?.village}</span>
                    <span className="capitalize">{c.channel}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`badge ${
                    c.triage_level === 'critical' ? 'badge-escalated' :
                    c.triage_level === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                    'badge-pending'
                  }`}>
                    {c.triage_level}
                  </span>
                  <span className="text-xs text-secondary-400 dark:text-secondary-500">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {data.pending_count > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card bg-yellow-50 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-start space-x-3">
            <HiOutlineExclamationCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">{language === 'fr' ? 'Action requise' : 'Action Required'}</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                {language === 'fr'
                  ? `Vous avez ${data.pending_count} consultation(s) en attente qui nécessitent votre réponse.`
                  : `You have ${data.pending_count} pending consultation(s) that require your response.`}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
