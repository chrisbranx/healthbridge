import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import toast from 'react-hot-toast';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineUser, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

interface AppointmentSlot {
  id: string;
  doctor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  max_patients: number;
  booked_count: number;
}

interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  slot_id: string;
  reason: string;
  status: string;
  created_at: string;
}

export default function Scheduling() {
  const { language } = useLanguage();
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCreateSlot, setShowCreateSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: '', start_time: '09:00', end_time: '17:00', max_patients: 10 });
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    loadSlots();
    loadAppointments();
    loadPatients();

    const socket = getSocket();
    socket?.on('scheduling:new-appointment', (data: any) => {
      toast.success(language === 'fr' ? 'Nouveau rendez-vous reçu' : 'New appointment received');
      loadAppointments();
    });
    return () => { socket?.off('scheduling:new-appointment'); };
  }, [selectedDate]);

  async function loadSlots() {
    try {
      const { data } = await api.get('/scheduling/slots', { params: { date: selectedDate } });
      setSlots(data || []);
    } catch (err) { console.error(err); }
  }

  async function loadAppointments() {
    try {
      const { data } = await api.get('/scheduling/appointments');
      setAppointments(data || []);
    } catch (err) { console.error(err); }
  }

  async function loadPatients() {
    try {
      const { data } = await api.get('/doctors/patients');
      setPatients(data || []);
    } catch (err) { console.error(err); }
  }

  async function createSlot(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/scheduling/slots', newSlot);
      toast.success(language === 'fr' ? 'Créneau créé' : 'Slot created');
      setShowCreateSlot(false);
      loadSlots();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error');
    }
  }

  const todayApps = appointments.filter(a => a.status === 'confirmed');

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Planification des Rendez-vous' : 'Appointment Scheduling'}
          </h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Gérer vos disponibilités et rendez-vous' : 'Manage your availability and appointments'}
          </p>
        </div>
        <button onClick={() => setShowCreateSlot(true)} className="btn-primary">{language === 'fr' ? '+ Créneau' : '+ Slot'}</button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card dark:bg-secondary-800 dark:border-secondary-700">
            <div className="flex items-center space-x-3 mb-4">
              <HiOutlineCalendar className="h-5 w-5 text-primary-500" />
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input flex-1 dark:bg-secondary-700 dark:text-white" />
            </div>

            {slots.length === 0 ? (
              <div className="text-center py-8 text-secondary-400">
                <HiOutlineClock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{language === 'fr' ? 'Aucun créneau pour cette date' : 'No slots for this date'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {slots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-lg">
                    <div>
                      <p className="font-medium dark:text-white">{slot.start_time} - {slot.end_time}</p>
                      <p className="text-xs text-secondary-500">{slot.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{slot.booked_count}/{slot.max_patients}</p>
                      <p className={`text-xs ${slot.booked_count >= slot.max_patients ? 'text-red-500' : 'text-green-500'}`}>
                        {slot.booked_count >= slot.max_patients ? (language === 'fr' ? 'Complet' : 'Full') : (language === 'fr' ? 'Disponible' : 'Available')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card dark:bg-secondary-800 dark:border-secondary-700">
            <h2 className="font-semibold mb-3 flex items-center dark:text-white">
              <HiOutlineCheckCircle className="h-5 w-5 mr-2 text-green-500" />
              {language === 'fr' ? `Rendez-vous confirmés (${todayApps.length})` : `Confirmed Appointments (${todayApps.length})`}
            </h2>
            {todayApps.length === 0 ? (
              <p className="text-center py-6 text-secondary-400 text-sm">{language === 'fr' ? 'Aucun rendez-vous confirmé' : 'No confirmed appointments'}</p>
            ) : (
              <div className="space-y-2">
                {todayApps.map((app) => {
                  const patient = patients.find((p: any) => p.id === app.patient_id);
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <HiOutlineUser className="h-8 w-8 p-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full" />
                        <div>
                          <p className="font-medium text-sm dark:text-white">{patient?.name || 'Patient'}</p>
                          <p className="text-xs text-secondary-400">{app.reason || (language === 'fr' ? 'Consultation générale' : 'General consultation')}</p>
                        </div>
                      </div>
                      <span className={`badge-${app.status}`}>{app.status}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="card dark:bg-secondary-800 dark:border-secondary-700">
          <h2 className="font-semibold mb-3 dark:text-white">{language === 'fr' ? 'Tous les rendez-vous' : 'All Appointments'}</h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {appointments.length === 0 ? (
              <p className="text-center py-6 text-secondary-400 text-sm">{language === 'fr' ? 'Aucun rendez-vous' : 'No appointments'}</p>
            ) : (
              appointments.map((app) => {
                const patient = patients.find((p: any) => p.id === app.patient_id);
                return (
                  <div key={app.id} className="p-2 border-l-2 border-primary-500 pl-3">
                    <p className="text-sm font-medium dark:text-white">{patient?.name || 'Patient'}</p>
                    <p className="text-xs text-secondary-400">{new Date(app.created_at).toLocaleDateString()}</p>
                    <span className={`text-xs font-medium ${app.status === 'confirmed' ? 'text-green-500' : app.status === 'cancelled' ? 'text-red-500' : 'text-secondary-400'}`}>{
                      app.status === 'confirmed' ? (language === 'fr' ? 'Confirmé' : 'Confirmed') :
                      app.status === 'cancelled' ? (language === 'fr' ? 'Annulé' : 'Cancelled') :
                      app.status
                    }</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showCreateSlot && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateSlot(false)}>
          <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4 dark:text-white">{language === 'fr' ? 'Créer un créneau' : 'Create a Slot'}</h3>
            <form onSubmit={createSlot} className="space-y-3">
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Date' : 'Date'}</label>
                <input type="date" className="input dark:bg-secondary-700 dark:text-white" value={newSlot.date} onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Début' : 'Start'}</label>
                  <input type="time" className="input dark:bg-secondary-700 dark:text-white" value={newSlot.start_time} onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })} required />
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Fin' : 'End'}</label>
                  <input type="time" className="input dark:bg-secondary-700 dark:text-white" value={newSlot.end_time} onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Patients max' : 'Max patients'}</label>
                <input type="number" className="input dark:bg-secondary-700 dark:text-white" value={newSlot.max_patients} onChange={(e) => setNewSlot({ ...newSlot, max_patients: parseInt(e.target.value) || 10 })} min={1} />
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center">{language === 'fr' ? 'Créer' : 'Create'}</button>
                <button type="button" onClick={() => setShowCreateSlot(false)} className="btn-secondary flex-1 justify-center dark:bg-secondary-700 dark:text-secondary-200">{language === 'fr' ? 'Annuler' : 'Cancel'}</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}
