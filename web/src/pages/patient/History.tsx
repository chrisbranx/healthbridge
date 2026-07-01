import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { consultationsApi } from '../../services/api';
import { HiOutlineClipboardList, HiOutlineClock, HiOutlineSearch, HiOutlineArrowLeft, HiOutlineFilter, HiOutlineChevronDown } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { HeartBeatIllustration } from '../../components/MedicalIllustrations';

interface Consultation {
  id: string; symptoms: string; diagnosis: string; prescription: string; status: string; channel: string; triage_level: string; created_at: string; responded_at: string; doctor: { name: string } | null;
}

export default function History() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    try {
      const { data } = await consultationsApi.list();
      setConsultations(data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = consultations.filter(c => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch = !search || c.symptoms.toLowerCase().includes(search.toLowerCase()) || c.diagnosis?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filters = [
    { key: 'all', label: language === 'fr' ? 'Tous' : 'All' },
    { key: 'pending', label: language === 'fr' ? 'En attente' : 'Pending' },
    { key: 'active', label: language === 'fr' ? 'Actif' : 'Active' },
    { key: 'resolved', label: language === 'fr' ? 'Résolu' : 'Resolved' },
    { key: 'escalated', label: language === 'fr' ? 'Escaladé' : 'Escalated' },
  ];

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
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Historique Médical' : 'Medical History'}
          </h1>
          <p className="text-xs lg:text-sm text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Consultez vos consultations et ordonnances passées' : 'View your past consultations and prescriptions'}
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 rounded-xl text-sm dark:text-secondary-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all placeholder-secondary-400"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map((f) => (
          <motion.button
            key={f.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs lg:text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                : 'bg-gray-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-gray-200 dark:hover:bg-secondary-600'
            }`}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-10 w-10 rounded-full border-3 border-primary-200 border-t-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 text-secondary-400 dark:text-secondary-500"
        >
          <HiOutlineClipboardList className="h-14 w-14 lg:h-20 lg:w-20 mx-auto mb-4 opacity-50" />
          <p className="text-base lg:text-lg font-medium">
            {language === 'fr' ? 'Aucune consultation trouvée' : 'No consultations found'}
          </p>
          <p className="text-sm mt-1">
            {language === 'fr' ? 'Commencez une nouvelle consultation' : 'Start a new consultation to build your history'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3 lg:space-y-4">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-6"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[10px] lg:text-xs text-secondary-400 dark:text-secondary-500 flex items-center space-x-1">
                  <HiOutlineClock className="h-3 w-3" />
                  <span>{new Date(c.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-medium ${
                  c.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  c.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  c.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {c.status}
                </span>
                <span className="text-[10px] lg:text-xs bg-gray-100 dark:bg-secondary-700 text-secondary-500 px-1.5 py-0.5 rounded capitalize">{c.channel}</span>
                {c.triage_level === 'critical' && (
                  <span className="text-[10px] lg:text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded">{language === 'fr' ? 'Urgence' : 'Emergency'}</span>
                )}
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-[10px] lg:text-xs font-medium text-secondary-400 dark:text-secondary-500 uppercase tracking-wider">
                    {language === 'fr' ? 'Symptômes' : 'Symptoms'}
                  </h4>
                  <p className="text-sm lg:text-base text-secondary-800 dark:text-secondary-200 mt-0.5">{c.symptoms}</p>
                </div>

                {c.diagnosis && (
                  <div>
                    <h4 className="text-[10px] lg:text-xs font-medium text-secondary-400 dark:text-secondary-500 uppercase tracking-wider">
                      {language === 'fr' ? 'Diagnostic' : 'Diagnosis'}
                    </h4>
                    <p className="text-sm lg:text-base text-secondary-800 dark:text-secondary-200 mt-0.5">{c.diagnosis}</p>
                  </div>
                )}

                {c.doctor && (
                  <p className="text-xs lg:text-sm text-secondary-500 dark:text-secondary-400">
                    {language === 'fr' ? 'Consulté par' : 'Reviewed by'}: <span className="font-medium text-secondary-700 dark:text-secondary-300">{c.doctor.name}</span>
                  </p>
                )}

                {c.prescription && (
                  <div className="p-3 lg:p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
                    <h4 className="text-[10px] lg:text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider flex items-center space-x-1">
                      <HiOutlineClipboardList className="h-3 w-3" />
                      <span>{language === 'fr' ? 'Ordonnance' : 'Prescription'}</span>
                    </h4>
                    <p className="text-sm lg:text-base text-primary-800 dark:text-primary-200 mt-1 whitespace-pre-wrap">{c.prescription}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Bottom decoration */}
      <div className="opacity-20">
        <HeartBeatIllustration className="w-full h-6" />
      </div>
    </div>
  );
}
