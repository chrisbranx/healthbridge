import { motion } from 'framer-motion';
import { HiOutlinePhone, HiOutlineHeart, HiOutlineShieldCheck, HiOutlineInformationCircle } from 'react-icons/hi';
import { useLanguage } from '../contexts/LanguageContext';

const contacts = [
  { number: '1510', labelEn: 'Emergency Services', labelFr: 'Services d\'Urgence', icon: HiOutlinePhone, color: 'bg-red-500', priority: 'high' },
  { number: '*800#', labelEn: 'HealthBridge USSD', labelFr: 'HealthBridge USSD', icon: HiOutlineHeart, color: 'bg-primary-500', priority: 'high' },
  { number: '112', labelEn: 'Police', labelFr: 'Police', icon: HiOutlineShieldCheck, color: 'bg-blue-600', priority: 'medium' },
  { number: '119', labelEn: 'Fire Brigade', labelFr: 'Pompiers', icon: HiOutlineInformationCircle, color: 'bg-orange-500', priority: 'medium' },
];

export default function EmergencyContacts() {
  const { language } = useLanguage();

  const handleCall = (number: string) => {
    if (number.startsWith('*')) {
      navigator.clipboard?.writeText(number);
    }
    window.open(`tel:${number.replace('*', '%2A')}`, '_self');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-secondary-900 dark:text-white flex items-center space-x-1.5">
          <HiOutlinePhone className="h-4 w-4 text-primary-500" />
          <span>{language === 'fr' ? 'Contacts d\'Urgence' : 'Emergency Contacts'}</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {contacts.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.button
              key={c.number}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCall(c.number)}
              className={`relative p-3 rounded-xl text-white ${c.color} shadow-lg hover:shadow-xl transition-all text-left overflow-hidden`}
            >
              {c.priority === 'high' && (
                <motion.div
                  className="absolute top-2 right-2 h-2 w-2 rounded-full bg-white/60"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              <Icon className="h-5 w-5 mb-1 opacity-80" />
              <p className="font-bold text-lg">{c.number}</p>
              <p className="text-[10px] opacity-80 leading-tight">
                {language === 'fr' ? c.labelFr : c.labelEn}
              </p>
            </motion.button>
          );
        })}
      </div>

      <p className="text-[10px] text-secondary-400 dark:text-secondary-500 text-center">
        {language === 'fr'
          ? 'Appuyez sur un numéro pour appeler. *800# est copié dans le presse-papier.'
          : 'Tap a number to call. *800# is copied to clipboard for USSD dialing.'}
      </p>
    </div>
  );
}
