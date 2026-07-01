import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { consultationsApi } from '../../services/api';
import HealthTips from '../../components/HealthTips';
import EmergencyContacts from '../../components/EmergencyContacts';
import { DoctorIllustration, HeartBeatIllustration } from '../../components/MedicalIllustrations';
import { HiOutlineChatAlt2, HiOutlineClipboardList, HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlinePhone, HiOutlineCalendar, HiOutlineHeart, HiOutlineArrowRight } from 'react-icons/hi';

interface Consultation {
  id: string; symptoms: string; diagnosis: string; status: string; channel: string; triage_level: string; created_at: string; doctor: { name: string } | null;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function PatientDashboard() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    consultationsApi.list()
      .then(({ data }) => setConsultations(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = consultations.filter(c => c.status === 'pending' || c.status === 'active');
  const resolved = consultations.filter(c => c.status === 'resolved');

  const stats = [
    { label: language === 'fr' ? 'Actifs' : 'Active', value: active.length, icon: HiOutlineClock, color: 'text-blue-600 bg-blue-100' },
    { label: language === 'fr' ? 'Résolus' : 'Resolved', value: resolved.length, icon: HiOutlineCheckCircle, color: 'text-green-600 bg-green-100' },
    { label: language === 'fr' ? 'Total' : 'Total', value: consultations.length, icon: HiOutlineClipboardList, color: 'text-primary-600 bg-primary-100' },
  ];

  const quickActions = [
    { label: language === 'fr' ? 'Nouvelle Consultation' : 'New Visit', icon: HiOutlineChatAlt2, onClick: () => navigate('/patient/consultation'), color: 'from-primary-600 to-accent-500' },
    { label: language === 'fr' ? 'Mon Historique' : 'My History', icon: HiOutlineCalendar, onClick: () => navigate('/patient/history'), color: 'from-blue-500 to-indigo-500' },
    { label: language === 'fr' ? 'AI Assistant' : 'AI Assistant', icon: HiOutlineHeart, onClick: () => window.dispatchEvent(new CustomEvent('toggle-ai')), color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 lg:space-y-6 pb-4">
      {/* Welcome + Quick actions */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Bienvenue' : 'Welcome'}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-xs lg:text-sm text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Votre tableau de bord santé' : 'Your health dashboard'}
          </p>
        </div>
        <DoctorIllustration className="h-16 w-16 lg:h-20 lg:w-20" />
      </motion.div>

      {/* Health Tips */}
      <motion.div variants={item}>
        <HealthTips />
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-3 gap-2 lg:gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              whileHover={{ y: -2 }}
              className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 flex flex-col items-center text-center py-3 lg:py-4 px-2"
            >
              <div className={`h-8 w-8 lg:h-10 lg:w-10 rounded-lg ${stat.color} flex items-center justify-center mb-1.5 lg:mb-2`}>
                <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
              <p className="text-lg lg:text-xl font-bold text-secondary-900 dark:text-white">{stat.value}</p>
              <p className="text-[10px] lg:text-xs text-secondary-500 dark:text-secondary-400">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div variants={item} className="grid grid-cols-3 gap-2 lg:gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={action.onClick}
              className="relative p-3 lg:p-4 rounded-xl lg:rounded-2xl text-white overflow-hidden shadow-lg"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color}`} />
              <div className="relative z-10 flex flex-col items-center text-center">
                <Icon className="h-5 w-5 lg:h-6 lg:w-6 mb-1" />
                <span className="text-[10px] lg:text-xs font-medium leading-tight">{action.label}</span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Recent Consultations */}
      <motion.div variants={item} className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <h2 className="text-base lg:text-lg font-semibold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Consultations Récentes' : 'Recent Consultations'}
          </h2>
          <button
            onClick={() => navigate('/patient/history')}
            className="text-xs lg:text-sm text-primary-600 font-medium flex items-center space-x-1"
          >
            <span>{language === 'fr' ? 'Tout voir' : 'View all'}</span>
            <HiOutlineArrowRight className="h-3 w-3 lg:h-4 lg:w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8 lg:py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-8 w-8 rounded-full border-3 border-primary-200 border-t-primary-600"
            />
          </div>
        ) : consultations.length === 0 ? (
          <div className="text-center py-8 lg:py-12 text-secondary-400 dark:text-secondary-500">
            <HiOutlineClipboardList className="h-10 w-10 lg:h-14 lg:w-14 mx-auto mb-2 lg:mb-3 opacity-50" />
            <p className="text-sm lg:text-base font-medium mb-2">
              {language === 'fr' ? 'Aucune consultation' : 'No consultations yet'}
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/patient/consultation')}
              className="btn-primary text-xs lg:text-sm py-2 px-4"
            >
              {language === 'fr' ? 'Démarrer une consultation' : 'Start Your First Visit'}
            </motion.button>
          </div>
        ) : (
          <div className="space-y-1.5 lg:space-y-2">
            {consultations.slice(0, 5).map((c) => (
              <motion.div
                key={c.id}
                whileHover={{ x: 3 }}
                className="flex items-center justify-between p-2.5 lg:p-3 bg-gray-50 dark:bg-secondary-700/50 rounded-xl cursor-pointer"
                onClick={() => navigate('/patient/history')}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs lg:text-sm text-secondary-900 dark:text-white truncate">
                    {c.symptoms.slice(0, 50)}{c.symptoms.length > 50 ? '...' : ''}
                  </p>
                  <p className="text-[10px] lg:text-xs text-secondary-400 dark:text-secondary-500 mt-0.5">
                    {new Date(c.created_at).toLocaleDateString()} · {c.channel}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-medium flex-shrink-0 ml-2 ${
                  c.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  c.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  c.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {c.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div variants={item} className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-6">
        <EmergencyContacts />
      </motion.div>

      {/* USSD Banner */}
      <motion.div variants={item} className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-primary-100 dark:border-primary-800">
        <div className="flex items-start space-x-3">
          <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center flex-shrink-0">
            <HiOutlinePhone className="h-4 w-4 lg:h-5 lg:w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm lg:text-base text-primary-800 dark:text-primary-200">
              {language === 'fr' ? 'Besoin d\'aide maintenant ?' : 'Need help now?'}
            </h3>
            <p className="text-xs lg:text-sm text-primary-600 dark:text-primary-300 mt-1">
              {language === 'fr'
                ? 'Composez le <strong>*800#</strong> pour une consultation USSD. Pas besoin d\'internet.'
                : 'Dial <strong>*800#</strong> on your phone for a USSD consultation. No internet needed.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Heartbeat decoration */}
      <motion.div variants={item} className="opacity-30">
        <HeartBeatIllustration className="w-full h-6 lg:h-8" />
      </motion.div>
    </motion.div>
  );
}
