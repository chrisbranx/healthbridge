import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { adminFullApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineClipboardList,
  HiOutlineOfficeBuilding,
  HiOutlineChartBar,
  HiOutlineGlobe,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineServer,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineCalendar,
  HiOutlineUserAdd,
  HiOutlineLocationMarker,
  HiOutlineBadgeCheck,
} from 'react-icons/hi';

interface Stats {
  total_users: number;
  active_today: number;
  total_doctors: number;
  total_chws: number;
  total_patients: number;
  total_clinics: number;
  region_distribution: { region: string; count: number }[];
  role_distribution: Record<string, number>;
}

interface Activity {
  id: string;
  user: { name: string; role?: string };
  action: string;
  created_at: string;
}

interface SystemStatus {
  health: string;
  api_status: string;
  last_deployment: string;
  version?: string;
  uptime?: string;
}

const roleColors: Record<string, string> = {
  doctor: 'bg-blue-500',
  chw: 'bg-green-500',
  patient: 'bg-purple-500',
  admin: 'bg-yellow-500',
};

const roleLabels: Record<string, { en: string; fr: string }> = {
  doctor: { en: 'Doctors', fr: 'Médecins' },
  chw: { en: 'CHWs', fr: 'ASC' },
  patient: { en: 'Patients', fr: 'Patients' },
  admin: { en: 'Admins', fr: 'Administrateurs' },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = (en: string, fr: string) => (language === 'fr' ? fr : en);

  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    Promise.all([
      adminFullApi.stats(),
      adminFullApi.activity(),
      adminFullApi.system(),
      adminFullApi.roleRequests({ status: 'pending' }).catch(() => ({ data: [] })),
    ])
      .then(([statsRes, activityRes, systemRes, requestsRes]) => {
        setStats(statsRes.data);
        setActivities(activityRes.data?.slice(0, 8) || []);
        setSystem(systemRes.data);
        setPendingCount(Array.isArray(requestsRes.data) ? requestsRes.data.length : 0);
      })
      .catch(() =>
        toast.error(t('Failed to load dashboard data', 'Échec du chargement du tableau de bord'))
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleSeed() {
    if (
      !confirm(
        t(
          'This will add sample data to the system. Continue?',
          'Cela ajoutera des données d\'exemple au système. Continuer?'
        )
      )
    )
      return;
    setSeeding(true);
    try {
      await adminFullApi.seed();
      toast.success(t('Sample data seeded successfully', 'Données d\'exemple ajoutées avec succès'));
      const { data } = await adminFullApi.stats();
      setStats(data);
    } catch {
      toast.error(t('Failed to seed data', 'Échec de l\'ajout des données'));
    } finally {
      setSeeding(false);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );

  const statCards = [
    {
      label: t('Total Users', 'Utilisateurs total'),
      value: stats?.total_users ?? 0,
      icon: HiOutlineUsers,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300',
    },
    {
      label: t('Active Today', 'Actifs aujourd\'hui'),
      value: stats?.active_today ?? 0,
      icon: HiOutlineShieldCheck,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300',
    },
    {
      label: t('Doctors', 'Médecins'),
      value: stats?.total_doctors ?? 0,
      icon: HiOutlineUserGroup,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300',
    },
    {
      label: t('CHWs', 'ASC'),
      value: stats?.total_chws ?? 0,
      icon: HiOutlineClipboardList,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300',
    },
    {
      label: t('Patients', 'Patients'),
      value: stats?.total_patients ?? 0,
      icon: HiOutlineLocationMarker,
      color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300',
    },
    {
      label: t('Clinics', 'Cliniques'),
      value: stats?.total_clinics ?? 0,
      icon: HiOutlineOfficeBuilding,
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300',
    },
    {
      label: t('Pending Approvals', 'En attente'),
      value: pendingCount,
      icon: HiOutlineBadgeCheck,
      color: 'text-accent-600 bg-accent-100 dark:bg-accent-900/30 dark:text-accent-300',
    },
  ];

  const roleEntries = stats?.role_distribution
    ? Object.entries(stats.role_distribution).filter(([k]) => k !== 'admin')
    : [];
  const roleTotal = roleEntries.reduce((s, [, v]) => s + v, 0);

  const regionEntries = stats?.region_distribution ?? [];
  const regionTotal = regionEntries.reduce((s, r) => s + r.count, 0);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
            {t('Admin Dashboard', 'Tableau de bord administrateur')}
          </h1>
          <p className="text-sm lg:text-base text-secondary-500 dark:text-secondary-400">
            {t('HealthBridge platform overview', 'Aperçu de la plateforme HealthBridge')}
          </p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiOutlineRefresh className={`h-4 w-4 ${seeding ? 'animate-spin' : ''}`} />
          {seeding
            ? t('Seeding...', 'Ajout en cours...')
            : t('Seed Sample Data', 'Ajouter des données d\'exemple')}
        </button>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} variants={item}>
              <div className="card p-4 flex flex-col gap-3 dark:bg-secondary-800 dark:border-secondary-700">
                <div
                  className={`h-10 w-10 rounded-lg ${card.color} flex items-center justify-center`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {card.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                    {card.label}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 card p-5 dark:bg-secondary-800 dark:border-secondary-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
              <HiOutlineClock className="h-5 w-5 text-secondary-400" />
              {t('Recent Activity', 'Activité récente')}
            </h2>
            <span className="text-xs text-secondary-400">
              {t('Last 24h', 'Dernières 24h')}
            </span>
          </div>
          <div className="space-y-0">
            {activities.length === 0 ? (
              <p className="text-sm text-secondary-400 py-4 text-center">
                {t('No recent activity', 'Aucune activité récente')}
              </p>
            ) : (
              activities.map((act, idx) => (
                <div
                  key={act.id || idx}
                  className="flex items-start gap-3 py-3 border-b border-secondary-100 dark:border-secondary-700 last:border-0"
                >
                  <div className="mt-1">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                      {act.user?.name || t('Unknown', 'Inconnu')}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 capitalize">
                      {act.action?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <span className="text-xs text-secondary-400 whitespace-nowrap">
                    {new Date(act.created_at).toLocaleString(
                      language === 'fr' ? 'fr-FR' : 'en-US',
                      { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-5 dark:bg-secondary-800 dark:border-secondary-700"
        >
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2 mb-4">
            <HiOutlineGlobe className="h-5 w-5 text-secondary-400" />
            {t('Region Distribution', 'Répartition par région')}
          </h2>
          {regionEntries.length === 0 ? (
            <p className="text-sm text-secondary-400 py-4 text-center">
              {t('No region data', 'Aucune donnée régionale')}
            </p>
          ) : (
            <div className="space-y-3">
              {regionEntries.map((r) => (
                <div key={r.region}>
                  <div className="flex justify-between text-xs text-secondary-600 dark:text-secondary-300 mb-1">
                    <span>{r.region}</span>
                    <span className="font-medium">{r.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${regionTotal ? (r.count / regionTotal) * 100 : 0}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5 dark:bg-secondary-800 dark:border-secondary-700"
        >
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2 mb-4">
            <HiOutlineChartBar className="h-5 w-5 text-secondary-400" />
            {t('Role Distribution', 'Répartition des rôles')}
          </h2>
          {roleEntries.length === 0 ? (
            <p className="text-sm text-secondary-400 py-4 text-center">
              {t('No role data', 'Aucune donnée de rôle')}
            </p>
          ) : (
            <div className="space-y-4">
              {roleEntries.map(([role, count]) => {
                const pct = roleTotal ? (count / roleTotal) * 100 : 0;
                const label = roleLabels[role] || { en: role, fr: role };
                const color = roleColors[role] || 'bg-secondary-400';
                return (
                  <div key={role}>
                    <div className="flex justify-between text-sm text-secondary-700 dark:text-secondary-200 mb-1.5">
                      <span>
                        {language === 'fr' ? label.fr : label.en}
                      </span>
                      <span className="font-semibold">{count.toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className={`h-full ${color} rounded-full`}
                      />
                    </div>
                    <p className="text-xs text-secondary-400 mt-0.5">{pct.toFixed(1)}%</p>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card p-5 dark:bg-secondary-800 dark:border-secondary-700"
        >
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2 mb-4">
            <HiOutlineServer className="h-5 w-5 text-secondary-400" />
            {t('System Status', 'État du système')}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600 dark:text-secondary-300">
                {t('Health', 'Santé')}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                  system?.health === 'healthy'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    system?.health === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                {system?.health === 'healthy'
                  ? t('Healthy', 'Sain')
                  : t('Degraded', 'Dégradé')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600 dark:text-secondary-300">
                {t('API Status', 'Statut API')}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                  system?.api_status === 'operational'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    system?.api_status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                />
                {system?.api_status === 'operational'
                  ? t('Operational', 'Opérationnel')
                  : t('Issues', 'Problèmes')}
              </span>
            </div>
            {system?.uptime && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 dark:text-secondary-300">
                  {t('Uptime', 'Temps de fonctionnement')}
                </span>
                <span className="text-sm font-medium text-secondary-900 dark:text-white">
                  {system.uptime}
                </span>
              </div>
            )}
            {system?.version && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 dark:text-secondary-300">
                  {t('Version', 'Version')}
                </span>
                <span className="text-sm font-medium text-secondary-900 dark:text-white">
                  {system.version}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600 dark:text-secondary-300">
                {t('Last Deployment', 'Dernier déploiement')}
              </span>
              <span className="text-sm text-secondary-900 dark:text-white">
                {system?.last_deployment
                  ? new Date(system.last_deployment).toLocaleDateString(
                      language === 'fr' ? 'fr-FR' : 'en-US',
                      { month: 'short', day: 'numeric', year: 'numeric' }
                    )
                  : '—'}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-5 dark:bg-secondary-800 dark:border-secondary-700"
        >
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2 mb-4">
            <HiOutlineUserAdd className="h-5 w-5 text-secondary-400" />
            {t('Quick Actions', 'Actions rapides')}
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/users')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary-50 hover:bg-secondary-100 dark:bg-secondary-700/50 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-200 transition-colors text-sm font-medium"
            >
              <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <HiOutlineUsers className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
              {t('Manage Users', 'Gérer les utilisateurs')}
            </button>
            <button
              onClick={() => navigate('/admin/clinics')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary-50 hover:bg-secondary-100 dark:bg-secondary-700/50 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-200 transition-colors text-sm font-medium"
            >
              <div className="h-8 w-8 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <HiOutlineOfficeBuilding className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              </div>
              {t('Manage Clinics', 'Gérer les cliniques')}
            </button>
            <button
              onClick={() => navigate('/admin/analytics')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary-50 hover:bg-secondary-100 dark:bg-secondary-700/50 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-200 transition-colors text-sm font-medium"
            >
              <div className="h-8 w-8 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <HiOutlineChartBar className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              </div>
              {t('View Analytics', 'Voir les analyses')}
            </button>
            {pendingCount > 0 && (
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-accent-50 hover:bg-accent-100 dark:bg-accent-900/30 dark:hover:bg-accent-900/50 text-accent-700 dark:text-accent-300 transition-colors text-sm font-medium"
              >
                <div className="h-8 w-8 rounded-md bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                  <HiOutlineBadgeCheck className="h-4 w-4 text-accent-600 dark:text-accent-300" />
                </div>
                <span className="flex items-center gap-2">
                  {t('Pending Approvals', 'Approbations en attente')}
                  <span className="h-5 w-5 rounded-full bg-accent-500 text-white text-xs flex items-center justify-center font-bold">{pendingCount}</span>
                </span>
              </button>
            )}
            <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-700">
              <div className="flex items-center gap-2 text-xs text-secondary-400">
                <HiOutlineCalendar className="h-3.5 w-3.5" />
                {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
