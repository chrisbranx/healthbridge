import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { doctorsApi } from '../../services/api';
import {
  HiOutlineChartBar, HiOutlineClock, HiOutlineUserGroup,
  HiOutlineExclamationCircle, HiOutlineCheckCircle, HiOutlineArrowUp
} from 'react-icons/hi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

export default function DoctorAnalytics() {
  const { language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  async function loadAnalytics() {
    try {
      const { data: analyticsData } = await doctorsApi.analytics(days);
      setData(analyticsData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="skeleton h-8 w-64 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-secondary-400">
        {language === 'fr' ? 'Échec du chargement des analyses' : 'Failed to load analytics'}
      </div>
    );
  }

  const statsCards = [
    {
      label: language === 'fr' ? 'Consultations totales' : 'Total Consultations',
      value: data.total_consultations,
      icon: HiOutlineChartBar,
      color: 'from-primary-500 to-primary-600',
      change: `${data.recent_count} ${language === 'fr' ? 'ce mois' : 'this month'}`,
    },
    {
      label: language === 'fr' ? 'Patients uniques' : 'Unique Patients',
      value: data.total_patients,
      icon: HiOutlineUserGroup,
      color: 'from-accent-500 to-primary-600',
      change: `${data.active_chw_assignments} ${language === 'fr' ? 'en suivi CHW' : 'in CHW follow-up'}`,
    },
    {
      label: language === 'fr' ? 'Temps de réponse moyen' : 'Avg Response Time',
      value: `${data.avg_response_time_hours}h`,
      icon: HiOutlineClock,
      color: 'from-primary-600 to-primary-800',
      change: language === 'fr' ? 'Depuis la création' : 'Since creation',
    },
    {
      label: language === 'fr' ? 'Taux de résolution' : 'Resolution Rate',
      value: data.total_consultations > 0
        ? `${Math.round((data.status_counts.resolved / data.total_consultations) * 100)}%`
        : '0%',
      icon: HiOutlineCheckCircle,
      color: 'from-green-500 to-green-600',
      change: `${data.status_counts.pending} ${language === 'fr' ? 'en attente' : 'pending'}`,
    },
  ];

  const daysSince = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const dayLabels = Object.keys(data.consultations_by_day || {}).sort();
  const dayValues = dayLabels.map(d => data.consultations_by_day[d] || 0);

  const lineChartData = {
    labels: dayLabels,
    datasets: [{
      label: language === 'fr' ? 'Consultations' : 'Consultations',
      data: dayValues,
      borderColor: '#16a34a',
      backgroundColor: 'rgba(22, 163, 74, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#16a34a',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  };

  const triageData = {
    labels: [
      language === 'fr' ? 'Faible' : 'Low',
      language === 'fr' ? 'Moyen' : 'Medium',
      language === 'fr' ? 'Élevé' : 'High',
      language === 'fr' ? 'Critique' : 'Critical',
    ],
    datasets: [{
      data: [
        data.triage_distribution.low,
        data.triage_distribution.medium,
        data.triage_distribution.high,
        data.triage_distribution.critical,
      ],
      backgroundColor: ['#22c55e', '#eab308', '#f97316', '#ef4444'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Analytiques' : 'Analytics'}
          </h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Aperçu de votre activité médicale' : 'Overview of your medical activity'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                days === d
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
              }`}
            >
              {d}{language === 'fr' ? 'j' : 'd'}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label}
              className="relative overflow-hidden bg-white dark:bg-secondary-800 rounded-2xl p-4 lg:p-5 shadow-sm border border-secondary-100 dark:border-secondary-700 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-primary-600 dark:text-primary-400 font-medium mt-1">{stat.change}</p>
            </div>
          );
        })}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-secondary-800 rounded-2xl p-5 lg:p-6 shadow-sm border border-secondary-100 dark:border-secondary-700">
          <h3 className="text-sm font-bold text-secondary-900 dark:text-white mb-4">
            {language === 'fr' ? 'Consultations par jour' : 'Consultations per Day'}
          </h3>
          {dayLabels.length > 0 ? (
            <Line data={lineChartData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { font: { size: 10 }, maxTicksLimit: 10 } },
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 1, font: { size: 10 } } },
              },
            }} />
          ) : (
            <div className="h-48 flex items-center justify-center text-secondary-400 text-sm">
              {language === 'fr' ? 'Aucune donnée pour cette période' : 'No data for this period'}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-secondary-800 rounded-2xl p-5 lg:p-6 shadow-sm border border-secondary-100 dark:border-secondary-700">
          <h3 className="text-sm font-bold text-secondary-900 dark:text-white mb-4">
            {language === 'fr' ? 'Répartition par triage' : 'Triage Distribution'}
          </h3>
          <div className="flex items-center justify-center h-48">
            <div className="w-44">
              <Doughnut data={triageData} options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { padding: 12, usePointStyle: true, font: { size: 11 } },
                  },
                },
                cutout: '65%',
              }} />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white dark:bg-secondary-800 rounded-2xl p-5 lg:p-6 shadow-sm border border-secondary-100 dark:border-secondary-700">
        <h3 className="text-sm font-bold text-secondary-900 dark:text-white mb-4">
          {language === 'fr' ? 'État des consultations' : 'Consultation Status'}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: language === 'fr' ? 'En attente' : 'Pending', value: data.status_counts.pending, color: 'bg-yellow-500' },
            { label: language === 'fr' ? 'Résolues' : 'Resolved', value: data.status_counts.resolved, color: 'bg-green-500' },
            { label: language === 'fr' ? 'Escaladées' : 'Escalated', value: data.status_counts.escalated, color: 'bg-red-500' },
          ].map((item) => {
            const total = data.status_counts.pending + data.status_counts.resolved + data.status_counts.escalated;
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={item.label} className="text-center p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/50">
                <div className={`h-3 w-3 rounded-full ${item.color} mx-auto mb-2`} />
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{item.value}</p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">{item.label}</p>
                <div className="mt-2 h-1.5 bg-secondary-200 dark:bg-secondary-600 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-secondary-400 mt-1">{pct}%</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
