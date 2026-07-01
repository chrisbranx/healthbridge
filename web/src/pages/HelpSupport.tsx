import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import {
  HiOutlineQuestionMarkCircle, HiOutlinePhone, HiOutlineMail,
  HiOutlineBookOpen, HiOutlineChevronDown, HiOutlineChatAlt2,
  HiOutlineUserGroup, HiOutlineGlobe, HiOutlineHeart,
  HiOutlineShieldCheck, HiOutlineExternalLink
} from 'react-icons/hi';

const faqs = [
  { q: 'How do I start a consultation?', qFr: 'Comment démarrer une consultation?',
    a: 'Go to your Dashboard and tap "New Consultation". Describe your symptoms, select severity, and submit. A doctor will review your case within 24 hours.',
    aFr: 'Allez sur votre Tableau de Bord et appuyez sur "Nouvelle Consultation". Décrivez vos symptômes, sélectionnez la gravité et soumettez. Un médecin examinera votre cas dans les 24 heures.' },
  { q: 'How do I use USSD (*800#)?', qFr: 'Comment utiliser l\'USSD (*800#)?',
    a: 'Dial *800# from any mobile phone. Follow the menu to describe symptoms, check history, or get first aid. No internet required.',
    aFr: 'Composez le *800# depuis n\'importe quel téléphone. Suivez le menu pour décrire les symptômes, consulter l\'historique ou obtenir les premiers soins. Pas besoin d\'internet.' },
  { q: 'How do I change my language?', qFr: 'Comment changer ma langue?',
    a: 'Tap the language button (EN/FR) in the top bar, or go to Settings to change your preferred language.',
    aFr: 'Appuyez sur le bouton de langue (EN/FR) dans la barre supérieure, ou allez dans Paramètres pour changer votre langue préférée.' },
  { q: 'How do I view my medical history?', qFr: 'Comment voir mon historique médical?',
    a: 'Tap "My History" on your Dashboard or navigate to History from the bottom menu. You can search and filter past consultations.',
    aFr: 'Appuyez sur "Mon Historique" sur votre Tableau de Bord ou naviguez vers Historique depuis le menu inférieur. Vous pouvez rechercher et filtrer les consultations passées.' },
  { q: 'How do I contact a CHW?', qFr: 'Comment contacter un ASC?',
    a: 'Dial *800# and select "Request CHW Visit", or start a consultation and request a follow-up. A community health worker will be assigned to you.',
    aFr: 'Composez le *800# et sélectionnez "Demander une visite d\'ASC", ou démarrez une consultation et demandez un suivi. Un agent de santé communautaire vous sera attribué.' },
  { q: 'Is my health data private?', qFr: 'Mes données de santé sont-elles privées?',
    a: 'Yes. HealthBridge follows strict data protection standards. Your health information is encrypted and only shared with authorized healthcare providers.',
    aFr: 'Oui. HealthBridge suit des normes strictes de protection des données. Vos informations de santé sont cryptées et partagées uniquement avec des professionnels de santé autorisés.' },
  { q: 'What if I have an emergency?', qFr: 'Que faire en cas d\'urgence?',
    a: 'Call emergency services at 1510 or dial *800# for emergency guidance. Do not wait - seek immediate help for serious conditions.',
    aFr: 'Appelez les services d\'urgence au 1510 ou composez le *800# pour obtenir des conseils d\'urgence. N\'attendez pas - cherchez de l\'aide immédiate pour les conditions graves.' },
  { q: 'How do I update my profile?', qFr: 'Comment mettre à jour mon profil?',
    a: 'Tap your avatar in the top bar or go to Settings to edit your personal information, medical details, and emergency contacts.',
    aFr: 'Appuyez sur votre avatar dans la barre supérieure ou allez dans Paramètres pour modifier vos informations personnelles, vos détails médicaux et vos contacts d\'urgence.' },
];

export default function HelpSupport() {
  const { language } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const inputClass = "w-full px-3 py-2.5 bg-gray-50 dark:bg-secondary-700 border border-gray-200 dark:border-secondary-600 rounded-xl text-sm text-secondary-800 dark:text-secondary-200 placeholder-secondary-400 focus:ring-2 focus:ring-primary-500/30 focus:outline-none transition-all";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-4 lg:space-y-6 pb-6">
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
          <HiOutlineQuestionMarkCircle className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Aide et Support' : 'Help & Support'}
          </h1>
          <p className="text-xs text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Trouvez des réponses et obtenez de l\'aide' : 'Find answers and get assistance'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: HiOutlinePhone, label: language === 'fr' ? 'Urgence: 1510' : 'Emergency: 1510', sub: language === 'fr' ? 'Appelez immédiatement' : 'Call immediately', color: 'from-red-500 to-red-600' },
          { icon: HiOutlineGlobe, label: '*800#', sub: language === 'fr' ? 'USSD - Pas d\'internet nécessaire' : 'USSD - No internet needed', color: 'from-primary-600 to-accent-500' },
          { icon: HiOutlineChatAlt2, label: 'AI Assistant', sub: language === 'fr' ? 'Support 24/7 dans l\'app' : '24/7 in-app support', color: 'from-blue-500 to-indigo-500' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i} whileHover={{ y: -2 }}
              className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 flex items-center space-x-3">
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-900 dark:text-white">{card.label}</p>
                <p className="text-[10px] text-secondary-500 dark:text-secondary-400">{card.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-6">
        <h2 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 flex items-center space-x-2 mb-4">
          <HiOutlineBookOpen className="h-4 w-4" />
          <span>{language === 'fr' ? 'Foire Aux Questions' : 'Frequently Asked Questions'}</span>
        </h2>
        <div className="space-y-1">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-gray-100 dark:border-secondary-700 last:border-0">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between py-3 text-left"
              >
                <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">{language === 'fr' ? faq.qFr : faq.q}</span>
                <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <HiOutlineChevronDown className="h-4 w-4 text-secondary-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 pb-3 leading-relaxed">
                      {language === 'fr' ? faq.aFr : faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-6">
        <h2 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 flex items-center space-x-2 mb-4">
          <HiOutlineChatAlt2 className="h-4 w-4" />
          <span>{language === 'fr' ? 'Nous Contacter' : 'Contact Us'}</span>
        </h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-secondary-700/50 rounded-xl">
            <HiOutlinePhone className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">{language === 'fr' ? 'Support technique' : 'Technical Support'}</p>
              <p className="text-xs text-secondary-500">+237 690 000 000</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-secondary-700/50 rounded-xl">
            <HiOutlineMail className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Email</p>
              <p className="text-xs text-secondary-500">support@healthbridge.cm</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-secondary-700/50 rounded-xl">
            <HiOutlineGlobe className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">USSD</p>
              <p className="text-xs text-secondary-500">*800#</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-primary-100 dark:border-primary-800">
        <div className="flex items-start space-x-3">
          <HiOutlineHeart className="h-5 w-5 text-primary-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-primary-800 dark:text-primary-200">
              {language === 'fr' ? 'Support 24/7' : '24/7 Support'}
            </h3>
            <p className="text-xs text-primary-600 dark:text-primary-300 mt-1">
              {language === 'fr'
                ? 'Notre assistant IA est disponible 24h/24 et 7j/7. Appuyez sur le bouton de chat en bas à droite pour obtenir une aide instantanée.'
                : 'Our AI assistant is available 24/7. Tap the chat button in the bottom-right corner for instant help.'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
