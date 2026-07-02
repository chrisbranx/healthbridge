import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlineChatAlt2, HiOutlinePlus, HiOutlineX, HiOutlineTag, HiOutlineClock, HiOutlineCheckCircle } from 'react-icons/hi';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const TAGS = ['General', 'Malaria', 'COVID', 'Pregnancy', 'Nutrition', 'Vaccination', 'Hygiene', 'Mental Health'];

export default function Forum() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', tags: [] as string[] });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions(1, true);
  }, [activeTag]);

  const loadQuestions = async (p: number, reset = false) => {
    if (reset) { setLoading(true); setQuestions([]); }
    else setLoadingMore(true);
    try {
      const params: any = { page: p, per_page: 10 };
      if (activeTag) params.tag = activeTag;
      if (search) params.search = search;
      const { data } = await api.get('/forum/questions', { params });
      const items = data?.questions || data?.data || [];
      setQuestions(prev => reset ? items : [...prev, ...items]);
      setHasMore(items.length >= 10);
      setPage(p);
    } catch {
      toast.error(language === 'fr' ? 'Échec du chargement' : 'Failed to load');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadQuestions(1, true);
  };

  const toggleTag = (tag: string) => {
    setActiveTag(prev => prev === tag ? null : tag);
  };

  const toggleFormTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/forum/questions', form);
      toast.success(language === 'fr' ? 'Question publiée!' : 'Question posted!');
      setShowModal(false);
      setForm({ title: '', content: '', tags: [] });
      loadQuestions(1, true);
    } catch {
      toast.error(language === 'fr' ? 'Échec de publication' : 'Failed to post');
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return language === 'fr' ? 'à l\'instant' : 'just now';
    if (mins < 60) return mins + (language === 'fr' ? ' min' : 'm');
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h';
    const days = Math.floor(hrs / 24);
    return days + (language === 'fr' ? 'j' : 'd');
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 lg:space-y-6 pb-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Forum Communautaire' : 'Community Forum'}
          </h1>
          <p className="text-xs lg:text-sm text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Posez vos questions et partagez vos connaissances' : 'Ask questions and share knowledge'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <HiOutlinePlus className="h-4 w-4" />
          <span>{language === 'fr' ? 'Poser' : 'Ask'}</span>
        </motion.button>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={language === 'fr' ? 'Rechercher des questions...' : 'Search questions...'}
            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 rounded-xl text-sm dark:text-secondary-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all placeholder-secondary-400"
          />
        </div>
      </motion.div>

      {/* Tag chips */}
      <motion.div variants={item} className="flex flex-wrap gap-1.5">
        {TAGS.map(tag => (
          <motion.button
            key={tag}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              activeTag === tag
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                : 'bg-gray-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-gray-200 dark:hover:bg-secondary-600'
            }`}
          >
            {tag}
          </motion.button>
        ))}
      </motion.div>

      {/* Questions list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-10 w-10 rounded-full border-3 border-primary-200 border-t-primary-600" />
        </div>
      ) : questions.length === 0 ? (
        <motion.div variants={item} className="text-center py-16 text-secondary-400 dark:text-secondary-500">
          <HiOutlineChatAlt2 className="h-14 w-14 mx-auto mb-4 opacity-50" />
          <p className="text-base font-medium">{language === 'fr' ? 'Aucune question' : 'No questions yet'}</p>
          <p className="text-sm mt-1">{language === 'fr' ? 'Soyez le premier à poser une question' : 'Be the first to ask a question'}</p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={item} className="space-y-3">
            {questions.map((q: any, i: number) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/patient/forum/${q.id}`)}
                className="bg-gradient-to-br from-white to-primary-50/30 dark:from-secondary-800 dark:to-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-5 cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{q.author?.name?.charAt(0).toUpperCase() || '?'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm lg:text-base font-semibold text-secondary-900 dark:text-white truncate">{q.title}</h3>
                    <p className="text-xs lg:text-sm text-secondary-500 dark:text-secondary-400 mt-1 line-clamp-2">{q.content}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {q.tags?.map((t: string) => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] lg:text-xs font-medium">
                          {t}
                        </span>
                      ))}
                      <span className="flex items-center space-x-1 text-[10px] lg:text-xs text-secondary-400 dark:text-secondary-500 ml-auto">
                        <HiOutlineChatAlt2 className="h-3 w-3" />
                        <span>{q.answer_count || 0}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-[10px] lg:text-xs text-secondary-400 dark:text-secondary-500">
                        <HiOutlineClock className="h-3 w-3" />
                        <span>{timeAgo(q.created_at)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Load More */}
          {hasMore && (
            <motion.div variants={item} className="flex justify-center pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loadingMore}
                onClick={() => loadQuestions(page + 1)}
                className="px-6 py-2.5 bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-secondary-700 transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="flex items-center space-x-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-4 w-4 border-2 border-secondary-400 border-t-transparent rounded-full" />
                    <span>{language === 'fr' ? 'Chargement...' : 'Loading...'}</span>
                  </span>
                ) : (
                  language === 'fr' ? 'Charger plus' : 'Load More'
                )}
              </motion.button>
            </motion.div>
          )}
        </>
      )}

      {/* Ask Question Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-white dark:bg-secondary-800 rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 lg:p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-secondary-900 dark:text-white">
                {language === 'fr' ? 'Poser une question' : 'Ask a Question'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg bg-gray-100 dark:bg-secondary-700 text-secondary-500 hover:bg-gray-200 dark:hover:bg-secondary-600 transition-colors">
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-secondary-500 dark:text-secondary-400 mb-1">
                  {language === 'fr' ? 'Titre' : 'Title'}
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder={language === 'fr' ? 'Résumez votre question...' : 'Summarize your question...'}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-secondary-700 border border-gray-200 dark:border-secondary-600 rounded-xl text-sm text-secondary-800 dark:text-secondary-200 placeholder-secondary-400 focus:ring-2 focus:ring-primary-500/30 focus:outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-500 dark:text-secondary-400 mb-1">
                  {language === 'fr' ? 'Détails' : 'Details'}
                </label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={4}
                  placeholder={language === 'fr' ? 'Expliquez votre question en détail...' : 'Explain your question in detail...'}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-secondary-700 border border-gray-200 dark:border-secondary-600 rounded-xl text-sm text-secondary-800 dark:text-secondary-200 placeholder-secondary-400 focus:ring-2 focus:ring-primary-500/30 focus:outline-none transition-all resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-500 dark:text-secondary-400 mb-1.5">
                  {language === 'fr' ? 'Tags' : 'Tags'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleFormTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        form.tags.includes(tag)
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-700'
                          : 'bg-gray-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 border border-transparent hover:bg-gray-200 dark:hover:bg-secondary-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={submitting || !form.title.trim() || !form.content.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <span>{language === 'fr' ? 'Publier la question' : 'Post Question'}</span>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
