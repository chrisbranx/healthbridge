import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePhone, HiOutlineLockClosed, HiOutlineHeart, HiOutlineShieldCheck, HiOutlineGlobe } from 'react-icons/hi';

export default function Login() {
  const { language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/');
      toast.success(language === 'fr' ? 'Bienvenue!' : 'Welcome back!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Échec de la connexion' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-primary-500/20"
          >
            <HiOutlineHeart className="h-10 w-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-secondary-900"
          >
            <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">HealthBridge</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-secondary-500 mt-1"
          >
            {language === 'fr' ? 'Connectez-vous à votre compte' : 'Sign in to your account'}
          </motion.p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="card space-y-4 bg-white/80 backdrop-blur-sm"
        >
          <div>
            <label className="label">{language === 'fr' ? 'Numéro de Téléphone' : 'Phone Number'}</label>
            <div className="relative">
              <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                className="input pl-10"
                placeholder="+237 6XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">{language === 'fr' ? 'Mot de Passe' : 'Password'}</label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                className="input pl-10"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>{language === 'fr' ? 'Connexion...' : 'Signing in...'}</span>
              </span>
            ) : (
              language === 'fr' ? 'Se Connecter' : 'Sign In'
            )}
          </motion.button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-secondary-400">
                {language === 'fr' ? 'Ou continuez avec' : 'Or continue with'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                window.location.href = `${import.meta.env.VITE_API_URL || ''}/api/auth/google`;
              }}
              className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:border-secondary-600 dark:hover:bg-secondary-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span className="text-sm font-medium dark:text-secondary-200">Google</span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                window.location.href = `${import.meta.env.VITE_API_URL || ''}/api/auth/facebook`;
              }}
              className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:border-secondary-600 dark:hover:bg-secondary-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span className="text-sm font-medium dark:text-secondary-200">Facebook</span>
            </motion.button>
          </div>

          <p className="text-center text-sm text-secondary-500">
            {language === 'fr' ? 'Pas encore de compte?' : "Don't have an account?"}{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              {language === 'fr' ? "S'inscrire" : 'Register'}
            </Link>
          </p>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center bg-primary-50/50 rounded-xl p-4 border border-primary-100"
        >
          <div className="flex items-center justify-center space-x-2 text-xs text-secondary-500">
            <HiOutlineShieldCheck className="h-4 w-4 text-primary-500" />
            <span>{language === 'fr' ? 'Sécurisé et crypté' : 'Secure & encrypted'}</span>
            <span className="text-gray-300">|</span>
            <HiOutlineGlobe className="h-4 w-4 text-primary-500" />
            <span>EN / FR</span>
          </div>
          <p className="text-xs text-secondary-400 mt-2">
            {language === 'fr' ? 'Composez le' : 'Dial'} <strong>*800#</strong> {language === 'fr' ? 'sur votre téléphone' : 'on any phone'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
