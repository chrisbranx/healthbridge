import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  HiOutlineCog, HiOutlineGlobe, HiOutlineSun, HiOutlineMoon,
  HiOutlineBell, HiOutlineLogout, HiOutlineInformationCircle,
} from 'react-icons/hi';

export default function Settings() {
  const { language, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('hb-dark') === 'true');
  const [notifPrefs, setNotifPrefs] = useState({
    consultations: true,
    reminders: true,
    promotions: false,
  });

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('hb-dark', String(next));
    document.documentElement.classList.toggle('dark', next);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleClass = (on: boolean) =>
    `relative w-10 h-5 rounded-full transition-colors ${on ? 'bg-primary-500' : 'bg-gray-300 dark:bg-secondary-600'}`;
  const knobClass = "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-4 lg:space-y-6 pb-6">
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
          <HiOutlineCog className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Paramètres' : 'Settings'}
          </h1>
          <p className="text-xs text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Personnalisez votre expérience' : 'Customize your experience'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 overflow-hidden">
        <div className="px-4 lg:px-6 py-3 border-b border-gray-100 dark:border-secondary-700">
          <h2 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 flex items-center space-x-2">
            <HiOutlineGlobe className="h-4 w-4" />
            <span>{language === 'fr' ? 'Langue' : 'Language'}</span>
          </h2>
        </div>
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                {language === 'fr' ? 'Langue de l\'application' : 'App Language'}
              </p>
              <p className="text-xs text-secondary-500 mt-0.5">{language === 'en' ? 'English' : 'Français'}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold rounded-lg uppercase"
            >
              {language === 'en' ? 'FR' : 'EN'}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 overflow-hidden">
        <div className="px-4 lg:px-6 py-3 border-b border-gray-100 dark:border-secondary-700">
          <h2 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 flex items-center space-x-2">
            {darkMode ? <HiOutlineMoon className="h-4 w-4" /> : <HiOutlineSun className="h-4 w-4" />}
            <span>{language === 'fr' ? 'Apparence' : 'Appearance'}</span>
          </h2>
        </div>
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                {language === 'fr' ? 'Mode sombre' : 'Dark Mode'}
              </p>
              <p className="text-xs text-secondary-500 mt-0.5">
                {darkMode
                  ? (language === 'fr' ? 'Actuellement activé' : 'Currently enabled')
                  : (language === 'fr' ? 'Actuellement désactivé' : 'Currently disabled')}
              </p>
            </div>
            <button onClick={toggleDarkMode} className={toggleClass(darkMode)}>
              <motion.div className={knobClass} animate={{ x: darkMode ? 20 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 overflow-hidden">
        <div className="px-4 lg:px-6 py-3 border-b border-gray-100 dark:border-secondary-700">
          <h2 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 flex items-center space-x-2">
            <HiOutlineBell className="h-4 w-4" />
            <span>{language === 'fr' ? 'Notifications' : 'Notifications'}</span>
          </h2>
        </div>
        <div className="p-4 lg:p-6 space-y-4">
          {[
            { key: 'consultations' as const, label: language === 'fr' ? 'Consultations' : 'Consultations', desc: language === 'fr' ? 'Notifications de consultation et de réponse' : 'Consultation and response notifications' },
            { key: 'reminders' as const, label: language === 'fr' ? 'Rappels' : 'Reminders', desc: language === 'fr' ? 'Rappels de médicaments et de rendez-vous' : 'Medication and appointment reminders' },
            { key: 'promotions' as const, label: language === 'fr' ? 'Promotions' : 'Promotions', desc: language === 'fr' ? 'Actualités et offres santé' : 'Health news and offers' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">{item.label}</p>
                <p className="text-xs text-secondary-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                className={toggleClass(notifPrefs[item.key])}
              >
                <motion.div className={knobClass} animate={{ x: notifPrefs[item.key] ? 20 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 overflow-hidden">
        <div className="px-4 lg:px-6 py-3 border-b border-gray-100 dark:border-secondary-700">
          <h2 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 flex items-center space-x-2">
            <HiOutlineInformationCircle className="h-4 w-4" />
            <span>{language === 'fr' ? 'À propos' : 'About'}</span>
          </h2>
        </div>
        <div className="p-4 lg:p-6 space-y-2 text-sm text-secondary-600 dark:text-secondary-400">
          <div className="flex justify-between">
            <span>{language === 'fr' ? 'Version' : 'Version'}</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>{language === 'fr' ? 'Compte' : 'Account'}</span>
            <span className="font-medium">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>{language === 'fr' ? 'Rôle' : 'Role'}</span>
            <span className="font-medium capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between">
            <span>{language === 'fr' ? 'Téléphone' : 'Phone'}</span>
            <span className="font-medium">{user?.phone}</span>
          </div>
        </div>
      </div>

      <motion.button
        onClick={handleLogout}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center space-x-2 py-3 bg-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-red-600 transition-all"
      >
        <HiOutlineLogout className="h-5 w-5" />
        <span>{language === 'fr' ? 'Déconnexion' : 'Logout'}</span>
      </motion.button>
    </motion.div>
  );
}
