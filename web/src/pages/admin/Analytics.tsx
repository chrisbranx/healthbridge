import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { analyticsApi } from '../../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

export default function AdminAnalytics() {
  const { language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [adherence, setAdherence] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.overview(),
      analyticsApi.adherence(),
    ]).then(([overview, adherenceData]) => {
      setData(overview.data);
      setAdherence(adherenceData.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-secondary-400 dark:text-secondary-300">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>;

  const channelChart = data?.consultations_by_channel && {
    labels: Object.keys(data.consultations_by_channel),
    datasets: [{
      data: Object.values(data.consultations_by_channel),
      backgroundColor: ['#22c55e', '#3b82f6'],
    }],
  };

  const triageChart = data?.triage_distribution && {
    labels: Object.keys(data.triage_distribution),
    datasets: [{
      label: language === 'fr' ? 'Consultations par gravité' : 'Consultations by Severity',
      data: Object.values(data.triage_distribution),
      backgroundColor: ['#94a3b8', '#eab308', '#f97316', '#ef4444'],
    }],
  };

  const dailyChart = data?.consultations_by_day && {
    labels: Object.keys(data.consultations_by_day).slice(-14),
    datasets: [{
      label: language === 'fr' ? 'Consultations quotidiennes' : 'Daily Consultations',
      data: Object.values(data.consultations_by_day).slice(-14) as number[],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
    }],
  };

  const adherenceChart = adherence && {
    labels: [language === 'fr' ? 'Pris' : 'Taken', language === 'fr' ? 'Manqué' : 'Missed'],
    datasets: [{
      data: [adherence.medication_taken || 0, adherence.medication_missed || 0],
      backgroundColor: ['#22c55e', '#ef4444'],
    }],
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">{language === 'fr' ? 'Analyses' : 'Analytics'}</h1>
        <p className="text-sm lg:text-base text-secondary-500 dark:text-secondary-400">{language === 'fr' ? 'Performance de la plateforme et indicateurs de santé' : 'Platform performance and health metrics'}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card dark:bg-secondary-800 dark:border-secondary-700">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">{language === 'fr' ? 'Total des utilisateurs' : 'Total Users'}</p>
          <p className="text-2xl font-bold dark:text-white">{data?.total_users || 0}</p>
        </div>
        <div className="card dark:bg-secondary-800 dark:border-secondary-700">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">{language === 'fr' ? 'Total des patients' : 'Total Patients'}</p>
          <p className="text-2xl font-bold dark:text-white">{data?.total_patients || 0}</p>
        </div>
        <div className="card dark:bg-secondary-800 dark:border-secondary-700">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">{language === 'fr' ? 'Total des consultations' : 'Total Consultations'}</p>
          <p className="text-2xl font-bold dark:text-white">{data?.total_consultations || 0}</p>
        </div>
        <div className="card dark:bg-secondary-800 dark:border-secondary-700">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">{language === 'fr' ? 'Consultations (30j)' : '30-Day Consultations'}</p>
          <p className="text-2xl font-bold dark:text-white">{data?.consultations_30d || 0}</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {channelChart && (
          <div className="card dark:bg-secondary-800 dark:border-secondary-700">
            <h3 className="font-semibold mb-4 dark:text-white">{language === 'fr' ? 'Consultations par canal' : 'Consultations by Channel'}</h3>
            <div className="max-w-[250px] mx-auto">
              <Doughnut data={channelChart} />
            </div>
          </div>
        )}

        {triageChart && (
          <div className="card dark:bg-secondary-800 dark:border-secondary-700">
            <h3 className="font-semibold mb-4 dark:text-white">{language === 'fr' ? 'Répartition par triage' : 'Triage Distribution'}</h3>
            <div className="max-w-[250px] mx-auto">
              <Bar data={triageChart} options={{ plugins: { legend: { display: false } }, responsive: true }} />
            </div>
          </div>
        )}

        {dailyChart && (
          <div className="card md:col-span-2 dark:bg-secondary-800 dark:border-secondary-700">
            <h3 className="font-semibold mb-4 dark:text-white">{language === 'fr' ? 'Consultations quotidiennes (14 derniers jours)' : 'Daily Consultations (Last 14 Days)'}</h3>
            <Line data={dailyChart} options={{ responsive: true }} />
          </div>
        )}

        {adherenceChart && (
          <div className="card md:col-span-2 dark:bg-secondary-800 dark:border-secondary-700">
            <h3 className="font-semibold mb-4 dark:text-white">{language === 'fr' ? 'Observance médicamenteuse' : 'Medication Adherence'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="max-w-[200px]">
                <Doughnut data={adherenceChart} />
              </div>
              <div>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{adherence?.adherence_rate || 0}%</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">{language === 'fr' ? "Taux d'observance" : 'Adherence Rate'}</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="dark:text-secondary-300">✅ {language === 'fr' ? 'Pris' : 'Taken'}: {adherence?.medication_taken || 0}</p>
                  <p className="dark:text-secondary-300">❌ {language === 'fr' ? 'Manqué' : 'Missed'}: {adherence?.medication_missed || 0}</p>
                  <p className="dark:text-secondary-300">📊 {language === 'fr' ? 'Total des enregistrements' : 'Total Logs'}: {adherence?.total_logs || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
