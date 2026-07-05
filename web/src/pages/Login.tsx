import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePhone, HiOutlineLockClosed, HiOutlineHeart, HiOutlineShieldCheck, HiOutlineGlobe, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

export default function Login() {
  const { language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState(() => localStorage.getItem('hb_remember_phone') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('hb_remember_phone'));
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      if (googleBtnRef.current && (window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response.credential) {
              try {
                setLoading(true);
                const { data } = await api.post('/auth/google', { credential: response.credential });
                localStorage.setItem('hb_token', data.token);
                api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                window.location.href = '/';
              } catch (err: any) {
                toast.error(err.response?.data?.error || 'Google login failed');
              } finally {
                setLoading(false);
              }
            }
          },
        });
        (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          shape: 'rectangular',
          theme: 'outline',
          text: 'signin_with',
          size: 'large',
          width: 280,
        });
      }
    };
    document.head.appendChild(script);
    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) document.head.removeChild(existingScript);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(phone, password);
      if (rememberMe) {
        localStorage.setItem('hb_remember_phone', phone);
      } else {
        localStorage.removeItem('hb_remember_phone');
      }
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
                type={showPassword ? 'text' : 'password'}
                className="input pl-10 pr-10"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm text-secondary-600">{language === 'fr' ? 'Se souvenir de moi' : 'Remember me'}</span>
            </label>
            <span className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer font-medium">{language === 'fr' ? 'Mot de passe oublié?' : 'Forgot password?'}</span>
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
            <motion.div
              ref={googleBtnRef}
              className="flex justify-center"
            />
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
