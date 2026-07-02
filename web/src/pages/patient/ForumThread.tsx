import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineChatAlt2, HiOutlineClock, HiOutlineTag, HiOutlineUser, HiOutlinePaperAirplane } from 'react-icons/hi';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function ForumThread() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/forum/questions/${id}`),
      api.get(`/forum/questions/${id}/answers`),
    ]).then(([qRes, aRes]) => {
      setQuestion(qRes.data);
      setAnswers(aRes.data?.answers || aRes.data?.data || []);
    }).catch(() => {
      toast.error(language === 'fr' ? 'Question introuvable' : 'Question not found');
      navigate('/patient/forum');
    }).finally(() => setLoading(false));
  }, [id]);

  const handlePostAnswer = async () => {
    if (!newAnswer.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/forum/questions/${id}/answers`, { content: newAnswer });
      setAnswers(prev => [...prev, data]);
      setNewAnswer('');
      toast.success(language === 'fr' ? 'Réponse publiée!' : 'Answer posted!');
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-10 w-10 rounded-full border-3 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!question) return null;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 lg:space-y-6 pb-6">
      {/* Back link */}
      <motion.div variants={item}>
        <Link
          to="/patient/forum"
          className="inline-flex items-center space-x-1.5 text-sm text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          <span>{language === 'fr' ? 'Retour au forum' : 'Back to Forum'}</span>
        </Link>
      </motion.div>

      {/* Question */}
      <motion.div variants={item} className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-6">
        <div className="flex items-start space-x-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{question.author?.name?.charAt(0).toUpperCase() || '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg lg:text-xl font-bold text-secondary-900 dark:text-white">{question.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-xs text-secondary-400 dark:text-secondary-500 flex items-center space-x-1">
                <HiOutlineUser className="h-3 w-3" />
                <span>{question.author?.name || language === 'fr' ? 'Anonyme' : 'Anonymous'}</span>
              </span>
              <span className="text-xs text-secondary-400 dark:text-secondary-500 flex items-center space-x-1">
                <HiOutlineClock className="h-3 w-3" />
                <span>{timeAgo(question.created_at)}</span>
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm lg:text-base text-secondary-700 dark:text-secondary-300 leading-relaxed whitespace-pre-wrap">{question.content}</p>
        {question.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {question.tags.map((t: string) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] lg:text-xs font-medium flex items-center space-x-1">
                <HiOutlineTag className="h-2.5 w-2.5" />
                <span>{t}</span>
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Answers */}
      <motion.div variants={item}>
        <h2 className="text-base lg:text-lg font-semibold text-secondary-900 dark:text-white mb-3 flex items-center space-x-2">
          <HiOutlineChatAlt2 className="h-5 w-5" />
          <span>{answers.length} {language === 'fr' ? 'réponses' : 'answers'}</span>
        </h2>

        {answers.length === 0 ? (
          <div className="text-center py-10 text-secondary-400 dark:text-secondary-500">
            <HiOutlineChatAlt2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">{language === 'fr' ? 'Aucune réponse pour le moment' : 'No answers yet'}</p>
            <p className="text-xs mt-1">{language === 'fr' ? 'Soyez le premier à répondre' : 'Be the first to answer'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {answers.map((a: any, i: number) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-5"
              >
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-secondary-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-secondary-500 dark:text-secondary-400">
                      {a.author?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-secondary-900 dark:text-white">
                        {a.author?.name || language === 'fr' ? 'Anonyme' : 'Anonymous'}
                      </span>
                      <span className="text-[10px] text-secondary-400 dark:text-secondary-500">{timeAgo(a.created_at)}</span>
                    </div>
                    <p className="text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Post Answer */}
      <motion.div variants={item} className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-6">
        <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3">
          {language === 'fr' ? 'Votre réponse' : 'Your Answer'}
        </h3>
        <textarea
          value={newAnswer}
          onChange={e => setNewAnswer(e.target.value)}
          rows={4}
          placeholder={language === 'fr' ? 'Écrivez votre réponse...' : 'Write your answer...'}
          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-secondary-700 border border-gray-200 dark:border-secondary-600 rounded-xl text-sm text-secondary-800 dark:text-secondary-200 placeholder-secondary-400 focus:ring-2 focus:ring-primary-500/30 focus:outline-none transition-all resize-none"
        />
        <div className="flex justify-end mt-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={submitting || !newAnswer.trim()}
            onClick={handlePostAnswer}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {submitting ? (
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <HiOutlinePaperAirplane className="h-4 w-4" />
            )}
            <span>{language === 'fr' ? 'Publier' : 'Post Answer'}</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
