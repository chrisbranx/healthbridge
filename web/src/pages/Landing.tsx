import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  HiOutlinePhone, HiOutlineGlobe, HiOutlineUserGroup, HiOutlineHeart,
  HiOutlineShieldCheck, HiOutlineClock, HiOutlineLocationMarker,
  HiOutlineStar, HiOutlineChevronRight, HiOutlineClipboardList,
  HiOutlineChartBar, HiOutlineVideoCamera, HiOutlineAcademicCap,
  HiOutlineSparkles, HiOutlineSun, HiOutlineMoon
} from 'react-icons/hi';
import Logo from '../components/Logo';
import { DoctorIllustration, CHWIllustration, PatientGroupIllustration, TelemedicineIllustration, GlobeIllustration } from '../components/MedicalIllustrations';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: 'easeOut' as const },
} as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
} as const;

function MagneticButton({ children, className = '', as: Component = 'button', to, href, ...props }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
    setPosition({ x, y });
  }, []);

  const handleLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouse);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouse);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [handleMouse, handleLeave]);

  const content = (
    <div
      ref={ref}
      className="inline-block"
      style={{ transform: `translate(${position.x}px, ${position.y}px)`, transition: 'transform 0.2s ease-out' }}
    >
      {children}
    </div>
  );

  if (to) return <Link to={to} className={className} {...props}>{content}</Link>;
  if (href) return <a href={href} className={className} {...props}>{content}</a>;
  return <Component className={className} {...props}>{content}</Component>;
}

function RippleButton({ children, className = '', ...props }: any) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'absolute rounded-full bg-white/30 pointer-events-none';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.style.animation = 'ripple 0.6s ease-out forwards';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <button ref={btnRef} className={`relative overflow-hidden ${className}`} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

function AnimatedCounter({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-white via-primary-100 to-accent-200 bg-clip-text text-transparent"
      >
        {count.toLocaleString()}{suffix}
      </motion.span>
      <p className="text-primary-200 text-sm mt-1.5 font-medium tracking-wide">{label}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white/10 rounded-2xl p-6 animate-pulse">
      <div className="h-12 w-12 rounded-xl bg-white/10 mb-4" />
      <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
      <div className="h-3 w-full bg-white/5 rounded" />
    </div>
  );
}

export default function Landing() {
  const { language, toggleLanguage } = useLanguage();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('hb-dark') === 'true');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  const featuresRef = useRef<HTMLDivElement>(null);

  const lang = language;

  useEffect(() => {
    const sections = document.querySelectorAll('.reveal-section');
    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 85%',
        toggleClass: 'is-visible',
        once: true,
      });
    });
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const stats = [
    { value: 5000, suffix: '+', label: lang === 'fr' ? 'Patients servis' : 'Patients Served' },
    { value: 200, suffix: '+', label: lang === 'fr' ? 'ASC intégrés' : 'CHWs Onboarded' },
    { value: 24, suffix: 'h', label: lang === 'fr' ? 'Délai de réponse' : 'Response Time' },
    { value: 98, suffix: '%', label: lang === 'fr' ? 'Satisfaction' : 'Satisfaction Rate' },
  ];

  const features = [
    {
      icon: HiOutlinePhone, size: 'large',
      title: lang === 'fr' ? 'Consultation USSD' : 'USSD Consultation',
      desc: lang === 'fr' ? 'Composez le *800# depuis n\'importe quel téléphone. Pas d\'internet requis.' : 'Dial *800# from any phone. No internet required.',
      gradient: 'from-primary-500 to-accent-500',
      illustration: 'phone',
    },
    {
      icon: HiOutlineGlobe, size: 'medium',
      title: lang === 'fr' ? 'Télémédecine Web' : 'Web Telemedicine',
      desc: lang === 'fr' ? 'Consultations vidéo avec des médecins qualifiés depuis votre navigateur.' : 'Video consultations with qualified doctors from your browser.',
      gradient: 'from-primary-600 to-primary-500',
      illustration: 'globe',
    },
    {
      icon: HiOutlineUserGroup, size: 'medium',
      title: lang === 'fr' ? 'Suivi ASC' : 'CHW Follow-up',
      desc: lang === 'fr' ? 'Visites à domicile et suivi médicamenteux par des agents de santé communautaires.' : 'Home visits and medication tracking by community health workers.',
      gradient: 'from-accent-500 to-primary-600',
      illustration: 'chw',
    },
    {
      icon: HiOutlineVideoCamera, size: 'small',
      title: lang === 'fr' ? 'Téléconsultation' : 'Teleconsultation',
      desc: lang === 'fr' ? 'Consultations vidéo en direct avec des médecins.' : 'Live video consultations with doctors.',
      gradient: 'from-primary-700 to-primary-500',
    },
    {
      icon: HiOutlineClock, size: 'small',
      title: lang === 'fr' ? 'Rendez-vous' : 'Appointments',
      desc: lang === 'fr' ? 'Planifiez avec rappels automatiques.' : 'Schedule with automatic reminders.',
      gradient: 'from-primary-700 to-accent-600',
    },
    {
      icon: HiOutlineClipboardList, size: 'small',
      title: lang === 'fr' ? 'Dossiers médicaux' : 'Medical Records',
      desc: lang === 'fr' ? 'Historique, diagnostics et ordonnances.' : 'History, diagnoses, and prescriptions.',
      gradient: 'from-accent-600 to-accent-500',
    },
    {
      icon: HiOutlineAcademicCap, size: 'small',
      title: lang === 'fr' ? 'Santé maternelle' : 'Maternal Health',
      desc: lang === 'fr' ? 'Suivi de grossesse et soins néonatals.' : 'Pregnancy tracking and neonatal care.',
      gradient: 'from-primary-500 to-primary-700',
    },
    {
      icon: HiOutlineShieldCheck, size: 'small',
      title: lang === 'fr' ? 'Ordonnances digitales' : 'Digital Prescriptions',
      desc: lang === 'fr' ? 'Ordonnances par SMS ou dans l\'app.' : 'Prescriptions via SMS or in-app.',
      gradient: 'from-primary-600 to-accent-600',
    },
  ];

  const steps = [
    {
      number: '01', title: lang === 'fr' ? 'Connectez-vous' : 'Connect',
      desc: lang === 'fr' ? 'Composez le *800# ou connectez-vous sur la plateforme web.' : 'Dial *800# or sign in to the web platform.',
      icon: HiOutlinePhone,
    },
    {
      number: '02', title: lang === 'fr' ? 'Consultez' : 'Consult',
      desc: lang === 'fr' ? 'Décrivez vos symptômes. Un médecin vous répond en 24h maximum.' : 'Describe your symptoms. A doctor responds within 24 hours.',
      icon: HiOutlineVideoCamera,
    },
    {
      number: '03', title: lang === 'fr' ? 'Suivi' : 'Follow-up',
      desc: lang === 'fr' ? 'Un ASC assure le suivi de votre traitement à domicile.' : 'A CHW visits you to ensure treatment adherence.',
      icon: HiOutlineUserGroup,
    },
    {
      number: '04', title: lang === 'fr' ? 'Guérison' : 'Recovery',
      desc: lang === 'fr' ? 'Retrouvez la santé avec un accompagnement continu.' : 'Regain health with continuous support.',
      icon: HiOutlineHeart,
    },
  ];

  const dashboardFeatures = [
    {
      title: lang === 'fr' ? 'Vue d\'ensemble' : 'Overview',
      desc: lang === 'fr' ? 'Tableau de bord en temps réel' : 'Real-time dashboard',
      color: 'from-primary-500 to-accent-500',
    },
    {
      title: lang === 'fr' ? 'Patients' : 'Patients',
      desc: lang === 'fr' ? 'Gestion des dossiers' : 'Record management',
      color: 'from-accent-500 to-primary-600',
    },
    {
      title: lang === 'fr' ? 'Analytiques' : 'Analytics',
      desc: lang === 'fr' ? 'Statistiques et rapports' : 'Statistics and reports',
      color: 'from-primary-600 to-primary-800',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-accent-500/20 border-b-accent-500 animate-spin animate-[spin_1.5s_linear_infinite]" />
          </div>
          <div className="space-y-2">
            <div className="skeleton h-4 w-48 mx-auto" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)', backgroundSize: '200% 100%' }} />
            <div className="skeleton h-3 w-32 mx-auto" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900 overflow-hidden">
      {/* ===== NOISE OVERLAY ===== */}
      <div className="fixed inset-0 noise-bg pointer-events-none z-[60]" />

      {/* ===== AURORA BACKGROUND ===== */}
      <div className="fixed inset-0 aurora-bg dark:opacity-30 pointer-events-none z-0" />
      <div className="fixed inset-0 mesh-gradient dark:opacity-20 pointer-events-none z-0" />

      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 inset-x-0 z-50 apple-frost">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Logo size={28} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-2"
          >
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-secondary-600 hover:text-primary-600 transition-colors relative group"
            >
              {lang === 'fr' ? 'Connexion' : 'Log In'}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-500 group-hover:w-3/4 transition-all duration-300 rounded-full" />
            </Link>
            <RippleButton
              className="px-5 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-all duration-300 shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40"
              onClick={() => window.location.href = '/register'}
            >
              {lang === 'fr' ? 'S\'inscrire' : 'Sign Up'}
            </RippleButton>
          </motion.div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative z-10 pt-28 pb-20 md:pt-36 md:pb-32 px-4 overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass mb-6"
              >
                <HiOutlineSparkles className="h-4 w-4 text-primary-600" />
                <span className="text-xs font-semibold text-primary-700">
                  {lang === 'fr' ? 'Santé sans frontières' : 'Health without barriers'}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-secondary-900 leading-[1.1] tracking-tight"
              >
                {lang === 'fr' ? (
                  <>La santé accessible{' '}<br />
                    <span className="text-gradient-primary">partout au Cameroun</span></>
                ) : (
                  <>Healthcare access{' '}<br />
                    <span className="text-gradient-primary">everywhere in Cameroon</span></>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="text-lg md:text-xl text-secondary-500 max-w-xl mt-6 leading-relaxed"
              >
                {lang === 'fr'
                  ? 'Connectez-vous avec des médecins et des agents de santé communautaire — par téléphone, web ou USSD. Aucun smartphone requis.'
                  : 'Connect with doctors and community health workers — by phone, web, or USSD. No smartphone required.'}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-col sm:flex-row items-center lg:items-start space-y-3 sm:space-y-0 sm:space-x-4 mt-8"
              >
                <MagneticButton to="/register">
                  <RippleButton className="group relative px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-600/25 hover:shadow-primary-600/40 hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center space-x-2 text-base">
                    <span>{lang === 'fr' ? 'Commencer' : 'Get Started'}</span>
                    <HiOutlineChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </RippleButton>
                </MagneticButton>
                <a
                  href="#how-it-works"
                  className="group px-8 py-4 border-2 border-secondary-200 text-secondary-700 font-semibold rounded-2xl hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50/50 transition-all duration-300 inline-flex items-center space-x-2"
                >
                  <span>{lang === 'fr' ? 'En savoir plus' : 'Learn more'}</span>
                  <motion.span animate={{ y: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="inline-block">
                    <HiOutlineChevronRight className="h-4 w-4" />
                  </motion.span>
                </a>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center space-x-4 mt-10 text-sm text-secondary-400"
              >
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 border-2 border-white shadow-sm" />
                  ))}
                </div>
                <span className="font-medium">
                  {lang === 'fr' ? 'Rejoint par 5000+ patients' : 'Trusted by 5000+ patients'}
                </span>
              </motion.div>
            </div>

            {/* Right - 3D Illustrations */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <div className="relative perspective-1000">
                {/* Main floating illustration */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-10"
                >
                  <PatientGroupIllustration className="w-full max-w-lg mx-auto" animated />
                </motion.div>

                {/* Floating doctor */}
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                  className="absolute -top-4 -right-4 z-20"
                >
                  <div className="glass-card rounded-2xl p-3">
                    <DoctorIllustration className="w-24 h-24" animated />
                  </div>
                </motion.div>

                {/* Floating CHW */}
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, -2, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                  className="absolute -bottom-4 -left-4 z-20"
                >
                  <div className="glass-card rounded-2xl p-3">
                    <CHWIllustration className="w-24 h-24" animated />
                  </div>
                </motion.div>

                {/* Floating globe */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
                  className="absolute top-1/2 -right-8 z-30"
                >
                  <div className="glass-card rounded-full p-2">
                    <GlobeIllustration className="w-16 h-16" animated />
                  </div>
                </motion.div>

                {/* USSD badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, type: 'spring' }}
                  className="absolute top-8 -left-6 z-30"
                >
                  <div className="glass rounded-xl px-4 py-2 shadow-lg">
                    <span className="text-sm font-bold text-primary-600">*800#</span>
                    <span className="text-[10px] text-secondary-400 ml-2">{lang === 'fr' ? 'Composez' : 'Dial'}</span>
                  </div>
                </motion.div>

                {/* Decorative elements */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-400/10 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent-400/10 rounded-full blur-3xl"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative z-10 py-16 md:py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.15),transparent_50%)]" />
        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
            {stats.map((stat, i) => (
              <AnimatedCounter key={i} value={stat.value} suffix={stat.suffix} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES - BENTO GRID ===== */}
      <section ref={featuresRef} className="relative z-10 py-24 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <span className="inline-block text-sm font-bold text-primary-600 uppercase tracking-[0.2em] mb-3">
              {lang === 'fr' ? 'Fonctionnalités' : 'Features'}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-secondary-900 tracking-tight">
              {lang === 'fr' ? 'Une plateforme, des soins complets' : 'One platform, complete care'}
            </h2>
            <p className="text-lg text-secondary-500 mt-4 max-w-2xl mx-auto">
              {lang === 'fr'
                ? 'De la consultation au suivi, nous couvrons tous les aspects de votre santé.'
                : 'From consultation to follow-up, we cover every aspect of your health.'}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {/* Large bento card - USSD */}
            <motion.div variants={cardVariants} className="md:col-span-2 md:row-span-2 group">
              <div className="relative h-full bg-gradient-to-br from-primary-50 via-white to-accent-50 rounded-3xl p-8 border border-primary-100/50 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:translate-x-0 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                      <HiOutlinePhone className="h-7 w-7 text-white" />
                    </div>
                    <div className="glass rounded-full px-3 py-1">
                      <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">Populaire</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-900 mb-3">
                    {lang === 'fr' ? 'Consultation USSD' : 'USSD Consultation'}
                  </h3>
                  <p className="text-secondary-500 leading-relaxed mb-6 flex-grow">
                    {lang === 'fr'
                      ? 'Composez le *800# depuis n\'importe quel téléphone. Pas d\'internet requis. Service disponible 24h/24, 7j/7.'
                      : 'Dial *800# from any phone. No internet required. Service available 24/7.'}
                  </p>
                  <div className="glass rounded-2xl p-4 inline-flex items-center space-x-3 self-start">
                    <HiOutlineStar className="h-5 w-5 text-primary-600" />
                    <span className="text-sm font-semibold text-secondary-700">
                      {lang === 'fr' ? 'Composez' : 'Dial'}{' '}
                      <span className="text-primary-600 font-bold text-lg">*800#</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Medium bento card - Telemedicine */}
            <motion.div variants={cardVariants} className="md:col-span-1 md:row-span-2 group">
              <div className="relative h-full bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center mb-5 backdrop-blur-sm">
                    <HiOutlineVideoCamera className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {lang === 'fr' ? 'Télémédecine' : 'Telemedicine'}
                  </h3>
                  <p className="text-primary-200 text-sm leading-relaxed flex-grow">
                    {lang === 'fr'
                      ? 'Consultations vidéo avec des médecins qualifiés.'
                      : 'Video consultations with qualified doctors.'}
                  </p>
                  <div className="mt-4">
                    <TelemedicineIllustration className="w-full max-w-[160px] mx-auto opacity-80" animated />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Medium bento card - CHW */}
            <motion.div variants={cardVariants} className="md:col-span-1 group">
              <div className="relative h-full bg-gradient-to-br from-accent-500 to-primary-600 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                    <HiOutlineUserGroup className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {lang === 'fr' ? 'Suivi ASC' : 'CHW Follow-up'}
                  </h3>
                  <p className="text-primary-100 text-xs leading-relaxed">
                    {lang === 'fr' ? 'Visites à domicile par des agents de santé.' : 'Home visits by health workers.'}
                  </p>
                  <div className="mt-4">
                    <CHWIllustration className="w-20 h-20 mx-auto opacity-80" animated />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Small bento cards */}
            {features.slice(3).map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div key={i} variants={cardVariants} className="group">
                  <div className="h-full bg-white rounded-2xl p-5 shadow-sm border border-secondary-100 hover:shadow-lg hover:border-primary-100 transition-all duration-300 hover:-translate-y-1">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-secondary-900 text-sm mb-1">{feat.title}</h3>
                    <p className="text-xs text-secondary-500 leading-relaxed">{feat.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS / TRUST ===== */}
      <section className="relative z-10 py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-14" {...fadeInUp}>
            <span className="inline-block text-sm font-bold text-primary-600 uppercase tracking-[0.2em] mb-3">
              {lang === 'fr' ? 'Témoignages' : 'Testimonials'}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-secondary-900 dark:text-white tracking-tight">
              {lang === 'fr' ? 'Ce que disent nos utilisateurs' : 'What our users say'}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Marie B.',
                role: lang === 'fr' ? 'Patiente, Yaoundé' : 'Patient, Yaoundé',
                quote: lang === 'fr'
                  ? 'Grâce à HealthBridge, j\'ai pu consulter un médecin sans faire 50km. Le suivi par l\'ASC a changé ma vie.'
                  : 'Thanks to HealthBridge, I saw a doctor without traveling 50km. The CHW follow-up changed my life.',
                rating: 5,
              },
              {
                name: 'Dr. Paul N.',
                role: lang === 'fr' ? 'Médecin, Douala' : 'Doctor, Douala',
                quote: lang === 'fr'
                  ? 'Je peux suivre mes patients à distance et assigner des ASC pour les visites à domicile. Un outil révolutionnaire.'
                  : 'I can monitor my patients remotely and assign CHWs for home visits. A revolutionary tool.',
                rating: 5,
              },
              {
                name: 'Jean K.',
                role: lang === 'fr' ? 'ASC, Garoua' : 'CHW, Garoua',
                quote: lang === 'fr'
                  ? 'L\'application me permet de suivre mes patients, enregistrer l\'observance et escalader les cas urgents.'
                  : 'The app lets me track patients, log adherence, and escalate urgent cases.',
                rating: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-sm border border-secondary-100 dark:border-secondary-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <HiOutlineStar key={j} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-secondary-600 dark:text-secondary-300 leading-relaxed mb-4 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center space-x-3 pt-3 border-t border-secondary-100 dark:border-secondary-700">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-secondary-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center space-x-6 md:space-x-12 text-secondary-400 text-xs">
              <div className="flex items-center space-x-2">
                <HiOutlineShieldCheck className="h-5 w-5 text-primary-500" />
                <span className="font-medium">{lang === 'fr' ? 'Données sécurisées' : 'Secure data'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <HiOutlineClock className="h-5 w-5 text-primary-500" />
                <span className="font-medium">{lang === 'fr' ? 'Réponse en 24h' : '24h response'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <HiOutlineGlobe className="h-5 w-5 text-primary-500" />
                <span className="font-medium">{lang === 'fr' ? 'Couverture nationale' : 'National coverage'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <HiOutlinePhone className="h-5 w-5 text-primary-500" />
                <span className="font-medium">*800#</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS - STICKY STORYTELLING ===== */}
      <section id="how-it-works" className="relative z-10 py-24 md:py-32 px-4">
        <div className="absolute inset-0 bg-secondary-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.03),transparent_70%)]" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <span className="inline-block text-sm font-bold text-accent-600 uppercase tracking-[0.2em] mb-3">
              {lang === 'fr' ? 'Processus' : 'Process'}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-secondary-900 tracking-tight">
              {lang === 'fr' ? 'Comment ça marche' : 'How It Works'}
            </h2>
            <p className="text-lg text-secondary-500 mt-4 max-w-xl mx-auto">
              {lang === 'fr'
                ? 'Votre parcours de soins en quatre étapes simples'
                : 'Your healthcare journey in four simple steps'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 md:gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="relative group"
                >
                  <div className="text-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative mx-auto mb-6"
                    >
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-50 to-accent-50 border-2 border-primary-100 flex items-center justify-center mx-auto group-hover:border-primary-300 transition-colors duration-300">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                        {step.number}
                      </div>
                    </motion.div>
                    {i < steps.length - 1 && (
                      <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5">
                        <div className="h-full w-full border-t-2 border-dashed border-primary-200" />
                        <motion.div
                          className="absolute top-0 left-0 h-0.5 bg-primary-500"
                          initial={{ width: 0 }}
                          whileInView={{ width: '100%' }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.3 + 0.3, duration: 0.6 }}
                        />
                      </div>
                    )}
                    <h3 className="font-bold text-lg text-secondary-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-secondary-500 max-w-[220px] mx-auto leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <div className="inline-flex items-center space-x-4 px-8 py-4 glass rounded-2xl shadow-lg border border-white/20">
              <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlinePhone className="h-5 w-5 text-primary-600" />
              </div>
              <div className="text-left">
                <p className="text-xs text-secondary-400 font-medium uppercase tracking-wider">
                  {lang === 'fr' ? 'Composez' : 'Dial'}
                </p>
                <span className="text-2xl font-bold text-primary-600 tracking-wider">*800#</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== APPLE-STYLE DASHBOARD PREVIEW ===== */}
      <section className="relative z-10 py-24 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-white to-white" />
        <div className="relative max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <span className="inline-block text-sm font-bold text-primary-600 uppercase tracking-[0.2em] mb-3">
              {lang === 'fr' ? 'Plateforme' : 'Platform'}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-secondary-900 tracking-tight">
              {lang === 'fr' ? 'Un tableau de bord intelligent' : 'A smart dashboard'}
            </h2>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-5xl"
          >
            {/* Browser chrome */}
            <div className="bg-secondary-100 rounded-t-2xl px-5 py-3 flex items-center space-x-2 border-b border-secondary-200">
              <div className="flex space-x-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="glass rounded-full px-4 py-1.5 text-[10px] text-secondary-400 font-mono">
                  app.healthbridge.cm/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="bg-secondary-800 rounded-b-2xl p-6 md:p-8 shadow-2xl">
              <div className="grid md:grid-cols-3 gap-4">
                {dashboardFeatures.map((feat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -2 }}
                    className="glass-dark rounded-xl p-5 cursor-pointer hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${feat.color} flex items-center justify-center`}>
                        <HiOutlineChartBar className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex -space-x-1">
                        {[...Array(3)].map((_, j) => (
                          <div key={j} className="h-5 w-5 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 border border-secondary-700" />
                        ))}
                      </div>
                    </div>
                    <h3 className="text-white font-semibold text-sm">{feat.title}</h3>
                    <p className="text-secondary-400 text-xs mt-1">{feat.desc}</p>
                    {/* Mini chart bars */}
                    <div className="flex items-end space-x-1 mt-4 h-12">
                      {[35, 60, 45, 80, 55, 70, 40].map((h, j) => (
                        <motion.div
                          key={j}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: j * 0.05 + i * 0.15 }}
                          className="flex-1 rounded-t bg-gradient-to-t from-primary-500/40 to-accent-500/40"
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* Bottom row mock data */}
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div className="glass-dark rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-secondary-400 font-medium">
                      {lang === 'fr' ? 'Consultations récentes' : 'Recent Consultations'}
                    </span>
                    <span className="text-[10px] text-primary-400 font-semibold">
                      {lang === 'fr' ? 'Voir tout' : 'View all'}
                    </span>
                  </div>
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center space-x-3 py-2 border-b border-white/5 last:border-0">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400" />
                      <div className="flex-1">
                        <div className="h-2 w-24 bg-white/10 rounded" />
                        <div className="h-1.5 w-16 bg-white/5 rounded mt-1" />
                      </div>
                      <div className="h-2 w-12 bg-primary-500/30 rounded" />
                    </div>
                  ))}
                </div>
                <div className="glass-dark rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-secondary-400 font-medium">
                      {lang === 'fr' ? 'Prochains rendez-vous' : 'Upcoming Appointments'}
                    </span>
                    <span className="text-[10px] text-accent-400 font-semibold">
                      {lang === 'fr' ? 'Ajouter' : 'Add'}
                    </span>
                  </div>
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center space-x-3 py-2 border-b border-white/5 last:border-0">
                      <div className="h-2 w-2 rounded-full bg-accent-400" />
                      <div className="flex-1">
                        <div className="h-2 w-20 bg-white/10 rounded" />
                        <div className="h-1.5 w-12 bg-white/5 rounded mt-1" />
                      </div>
                      <div className="text-[10px] text-secondary-400 font-mono">
                        {`${9 + j}:00`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== WORLD MAP / COVERAGE ===== */}
      <section className="relative z-10 py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-sm font-bold text-primary-600 uppercase tracking-[0.2em] mb-3">
                {lang === 'fr' ? 'Couverture' : 'Coverage'}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-secondary-900 tracking-tight mb-4">
                {lang === 'fr'
                  ? 'Présent dans toutes les régions du Cameroun'
                  : 'Available across all regions of Cameroon'}
              </h2>
              <p className="text-secondary-500 leading-relaxed mb-6">
                {lang === 'fr'
                  ? 'Notre réseau d\'agents de santé communautaires et de médecins couvre l\'ensemble du territoire camerounais, y compris les zones rurales les plus reculées.'
                  : 'Our network of community health workers and doctors covers all Cameroonian territory, including the most remote rural areas.'}
              </p>
              <div className="flex flex-wrap gap-3">
                {['Yaoundé', 'Douala', 'Garoua', 'Bamenda', 'Maroua', 'Bafoussam', 'Ngaoundéré', 'Bertoua'].map((city) => (
                  <span key={city} className="glass rounded-full px-4 py-2 text-xs font-semibold text-secondary-600 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all duration-300 cursor-default border border-secondary-200">
                    {city}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <GlobeIllustration className="w-72 h-72 md:w-80 md:h-80" animated />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative z-10 py-24 md:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl md:rounded-[48px] p-8 md:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,197,94,0.3),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.2),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_50%)]" />
            <div className="absolute inset-0 noise-bg" />

            {/* Animated gradient orbs */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-10 left-10 w-40 h-40 bg-primary-400/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, -5, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-10 right-10 w-48 h-48 bg-accent-400/20 rounded-full blur-3xl"
            />

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="h-16 w-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm"
              >
                <HiOutlineHeart className="h-8 w-8 text-white" />
              </motion.div>

              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                {lang === 'fr' ? 'Prêt à prendre soin de votre santé ?' : 'Ready to take care of your health?'}
              </h2>
              <p className="text-primary-200 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
                {lang === 'fr'
                  ? 'Rejoignez HealthBridge aujourd\'hui. Gratuit, accessible, et conçu pour vous.'
                  : 'Join HealthBridge today. Free, accessible, and designed for you.'}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <MagneticButton to="/register">
                  <RippleButton className="group relative px-8 py-4 bg-white text-primary-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center space-x-2 text-base">
                    <HiOutlineHeart className="h-5 w-5" />
                    <span>{lang === 'fr' ? 'Créer un compte gratuit' : 'Create Free Account'}</span>
                  </RippleButton>
                </MagneticButton>
                <MagneticButton href="#">
                  <div className="px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300 inline-flex items-center space-x-2 cursor-pointer">
                    <HiOutlinePhone className="h-5 w-5" />
                    <span>{lang === 'fr' ? 'Composer *800#' : 'Dial *800#'}</span>
                  </div>
                </MagneticButton>
              </div>
              <p className="text-primary-300/60 text-xs mt-6">
                {lang === 'fr' ? 'Pas de smartphone ? Composez le *800# depuis n\'importe quel téléphone' : 'No smartphone? Dial *800# from any phone'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FLOATING CONTROLS (beside AI button) ===== */}
      <div className="fixed bottom-36 lg:bottom-24 right-4 z-50 flex flex-col space-y-2">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setDarkMode(!darkMode)}
          className="h-11 w-11 rounded-xl bg-white dark:bg-secondary-800 text-secondary-500 dark:text-secondary-300 shadow-lg border border-gray-200 dark:border-secondary-700 flex items-center justify-center hover:shadow-xl transition-shadow"
          title={lang === 'fr' ? 'Mode sombre' : 'Dark mode'}
        >
          {darkMode ? <HiOutlineSun className="h-5 w-5" /> : <HiOutlineMoon className="h-5 w-5" />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggleLanguage}
          className="h-11 w-11 rounded-xl bg-white dark:bg-secondary-800 shadow-lg border border-gray-200 dark:border-secondary-700 flex items-center justify-center hover:shadow-xl transition-shadow"
        >
          <span className="text-xs font-bold text-primary-600 uppercase">{language}</span>
        </motion.button>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-secondary-100 bg-secondary-50/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Logo size={28} />
              <p className="text-sm text-secondary-500 mt-3 max-w-md leading-relaxed">
                {lang === 'fr'
                  ? 'HealthBridge connecte les patients camerounais avec des médecins et agents de santé communautaires, par téléphone, web ou USSD.'
                  : 'HealthBridge connects Cameroonian patients with doctors and community health workers, by phone, web, or USSD.'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-secondary-900 mb-3">
                {lang === 'fr' ? 'Produit' : 'Product'}
              </h4>
              <ul className="space-y-2 text-sm text-secondary-500">
                <li><a href="#features" className="hover:text-primary-600 transition-colors">{lang === 'fr' ? 'Fonctionnalités' : 'Features'}</a></li>
                <li><a href="#how-it-works" className="hover:text-primary-600 transition-colors">{lang === 'fr' ? 'Comment ça marche' : 'How it works'}</a></li>
                <li><a href="/pricing" className="hover:text-primary-600 transition-colors">{lang === 'fr' ? 'Tarifs' : 'Pricing'}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-secondary-900 mb-3">
                {lang === 'fr' ? 'Contact' : 'Contact'}
              </h4>
              <ul className="space-y-2 text-sm text-secondary-500">
                <li className="flex items-center space-x-2">
                  <HiOutlinePhone className="h-3.5 w-3.5" />
                  <span>*800#</span>
                </li>
                <li className="flex items-center space-x-2">
                  <HiOutlineLocationMarker className="h-3.5 w-3.5" />
                  <span>Yaoundé, Cameroun</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-200 pt-6 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
            <p className="text-xs text-secondary-400">
              {lang === 'fr' ? '© 2026 HealthBridge. Construit au Cameroun.' : '© 2026 HealthBridge. Built in Cameroon.'}
            </p>
            <div className="flex items-center space-x-4 text-xs text-secondary-400">
              <span className="px-3 py-1 glass rounded-full font-mono text-primary-600 font-bold">*800#</span>
              <span>{lang === 'fr' ? 'Code USSD' : 'USSD Code'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
