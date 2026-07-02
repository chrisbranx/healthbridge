import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineDocumentText, HiOutlineClipboardList, HiOutlineClock, HiOutlineX, HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineUpload } from 'react-icons/hi';

interface LabResult {
  id: string;
  test_type: string;
  results_text: string;
  notes: string;
  image_url: string;
  status: string;
  created_at: string;
  analysis: {
    keywords: string[];
    interpretation: string;
    confidence: number;
  } | null;
}

const testTypes = ['Blood Test', 'Malaria RDT', 'COVID PCR', 'Urinalysis', 'Stool Test', 'X-Ray', 'Ultrasound'];

const testTypeColors: Record<string, string> = {
  'Blood Test': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Malaria RDT': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'COVID PCR': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Urinalysis': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Stool Test': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'X-Ray': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Ultrasound': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function LabResults() {
  const { language } = useLanguage();
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [newResult, setNewResult] = useState({
    test_type: 'Blood Test',
    results_text: '',
    notes: '',
    image_url: '',
  });

  useEffect(() => { loadResults(); }, []);

  async function loadResults() {
    try {
      const { data } = await api.get('/lab-results');
      setResults(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/lab-results', newResult);
      toast.success(language === 'fr' ? 'Résultat ajouté' : 'Result added');
      setShowForm(false);
      setNewResult({ test_type: 'Blood Test', results_text: '', notes: '', image_url: '' });
      loadResults();
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Erreur' : 'Error'));
    }
  }

  async function handleAnalyze(id: string) {
    setAnalyzing(id);
    try {
      const { data } = await api.post(`/lab-results/${id}/analyze`);
      setResults(prev => prev.map(r => r.id === id ? { ...r, analysis: data } : r));
      toast.success(language === 'fr' ? 'Analyse terminée' : 'Analysis complete');
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Échec de l\'analyse' : 'Analysis failed'));
    } finally {
      setAnalyzing(null);
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 lg:space-y-6 pb-4">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Résultats de Laboratoire' : 'Lab Results'}
          </h1>
          <p className="text-xs lg:text-sm text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Téléchargez et consultez vos résultats' : 'Upload and view your lab results'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(true)}
          className="btn-primary text-xs lg:text-sm"
        >
          <HiOutlinePlus className="h-4 w-4 mr-1" />
          {language === 'fr' ? 'Nouveau Résultat' : 'Upload New Result'}
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-10 w-10 rounded-full border-3 border-primary-200 border-t-primary-600" />
        </div>
      ) : results.length === 0 ? (
        <motion.div variants={item} className="text-center py-16 text-secondary-400 dark:text-secondary-500">
          <HiOutlineDocumentText className="h-14 w-14 lg:h-20 lg:w-20 mx-auto mb-4 opacity-50" />
          <p className="text-base lg:text-lg font-medium">
            {language === 'fr' ? 'Aucun résultat' : 'No lab results yet'}
          </p>
          <p className="text-sm mt-1">
            {language === 'fr' ? 'Téléchargez votre premier résultat' : 'Upload your first lab result'}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="space-y-3">
          {results.map((r) => (
            <motion.div
              key={r.id}
              layout
              className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 overflow-hidden"
            >
              <div
                className="p-4 lg:p-5 cursor-pointer"
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] lg:text-xs font-medium ${testTypeColors[r.test_type] || 'bg-gray-100 text-gray-700'}`}>
                      {r.test_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-medium ${
                      r.status === 'analyzed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] lg:text-xs text-secondary-400 flex items-center">
                      <HiOutlineClock className="h-3 w-3 mr-1" />
                      {new Date(r.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-GB')}
                    </span>
                    {expandedId === r.id ? <HiOutlineChevronUp className="h-4 w-4 text-secondary-400" /> : <HiOutlineChevronDown className="h-4 w-4 text-secondary-400" />}
                  </div>
                </div>
                <p className="text-sm lg:text-base text-secondary-700 dark:text-secondary-300 mt-2 line-clamp-2">
                  {r.results_text}
                </p>
              </div>

              <AnimatePresence>
                {expandedId === r.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100 dark:border-secondary-700"
                  >
                    <div className="p-4 lg:p-5 space-y-4">
                      <div>
                        <h4 className="text-[10px] lg:text-xs font-medium text-secondary-400 dark:text-secondary-500 uppercase tracking-wider">
                          {language === 'fr' ? 'Résultats Complets' : 'Full Results'}
                        </h4>
                        <p className="text-sm lg:text-base text-secondary-800 dark:text-secondary-200 mt-1 whitespace-pre-wrap">{r.results_text}</p>
                      </div>

                      {r.notes && (
                        <div>
                          <h4 className="text-[10px] lg:text-xs font-medium text-secondary-400 dark:text-secondary-500 uppercase tracking-wider">
                            {language === 'fr' ? 'Notes' : 'Notes'}
                          </h4>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">{r.notes}</p>
                        </div>
                      )}

                      {r.image_url && (
                        <div className="flex items-center space-x-2 text-xs text-primary-600">
                          <HiOutlineUpload className="h-4 w-4" />
                          <span>{language === 'fr' ? 'Fichier joint' : 'File attached'}</span>
                        </div>
                      )}

                      {r.analysis ? (
                        <div className="p-3 lg:p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
                          <h4 className="text-[10px] lg:text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-3">
                            {language === 'fr' ? 'Analyse IA' : 'AI Analysis'}
                          </h4>
                          <div className="space-y-2 text-sm">
                            {r.analysis.keywords?.length > 0 && (
                              <div>
                                <span className="text-[10px] lg:text-xs text-primary-500 dark:text-primary-400 font-medium">
                                  {language === 'fr' ? 'Mots-clés' : 'Keywords'}:
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {r.analysis.keywords.map((kw, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-white dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full text-[10px] lg:text-xs font-medium">
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div>
                              <span className="text-[10px] lg:text-xs text-primary-500 dark:text-primary-400 font-medium">
                                {language === 'fr' ? 'Interprétation' : 'Interpretation'}:
                              </span>
                              <p className="text-primary-800 dark:text-primary-200 mt-0.5">{r.analysis.interpretation}</p>
                            </div>
                            {r.analysis.confidence != null && (
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] lg:text-xs text-primary-500 dark:text-primary-400 font-medium">
                                  {language === 'fr' ? 'Confiance' : 'Confidence'}:
                                </span>
                                <div className="flex-1 h-2 bg-primary-200 dark:bg-primary-800 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${r.analysis.confidence}%` }}
                                    className="h-full bg-primary-600 rounded-full"
                                  />
                                </div>
                                <span className="text-xs font-medium text-primary-700 dark:text-primary-300">{r.analysis.confidence}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => { e.stopPropagation(); handleAnalyze(r.id); }}
                          disabled={analyzing === r.id}
                          className="btn-primary text-sm"
                        >
                          {analyzing === r.id ? (
                            <span className="flex items-center space-x-1">
                              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                              <span>{language === 'fr' ? 'Analyse...' : 'Analyzing...'}</span>
                            </span>
                          ) : (
                            <span>{language === 'fr' ? 'Analyser avec IA' : 'Analyze with AI'}</span>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/40 z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[540px] z-50 bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-secondary-100 dark:border-secondary-700">
                <h2 className="text-lg font-bold text-secondary-900 dark:text-white">
                  {language === 'fr' ? 'Ajouter un Résultat' : 'Add Lab Result'}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
                  <HiOutlineX className="h-5 w-5 text-secondary-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Type de Test' : 'Test Type'}</label>
                  <select
                    className="input dark:bg-secondary-700 dark:text-white"
                    value={newResult.test_type}
                    onChange={(e) => setNewResult({ ...newResult, test_type: e.target.value })}
                    required
                  >
                    {testTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Résultats' : 'Results'}</label>
                  <textarea
                    className="input min-h-[100px] dark:bg-secondary-700 dark:text-white"
                    value={newResult.results_text}
                    onChange={(e) => setNewResult({ ...newResult, results_text: e.target.value })}
                    placeholder={language === 'fr' ? 'Entrez les résultats du test...' : 'Enter test results...'}
                    required
                  />
                </div>

                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Notes' : 'Notes'}</label>
                  <textarea
                    className="input min-h-[60px] dark:bg-secondary-700 dark:text-white"
                    value={newResult.notes}
                    onChange={(e) => setNewResult({ ...newResult, notes: e.target.value })}
                    placeholder={language === 'fr' ? 'Notes additionnelles...' : 'Additional notes...'}
                  />
                </div>

                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Fichier (optionnel)' : 'File (optional)'}</label>
                  <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 dark:border-secondary-600 rounded-xl cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
                    <div className="text-center text-secondary-400">
                      <HiOutlineUpload className="h-6 w-6 mx-auto mb-1" />
                      <p className="text-xs">{language === 'fr' ? 'Cliquez pour télécharger' : 'Click to upload'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    {language === 'fr' ? 'Enregistrer' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
