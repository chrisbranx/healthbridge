import { ReactNode, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { notificationsApi } from '../services/api';
import Logo from './Logo';
import NotificationsPanel from './NotificationsPanel';
import {
  HiOutlineHome, HiOutlineUserGroup, HiOutlineClipboardList,
  HiOutlineChatAlt2, HiOutlineExclamationCircle, HiOutlineChartBar,
  HiOutlineLogout, HiOutlineMenu, HiOutlineX, HiOutlineGlobe,
  HiOutlinePhone, HiOutlineCalendar, HiOutlineUsers, HiOutlineOfficeBuilding,
  HiOutlineBell, HiOutlineHeart, HiOutlineCog, HiOutlineQuestionMarkCircle,
  HiOutlineChevronRight, HiOutlineSun, HiOutlineMoon, HiOutlineUser,
} from 'react-icons/hi';

const roleConfig: Record<string, {
  name: string; color: string; accent: string;
  nav: { label: string; path: string; icon: any }[]
}> = {
  patient: {
    name: 'Patient Portal', color: 'from-primary-600 to-accent-500', accent: 'bg-primary-600',
    nav: [
      { label: 'Dashboard', path: '/patient/dashboard', icon: HiOutlineHome },
      { label: 'Consult', path: '/patient/consultation', icon: HiOutlineChatAlt2 },
      { label: 'History', path: '/patient/history', icon: HiOutlineCalendar },
    ],
  },
  doctor: {
    name: 'Doctor Portal', color: 'from-primary-600 to-accent-500', accent: 'bg-primary-600',
    nav: [
      { label: 'Dashboard', path: '/doctor/dashboard', icon: HiOutlineHome },
      { label: 'Cases', path: '/doctor/consultations', icon: HiOutlineClipboardList },
      { label: 'Patients', path: '/doctor/patients', icon: HiOutlineUserGroup },
      { label: 'Analytics', path: '/doctor/analytics', icon: HiOutlineChartBar },
      { label: 'Scheduling', path: '/doctor/scheduling', icon: HiOutlineCalendar },
      { label: 'Video Calls', path: '/doctor/video', icon: HiOutlinePhone },
      { label: 'Reminders', path: '/doctor/reminders', icon: HiOutlineBell },
      { label: 'Inventory', path: '/doctor/inventory', icon: HiOutlineOfficeBuilding },
      { label: 'Health Alerts', path: '/doctor/alerts', icon: HiOutlineExclamationCircle },
      { label: 'CHW Scores', path: '/doctor/chw-performance', icon: HiOutlineChartBar },
    ],
  },
  chw: {
    name: 'CHW Toolkit', color: 'from-accent-500 to-primary-600', accent: 'bg-accent-500',
    nav: [
      { label: 'Home', path: '/chw/dashboard', icon: HiOutlineHome },
      { label: 'Patients', path: '/chw/patients', icon: HiOutlineUserGroup },
      { label: 'Tasks', path: '/chw/tasks', icon: HiOutlineClipboardList },
      { label: 'Alerts', path: '/chw/escalations', icon: HiOutlineExclamationCircle },
    ],
  },
  admin: {
    name: 'Admin', color: 'from-primary-800 to-primary-700', accent: 'bg-primary-800',
    nav: [
      { label: 'Home', path: '/admin/dashboard', icon: HiOutlineHome },
      { label: 'Users', path: '/admin/users', icon: HiOutlineUsers },
      { label: 'Clinics', path: '/admin/clinics', icon: HiOutlineOfficeBuilding },
      { label: 'Analytics', path: '/admin/analytics', icon: HiOutlineChartBar },
    ],
  },
};

const bottomTabConfig: Record<string, { label: string; icon: any; path: string }[]> = {
  patient: [
    { label: 'Home', icon: HiOutlineHome, path: '/patient/dashboard' },
    { label: 'Consult', icon: HiOutlineChatAlt2, path: '/patient/consultation' },
    { label: 'History', icon: HiOutlineCalendar, path: '/patient/history' },
  ],
  doctor: [
    { label: 'Home', icon: HiOutlineHome, path: '/doctor/dashboard' },
    { label: 'Cases', icon: HiOutlineClipboardList, path: '/doctor/consultations' },
    { label: 'Patients', icon: HiOutlineUserGroup, path: '/doctor/patients' },
    { label: 'Analytics', icon: HiOutlineChartBar, path: '/doctor/analytics' },
  ],
  chw: [
    { label: 'Home', icon: HiOutlineHome, path: '/chw/dashboard' },
    { label: 'Patients', icon: HiOutlineUserGroup, path: '/chw/patients' },
    { label: 'Tasks', icon: HiOutlineClipboardList, path: '/chw/tasks' },
    { label: 'Alerts', icon: HiOutlineExclamationCircle, path: '/chw/escalations' },
  ],
  admin: [
    { label: 'Home', icon: HiOutlineHome, path: '/admin/dashboard' },
    { label: 'Users', icon: HiOutlineUsers, path: '/admin/users' },
    { label: 'Clinics', icon: HiOutlineOfficeBuilding, path: '/admin/clinics' },
    { label: 'Data', icon: HiOutlineChartBar, path: '/admin/analytics' },
  ],
};

const tabSequence: Record<string, string[]> = {};
for (const role of Object.keys(bottomTabConfig)) {
  tabSequence[role] = bottomTabConfig[role].map(t => t.path);
}

const pageSlide = (direction: number) => ({
  initial: { opacity: 0, x: direction > 0 ? 80 : -80 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: direction > 0 ? -80 : 80 },
});

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('hb-dark') === 'true');
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const navDirRef = useRef(1);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('hb-dark', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    notificationsApi.unreadCount().then(({ data }) => setNotificationCount(data.count)).catch(() => {});
  }, []);

  useEffect(() => {
    const tabs = tabSequence[user?.role || ''] || [];
    const prevIdx = tabs.indexOf(prevPathRef.current);
    const currIdx = tabs.indexOf(location.pathname);
    if (prevIdx !== -1 && currIdx !== -1) {
      navDirRef.current = currIdx > prevIdx ? 1 : -1;
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname, user?.role]);

  if (!user) return null;

  const config = roleConfig[user.role];
  const tabs = bottomTabConfig[user.role] || [];
  const currentTabIdx = tabs.findIndex(t => t.path === location.pathname);
  const dir = navDirRef.current;

  const slideVariant = pageSlide(dir);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-secondary-900">
      {/* ===== TOP BAR ===== */}
      <header className="h-14 lg:h-16 bg-white dark:bg-secondary-800 border-b border-gray-100 dark:border-secondary-700 flex items-center justify-between px-3 lg:px-6 sticky top-0 z-30 safe-area-top">
        <div className="flex items-center space-x-2 lg:space-x-4">
          <button
            className="lg:hidden p-2 -ml-1 rounded-xl text-secondary-500 hover:bg-gray-100 dark:hover:bg-secondary-700 active:scale-95 transition-all"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <HiOutlineMenu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center space-x-2">
            <Logo size={16} showText={false} animated={false} />
            <span className="hidden sm:block text-sm font-semibold text-secondary-700 dark:text-secondary-200">
              {config.nav.find(n => n.path === location.pathname)?.label || config.name}
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-1 lg:space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
            onClick={toggleLanguage}
            className="flex items-center space-x-1 px-2 lg:px-2.5 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
          >
            <HiOutlineGlobe className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
            <span className="text-[11px] lg:text-xs font-bold text-primary-700 dark:text-primary-400 uppercase">{language}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
            onClick={() => setDarkMode(!darkMode)}
            className="hidden sm:flex p-1.5 rounded-lg text-secondary-400 hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors"
          >
            {darkMode ? <HiOutlineSun className="h-4 w-4" /> : <HiOutlineMoon className="h-4 w-4" />}
          </motion.button>

          <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-secondary-400 bg-gray-50 dark:bg-secondary-700 px-2.5 py-1.5 rounded-lg">
            <HiOutlinePhone className="h-3 w-3" />
            <span>*800#</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
            onClick={() => setNotificationsPanelOpen(true)}
            className="relative p-1.5 rounded-lg text-secondary-400 hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors"
          >
            <HiOutlineBell className="h-5 w-5" />
            {notificationCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
              >
                {notificationCount}
              </motion.span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/${user.role}/profile`)}
            className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-800 dark:to-primary-700 flex items-center justify-center cursor-pointer border-2 border-primary-200 dark:border-primary-600"
          >
            <span className="text-primary-700 dark:text-primary-200 font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
          </motion.button>
        </div>
      </header>

      {/* ===== CONTENT ===== */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-3 lg:px-6 py-4 lg:py-6 max-w-7xl w-full mx-auto pb-20 lg:pb-8">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={location.pathname}
              custom={dir}
              variants={slideVariant}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ===== MOBILE BOTTOM TABS ===== */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/90 dark:bg-secondary-800/90 backdrop-blur-xl border-t border-gray-200 dark:border-secondary-700 lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-14 px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`relative flex flex-col items-center justify-center h-full px-2 py-1 min-w-0 flex-1 transition-colors ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-400 dark:text-secondary-500 hover:text-secondary-600'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {isActive && (
                    <motion.div
                      layoutId="tabIndicator"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-primary-500"
                    />
                  )}
                </div>
                <span className="text-[10px] font-medium mt-0.5 truncate max-w-full">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ===== NOTIFICATIONS PANEL ===== */}
      <NotificationsPanel open={notificationsPanelOpen} onClose={() => setNotificationsPanelOpen(false)} />

      {/* ===== MOBILE SIDEBAR DRAWER ===== */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-secondary-800 shadow-2xl flex flex-col"
            >
              <div className={`bg-gradient-to-r ${config.color} p-5`}>
                <div className="flex items-center justify-between">
                  <Logo size={18} showText animated={false} />
                  <button onClick={() => setSidebarOpen(false)} className="text-white/80 hover:text-white p-1">
                    <HiOutlineX className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-white/70 text-xs mt-1.5">{config.name}</p>
              </div>

              <div className="px-4 py-4 border-b border-gray-100 dark:border-secondary-700">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-800 dark:to-primary-700 flex items-center justify-center">
                    <span className="text-primary-700 dark:text-primary-200 font-bold text-lg">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-700 dark:text-secondary-200 truncate">{user.name}</p>
                    <p className="text-[11px] text-secondary-400 dark:text-secondary-500 capitalize">{user.role} · {language === 'en' ? 'English' : 'Français'}</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                {config.nav.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                          : 'text-secondary-600 dark:text-secondary-400 hover:bg-gray-50 dark:hover:bg-secondary-700'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : ''}`} />
                      <span>{item.label}</span>
                      {isActive && <motion.div layoutId="activeNav" className="ml-auto h-2 w-2 rounded-full bg-primary-500" />}
                    </Link>
                  );
                })}

                <div className="border-t border-gray-100 dark:border-secondary-700 my-3" />

                <button
                  onClick={() => { setSidebarOpen(false); setNotificationsPanelOpen(true); }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:bg-gray-50 dark:hover:bg-secondary-700 transition-colors"
                >
                  <HiOutlineBell className="h-5 w-5" />
                  <span>Notifications</span>
                  <HiOutlineChevronRight className="h-4 w-4 ml-auto text-secondary-300" />
                </button>
                <Link
                  to={`/${user.role}/help`}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === `/${user.role}/help`
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-secondary-600 dark:text-secondary-400 hover:bg-gray-50 dark:hover:bg-secondary-700'
                  }`}
                >
                  <HiOutlineQuestionMarkCircle className="h-5 w-5" />
                  <span>Help & Support</span>
                  <HiOutlineChevronRight className="h-4 w-4 ml-auto text-secondary-300" />
                </Link>
                <Link
                  to={`/${user.role}/settings`}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === `/${user.role}/settings`
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-secondary-600 dark:text-secondary-400 hover:bg-gray-50 dark:hover:bg-secondary-700'
                  }`}
                >
                  <HiOutlineCog className="h-5 w-5" />
                  <span>Settings</span>
                  <HiOutlineChevronRight className="h-4 w-4 ml-auto text-secondary-300" />
                </Link>

                <div className="border-t border-gray-100 dark:border-secondary-700 my-3" />

                <button
                  onClick={toggleLanguage}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:bg-gray-50 dark:hover:bg-secondary-700 transition-colors"
                >
                  <HiOutlineGlobe className="h-5 w-5" />
                  <span>{language === 'en' ? 'Switch to French' : 'Switch to English'}</span>
                  <span className="ml-auto text-xs bg-gray-100 dark:bg-secondary-700 px-2 py-0.5 rounded-full uppercase font-bold">{language}</span>
                </button>

                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1"
                >
                  <HiOutlineLogout className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </nav>

              <div className="p-3 border-t border-gray-100 dark:border-secondary-700">
                <div className="flex items-center space-x-2 text-xs text-secondary-400 justify-center">
                  <HiOutlinePhone className="h-3 w-3" />
                  <span>Emergency: *800#</span>
                  <span className="mx-2">·</span>
                  <HiOutlineHeart className="h-3 w-3 text-primary-500" />
                  <span>HealthBridge v1.0</span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
