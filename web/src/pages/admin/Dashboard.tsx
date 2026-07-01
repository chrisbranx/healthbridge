import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { adminApi } from '../../services/api';
import { HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineOfficeBuilding, HiOutlineExclamationCircle, HiOutlineUsers } from 'react-icons/hi';

export default function AdminDashboard() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const { data } = await adminApi.stats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-secondary-400 dark:text-secondary-300">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>;

  const cards = [
    { label: language === 'fr' ? 'Total des utilisateurs' : 'Total Users', value: stats?.total_users || 0, icon: HiOutlineUsers, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    { label: language === 'fr' ? 'Patients' : 'Patients', value: stats?.total_patients || 0, icon: HiOutlineUserGroup, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { label: language === 'fr' ? 'Consultations' : 'Consultations', value: stats?.total_consultations || 0, icon: HiOutlineClipboardList, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { label: language === 'fr' ? 'ASC' : 'CHWs', value: stats?.total_chws || 0, icon: HiOutlineClipboardList, color: 'text-accent-600 bg-accent-100 dark:bg-accent-900/30' },
    { label: language === 'fr' ? 'Cliniques' : 'Clinics', value: stats?.total_clinics || 0, icon: HiOutlineOfficeBuilding, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
    { label: language === 'fr' ? 'Tâches en attente' : 'Pending Tasks', value: stats?.pending_tasks || 0, icon: HiOutlineClipboardList, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
    { label: language === 'fr' ? 'Escalades en attente' : 'Pending Escalations', value: stats?.pending_escalations || 0, icon: HiOutlineExclamationCircle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">{language === 'fr' ? 'Tableau de bord administrateur' : 'Admin Dashboard'}</h1>
        <p className="text-sm lg:text-base text-secondary-500 dark:text-secondary-400">{language === 'fr' ? "Aperçu de la plateforme HealthBridge" : 'HealthBridge platform overview'}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card flex items-center space-x-3 dark:bg-secondary-800 dark:border-secondary-700">
              <div className={`h-10 w-10 rounded-lg ${card.color} flex items-center justify-center`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-secondary-900 dark:text-white">{card.value}</p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">{card.label}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card dark:bg-secondary-800 dark:border-secondary-700">
        <h2 className="text-lg font-semibold mb-2 dark:text-white">{language === 'fr' ? 'Actions rapides' : 'Quick Actions'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="/admin/users" className="btn-secondary text-center dark:bg-secondary-700 dark:text-secondary-200">{language === 'fr' ? 'Gérer les utilisateurs' : 'Manage Users'}</a>
          <a href="/admin/clinics" className="btn-secondary text-center dark:bg-secondary-700 dark:text-secondary-200">{language === 'fr' ? 'Gérer les cliniques' : 'Manage Clinics'}</a>
          <a href="/admin/analytics" className="btn-secondary text-center dark:bg-secondary-700 dark:text-secondary-200">{language === 'fr' ? 'Voir les analyses' : 'View Analytics'}</a>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card bg-primary-50 border-primary-100 dark:bg-primary-900/20 dark:border-primary-800">
        <h3 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">{language === 'fr' ? 'État du système' : 'System Status'}</h3>
        <div className="flex items-center space-x-2 text-sm text-primary-600 dark:text-primary-300">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>{language === 'fr' ? 'Passerelle USSD : *800# — Active' : 'USSD Gateway: *800# — Active'}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-primary-600 dark:text-primary-300 mt-1">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>{language === 'fr' ? 'Plateforme Web : healthbridge.cm — Active' : 'Web Platform: healthbridge.cm — Active'}</span>
        </div>
      </motion.div>
    </div>
  );
}
