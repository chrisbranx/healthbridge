import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { chwApi } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUserGroup, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

interface Patient {
  id: string;
  name: string;
  phone: string;
  village: string;
  region: string;
  gender: string;
  chronic_conditions: string[];
}

export default function CHWPatients() {
  const { language } = useLanguage();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [adherence, setAdherence] = useState({ prescription_id: '', was_taken: true, notes: '' });

  useEffect(() => { loadPatients(); }, []);

  async function loadPatients() {
    try {
      const { data } = await chwApi.patients();
      setPatients(data || []);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  }

  async function logAdherence() {
    if (!selectedPatient) return;
    try {
      await chwApi.logAdherence({
        prescription_id: adherence.prescription_id || '00000000-0000-0000-0000-000000000000',
        patient_id: selectedPatient.id,
        was_taken: adherence.was_taken,
        notes: adherence.notes,
      });
      toast.success(language === 'fr' ? "Observance enregistrée avec succès" : 'Adherence logged successfully');
      setAdherence({ prescription_id: '', was_taken: true, notes: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? "Échec de l'enregistrement de l'observance" : 'Failed to log adherence'));
    }
  }

  if (loading) return <div className="text-center py-12 text-secondary-400 dark:text-secondary-300">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">{language === 'fr' ? 'Mes patients' : 'My Patients'}</h1>
        <p className="text-sm lg:text-base text-secondary-500 dark:text-secondary-400">{patients.length} {language === 'fr' ? 'patient(s) assigné(s)' : 'patient(s) assigned to you'}</p>
      </motion.div>

      {patients.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-secondary-400 dark:text-secondary-500">
          <HiOutlineUserGroup className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">{language === 'fr' ? 'Aucun patient assigné' : 'No patients assigned'}</p>
          <p className="text-sm">{language === 'fr' ? 'Les patients seront assignés lorsque les médecins demanderont des consultations de suivi' : 'Patients will be assigned when doctors order follow-up consultations'}</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((p) => (
            <div key={p.id} className="card dark:bg-secondary-800 dark:border-secondary-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span className="text-primary-700 dark:text-primary-300 font-semibold text-lg">{p.name?.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate dark:text-white">{p.name}</h3>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">{p.phone}</p>
                </div>
              </div>
              <div className="text-sm text-secondary-500 dark:text-secondary-400 space-y-1 mb-3">
                {p.village && <p>📍 {p.village}, {p.region}</p>}
                {p.gender && <p>{language === 'fr' ? 'Genre' : 'Gender'}: {p.gender === 'male' ? (language === 'fr' ? 'Masculin' : 'Male') : p.gender === 'female' ? (language === 'fr' ? 'Féminin' : 'Female') : p.gender}</p>}
                {p.chronic_conditions?.length > 0 && (
                  <p>{language === 'fr' ? 'Chronique' : 'Chronic'}: {p.chronic_conditions.join(', ')}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedPatient(p)}
                  className="btn-primary text-sm flex-1"
                >
                  {language === 'fr' ? "Enregistrer l'observance" : 'Log Adherence'}
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPatient(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-secondary-800 rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2 dark:text-white">{language === 'fr' ? "Enregistrer l'observance médicamenteuse" : 'Log Medication Adherence'}</h2>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">{language === 'fr' ? 'Patient' : 'Patient'}: {selectedPatient.name}</p>

            <div className="space-y-3">
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Médicament pris ?' : 'Medication Taken?'}</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setAdherence({ ...adherence, was_taken: true })}
                    className={`flex-1 btn ${adherence.was_taken ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700' : 'bg-gray-100 dark:bg-secondary-700'} border`}
                  >
                    <HiOutlineCheckCircle className="h-5 w-5 mr-1" />
                    {language === 'fr' ? 'Oui' : 'Yes'}
                  </button>
                  <button
                    onClick={() => setAdherence({ ...adherence, was_taken: false })}
                    className={`flex-1 btn ${!adherence.was_taken ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700' : 'bg-gray-100 dark:bg-secondary-700'} border`}
                  >
                    <HiOutlineXCircle className="h-5 w-5 mr-1" />
                    {language === 'fr' ? 'Non' : 'No'}
                  </button>
                </div>
              </div>

              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Notes (optionnel)' : 'Notes (optional)'}</label>
                <textarea
                  className="input min-h-[80px] dark:bg-secondary-700 dark:text-white dark:border-secondary-600"
                  placeholder={language === 'fr' ? 'Observations...' : 'Any observations...'}
                  value={adherence.notes}
                  onChange={(e) => setAdherence({ ...adherence, notes: e.target.value })}
                />
              </div>

              <div className="flex space-x-2">
                <button onClick={logAdherence} className="btn-primary flex-1">{language === 'fr' ? "Enregistrer l'observance" : 'Log Adherence'}</button>
                <button onClick={() => setSelectedPatient(null)} className="btn-secondary dark:bg-secondary-700 dark:text-secondary-200">{language === 'fr' ? 'Annuler' : 'Cancel'}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
