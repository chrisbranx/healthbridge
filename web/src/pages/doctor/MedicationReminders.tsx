import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCube, HiOutlinePlus, HiOutlineClock, HiOutlineBell } from 'react-icons/hi';

interface Reminder {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  reminder_time: string;
  channel: string;
  status: string;
  next_reminder_at: string;
}

export default function MedicationReminders() {
  const { language } = useLanguage();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newReminder, setNewReminder] = useState({
    patient_id: '', medication_name: '', dosage: '', frequency: '', reminder_time: '08:00', channel: 'sms', phone_number: '',
  });
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    loadReminders();
    api.get('/doctors/patients').then(({ data }) => setPatients(data || [])).catch(() => {});
  }, []);

  async function loadReminders() {
    try {
      const { data } = await api.get('/reminders');
      setReminders(data || []);
    } catch (err) { console.error(err); }
  }

  async function createReminder(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/reminders', newReminder);
      toast.success(language === 'fr' ? 'Rappel créé' : 'Reminder created');
      setShowCreate(false);
      loadReminders();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
  }

  async function toggleStatus(id: string, status: string) {
    const newStatus = status === 'active' ? 'paused' : 'active';
    try {
      await api.patch(`/reminders/${id}/status`, { status: newStatus });
      loadReminders();
    } catch (err) { console.error(err); }
  }

  const activeReminders = reminders.filter(r => r.status === 'active');
  const upcoming = activeReminders.filter(r => r.next_reminder_at).slice(0, 5);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Rappels de Médicaments' : 'Medication Reminders'}
          </h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Programmer des rappels SMS pour les patients' : 'Schedule SMS reminders for patients'}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><HiOutlinePlus className="h-5 w-5 mr-1" /> {language === 'fr' ? 'Rappel' : 'Reminder'}</button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card dark:bg-secondary-800 dark:border-secondary-700">
            <h2 className="font-semibold mb-3 dark:text-white flex items-center">
              <HiOutlineBell className="h-5 w-5 mr-2 text-primary-500" />
              {language === 'fr' ? `Rappels actifs (${activeReminders.length})` : `Active Reminders (${activeReminders.length})`}
            </h2>
            {reminders.length === 0 ? (
              <div className="text-center py-8 text-secondary-400">
                <HiOutlineBell className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{language === 'fr' ? 'Aucun rappel programmé' : 'No reminders scheduled'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reminders.map((r) => {
                  const patient = patients.find((p: any) => p.id === r.patient_id);
                  return (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <HiOutlineBell className="h-4 w-4 text-primary-500" />
                          <span className="font-medium text-sm dark:text-white">{r.medication_name}</span>
                          <span className="text-xs text-secondary-400">{r.dosage}</span>
                        </div>
                        <p className="text-xs text-secondary-500 mt-0.5">{patient?.name || 'Patient'} - {r.frequency} à {r.reminder_time}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'}`}>{r.status}</span>
                        <button onClick={() => toggleStatus(r.id, r.status)} className="text-xs text-primary-600 hover:underline">{r.status === 'active' ? (language === 'fr' ? 'Pause' : 'Pause') : (language === 'fr' ? 'Activer' : 'Activate')}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card dark:bg-secondary-800 dark:border-secondary-700">
            <h2 className="font-semibold mb-3 dark:text-white flex items-center">
              <HiOutlineClock className="h-5 w-5 mr-2 text-yellow-500" />
              {language === 'fr' ? 'À venir' : 'Upcoming'}
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-center py-6 text-secondary-400 text-sm">{language === 'fr' ? 'Aucun rappel à venir' : 'No upcoming reminders'}</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((r) => (
                  <div key={r.id} className="flex items-center space-x-2 p-2 border-l-2 border-primary-500">
                    <HiOutlineBell className="h-4 w-4 text-primary-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium dark:text-white">{r.medication_name} {r.dosage}</p>
                      <p className="text-xs text-secondary-400">{new Date(r.next_reminder_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4 dark:text-white">{language === 'fr' ? 'Nouveau rappel médicamenteux' : 'New Medication Reminder'}</h3>
            <form onSubmit={createReminder} className="space-y-3">
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Patient' : 'Patient'}</label>
                <select className="input dark:bg-secondary-700 dark:text-white" value={newReminder.patient_id} onChange={(e) => setNewReminder({ ...newReminder, patient_id: e.target.value })} required>
                  <option value="">{language === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                  {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name} - {p.phone}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Médicament' : 'Medication'}</label>
                  <input className="input dark:bg-secondary-700 dark:text-white" value={newReminder.medication_name} onChange={(e) => setNewReminder({ ...newReminder, medication_name: e.target.value })} required />
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Dosage' : 'Dosage'}</label>
                  <input className="input dark:bg-secondary-700 dark:text-white" value={newReminder.dosage} onChange={(e) => setNewReminder({ ...newReminder, dosage: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Fréquence' : 'Frequency'}</label>
                  <input className="input dark:bg-secondary-700 dark:text-white" value={newReminder.frequency} onChange={(e) => setNewReminder({ ...newReminder, frequency: e.target.value })} required />
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Heure' : 'Time'}</label>
                  <input type="time" className="input dark:bg-secondary-700 dark:text-white" value={newReminder.reminder_time} onChange={(e) => setNewReminder({ ...newReminder, reminder_time: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Canal' : 'Channel'}</label>
                  <select className="input dark:bg-secondary-700 dark:text-white" value={newReminder.channel} onChange={(e) => setNewReminder({ ...newReminder, channel: e.target.value })}>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Téléphone' : 'Phone'}</label>
                  <input className="input dark:bg-secondary-700 dark:text-white" value={newReminder.phone_number} onChange={(e) => setNewReminder({ ...newReminder, phone_number: e.target.value })} />
                </div>
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center">{language === 'fr' ? 'Créer' : 'Create'}</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 justify-center">{language === 'fr' ? 'Annuler' : 'Cancel'}</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}
