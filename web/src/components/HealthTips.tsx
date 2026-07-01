import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineLightBulb, HiOutlineX, HiOutlineChevronRight } from 'react-icons/hi';
import { useLanguage } from '../contexts/LanguageContext';

const tips = [
  { en: 'Drink at least 8 glasses of water daily to stay hydrated and healthy.', fr: 'Buvez au moins 8 verres d\'eau par jour pour rester hydraté et en bonne santé.' },
  { en: 'Wash your hands with soap before eating to prevent infections.', fr: 'Lavez-vous les mains avec du savon avant de manger pour prévenir les infections.' },
  { en: 'Sleep under an insecticide-treated mosquito net every night to prevent malaria.', fr: 'Dormez sous une moustiquaire imprégnée d\'insecticide chaque nuit pour prévenir le paludisme.' },
  { en: 'Breastfeed your baby exclusively for the first 6 months for optimal growth.', fr: 'Allaitez votre bébé exclusivement pendant les 6 premiers mois pour une croissance optimale.' },
  { en: 'Take your medications at the same time every day for best results.', fr: 'Prenez vos médicaments à la même heure chaque jour pour de meilleurs résultats.' },
  { en: 'Exercise for 30 minutes daily — walking, cycling, or dancing counts!', fr: 'Faites de l\'exercice 30 minutes par jour — la marche, le vélo ou la danse comptent!' },
  { en: 'Eat fruits and vegetables with every meal for essential vitamins.', fr: 'Mangez des fruits et légumes à chaque repas pour les vitamines essentielles.' },
  { en: 'Know your blood pressure. Check it regularly at your nearest health center.', fr: 'Connaissez votre tension artérielle. Vérifiez-la régulièrement au centre de santé le plus proche.' },
  { en: 'Vaccinations save lives. Keep your child\'s vaccination schedule up to date.', fr: 'Les vaccins sauvent des vies. Tenez à jour le calendrier de vaccination de votre enfant.' },
  { en: 'Visit a health center immediately if you have a fever, cough, or diarrhea.', fr: 'Rendez-vous immédiatement dans un centre de santé si vous avez de la fièvre, de la toux ou de la diarrhée.' },
];

export default function HealthTips() {
  const { language } = useLanguage();
  const [currentTip, setCurrentTip] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (dismissed || paused) return;
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [dismissed, paused]);

  if (dismissed) return null;

  const tip = tips[currentTip];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="relative bg-gradient-to-r from-primary-600 to-accent-500 rounded-2xl p-4 overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white" />
          <div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-white" />
        </div>

        <div className="relative flex items-start space-x-3">
          <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <HiOutlineLightBulb className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/70 uppercase tracking-wider">
              {language === 'fr' ? 'Conseil Santé' : 'Health Tip'}
            </p>
            <motion.p
              key={currentTip}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-white mt-0.5 leading-relaxed"
            >
              {language === 'fr' ? tip.fr : tip.en}
            </motion.p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors flex-shrink-0"
          >
            <HiOutlineX className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex space-x-1">
            {tips.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentTip(i); setPaused(false); }}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentTip ? 'w-5 bg-white' : 'w-1 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentTip(prev => (prev + 1) % tips.length)}
            className="text-[10px] text-white/70 flex items-center space-x-0.5 hover:text-white"
          >
            <span>{language === 'fr' ? 'Suivant' : 'Next'}</span>
            <HiOutlineChevronRight className="h-3 w-3" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
