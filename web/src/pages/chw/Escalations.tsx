import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { chwApi } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineExclamationCircle, HiOutlinePlusCircle } from 'react-icons/hi';

interface Escalation {
  id: string;
  patient: { name: string; phone: string; village: string; region: string };
  clinic: { name: string } | null;
  reason: string;
  severity: string;
  status: string;
  created_at: string;
}

export default function CHWEscalations() {
  const { language } = useLanguage();
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient_id: '', clinic_id: '', reason: '', severity: 'high' });

  useEffect(() => { loadEscalations(); }, []);

  async function loadEscalations() {
    try {
      const { data } = await chwApi.escalations();
      setEscalations(data || []);
    } catch (err) {
      console.error('Failed to load escalations:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createEscalation(e: React.FormEvent) {
    e.preventDefault();
    if (!form.reason.trim()) return toast.error(language === 'fr' ? 'Veuillez fournir une raison' : 'Please provide a reason');
    try {
      await chwApi.createEscalation(form);
      toast.success(language === 'fr' ? "Alerte d'escalade envoyée" : 'Escalation alert sent');
      setShowForm(false);
      setForm({ patient_id: '', clinic_id: '', reason: '', severity: 'high' });
      loadEscalations();
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? "Échec de la création de l'escalade" : 'Failed to create escalation'));
    }
  }

  const pendingEscalations = escalations.filter(e => e.status === 'pending');

  const severityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-600 dark:bg-secondary-700 dark:text-secondary-400',
    medium: 'badge-pending',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    critical: 'badge-escalated',
  };

  if (loading) return <div className="text-center py-12 text-secondary-400 dark:text-secondary-300">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">{language === 'fr' ? 'Escalades' : 'Escalations'}</h1>
          <p className="text-sm lg:text-base text-secondary-500 dark:text-secondary-400">{language === 'fr' ? "Alerter les cliniques lorsque l'état d'un patient se détériore" : "Alert clinics when a patient's condition deteriorates"}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary shrink-0">
          <HiOutlinePlusCircle className="h-5 w-5 mr-1" />
          {language === 'fr' ? 'Nouvelle escalade' : 'New Escalation'}
        </button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={createEscalation} className="card space-y-3 dark:bg-secondary-800 dark:border-secondary-700">
            <h2 className="font-semibold dark:text-white">{language === 'fr' ? "Créer une alerte d'escalade" : 'Create Escalation Alert'}</h2>
            <div>
              <label className="label dark:text-secondary-200">{language === 'fr' ? 'ID du patient' : 'Patient ID'}</label>
              <input type="text" className="input dark:bg-secondary-700 dark:text-white dark:border-secondary-600" placeholder={language === 'fr' ? "Entrez l'ID du patient" : 'Enter patient ID'} value={form.patient_id}
                onChange={(e) => setForm({ ...form, patient_id: e.target.value })} required />
            </div>
            <div>
              <label className="label dark:text-secondary-200">{language === 'fr' ? 'ID de la clinique (optionnel)' : 'Clinic ID (optional)'}</label>
              <input type="text" className="input dark:bg-secondary-700 dark:text-white dark:border-secondary-600" placeholder={language === 'fr' ? "Entrez l'ID de la clinique" : 'Enter clinic ID'} value={form.clinic_id}
                onChange={(e) => setForm({ ...form, clinic_id: e.target.value })} />
            </div>
            <div>
              <label className="label dark:text-secondary-200">{language === 'fr' ? 'Gravité' : 'Severity'}</label>
              <select className="input dark:bg-secondary-700 dark:text-white dark:border-secondary-600" value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option value="low">{language === 'fr' ? 'Faible' : 'Low'}</option>
                <option value="medium">{language === 'fr' ? 'Moyen' : 'Medium'}</option>
                <option value="high">{language === 'fr' ? 'Élevé' : 'High'}</option>
                <option value="critical">{language === 'fr' ? 'Critique' : 'Critical'}</option>
              </select>
            </div>
            <div>
              <label className="label dark:text-secondary-200">{language === 'fr' ? "Raison de l'escalade" : 'Reason for Escalation'}</label>
              <textarea className="input min-h-[100px] dark:bg-secondary-700 dark:text-white dark:border-secondary-600" placeholder={language === 'fr' ? "Décrivez l'état du patient et pourquoi une escalade est nécessaire..." : "Describe the patient's condition and why escalation is needed..."}
                value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="btn-primary">{language === 'fr' ? "Envoyer l'alerte" : 'Send Alert'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary dark:bg-secondary-700 dark:text-secondary-200">{language === 'fr' ? 'Annuler' : 'Cancel'}</button>
            </div>
          </form>
        </motion.div>
      )}

      {pendingEscalations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
            <HiOutlineExclamationCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{pendingEscalations.length} {language === 'fr' ? "escalade(s) en attente d'accusé de réception" : 'escalation(s) awaiting acknowledgment'}</p>
          </div>
        </motion.div>
      )}

      {escalations.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-secondary-400 dark:text-secondary-500">
          <HiOutlineExclamationCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">{language === 'fr' ? "Aucune escalade" : 'No escalations'}</p>
          <p className="text-sm">{language === 'fr' ? "Escalader lorsqu'un patient a besoin d'une attention clinique urgente" : 'Escalate when a patient needs urgent clinical attention'}</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
          {escalations.map((e) => (
            <div key={e.id} className="card dark:bg-secondary-800 dark:border-secondary-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`badge ${severityColors[e.severity] || 'badge-pending'}`}>{e.severity === 'low' ? (language === 'fr' ? 'Faible' : 'Low') : e.severity === 'medium' ? (language === 'fr' ? 'Moyen' : 'Medium') : e.severity === 'high' ? (language === 'fr' ? 'Élevé' : 'High') : e.severity === 'critical' ? (language === 'fr' ? 'Critique' : 'Critical') : e.severity}</span>
                    <span className={`badge ${
                      e.status === 'pending' ? 'badge-pending' :
                      e.status === 'acknowledged' ? 'badge-active' : 'badge-resolved'
                    }`}>{e.status === 'pending' ? (language === 'fr' ? 'En attente' : 'Pending') : e.status === 'acknowledged' ? (language === 'fr' ? 'Accusé' : 'Acknowledged') : e.status === 'resolved' ? (language === 'fr' ? 'Résolu' : 'Resolved') : e.status}</span>
                  </div>
                  <p className="text-secondary-800 dark:text-secondary-200 mb-1">{e.reason}</p>
                  <div className="text-xs text-secondary-400 dark:text-secondary-500 space-y-1">
                    {e.patient && <p>{language === 'fr' ? 'Patient' : 'Patient'}: {e.patient.name} | {e.patient.phone} | {e.patient.village}, {e.patient.region}</p>}
                    {e.clinic && <p>{language === 'fr' ? 'Clinique' : 'Clinic'}: {e.clinic.name}</p>}
                    <p>{new Date(e.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
