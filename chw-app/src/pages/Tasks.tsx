import { useState, useEffect } from 'react';
import { chwApi } from '../services/api';
import { getCachedTasks, cacheTasks } from '../services/db';
import toast from 'react-hot-toast';
import { HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineRefresh } from 'react-icons/hi';

interface Task {
  id: string; title: string; description: string; status: string; priority: string;
  patient: { name: string; village: string };
  created_at: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    if (!navigator.onLine) {
      setTasks(await getCachedTasks());
      setLoading(false);
      return;
    }
    try {
      const { data } = await chwApi.tasks();
      setTasks(data || []);
      await cacheTasks(data || []);
    } catch {
      setTasks(await getCachedTasks());
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    if (!navigator.onLine) {
      toast.error('Cannot update while offline');
      return;
    }
    try {
      await chwApi.updateTask(id, { status });
      toast.success(`Task ${status}`);
      loadTasks();
    } catch {
      toast.error('Failed to update');
    }
  }

  const pending = tasks.filter(t => t.status !== 'completed');

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Tasks</h1>
          <p className="text-sm text-gray-500">{pending.length} pending</p>
        </div>
        <button onClick={loadTasks} className="btn-secondary p-2">
          <HiOutlineRefresh className="h-5 w-5" />
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <HiOutlineClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No tasks</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-sm">{t.title}</h3>
                    <span className={`badge ${
                      t.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      t.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{t.priority}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{t.description}</p>
                  <p className="text-xs text-gray-400">
                    {t.patient?.name} | {t.patient?.village || ''}
                  </p>
                </div>
                <div className="ml-2">
                  {t.status === 'pending' && (
                    <button onClick={() => updateStatus(t.id, 'in_progress')} className="btn-primary text-xs py-1 px-2">Start</button>
                  )}
                  {t.status === 'in_progress' && (
                    <button onClick={() => updateStatus(t.id, 'completed')} className="btn-primary text-xs py-1 px-2">
                      <HiOutlineCheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  {t.status === 'completed' && (
                    <span className="badge bg-green-100 text-green-700">Done</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
