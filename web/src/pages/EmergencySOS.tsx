import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePhone, HiOutlineHeart, HiOutlineExclamationCircle, HiOutlineLocationMarker, HiOutlineX, HiOutlineUserGroup, HiOutlineInformationCircle, HiOutlineCheckCircle, HiOutlineShieldCheck } from 'react-icons/hi';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function EmergencySOS() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'idle' | 'countdown' | 'sent' | 'cancelled'>('idle');
  const [countdown, setCountdown] = useState(60);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [sosResult, setSosResult] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentAtRef = useRef<number>(0);
  const [canCancel, setCanCancel] = useState(false);

  useEffect(() => {
    api.get('/family/members').then(({ data }) => setContacts(data || [])).catch(() => {}).finally(() => setLoadingContacts(false));
  }, []);

  const bloodType = user?.patient_profile?.blood_type;
  const allergies = user?.patient_profile?.allergies;

  const startSOS = () => {
    if (!navigator.geolocation) {
      toast.error(language === 'fr' ? 'Géolocalisation non disponible' : 'Geolocation unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        setPhase('countdown');
        setCountdown(60);
        setCanCancel(true);
        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              sendSOS(latitude, longitude);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      },
      () => {
        toast.error(language === 'fr' ? 'Impossible d\'obtenir votre position. Activez la géolocalisation.' : 'Could not get your location. Enable GPS.');
      }
    );
  };

  const sendSOS = async (latitude: number, longitude: number) => {
    try {
      const { data } = await api.post('/sos', {
        latitude,
        longitude,
        patient_name: user?.name || 'Unknown',
      });
      setSosResult(data);
      setPhase('sent');
      sentAtRef.current = Date.now();
      setCanCancel(true);
      setTimeout(() => setCanCancel(false), 5000);
      toast.success(language === 'fr' ? 'Alerte SOS envoyée!' : 'SOS alert sent!');
    } catch {
      toast.error(language === 'fr' ? 'Échec d\'envoi SOS' : 'Failed to send SOS');
      setPhase('idle');
    }
  };

  const cancelSOS = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('cancelled');
    setCanCancel(false);
    toast(language === 'fr' ? 'Alerte annulée' : 'Alert cancelled');
  };

  const callNumber = (phone: string) => {
    toast.success(`${language === 'fr' ? 'Appel vers' : 'Calling'} ${phone}`);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return language === 'fr' ? 'à l\'instant' : 'just now';
    if (mins < 60) return mins + (language === 'fr' ? ' min' : 'm');
    const hrs = Math.floor(mins / 60);
    return hrs + 'h';
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="min-h-screen bg-gray-950 text-white space-y-4 lg:space-y-6 pb-8 px-4 lg:px-6 pt-4">
      {/* Back */}
      <motion.div variants={item} className="flex items-center justify-between">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="p-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
        <span className="text-xs text-red-400 font-semibold tracking-wider uppercase">{language === 'fr' ? 'Urgence' : 'Emergency'}</span>
      </motion.div>

      {/* SOS Button */}
      {phase === 'idle' && (
        <motion.div variants={item} className="flex flex-col items-center pt-6 lg:pt-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ boxShadow: ['0 0 0 0 rgba(220,38,38,0.7)', '0 0 0 30px rgba(220,38,38,0)', '0 0 0 0 rgba(220,38,38,0.7)'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            onClick={startSOS}
            className="relative h-48 w-48 lg:h-56 lg:w-56 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex flex-col items-center justify-center shadow-2xl shadow-red-500/50 border-4 border-red-400"
          >
            <span className="text-5xl lg:text-6xl font-black tracking-widest">SOS</span>
            <span className="text-sm lg:text-base mt-2 font-medium text-red-200">{language === 'fr' ? 'Appuyez pour alerter' : 'Tap to alert'}</span>
          </motion.button>
          <p className="text-sm text-white/50 mt-6 text-center max-w-xs">
            {language === 'fr'
              ? 'Un signal d\'urgence sera envoyé à l\'équipe médicale la plus proche avec votre position.'
              : 'An emergency signal will be sent to the nearest medical team with your location.'}
          </p>
        </motion.div>
      )}

      {/* Countdown */}
      {phase === 'countdown' && (
        <motion.div variants={item} className="flex flex-col items-center pt-6 lg:pt-10">
          <div className="relative h-48 w-48 lg:h-56 lg:w-56 rounded-full bg-gradient-to-br from-red-600/30 to-red-800/30 border-4 border-red-500 flex flex-col items-center justify-center">
            <motion.span
              key={countdown}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl lg:text-7xl font-black text-red-400"
            >
              {countdown}
            </motion.span>
            <span className="text-xs text-white/60 mt-1">{language === 'fr' ? 'secondes' : 'seconds'}</span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: countdown, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-4 border-t-red-500 border-transparent"
            />
          </div>
          <p className="text-sm text-white/60 mt-4 text-center">
            {language === 'fr'
              ? 'Alerte SOS sera envoyée automatiquement...'
              : 'SOS alert will be sent automatically...'}
          </p>
          {canCancel && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={cancelSOS}
              className="mt-6 px-8 py-3 rounded-xl border-2 border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors flex items-center space-x-2"
            >
              <HiOutlineX className="h-5 w-5" />
              <span>{language === 'fr' ? 'Annuler l\'alerte' : 'Cancel Alert'}</span>
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Sent Confirmation */}
      {phase === 'sent' && (
        <motion.div variants={item} className="flex flex-col items-center pt-4 lg:pt-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center mb-4"
          >
            <HiOutlineCheckCircle className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-xl lg:text-2xl font-bold">{language === 'fr' ? 'Alerte Envoyée!' : 'Alert Sent!'}</h2>
          <p className="text-sm text-white/60 mt-1 text-center max-w-sm">
            {language === 'fr'
              ? 'L\'équipe médicale a été notifiée. De l\'aide arrive.'
              : 'Medical team has been notified. Help is on the way.'}
          </p>

          {sosResult?.nearest_clinic && (
            <motion.div variants={item} className="w-full max-w-sm mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-start space-x-3">
                <HiOutlineLocationMarker className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{language === 'fr' ? 'Clinique la plus proche' : 'Nearest Clinic'}</p>
                  <p className="text-sm text-white/70 mt-0.5">{sosResult.nearest_clinic.name}</p>
                  <p className="text-xs text-white/50 mt-0.5">{sosResult.nearest_clinic.address}</p>
                  <p className="text-xs text-white/50">{sosResult.nearest_clinic.phone}</p>
                </div>
              </div>
            </motion.div>
          )}

          {canCancel && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={cancelSOS}
              className="mt-4 px-6 py-2.5 rounded-xl border-2 border-red-400/50 text-red-400 font-medium text-sm hover:bg-red-500/10 transition-colors"
            >
              {language === 'fr' ? 'Annuler (5s)' : 'Cancel (5s)'}
            </motion.button>
          )}

          <motion.button
            variants={item}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setPhase('idle'); setSosResult(null); }}
            className="mt-4 px-6 py-2.5 rounded-xl bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors"
          >
            {language === 'fr' ? 'Retour' : 'Go Back'}
          </motion.button>
        </motion.div>
      )}

      {/* Cancelled */}
      {phase === 'cancelled' && (
        <motion.div variants={item} className="flex flex-col items-center pt-6 lg:pt-10">
          <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <HiOutlineShieldCheck className="h-10 w-10 text-white/60" />
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-white/70">{language === 'fr' ? 'Alerte Annulée' : 'Alert Cancelled'}</h2>
          <p className="text-sm text-white/50 mt-1">{language === 'fr' ? 'Vous êtes en sécurité' : 'You are safe'}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPhase('idle')}
            className="mt-6 px-8 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors"
          >
            {language === 'fr' ? 'Nouvelle alerte' : 'New Alert'}
          </motion.button>
        </motion.div>
      )}

      {/* Medical Info Badge */}
      {phase !== 'sent' && (bloodType || (allergies && allergies.length > 0)) && (
        <motion.div variants={item} className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-2">
            <HiOutlineInformationCircle className="h-4 w-4 text-red-400" />
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">{language === 'fr' ? 'Infos Médicales' : 'Medical Info'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {bloodType && (
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold border border-red-500/30">
                {language === 'fr' ? 'Groupe sanguin' : 'Blood Type'}: {bloodType}
              </span>
            )}
            {allergies?.map((a: string, i: number) => (
              <span key={i} className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs border border-yellow-500/30">
                {language === 'fr' ? 'Allergie' : 'Allergy'}: {a}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Emergency Contacts */}
      <motion.div variants={item}>
        <div className="flex items-center space-x-2 mb-3">
          <HiOutlineUserGroup className="h-4 w-4 text-red-400" />
          <h3 className="text-sm font-semibold text-white/80">{language === 'fr' ? 'Contacts d\'Urgence' : 'Emergency Contacts'}</h3>
        </div>
        {loadingContacts ? (
          <div className="flex justify-center py-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-6 w-6 rounded-full border-2 border-red-400 border-t-transparent" />
          </div>
        ) : contacts.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-4">{language === 'fr' ? 'Aucun contact d\'urgence' : 'No emergency contacts'}</p>
        ) : (
          <div className="space-y-2">
            {contacts.map((c: any, i: number) => (
              <motion.div
                key={c.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-red-300">{c.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{c.name}</p>
                    <p className="text-xs text-white/50">{c.relationship}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => callNumber(c.phone)}
                  className="h-9 w-9 rounded-full bg-red-500/20 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                >
                  <HiOutlinePhone className="h-4 w-4 text-red-300" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Direct call buttons */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => callNumber('1510')}
          className="flex items-center justify-center space-x-2 py-3 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 font-medium text-sm hover:bg-red-600/30 transition-colors"
        >
          <HiOutlinePhone className="h-4 w-4" />
          <span>1510 {language === 'fr' ? 'Urgences' : 'Emergency'}</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => callNumber('*800#')}
          className="flex items-center justify-center space-x-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium text-sm hover:bg-white/10 transition-colors"
        >
          <HiOutlinePhone className="h-4 w-4" />
          <span>*800# USSD</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
