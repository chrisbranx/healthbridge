import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chwApi } from '../services/api';
import { getCachedPatients, getCachedTasks, getCachedEscalations } from '../services/db';
import { HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineExclamationCircle, HiOutlineCheckCircle } from 'react-icons/hi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    loadData();
    window.addEventListener('online', loadData);
    return () => window.removeEventListener('online', loadData);
  }, []);

  async function loadData() {
    if (!navigator.onLine) {
      setOffline(true);
      const [patients, tasks, escalations] = await Promise.all([
        getCachedPatients(),
        getCachedTasks(),
        getCachedEscalations(),
      ]);
      setData({
        total_patients: patients.length,
        pending_tasks: tasks.filter((t: any) => t.status === 'pending').length,
        escalations: escalations.filter((e: any) => e.status === 'pending'),
      });
      setLoading(false);
      return;
    }

    setOffline(false);
    try {
      const { data } = await chwApi.dashboard();
      setData(data);
    } catch {
      const [patients, tasks, escalations] = await Promise.all([
        getCachedPatients(),
        getCachedTasks(),
        getCachedEscalations(),
      ]);
      setData({
        total_patients: patients.length,
        pending_tasks: tasks.filter((t: any) => t.status === 'pending').length,
        escalations: escalations.filter((e: any) => e.status === 'pending'),
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  const stats = [
    { label: 'Patients', value: data?.total_patients || 0, icon: HiOutlineUserGroup, color: 'text-blue-600 bg-blue-100', path: '/patients' },
    { label: 'Pending Tasks', value: data?.pending_tasks || 0, icon: HiOutlineClipboardList, color: 'text-yellow-600 bg-yellow-100', path: '/tasks' },
    { label: 'Escalations', value: data?.escalations?.length || 0, icon: HiOutlineExclamationCircle, color: 'text-red-600 bg-red-100', path: '/escalations' },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">CHW Dashboard</h1>
          {offline && <p className="text-xs text-yellow-600">Offline mode — showing cached data</p>}
        </div>
        <div className={`h-2 w-2 rounded-full ${offline ? 'bg-yellow-500' : 'bg-green-500'}`} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <div className="card flex flex-col items-center text-center py-3">
              <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          );
          return stat.path ? (
            <div key={stat.label} onClick={() => navigate(stat.path!)} className="cursor-pointer">{content}</div>
          ) : (
            <div key={stat.label}>{content}</div>
          );
        })}
      </div>

      <div className="card bg-primary-50 border-primary-100">
        <p className="text-sm text-primary-700">
          <strong>Tip:</strong> This app works offline. Data syncs automatically when you're back online.
        </p>
      </div>

      <div className="space-y-2">
        <button onClick={() => navigate('/patients')} className="btn-primary w-full">View My Patients</button>
        <button onClick={() => navigate('/tasks')} className="btn-secondary w-full">View Pending Tasks</button>
      </div>
    </div>
  );
}
