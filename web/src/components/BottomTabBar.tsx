import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { HiOutlineHome, HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineChatAlt2, HiOutlineExclamationCircle, HiOutlineChartBar, HiOutlineCalendar, HiOutlineUsers, HiOutlineOfficeBuilding, HiOutlineHeart } from 'react-icons/hi';

const tabConfig: Record<string, { label: string; icon: any; path: string }[]> = {
  patient: [
    { label: 'Dashboard', icon: HiOutlineHome, path: '/patient/dashboard' },
    { label: 'Consult', icon: HiOutlineChatAlt2, path: '/patient/consultation' },
    { label: 'History', icon: HiOutlineCalendar, path: '/patient/history' },
  ],
  doctor: [
    { label: 'Dashboard', icon: HiOutlineHome, path: '/doctor/dashboard' },
    { label: 'Cases', icon: HiOutlineClipboardList, path: '/doctor/consultations' },
    { label: 'Patients', icon: HiOutlineUserGroup, path: '/doctor/patients' },
  ],
  chw: [
    { label: 'Home', icon: HiOutlineHome, path: '/chw/dashboard' },
    { label: 'Patients', icon: HiOutlineUserGroup, path: '/chw/patients' },
    { label: 'Tasks', icon: HiOutlineClipboardList, path: '/chw/tasks' },
    { label: 'Alert', icon: HiOutlineExclamationCircle, path: '/chw/escalations' },
  ],
  admin: [
    { label: 'Home', icon: HiOutlineHome, path: '/admin/dashboard' },
    { label: 'Users', icon: HiOutlineUsers, path: '/admin/users' },
    { label: 'Clinics', icon: HiOutlineOfficeBuilding, path: '/admin/clinics' },
    { label: 'Analytics', icon: HiOutlineChartBar, path: '/admin/analytics' },
  ],
};

export default function BottomTabBar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const tabs = tabConfig[user.role] || tabConfig.patient;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-lg border-t border-gray-200 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center justify-center h-full px-3 py-1 min-w-0 transition-colors ${
                isActive ? 'text-primary-600' : 'text-secondary-400 hover:text-secondary-600'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isActive && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-primary-500"
                  />
                )}
              </div>
              <span className="text-[10px] font-medium mt-0.5 truncate max-w-full">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
