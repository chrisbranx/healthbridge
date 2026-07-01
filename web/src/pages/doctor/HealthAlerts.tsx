import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineBell, HiOutlineGlobe, HiOutlineExclamationCircle, HiOutlinePlus } from 'react-icons/hi';

interface HealthAlert {
  id: string;
  title: string;
  description: string;
  severity: string;
  disease: string;
  regions: string[];
  instructions: string;
  status: string;
  created_at: string;
}

const severityStyles: Record<string, string> = {
  critical: 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 border-orange-400 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  warning: 'bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  info: 'bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

export default function HealthAlerts() {
  const { language } = useLanguage();
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newAlert, setNewAlert] = useState({ title: '', description: '', severity: 'info', disease: '', regions: '', instructions: '' });

  useEffect(() => { loadAlerts(); }, []);

  async function loadAlerts() {
    try {
      const { data } = await api.get('/alerts');
      setAlerts(data || []);
    } catch (err) { console.error(err); }
  }

  async function createAlert(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/alerts', { ...newAlert, regions: newAlert.regions.split(',').map(r => r.trim()) });
      toast.success(language === 'fr' ? 'Alerte créée' : 'Alert created');
      setShowCreate(false);
      loadAlerts();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
  }

  async function resolveAlert(id: string) {
    try {
      await api.patch(`/alerts/${id}/status`, { status: 'resolved' });
      toast.success(language === 'fr' ? 'Alerte résolue' : 'Alert resolved');
      loadAlerts();
    } catch (err) { console.error(err); }
  }

  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Alertes Sanitaires' : 'Health Alerts'}
          </h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Alertes communautaires et épidémies' : 'Community alerts and disease outbreaks'}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><HiOutlinePlus className="h-5 w-5 mr-1" /> {language === 'fr' ? 'Alerte' : 'Alert'}</button>
      </motion.div>

      {criticalCount > 0 && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl flex items-center space-x-3">
          <HiOutlineExclamationCircle className="h-6 w-6 text-red-600 animate-pulse" />
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            {language === 'fr' ? `${criticalCount} alerte(s) critique(s) nécessitent une action immédiate` : `${criticalCount} critical alert(s) require immediate action`}
          </p>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="text-center py-12 text-secondary-400">
          <HiOutlineBell className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>{language === 'fr' ? 'Aucune alerte sanitaire' : 'No health alerts'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <motion.div key={alert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border-2 ${severityStyles[alert.severity] || 'bg-secondary-50 dark:bg-secondary-800'} ${alert.status === 'resolved' ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20">{alert.severity}</span>
                  <h3 className="font-semibold">{alert.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-secondary-500">{new Date(alert.created_at).toLocaleDateString()}</span>
                  {alert.status === 'active' && (
                    <button onClick={() => resolveAlert(alert.id)} className="text-xs text-primary-600 hover:underline">{language === 'fr' ? 'Résoudre' : 'Resolve'}</button>
                  )}
                </div>
              </div>
              <p className="text-sm opacity-80 mb-2">{alert.description}</p>
              <div className="flex items-center space-x-4 text-xs">
                {alert.disease && <span className="flex items-center"><HiOutlineExclamationCircle className="h-3 w-3 mr-1" />{alert.disease}</span>}
                <span className="flex items-center"><HiOutlineGlobe className="h-3 w-3 mr-1" />{alert.regions?.join(', ')}</span>
                <span className={`text-xs font-medium ${alert.status === 'active' ? 'text-green-600' : 'text-secondary-400'}`}>{alert.status}</span>
              </div>
              {alert.instructions && (
                <div className="mt-2 p-2 bg-white/30 dark:bg-black/10 rounded text-sm">
                  <strong>{language === 'fr' ? 'Instructions:' : 'Instructions:'}</strong> {alert.instructions}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {showCreate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4 dark:text-white">{language === 'fr' ? 'Créer une alerte sanitaire' : 'Create Health Alert'}</h3>
            <form onSubmit={createAlert} className="space-y-3">
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Titre' : 'Title'}</label>
                <input className="input dark:bg-secondary-700 dark:text-white" value={newAlert.title} onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })} required />
              </div>
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Description' : 'Description'}</label>
                <textarea className="input min-h-[60px] dark:bg-secondary-700 dark:text-white" value={newAlert.description} onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Gravité' : 'Severity'}</label>
                  <select className="input dark:bg-secondary-700 dark:text-white" value={newAlert.severity} onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Maladie (optionnel)' : 'Disease (optional)'}</label>
                  <input className="input dark:bg-secondary-700 dark:text-white" value={newAlert.disease} onChange={(e) => setNewAlert({ ...newAlert, disease: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Régions (virgule)' : 'Regions (comma-separated)'}</label>
                <input className="input dark:bg-secondary-700 dark:text-white" placeholder="Yaoundé, Douala, Bamenda" value={newAlert.regions} onChange={(e) => setNewAlert({ ...newAlert, regions: e.target.value })} required />
              </div>
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Instructions' : 'Instructions'}</label>
                <textarea className="input min-h-[60px] dark:bg-secondary-700 dark:text-white" value={newAlert.instructions} onChange={(e) => setNewAlert({ ...newAlert, instructions: e.target.value })} />
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center">{language === 'fr' ? 'Créer' : 'Create'}</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 justify-center">{language === 'fr' ? 'Annuler' : 'Cancel'}</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}
