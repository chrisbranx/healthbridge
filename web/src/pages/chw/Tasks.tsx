import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { chwApi } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi';

interface Task {
  id: string;
  title: string;
  description: string;
  task_type: string;
  status: string;
  priority: string;
  due_date: string;
  created_at: string;
  patient: { name: string; phone: string; village: string };
  consultation: { symptoms: string; diagnosis: string };
}

export default function CHWTasks() {
  const { language } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    try {
      const { data } = await chwApi.tasks();
      setTasks(data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await chwApi.updateTask(id, { status });
      toast.success(`${language === 'fr' ? 'Tâche' : 'Task'} ${status === 'completed' ? (language === 'fr' ? 'terminée' : 'completed') : status === 'in_progress' ? (language === 'fr' ? 'en cours' : 'in progress') : status}`);
      loadTasks();
    } catch (err: any) {
      toast.error(language === 'fr' ? 'Échec de la mise à jour de la tâche' : 'Failed to update task');
    }
  }

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  if (loading) return <div className="text-center py-12 text-secondary-400 dark:text-secondary-300">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">{language === 'fr' ? 'Tâches' : 'Tasks'}</h1>
        <p className="text-sm lg:text-base text-secondary-500 dark:text-secondary-400">{language === 'fr' ? 'Tâches de suivi et assignments de soins aux patients' : 'Follow-up tasks and patient care assignments'}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center justify-between overflow-x-auto">
        <div className="flex space-x-2">
          {['all', 'pending', 'in_progress', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize whitespace-nowrap ${
                filter === f ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-gray-100 text-secondary-600 hover:bg-gray-200 dark:bg-secondary-700 dark:text-secondary-400 dark:hover:bg-secondary-600'
              }`}
            >
              {f === 'all' ? (language === 'fr' ? `Tout (${tasks.length})` : `All (${tasks.length})`) : f === 'pending' ? (language === 'fr' ? `En attente (${tasks.filter(t => t.status === f).length})` : `Pending (${tasks.filter(t => t.status === f).length})`) : f === 'in_progress' ? (language === 'fr' ? `En cours (${tasks.filter(t => t.status === f).length})` : `In Progress (${tasks.filter(t => t.status === f).length})`) : f === 'completed' ? (language === 'fr' ? `Terminé (${tasks.filter(t => t.status === f).length})` : `Completed (${tasks.filter(t => t.status === f).length})`) : `${f} (${tasks.filter(t => t.status === f).length})`}
            </button>
          ))}
        </div>
      </motion.div>

      {pendingCount > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card bg-yellow-50 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            {language === 'fr' ? (
              <>Vous avez <strong>{pendingCount}</strong> tâche(s) en attente. Accomplissez-les pour assurer le suivi des patients.</>
            ) : (
              <>You have <strong>{pendingCount}</strong> pending task(s). Complete them to ensure patient follow-through.</>
            )}
          </p>
        </motion.div>
      )}

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-secondary-400 dark:text-secondary-500">
          <HiOutlineClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">{language === 'fr' ? 'Aucune tâche trouvée' : 'No tasks found'}</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
          {filtered.map((task) => (
            <div key={task.id} className="card dark:bg-secondary-800 dark:border-secondary-700">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold dark:text-white">{task.title}</h3>
                    <span className={`badge ${
                      task.priority === 'critical' ? 'badge-escalated' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                      task.priority === 'medium' ? 'badge-pending' : 'bg-gray-100 text-gray-600 dark:bg-secondary-700 dark:text-secondary-400'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="badge bg-gray-100 text-gray-600 capitalize dark:bg-secondary-700 dark:text-secondary-400">{task.task_type.replace('_', ' ')}</span>
                  </div>

                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">{task.description}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary-400 dark:text-secondary-500">
                    <span>{language === 'fr' ? 'Patient' : 'Patient'}: {task.patient?.name || (language === 'fr' ? 'Inconnu' : 'Unknown')}</span>
                    {task.patient?.village && <span>📍 {task.patient.village}</span>}
                    {task.due_date && (
                      <span className="flex items-center">
                        <HiOutlineClock className="h-3 w-3 mr-1" />
                        {language === 'fr' ? 'Échéance' : 'Due'}: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {task.consultation && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-secondary-700/50 rounded text-xs text-secondary-500 dark:text-secondary-400">
                      <p>{language === 'fr' ? 'Symptômes' : 'Symptoms'}: {task.consultation.symptoms}</p>
                      {task.consultation.diagnosis && <p>{language === 'fr' ? 'Diagnostic' : 'Diagnosis'}: {task.consultation.diagnosis}</p>}
                    </div>
                  )}
                </div>

                <div className="shrink-0 space-y-1">
                  {task.status === 'pending' && (
                    <button onClick={() => updateStatus(task.id, 'in_progress')} className="btn-primary text-sm w-full sm:w-auto">
                      {language === 'fr' ? 'Commencer' : 'Start'}
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button onClick={() => updateStatus(task.id, 'completed')} className="btn-primary text-sm w-full sm:w-auto">
                      <HiOutlineCheckCircle className="h-4 w-4 mr-1" />
                      {language === 'fr' ? 'Terminer' : 'Complete'}
                    </button>
                  )}
                  {task.status === 'completed' && (
                    <span className="badge-resolved">{language === 'fr' ? 'Terminé' : 'Completed'}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
