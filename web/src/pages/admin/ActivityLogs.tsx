import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import { HiOutlineRefresh, HiOutlineFilter, HiOutlineSearch } from 'react-icons/hi';

const EVENT_TYPES = ['all', 'login', 'register', 'consultation', 'prescription', 'escalation', 'task', 'profile_update'];

export default function AdminActivityLogs() {
  const { language } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<number>();

  useEffect(() => {
    loadLogs();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = window.setInterval(loadLogs, 10000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh]);

  async function loadLogs() {
    try {
      const params: any = {};
      if (eventFilter !== 'all') params.event = eventFilter;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const { data } = await api.get('/admin/activity', { params });
      setLogs(Array.isArray(data) ? data : data.logs || []);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
          {language === 'fr' ? "Journaux d'activité" : 'Activity Logs'}
        </h1>
        <p className="text-sm lg:text-base text-secondary-500 dark:text-secondary-400">
          {language === 'fr' ? 'Toutes les actions des utilisateurs sur la plateforme' : 'All user actions across the platform'}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card dark:bg-secondary-800 dark:border-secondary-700">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <HiOutlineFilter className="h-4 w-4 text-secondary-400" />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="input text-sm dark:bg-secondary-700 dark:border-secondary-600 dark:text-secondary-200"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === 'all' ? (language === 'fr' ? 'Tous les événements' : 'All Events') : t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input text-sm dark:bg-secondary-700 dark:border-secondary-600 dark:text-secondary-200" />
          <span className="text-secondary-400 text-sm">—</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input text-sm dark:bg-secondary-700 dark:border-secondary-600 dark:text-secondary-200" />
          <button onClick={loadLogs} className="btn-primary text-sm flex items-center space-x-1">
            <HiOutlineSearch className="h-4 w-4" />
            <span>{language === 'fr' ? 'Filtrer' : 'Filter'}</span>
          </button>
          <label className="flex items-center space-x-2 text-sm text-secondary-600 dark:text-secondary-400 ml-auto">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded border-secondary-300" />
            <span>{language === 'fr' ? 'Auto-actualisation' : 'Auto-refresh'}</span>
          </label>
          <button onClick={loadLogs} className="p-2 rounded-lg text-secondary-400 hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors" title={language === 'fr' ? 'Actualiser' : 'Refresh'}>
            <HiOutlineRefresh className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card dark:bg-secondary-800 dark:border-secondary-700 overflow-x-auto">
        {loading ? (
          <div className="text-center py-12 text-secondary-400 dark:text-secondary-300">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-secondary-400 dark:text-secondary-300">{language === 'fr' ? 'Aucune activité trouvée' : 'No activity found'}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-secondary-700">
                <th className="text-left py-3 px-2 font-medium text-secondary-500 dark:text-secondary-400">{language === 'fr' ? 'Horodatage' : 'Timestamp'}</th>
                <th className="text-left py-3 px-2 font-medium text-secondary-500 dark:text-secondary-400">{language === 'fr' ? 'Utilisateur' : 'User'}</th>
                <th className="text-left py-3 px-2 font-medium text-secondary-500 dark:text-secondary-400">{language === 'fr' ? 'Action / Événement' : 'Action / Event'}</th>
                <th className="text-left py-3 px-2 font-medium text-secondary-500 dark:text-secondary-400">{language === 'fr' ? 'Détails' : 'Details'}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={log.id || idx} className="border-b border-gray-50 dark:border-secondary-700/50 hover:bg-gray-50 dark:hover:bg-secondary-700/50">
                  <td className="py-3 px-2 text-secondary-900 dark:text-white whitespace-nowrap">{new Date(log.timestamp || log.created_at).toLocaleString()}</td>
                  <td className="py-3 px-2 text-secondary-700 dark:text-secondary-200">{log.user_name || log.user?.name || log.user_id}</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                      {log.event || log.action || log.type}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-secondary-500 dark:text-secondary-400 max-w-xs truncate">{log.details || log.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
