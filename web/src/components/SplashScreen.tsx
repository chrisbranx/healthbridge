import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    const timer = setTimeout(() => setPhase('exit'), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {phase === 'enter' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-primary-800 via-primary-700 to-accent-700"
        >
          {/* Animated Logo */}
          <div className="relative mb-6" style={{ width: 140, height: 114 }}>
            <svg viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <defs>
                <linearGradient id="splashCross" x1="0" y1="0" x2="110" y2="90">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#e0f2fe" />
                </linearGradient>
                <linearGradient id="splashRing" x1="0" y1="0" x2="110" y2="90">
                  <stop offset="0%" stopColor="#5eead4" />
                  <stop offset="100%" stopColor="#93c5fd" />
                </linearGradient>
              </defs>

              <motion.circle
                cx="55" cy="45" r="38"
                stroke="url(#splashRing)"
                strokeWidth="2.5"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />

              <motion.path
                d="M 50 15 L 50 40 L 25 40 L 25 50 L 50 50 L 50 75 L 60 75 L 60 50 L 85 50 L 85 40 L 60 40 L 60 15 Z"
                fill="url(#splashCross)"
                initial={{ scale: 0, rotate: -90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                style={{ transformOrigin: '55px 45px' }}
              />

              <motion.circle
                cx="55" cy="45" r="15"
                stroke="#5eead4"
                strokeWidth="1.5"
                fill="none"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.4, 2] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
              />

              <motion.circle
                cx="55" cy="45" r="15"
                stroke="#93c5fd"
                strokeWidth="1"
                fill="none"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 0.3, 0], scale: [0.8, 1.6, 2.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 1 }}
              />
            </svg>
          </div>

          {/* Brand Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-white tracking-tight">HealthBridge</h1>
            <p className="text-sm text-white/70 mt-1 font-medium tracking-widest uppercase">Connecting Care</p>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 200 }}
            transition={{ duration: 1.5, delay: 0.3, ease: 'easeInOut' }}
            className="h-1 bg-white/20 rounded-full mt-8 overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-accent-400 to-primary-200 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, delay: 0.3, ease: 'easeInOut' }}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-[10px] text-white/40 mt-4 tracking-wider uppercase"
          >
            Loading your health platform...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
