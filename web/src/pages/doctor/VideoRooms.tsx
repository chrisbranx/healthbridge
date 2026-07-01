import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import VideoConsultation from '../../components/VideoConsultation';
import toast from 'react-hot-toast';
import { HiOutlinePhone, HiOutlineVideoCamera, HiOutlineCalendar, HiOutlineUser } from 'react-icons/hi';

interface VideoRoom {
  id: string;
  patient_id: string;
  doctor_id: string;
  status: string;
  room_name: string;
  scheduled_at: string;
  created_at: string;
}

export default function VideoRooms() {
  const { language } = useLanguage();
  const { socket } = useSocket();
  const [rooms, setRooms] = useState<VideoRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [newRoom, setNewRoom] = useState({ patient_id: '', scheduled_at: '' });

  useEffect(() => {
    loadRooms();
    api.get('/doctors/patients').then(({ data }) => setPatients(data || [])).catch(() => {});

    socket?.on('video:invite', (data: any) => {
      toast.success(language === 'fr' ? 'Appel vidéo entrant' : 'Incoming video call');
      loadRooms();
    });
    return () => { socket?.off('video:invite'); };
  }, []);

  async function loadRooms() {
    try {
      const { data } = await api.get('/video/rooms');
      setRooms(data || []);
    } catch (err) { console.error(err); }
  }

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/video/rooms', newRoom);
      toast.success(language === 'fr' ? 'Salle créée' : 'Room created');
      setShowCreate(false);
      loadRooms();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
  }

  if (activeRoom) {
    const room = rooms.find(r => r.id === activeRoom);
    return <VideoConsultation roomId={activeRoom} patientName={room ? 'Patient' : ''} onClose={() => setActiveRoom(null)} />;
  }

  const activeRooms = rooms.filter(r => r.status === 'pending' || r.status === 'active');
  const pastRooms = rooms.filter(r => r.status === 'completed' || r.status === 'missed');

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Consultations Vidéo' : 'Video Consultations'}
          </h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Téléconsultation en temps réel' : 'Real-time teleconsultation'}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><HiOutlineVideoCamera className="h-5 w-5 mr-1" /> {language === 'fr' ? 'Nouvel appel' : 'New Call'}</button>
      </motion.div>

      {activeRooms.length > 0 && (
        <div className="card dark:bg-secondary-800 dark:border-secondary-700">
          <h2 className="font-semibold mb-3 dark:text-white">{language === 'fr' ? 'Appels actifs' : 'Active Calls'}</h2>
          <div className="space-y-3">
            {activeRooms.map((room) => {
              const patient = patients.find((p: any) => p.id === room.patient_id);
              return (
                <div key={room.id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <HiOutlineUser className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm dark:text-white">{patient?.name || language === 'fr' ? 'Patient' : 'Patient'}</p>
                      <p className="text-xs text-secondary-400">{room.room_name} • {new Date(room.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveRoom(room.id)} className="btn-primary text-sm">
                    <HiOutlinePhone className="h-4 w-4 mr-1" /> {language === 'fr' ? 'Rejoindre' : 'Join'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card dark:bg-secondary-800 dark:border-secondary-700">
        <h2 className="font-semibold mb-3 dark:text-white">{language === 'fr' ? 'Historique' : 'History'}</h2>
        {pastRooms.length === 0 ? (
          <p className="text-center py-8 text-secondary-400 text-sm">{language === 'fr' ? 'Aucun appel passé' : 'No past calls'}</p>
        ) : (
          <div className="space-y-2">
            {pastRooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between p-2">
                <div className="flex items-center space-x-2">
                  <HiOutlineCalendar className="h-4 w-4 text-secondary-400" />
                  <span className="text-sm dark:text-white">{room.room_name}</span>
                </div>
                <span className={`text-xs font-medium ${room.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>{room.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4 dark:text-white">{language === 'fr' ? 'Nouvel appel vidéo' : 'New Video Call'}</h3>
            <form onSubmit={createRoom} className="space-y-3">
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Patient' : 'Patient'}</label>
                <select className="input dark:bg-secondary-700 dark:text-white" value={newRoom.patient_id} onChange={(e) => setNewRoom({ ...newRoom, patient_id: e.target.value })} required>
                  <option value="">{language === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                  {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Planifier (optionnel)' : 'Schedule (optional)'}</label>
                <input type="datetime-local" className="input dark:bg-secondary-700 dark:text-white" value={newRoom.scheduled_at} onChange={(e) => setNewRoom({ ...newRoom, scheduled_at: e.target.value })} />
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center"><HiOutlineVideoCamera className="h-5 w-5 mr-1" /> {language === 'fr' ? 'Créer' : 'Create'}</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 justify-center">{language === 'fr' ? 'Annuler' : 'Cancel'}</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}
