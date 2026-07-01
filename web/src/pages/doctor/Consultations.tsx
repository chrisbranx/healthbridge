import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSocket } from '../../contexts/SocketContext';
import { consultationsApi } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineBell } from 'react-icons/hi';

interface Consultation {
  id: string;
  patient: { name: string; phone: string; village: string; region: string };
  symptoms: string;
  diagnosis: string;
  prescription: string;
  status: string;
  channel: string;
  triage_level: string;
  created_at: string;
  doctor: { name: string } | null;
}

export default function DoctorConsultations() {
  const { language } = useLanguage();
  const { socket } = useSocket();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [response, setResponse] = useState({ diagnosis: '', prescription: '', doctor_notes: '', requires_follow_up: false });
  const [newConsultationAlert, setNewConsultationAlert] = useState(false);

  const fetchConsultations = useCallback(async () => {
    try {
      const { data } = await consultationsApi.list();
      setConsultations(data || []);
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConsultations(); }, [fetchConsultations]);

  useEffect(() => {
    if (!socket) return;
    socket.on('consultation:new', () => {
      setNewConsultationAlert(true);
      toast.success(language === 'fr' ? 'Nouvelle consultation reçue!' : 'New consultation received!', { duration: 5000 });
      fetchConsultations();
    });
    socket.on('consultation:updated', () => { fetchConsultations(); });
    return () => {
      socket.off('consultation:new');
      socket.off('consultation:updated');
    };
  }, [socket, loadConsultations, language]);

  async function loadConsultations() {
    try {
      const { data } = await consultationsApi.list();
      setConsultations(data || []);
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRespond(id: string) {
    if (!response.diagnosis.trim()) {
      toast.error(language === 'fr' ? 'Veuillez entrer un diagnostic' : 'Please enter a diagnosis');
      return;
    }
    try {
      await consultationsApi.respond(id, response);
      toast.success(language === 'fr' ? 'Consultation traitée avec succès' : 'Consultation responded successfully');
      setResponding(null);
      setResponse({ diagnosis: '', prescription: '', doctor_notes: '', requires_follow_up: false });
      fetchConsultations();
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Échec de la réponse' : 'Failed to respond'));
    }
  }

  const pending = consultations.filter(c => c.status === 'pending');
  const resolved = consultations.filter(c => c.status === 'resolved');

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">{language === 'fr' ? 'Consultations' : 'Consultations'}</h1>
        <p className="text-sm lg:text-base text-secondary-500 dark:text-secondary-400">{language === 'fr' ? 'Examiner et répondre aux consultations des patients' : 'Review and respond to patient consultations'}</p>
      </motion.div>

      <AnimatePresence>
        {newConsultationAlert && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="p-3 bg-primary-100 dark:bg-primary-900/30 border border-primary-300 dark:border-primary-700 rounded-xl flex items-center justify-between"
          >
            <span className="flex items-center text-sm font-medium text-primary-800 dark:text-primary-300">
              <HiOutlineBell className="h-5 w-5 mr-2 animate-pulse" />
              {language === 'fr' ? '🆕 Nouvelle consultation reçue en temps réel!' : '🆕 New consultation received in real-time!'}
            </span>
            <button onClick={() => setNewConsultationAlert(false)} className="text-primary-600 hover:text-primary-800">
              <HiOutlineXCircle className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-12 text-secondary-400 dark:text-secondary-300">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>
      ) : consultations.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-secondary-400 dark:text-secondary-500">
          <HiOutlineClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">{language === 'fr' ? 'Aucune consultation pour le moment' : 'No consultations yet'}</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-lg font-semibold mb-3 flex items-center dark:text-white">
                <HiOutlineClipboardList className="h-5 w-5 mr-2 text-yellow-500" />
                {language === 'fr' ? `Réponse en attente (${pending.length})` : `Pending Response (${pending.length})`}
              </h2>
              <div className="space-y-4">
                {pending.map((c) => (
                  <div key={c.id} className="card dark:bg-secondary-800 dark:border-secondary-700">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold dark:text-white">{c.patient?.name}</h3>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">
                          {c.patient?.phone} | {c.patient?.village}, {c.patient?.region}
                        </p>
                        <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">
                          {new Date(c.created_at).toLocaleDateString()} | {c.channel} | {language === 'fr' ? 'Gravité' : 'Severity'}: {c.triage_level}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-secondary-700/50 rounded-lg mb-4">
                      <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-1">{language === 'fr' ? 'Symptômes' : 'Symptoms'}</p>
                      <p className="text-secondary-800 dark:text-secondary-200">{c.symptoms}</p>
                    </div>

                    {responding === c.id ? (
                      <div className="space-y-3 border-t dark:border-secondary-700 pt-4">
                        <div>
                          <label className="label dark:text-secondary-200">{language === 'fr' ? 'Diagnostic *' : 'Diagnosis *'}</label>
                          <input
                            type="text"
                            className="input dark:bg-secondary-700 dark:text-white dark:border-secondary-600"
                            placeholder={language === 'fr' ? 'Entrez le diagnostic' : 'Enter diagnosis'}
                            value={response.diagnosis}
                            onChange={(e) => setResponse({ ...response, diagnosis: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="label dark:text-secondary-200">{language === 'fr' ? 'Prescription' : 'Prescription'}</label>
                          <textarea
                            className="input min-h-[80px] dark:bg-secondary-700 dark:text-white dark:border-secondary-600"
                            placeholder={language === 'fr' ? 'Détails de la prescription...' : 'Enter prescription details...'}
                            value={response.prescription}
                            onChange={(e) => setResponse({ ...response, prescription: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="label dark:text-secondary-200">{language === 'fr' ? "Notes du médecin" : "Doctor's Notes"}</label>
                          <textarea
                            className="input min-h-[80px] dark:bg-secondary-700 dark:text-white dark:border-secondary-600"
                            placeholder={language === 'fr' ? 'Notes supplémentaires...' : 'Additional notes...'}
                            value={response.doctor_notes}
                            onChange={(e) => setResponse({ ...response, doctor_notes: e.target.value })}
                          />
                        </div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={response.requires_follow_up}
                            onChange={(e) => setResponse({ ...response, requires_follow_up: e.target.checked })}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-secondary-700 dark:text-secondary-300">{language === 'fr' ? "Nécessite un suivi ASC" : 'Requires CHW follow-up'}</span>
                        </label>
                        <div className="flex space-x-2">
                          <button onClick={() => handleRespond(c.id)} className="btn-primary">
                            <HiOutlineCheckCircle className="h-5 w-5 mr-1" />
                            {language === 'fr' ? 'Soumettre la réponse' : 'Submit Response'}
                          </button>
                          <button onClick={() => setResponding(null)} className="btn-secondary dark:bg-secondary-700 dark:text-secondary-200">
                            {language === 'fr' ? 'Annuler' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setResponding(c.id)} className="btn-primary">
                        {language === 'fr' ? 'Répondre à la consultation' : 'Respond to Consultation'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {resolved.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-lg font-semibold mb-3 flex items-center dark:text-white">
                <HiOutlineCheckCircle className="h-5 w-5 mr-2 text-green-500" />
                {language === 'fr' ? `Résolu (${resolved.length})` : `Resolved (${resolved.length})`}
              </h2>
              <div className="space-y-2">
                {resolved.map((c) => (
                  <div key={c.id} className="card flex items-center justify-between dark:bg-secondary-800 dark:border-secondary-700">
                    <div>
                      <p className="font-medium dark:text-white">{c.patient?.name}</p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">{language === 'fr' ? 'Diagnostic' : 'Diagnosis'}: {c.diagnosis}</p>
                      <p className="text-xs text-secondary-400 dark:text-secondary-500">{new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="badge-resolved">{language === 'fr' ? 'Résolu' : 'Resolved'}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
