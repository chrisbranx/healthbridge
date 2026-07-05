import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import { HiOutlineServer, HiOutlineDatabase, HiOutlineClock, HiOutlineGlobe, HiOutlineLightningBolt, HiOutlineCog, HiOutlineRefresh } from 'react-icons/hi';

export default function AdminSystemSettings() {
  const { language } = useLanguage();
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [toggles, setToggles] = useState({
    maintenance_mode: false,
    registration_open: true,
    guest_access: false,
  });

  useEffect(() => { loadSystemInfo(); }, []);

  async function loadSystemInfo() {
    try {
      const { data } = await api.get('/admin/system');
      setSystemInfo(data);
      if (data.feature_toggles) setToggles(data.feature_toggles);
    } catch (err) {
      console.error('Failed to load system info:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    setSeedResult(null);
    try {
      await api.post('/seed/all');
      setSeedResult(language === 'fr' ? 'Données de semence créées avec succès' : 'Seed data created successfully');
    } catch (err: any) {
      setSeedResult(err?.response?.data?.message || (language === 'fr' ? 'Échec de la création des données de semence' : 'Failed to create seed data'));
    } finally {
      setSeeding(false);
    }
  }

  function toggleFeature(key: string) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  }

  if (loading) return <div className="text-center py-12 text-secondary-400 dark:text-secondary-300">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>;

  const statusCards = [
    {
      label: language === 'fr' ? 'Statut API' : 'API Status',
      value: systemInfo?.api_status || systemInfo?.api?.status || 'unknown',
      icon: HiOutlineServer,
      ok: (systemInfo?.api_status || systemInfo?.api?.status) === 'ok' || (systemInfo?.api_status || systemInfo?.api?.status) === 'healthy',
    },
    {
      label: language === 'fr' ? 'Base de données' : 'Database',
      value: systemInfo?.db_status || systemInfo?.database?.status || 'unknown',
      icon: HiOutlineDatabase,
      ok: (systemInfo?.db_status || systemInfo?.database?.status) === 'ok' || (systemInfo?.db_status || systemInfo?.database?.status) === 'connected',
    },
    {
      label: language === 'fr' ? 'Temps de fonctionnement' : 'Uptime',
      value: systemInfo?.uptime ? `${Math.floor(systemInfo.uptime / 3600)}h ${Math.floor((systemInfo.uptime % 3600) / 60)}m` : (systemInfo?.server?.uptime || '-'),
      icon: HiOutlineClock,
      ok: true,
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
          {language === 'fr' ? 'Paramètres système' : 'System Settings'}
        </h1>
        <p className="text-sm lg:text-base text-secondary-500 dark:text-secondary-400">
          {language === 'fr' ? 'Gérer la configuration et le statut du système' : 'Manage system configuration and status'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="card dark:bg-secondary-800 dark:border-secondary-700 flex items-center space-x-4"
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${card.ok ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">{card.label}</p>
                <p className={`text-lg font-bold capitalize ${card.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{card.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card dark:bg-secondary-800 dark:border-secondary-700">
        <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center space-x-2">
          <HiOutlineCog className="h-5 w-5 text-primary-500" />
          <span>{language === 'fr' ? 'Fonctionnalités' : 'Feature Toggles'}</span>
        </h2>
        <div className="space-y-3">
          {[
            { key: 'maintenance_mode', label: language === 'fr' ? 'Mode maintenance' : 'Maintenance Mode' },
            { key: 'registration_open', label: language === 'fr' ? 'Inscriptions ouvertes' : 'Registration Open' },
            { key: 'guest_access', label: language === 'fr' ? 'Accès invité' : 'Allow Guest Access' },
          ].map((feat) => (
            <div key={feat.key} className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-secondary-700 dark:text-secondary-200">{feat.label}</span>
              <button
                onClick={() => toggleFeature(feat.key)}
                className={`relative w-11 h-6 rounded-full transition-colors ${toggles[feat.key as keyof typeof toggles] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-secondary-600'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${toggles[feat.key as keyof typeof toggles] ? 'translate-x-5' : ''}`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card dark:bg-secondary-800 dark:border-secondary-700">
        <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center space-x-2">
          <HiOutlineGlobe className="h-5 w-5 text-primary-500" />
          <span>{language === 'fr' ? "Informations sur l'environnement" : 'Environment Info'}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'NODE_ENV', value: systemInfo?.env || systemInfo?.environment?.node_env || systemInfo?.node_env || 'development' },
            { label: 'Platform', value: systemInfo?.platform || systemInfo?.environment?.platform || navigator.platform || '-' },
            { label: 'Node Version', value: systemInfo?.node_version || systemInfo?.environment?.node || '-' },
            { label: 'App Version', value: systemInfo?.version || systemInfo?.app_version || '1.0.0' },
            { label: 'API Base', value: systemInfo?.api_url || '/api' },
          ].map((info) => (
            <div key={info.label} className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-3">
              <p className="text-xs text-secondary-400 dark:text-secondary-500 mb-1">{info.label}</p>
              <p className="text-sm font-mono font-medium text-secondary-800 dark:text-secondary-200 break-all">{info.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card dark:bg-secondary-800 dark:border-secondary-700">
        <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center space-x-2">
          <HiOutlineLightningBolt className="h-5 w-5 text-primary-500" />
          <span>{language === 'fr' ? 'Actions système' : 'System Actions'}</span>
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            {seeding ? (
              <HiOutlineRefresh className="h-4 w-4 animate-spin" />
            ) : (
              <HiOutlineLightningBolt className="h-4 w-4" />
            )}
            <span>{seeding ? (language === 'fr' ? 'Création...' : 'Seeding...') : (language === 'fr' ? 'Générer des données de test' : 'Seed Sample Data')}</span>
          </button>
          {seedResult && (
            <span className={`text-sm font-medium ${seedResult.includes('success') || seedResult.includes('réussi') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {seedResult}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
