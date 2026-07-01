import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { chwApi } from '../../services/api';
import { HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineExclamationCircle, HiOutlineCheckCircle } from 'react-icons/hi';

export default function CHWDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    try {
      const { data } = await chwApi.dashboard();
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
    { label: language === 'fr' ? 'Patients assignés' : 'Assigned Patients', value: data.total_patients, icon: HiOutlineUserGroup, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', path: '/chw/patients' },
    { label: language === 'fr' ? 'Tâches en attente' : 'Pending Tasks', value: data.pending_tasks, icon: HiOutlineClipboardList, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30', path: '/chw/tasks' },
    { label: language === 'fr' ? "Taux d'observance" : 'Adherence Rate', value: `${data.adherence_rate}%`, icon: HiOutlineCheckCircle, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { label: language === 'fr' ? 'Escalades' : 'Escalations', value: data.escalations?.length || 0, icon: HiOutlineExclamationCircle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30', path: '/chw/escalations' },
  ];

  const pendingTasks = (data.tasks || []).filter((t: any) => t.status === 'pending').slice(0, 5);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">{language === 'fr' ? 'Tableau de bord ASC' : 'CHW Dashboard'}</h1>
        <p className="text-sm lg:text-base text-secondary-500 dark:text-secondary-400">{language === 'fr' ? 'Boîte à outils ASC — Fonctionne hors ligne' : 'Community Health Worker Toolkit — Offline Capable'}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <div className={`card flex flex-col items-center text-center dark:bg-secondary-800 dark:border-secondary-700 ${stat.path ? 'cursor-pointer hover:shadow-md' : ''}`}>
              <div className={`h-12 w-12 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">{stat.label}</p>
            </div>
          );
          return stat.path ? (
            <div key={stat.label} onClick={() => navigate(stat.path!)}>{content}</div>
          ) : (
            <div key={stat.label}>{content}</div>
          );
        })}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card dark:bg-secondary-800 dark:border-secondary-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold dark:text-white">{language === 'fr' ? 'Tâches en attente' : 'Pending Tasks'}</h2>
          <button onClick={() => navigate('/chw/tasks')} className="text-sm text-primary-600 font-medium">{language === 'fr' ? 'Voir tout' : 'View All'}</button>
        </div>
        {pendingTasks.length === 0 ? (
          <p className="text-center py-4 text-secondary-400 dark:text-secondary-500">{language === 'fr' ? 'Aucune tâche en attente' : 'No pending tasks'}</p>
        ) : (
          <div className="space-y-2">
            {pendingTasks.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-secondary-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm dark:text-white">{task.title}</p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">{task.patient?.name || (language === 'fr' ? 'Patient inconnu' : 'Unknown patient')}</p>
                </div>
                <span className={`badge ${
                  task.priority === 'critical' ? 'badge-escalated' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'badge-pending'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card bg-accent-50 border-accent-100 dark:bg-accent-900/20 dark:border-accent-800">
        <p className="text-sm text-accent-700 dark:text-accent-300">
          <strong>{language === 'fr' ? 'Mode hors ligne :' : 'Offline Mode:'}</strong> {language === 'fr' ? "Cette application fonctionne sans Internet. Les données seront synchronisées lorsque vous vous connecterez." : 'This app works without internet. Data will sync when you connect.'}
        </p>
      </motion.div>
    </div>
  );
}
