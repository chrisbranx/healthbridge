import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePhone, HiOutlineMail, HiOutlineUser, HiOutlineLockClosed, HiOutlineGlobe, HiOutlineHeart, HiOutlineShieldCheck, HiOutlineEye, HiOutlineEyeOff, HiOutlineAcademicCap, HiOutlineBadgeCheck, HiOutlineClock } from 'react-icons/hi';

export default function Register() {
  const { language } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showProfessionalFields, setShowProfessionalFields] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '+237',
    email: '',
    password: '',
    role: 'patient' as 'patient' | 'doctor' | 'chw',
    region: '',
    qualifications: '',
    license_number: '',
    experience_years: '',
    specialization: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        name: form.name,
        password: form.password,
        role: form.role,
        language: language,
        region: form.region,
      };
      if (method === 'phone') payload.phone = form.phone;
      else payload.email = form.email;
      if (form.role !== 'patient') {
        payload.qualifications = form.qualifications;
        payload.license_number = form.license_number;
        payload.experience_years = form.experience_years ? parseInt(form.experience_years) : undefined;
        payload.specialization = form.specialization;
      }
      const result = await register(payload);
      if (result?.pending) {
        setPendingMessage(result.message || null);
        return;
      }
      navigate('/');
      toast.success(language === 'fr' ? 'Compte créé avec succès!' : 'Account created successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Échec de l\'inscription' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  if (pendingMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center space-y-6 py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="h-20 w-20 rounded-full bg-accent-100 flex items-center justify-center mx-auto"
            >
              <HiOutlineClock className="h-10 w-10 text-accent-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-secondary-900">
              {language === 'fr' ? 'Demande reçue !' : 'Application Received!'}
            </h2>
            <p className="text-secondary-500 leading-relaxed">
              {pendingMessage}
            </p>
            <p className="text-sm text-secondary-400">
              {language === 'fr'
                ? 'Vous recevrez une notification dès que votre compte sera approuvé.'
                : 'You will be notified once your account is approved.'}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary px-8 py-3"
            >
              {language === 'fr' ? 'Aller à la connexion' : 'Go to Login'}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-xl"
          >
            <HiOutlineHeart className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-secondary-900">HealthBridge</h1>
          <p className="text-secondary-500 mt-1">
            {language === 'fr' ? 'Créer un compte' : 'Create your account'}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="card space-y-4"
            >
              <h2 className="text-lg font-semibold text-center mb-4">
                {language === 'fr' ? 'Choisissez votre méthode' : 'Choose your method'}
              </h2>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setMethod('phone'); setStep(2); }}
                className="w-full p-4 rounded-xl border-2 border-primary-200 bg-primary-50/50 hover:bg-primary-50 hover:border-primary-400 transition-all flex items-center space-x-4"
              >
                <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                  <HiOutlinePhone className="h-6 w-6 text-primary-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-secondary-900">
                    {language === 'fr' ? "S'inscrire avec Téléphone" : 'Register with Phone'}
                  </p>
                  <p className="text-sm text-secondary-500">*800# USSD ready</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setMethod('email'); setStep(2); }}
                className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 transition-all flex items-center space-x-4"
              >
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <HiOutlineMail className="h-6 w-6 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-secondary-900">
                    {language === 'fr' ? "S'inscrire avec Email" : 'Register with Email'}
                  </p>
                  <p className="text-sm text-secondary-500">
                    {language === 'fr' ? 'Nécessite un accès internet' : 'Requires internet access'}
                  </p>
                </div>
              </motion.button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-secondary-400">
                    {language === 'fr' ? 'Ou continuer avec' : 'Or continue with'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toast(language === 'fr' ? 'Connexion Google bientôt disponible' : 'Google login coming soon')}
                  className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 dark:border-secondary-600 dark:hover:bg-secondary-700 flex items-center justify-center space-x-2 transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  <span className="text-sm font-medium dark:text-secondary-200">Google</span>
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toast(language === 'fr' ? 'Connexion Facebook bientôt disponible' : 'Facebook login coming soon')}
                  className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:border-secondary-600 dark:hover:bg-secondary-700 flex items-center justify-center space-x-2 transition-colors"
                >
                  <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  <span className="text-sm font-medium dark:text-secondary-200">Facebook</span>
                </motion.button>
              </div>

              <p className="text-center text-sm text-secondary-400 mt-4">
                {language === 'fr' ? 'Pas encore de compte?' : 'Already have an account?'}{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  {language === 'fr' ? 'Connectez-vous' : 'Sign in'}
                </Link>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              onSubmit={handleSubmit}
              className="card space-y-4"
            >
              <button type="button" onClick={() => setStep(1)} className="text-sm text-primary-600 hover:text-primary-700 font-medium mb-2 flex items-center">
                &larr; {language === 'fr' ? 'Retour' : 'Back'}
              </button>

              <div>
                <label className="label">{language === 'fr' ? 'Nom Complet' : 'Full Name'}</label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="text" className="input pl-10" placeholder="John Doe" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
              </div>

              {method === 'phone' ? (
                <div>
                  <label className="label">{language === 'fr' ? 'Numéro de Téléphone' : 'Phone Number'}</label>
                  <div className="relative">
                    <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="tel" className="input pl-10" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                  </div>
                  <p className="text-xs text-secondary-400 mt-1">{language === 'fr' ? 'Format: +237 6XX XXX XXX' : 'Format: +237 6XX XXX XXX'}</p>
                </div>
              ) : (
                <div>
                  <label className="label">{language === 'fr' ? 'Adresse Email' : 'Email Address'}</label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="email" className="input pl-10" placeholder="email@example.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
              )}

              <div>
                <label className="label">{language === 'fr' ? 'Mot de Passe' : 'Password'}</label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="Min. 6 characters" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{language === 'fr' ? 'Je suis...' : 'I am a...'}</label>
                  <select className="input" value={form.role}
                    onChange={(e) => {
                      setForm({ ...form, role: e.target.value as any });
                      setShowProfessionalFields(e.target.value !== 'patient');
                    }}>
                    <option value="patient">{language === 'fr' ? 'Patient' : 'Patient'}</option>
                    <option value="doctor">{language === 'fr' ? 'Médecin' : 'Doctor'}</option>
                    <option value="chw">{language === 'fr' ? 'Agent de Santé' : 'CHW'}</option>
                  </select>
                </div>
                <div>
                  <label className="label">{language === 'fr' ? 'Région' : 'Region'}</label>
                  <select className="input" value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}>
                    <option value="">{language === 'fr' ? 'Choisir' : 'Select'}</option>
                    {['Adamawa','Centre','East','Far North','Littoral','North','Northwest','South','Southwest','West'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {showProfessionalFields && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-2 border-t border-gray-100"
                >
                  <p className="text-sm font-medium text-secondary-700 flex items-center gap-2">
                    <HiOutlineAcademicCap className="h-4 w-4 text-primary-500" />
                    {language === 'fr' ? 'Informations professionnelles' : 'Professional Information'}
                    <span className="text-xs text-secondary-400 font-normal">
                      ({language === 'fr' ? 'requis pour approbation' : 'required for approval'})
                    </span>
                  </p>
                  <div>
                    <label className="label">{language === 'fr' ? 'Qualifications / Diplômes' : 'Qualifications / Degrees'}</label>
                    <div className="relative">
                      <HiOutlineAcademicCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input type="text" className="input pl-10" placeholder="e.g. MD, University of Yaoundé I" value={form.qualifications}
                        onChange={(e) => setForm({ ...form, qualifications: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <label className="label">{language === 'fr' ? 'Numéro de licence' : 'License Number'}</label>
                    <div className="relative">
                      <HiOutlineBadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input type="text" className="input pl-10" placeholder="e.g. CM-MD-2024-xxxx" value={form.license_number}
                        onChange={(e) => setForm({ ...form, license_number: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">{language === 'fr' ? 'Années d\'expérience' : 'Years of Experience'}</label>
                      <div className="relative">
                        <HiOutlineClock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="number" className="input pl-10" placeholder="0" min="0" value={form.experience_years}
                          onChange={(e) => setForm({ ...form, experience_years: e.target.value })} required />
                      </div>
                    </div>
                    <div>
                      <label className="label">{language === 'fr' ? 'Spécialisation' : 'Specialization'}</label>
                      <select className="input" value={form.specialization}
                        onChange={(e) => setForm({ ...form, specialization: e.target.value })}>
                        <option value="">{language === 'fr' ? 'Choisir' : 'Select'}</option>
                        {form.role === 'doctor' ? (
                          <>
                            <option value="General Medicine">{language === 'fr' ? 'Médecine générale' : 'General Medicine'}</option>
                            <option value="Pediatrics">{language === 'fr' ? 'Pédiatrie' : 'Pediatrics'}</option>
                            <option value="Gynecology">{language === 'fr' ? 'Gynécologie' : 'Gynecology'}</option>
                            <option value="Cardiology">{language === 'fr' ? 'Cardiologie' : 'Cardiology'}</option>
                            <option value="Internal Medicine">{language === 'fr' ? 'Médecine interne' : 'Internal Medicine'}</option>
                            <option value="Surgery">{language === 'fr' ? 'Chirurgie' : 'Surgery'}</option>
                            <option value="Public Health">{language === 'fr' ? 'Santé publique' : 'Public Health'}</option>
                          </>
                        ) : (
                          <>
                            <option value="Community Health">{language === 'fr' ? 'Santé communautaire' : 'Community Health'}</option>
                            <option value="Maternal Health">{language === 'fr' ? 'Santé maternelle' : 'Maternal Health'}</option>
                            <option value="Child Health">{language === 'fr' ? 'Santé infantile' : 'Child Health'}</option>
                            <option value="HIV/TB Care">{language === 'fr' ? 'Soins VIH/TB' : 'HIV/TB Care'}</option>
                            <option value="Nutrition">{language === 'fr' ? 'Nutrition' : 'Nutrition'}</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                  <div className="rounded-lg bg-accent-50 p-3 text-xs text-accent-700 leading-relaxed">
                    <HiOutlineShieldCheck className="h-4 w-4 inline mr-1" />
                    {form.role === 'doctor'
                      ? (language === 'fr'
                        ? 'Les médecins approuvés reçoivent des droits d\'administration. Ces informations seront examinées avant l\'approbation.'
                        : 'Approved doctors receive admin privileges. This information will be reviewed before approval.')
                      : (language === 'fr'
                        ? 'Ces informations seront examinées par un administrateur avant l\'activation de votre compte.'
                        : 'This information will be reviewed by an administrator before your account is activated.')}
                  </div>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {loading ? (language === 'fr' ? 'Envoi...' : 'Submitting...') : (language === 'fr' ? 'Créer le Compte' : 'Create Account')}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center space-x-2 text-xs text-secondary-400">
            <HiOutlineShieldCheck className="h-4 w-4 text-primary-500" />
            <span>{language === 'fr' ? 'Sécurisé et crypté' : 'Secure & encrypted'}</span>
            <span className="text-gray-300">|</span>
            <HiOutlineGlobe className="h-4 w-4 text-primary-500" />
            <span>EN / FR</span>
          </div>
          <p className="text-xs text-secondary-400 mt-2">
            {language === 'fr' ? 'Composez le' : 'Dial'} <strong>*800#</strong> {language === 'fr' ? 'sur votre téléphone' : 'on your phone'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
