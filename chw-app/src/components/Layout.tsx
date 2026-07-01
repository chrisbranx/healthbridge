import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineHome, HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineExclamationCircle, HiOutlineLogout } from 'react-icons/hi';
import { getPendingAdherenceCount } from '../services/db';
import { useState, useEffect } from 'react';

const nav = [
  { label: 'Home', path: '/', icon: HiOutlineHome },
  { label: 'Patients', path: '/patients', icon: HiOutlineUserGroup },
  { label: 'Tasks', path: '/tasks', icon: HiOutlineClipboardList },
  { label: 'Escalations', path: '/escalations', icon: HiOutlineExclamationCircle },
];

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      setPendingCount(await getPendingAdherenceCount());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hb_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-7">
      <div className="pb-20">
        {children}
      </div>

      {pendingCount > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-40">
          <div className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg text-center">
            {pendingCount} pending sync item(s) — will sync when online
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-2">
        <div className="flex items-center justify-around py-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                  isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs mt-0.5">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center py-1 px-3 rounded-lg text-gray-400 hover:text-red-500"
          >
            <HiOutlineLogout className="h-6 w-6" />
            <span className="text-xs mt-0.5">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
