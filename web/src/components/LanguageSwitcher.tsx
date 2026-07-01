import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { HiOutlineGlobe } from 'react-icons/hi';

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <motion.button
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Switch language"
    >
      <HiOutlineGlobe className="h-5 w-5 text-primary-600" />
      <AnimatePresence mode="wait">
        <motion.span
          key={language}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="text-sm font-bold text-secondary-700 uppercase tracking-wider min-w-[28px]"
        >
          {language}
        </motion.span>
      </AnimatePresence>
      <motion.div
        animate={{ rotate: language === 'fr' ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden"
      >
        <span className="text-[10px] font-bold text-primary-700">
          {language === 'en' ? 'FR' : 'EN'}
        </span>
      </motion.div>
    </motion.button>
  );
}
