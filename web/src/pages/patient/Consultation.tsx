import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { consultationsApi, patientsApi } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineChatAlt2, HiOutlineShieldCheck, HiOutlinePhone, HiOutlineArrowLeft, HiOutlineExclamationCircle, HiOutlineInformationCircle } from 'react-icons/hi';
import { StethoscopeIllustration } from '../../components/MedicalIllustrations';

export default function Consultation() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState<string | null>(null);
  const [form, setForm] = useState({
    symptoms: '',
    triage_level: 'low',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.patient_profile?.id) {
      setPatientId(user.patient_profile.id);
    } else {
      patientsApi.list().then(({ data }) => {
        if (data?.[0]?.id) setPatientId(data[0].id);
      }).catch(() => {});
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      toast.error(language === 'fr' ? 'Profil patient introuvable. Veuillez compléter votre inscription.' : 'Patient profile not found. Please complete your registration.');
      return;
    }
    setLoading(true);
    try {
      await consultationsApi.create({ ...form, channel: 'web', patient_id: patientId });
      toast.success(language === 'fr' ? 'Votre consultation a été soumise. Un médecin répondra dans les 24 heures.' : 'Your consultation has been submitted. A doctor will respond within 24 hours.');
      navigate('/patient/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Échec de la soumission' : 'Failed to submit consultation'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/patient/dashboard')}
          className="p-2 rounded-xl bg-gray-100 dark:bg-secondary-700 text-secondary-500"
        >
          <HiOutlineArrowLeft className="h-5 w-5" />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Nouvelle Consultation' : 'New Consultation'}
          </h1>
          <p className="text-xs lg:text-sm text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Décrivez vos symptômes à un médecin' : 'Describe your symptoms to a doctor'}
          </p>
        </div>
        <StethoscopeIllustration className="h-12 w-12 lg:h-16 lg:w-16 opacity-70" />
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-6 space-y-4"
      >
        {/* Symptoms */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">
            {language === 'fr' ? 'Décrivez vos symptômes' : 'Describe Your Symptoms'}
          </label>
          <textarea
            className="w-full px-3 py-2.5 lg:px-4 lg:py-3 border border-gray-200 dark:border-secondary-600 rounded-xl text-sm dark:bg-secondary-700 dark:text-secondary-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all resize-none min-h-[180px] lg:min-h-[220px] placeholder-secondary-400"
            placeholder={language === 'fr'
              ? 'Décrivez vos symptômes en détail. Depuis quand, sévérité, autres informations pertinentes...'
              : 'Describe your symptoms in detail. When they started, severity, any other relevant information...'}
            value={form.symptoms}
            onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
            required
          />
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">
            {language === 'fr' ? 'Sévérité des symptômes' : 'How severe are your symptoms?'}
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { value: 'low', label: language === 'fr' ? 'Léger' : 'Mild', desc: language === 'fr' ? 'Gêne mineure' : 'Minor discomfort', color: 'border-green-300 bg-green-50 dark:bg-green-900/20' },
              { value: 'medium', label: language === 'fr' ? 'Modéré' : 'Moderate', desc: language === 'fr' ? 'Notable mais gérable' : 'Noticeable but manageable', color: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' },
              { value: 'high', label: language === 'fr' ? 'Grave' : 'Severe', desc: language === 'fr' ? 'Inconfort important' : 'Significant discomfort', color: 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' },
              { value: 'critical', label: language === 'fr' ? 'Critique' : 'Critical', desc: language === 'fr' ? 'Urgence immédiate' : 'Immediate attention', color: 'border-red-300 bg-red-50 dark:bg-red-900/20' },
            ].map((option) => (
              <motion.button
                key={option.value}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setForm({ ...form, triage_level: option.value })}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.triage_level === option.value
                    ? `${option.color} border-current ring-2 ring-primary-500/30`
                    : 'border-gray-200 dark:border-secondary-600 hover:border-gray-300 dark:hover:border-secondary-500'
                }`}
              >
                <p className={`font-semibold text-sm ${form.triage_level === option.value ? 'text-secondary-900 dark:text-white' : 'text-secondary-600 dark:text-secondary-400'}`}>
                  {option.label}
                </p>
                <p className="text-[10px] lg:text-xs text-secondary-400 dark:text-secondary-500 mt-0.5">{option.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
          <motion.button
            type="submit"
            disabled={loading || !form.symptoms.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-5 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>{language === 'fr' ? 'Envoi...' : 'Submitting...'}</span>
              </span>
            ) : (
              <>
                <HiOutlineChatAlt2 className="h-5 w-5" />
                <span>{language === 'fr' ? 'Soumettre la consultation' : 'Submit Consultation'}</span>
              </>
            )}
          </motion.button>
          <button
            type="button"
            onClick={() => navigate('/patient/dashboard')}
            className="px-5 py-3 border-2 border-gray-200 dark:border-secondary-600 text-secondary-600 dark:text-secondary-400 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-secondary-700 transition-colors"
          >
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </button>
        </div>
      </motion.form>

      {/* Info card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl lg:rounded-2xl p-4 lg:p-6"
      >
        <div className="flex items-start space-x-3">
          <HiOutlineInformationCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm text-amber-800 dark:text-amber-300">
              {language === 'fr' ? 'Important' : 'Important'}
            </h3>
            <ul className="mt-2 space-y-1.5">
              {[
                language === 'fr' ? 'Si c\'est une urgence médicale, appelez le 1510 immédiatement' : 'If this is a medical emergency, call 1510 immediately',
                language === 'fr' ? 'Un médecin répondra dans les 24 heures' : 'A doctor will respond within 24 hours',
                language === 'fr' ? 'Vous recevrez une réponse par SMS et sur ce portail' : 'You will receive a response via SMS and on this portal',
                language === 'fr' ? 'Composez le *800# pour une consultation USSD instantanée (pas besoin d\'internet)' : 'Dial *800# for instant USSD consultation (no internet needed)',
              ].map((msg, i) => (
                <li key={i} className="flex items-start space-x-2 text-xs lg:text-sm text-amber-700 dark:text-amber-400">
                  <HiOutlineExclamationCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span>{msg}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
