import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBell, HiOutlineX, HiOutlineClock, HiOutlineExclamationCircle, HiOutlineCheckCircle, HiOutlineInformationCircle, HiOutlineHeart, HiOutlinePhone } from 'react-icons/hi';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { notificationsApi } from '../services/api';

interface Notification {
  id: string;
  type: 'appointment' | 'alert' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
  read: boolean;
  created_at: string;
}

const typeConfig = {
  appointment: { icon: HiOutlineClock, color: 'text-blue-600 bg-blue-100' },
  alert: { icon: HiOutlineExclamationCircle, color: 'text-red-600 bg-red-100' },
  info: { icon: HiOutlineInformationCircle, color: 'text-primary-600 bg-primary-100' },
  success: { icon: HiOutlineCheckCircle, color: 'text-green-600 bg-green-100' },
};

function formatTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      notificationsApi.list()
        .then(({ data }) => setNotifications(data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40"
          />
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 z-50 bg-white dark:bg-secondary-800 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-secondary-700">
              <div className="flex items-center space-x-2">
                <HiOutlineBell className="h-5 w-5 text-primary-600" />
                <h2 className="font-bold text-secondary-900 dark:text-white">
                  {language === 'fr' ? 'Notifications' : 'Notifications'}
                </h2>
                {unreadCount > 0 && (
                  <span className="bg-primary-100 text-primary-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary-600 font-medium hover:text-primary-700">
                    {language === 'fr' ? 'Tout lu' : 'Mark all read'}
                  </button>
                )}
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700 text-secondary-400">
                  <HiOutlineX className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="h-8 w-8 rounded-full border-3 border-primary-200 border-t-primary-600"
                  />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-secondary-400">
                  <HiOutlineBell className="h-12 w-12 mb-2" />
                  <p className="text-sm">{language === 'fr' ? 'Aucune notification' : 'No notifications'}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-secondary-700">
                  {notifications.map((n, i) => {
                    const config = typeConfig[n.type] || typeConfig.info;
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => !n.read && markRead(n.id)}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-secondary-700/50 transition-colors cursor-pointer ${!n.read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                      >
                        <div className="flex space-x-3">
                          <div className={`h-9 w-9 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className={`text-sm ${!n.read ? 'font-bold text-secondary-900 dark:text-white' : 'font-medium text-secondary-700 dark:text-secondary-300'}`}>
                                {n.title}
                              </p>
                              {!n.read && <span className="h-2 w-2 rounded-full bg-primary-500 flex-shrink-0 ml-2 mt-1.5" />}
                            </div>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-secondary-400 mt-1.5 flex items-center space-x-1">
                              <HiOutlineClock className="h-3 w-3" />
                              <span>{formatTime(n.created_at)}</span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-secondary-700 bg-gray-50 dark:bg-secondary-900/50">
              <div className="flex items-center justify-between text-xs text-secondary-400">
                <span className="flex items-center space-x-1">
                  <HiOutlineHeart className="h-3 w-3 text-primary-500" />
                  <span>{language === 'fr' ? 'Santé' : 'HealthBridge'}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <HiOutlinePhone className="h-3 w-3" />
                  <span>*800#</span>
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
