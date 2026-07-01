import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface IllustrationProps {
  className?: string;
  animated?: boolean;
}

function use3DTilt(className: string) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale3d(1.02,1.02,1.02)`;
    };
    const handleLeave = () => {
      el.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
    };
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, []);
  return ref;
}

export function DoctorIllustration({ className = '', animated = true }: IllustrationProps) {
  const ref = use3DTilt(className);
  const W = animated ? motion.svg : 'svg';
  const animProps = animated ? {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6 },
  } : {};
  return (
    <div ref={ref} className="transition-transform duration-200 ease-out" style={{ transformStyle: 'preserve-3d' }}>
      <W viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...animProps}>
        {/* Shadow */}
        <ellipse cx="100" cy="210" rx="50" ry="8" fill="rgba(0,0,0,0.08)" />
        {/* Body - white coat */}
        <rect x="70" y="80" width="60" height="75" rx="12" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
        {/* Coat lapels */}
        <path d="M85 80 L95 100 L100 90" fill="#cbd5e1" opacity="0.5" />
        <path d="M115 80 L105 100 L100 90" fill="#cbd5e1" opacity="0.5" />
        {/* Head */}
        <circle cx="100" cy="55" r="28" fill="#fef3c7" />
        {/* Hair - doctor cut */}
        <path d="M72 48 C72 25, 128 25, 128 48" fill="#1e293b" />
        <path d="M74 46 C78 30, 95 22, 110 26" fill="#334155" />
        {/* Eyes */}
        <ellipse cx="91" cy="53" rx="3.5" ry="3" fill="#1e293b" />
        <ellipse cx="109" cy="53" rx="3.5" ry="3" fill="#1e293b" />
        <circle cx="90" cy="52" r="1" fill="white" />
        <circle cx="108" cy="52" r="1" fill="white" />
        {/* Eyebrows */}
        <path d="M86 46 Q91 43 96 46" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M104 46 Q109 43 114 46" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Smile */}
        <path d="M90 63 Q100 72 110 63" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Glasses */}
        <circle cx="92" cy="53" r="10" fill="none" stroke="#64748b" strokeWidth="1.5" />
        <circle cx="110" cy="53" r="10" fill="none" stroke="#64748b" strokeWidth="1.5" />
        <line x1="102" y1="53" x2="100" y2="53" stroke="#64748b" strokeWidth="1.5" />
        {/* Stethoscope */}
        <path d="M100 80 L100 95 L85 100" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="85" cy="100" r="7" fill="none" stroke="#16a34a" strokeWidth="2.5" />
        <circle cx="85" cy="100" r="3" fill="#22c55e" opacity="0.4" />
        {/* ID badge */}
        <rect x="105" y="110" width="18" height="12" rx="2" fill="white" stroke="#cbd5e1" strokeWidth="0.5" />
        <rect x="108" y="112" width="12" height="3" rx="1" fill="#22c55e" opacity="0.5" />
        <line x1="108" y1="118" x2="118" y2="118" stroke="#cbd5e1" strokeWidth="0.5" />
        <line x1="108" y1="120" x2="115" y2="120" stroke="#cbd5e1" strokeWidth="0.5" />
        {/* Medical cross floating */}
        {animated && (
          <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <rect x="143" y="40" width="20" height="20" rx="5" fill="#22c55e" />
            <rect x="149" y="44" width="8" height="12" rx="1.5" fill="white" />
            <rect x="146" y="47" width="14" height="6" rx="1.5" fill="white" />
            {/* Pulse lines from cross */}
            <motion.path d="M168 50 L175 50 L180 40 L185 60 L190 50 L200 50" stroke="#22c55e" strokeWidth="2" fill="none"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
          </motion.g>
        )}
      </W>
    </div>
  );
}

export function PatientIllustration({ className = '', animated = true }: IllustrationProps) {
  const ref = use3DTilt(className);
  const W = animated ? motion.svg : 'svg';
  const animProps = animated ? {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, delay: 0.2 },
  } : {};
  return (
    <div ref={ref} className="transition-transform duration-200 ease-out" style={{ transformStyle: 'preserve-3d' }}>
      <W viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...animProps}>
        {/* Shadow */}
        <ellipse cx="100" cy="210" rx="45" ry="7" fill="rgba(0,0,0,0.08)" />
        {/* Body */}
        <rect x="72" y="82" width="56" height="70" rx="14" fill="#dbeafe" stroke="#bfdbfe" strokeWidth="1" />
        {/* Head */}
        <circle cx="100" cy="55" r="27" fill="#fef3c7" />
        {/* Hair - curly */}
        <path d="M73 45 C73 22, 127 22, 127 45" stroke="#78350f" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M76 42 C78 30, 88 24, 100 24" stroke="#78350f" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M80 48 C85 55, 90 48, 95 55" stroke="#78350f" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Eyes */}
        <circle cx="91" cy="53" r="3" fill="#1e293b" />
        <circle cx="109" cy="53" r="3" fill="#1e293b" />
        <circle cx="90" cy="52" r="1" fill="white" />
        <circle cx="108" cy="52" r="1" fill="white" />
        {/* Lashes */}
        <path d="M88 50 L86 48" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
        <path d="M106 50 L104 48" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
        {/* Smile */}
        <path d="M92 62 Q100 70 108 62" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Arm holding phone */}
        <path d="M128 90 L145 95 L142 112" stroke="#fef3c7" strokeWidth="7" fill="none" strokeLinecap="round" />
        {/* Phone */}
        <rect x="134" y="112" width="16" height="26" rx="4" fill="#1e293b" />
        <rect x="136" y="114" width="12" height="20" rx="2" fill="#22c55e" opacity="0.2" />
        <rect x="136" y="114" width="12" height="6" rx="2" fill="#22c55e" opacity="0.5" />
        {/* Heart on screen */}
        <motion.path d="M142 125 C141 123, 138 124, 138 126 C138 129, 142 133, 142 133 C142 133, 146 129, 146 126 C146 124, 143 123, 142 125Z"
          fill="#ef4444"
          animate={animated ? { scale: [1, 1.15, 1] } : undefined}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ originX: '142px', originY: '127px' }} />
        {/* Signal waves */}
        {animated && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <path d="M155 120 Q160 117 165 122" stroke="#22c55e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M157 125 Q163 121 169 127" stroke="#22c55e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </motion.g>
        )}
      </W>
    </div>
  );
}

export function CHWIllustration({ className = '', animated = true }: IllustrationProps) {
  const ref = use3DTilt(className);
  const W = animated ? motion.svg : 'svg';
  const animProps = animated ? {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, delay: 0.4 },
  } : {};
  return (
    <div ref={ref} className="transition-transform duration-200 ease-out" style={{ transformStyle: 'preserve-3d' }}>
      <W viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...animProps}>
        {/* Shadow */}
        <ellipse cx="100" cy="215" rx="50" ry="8" fill="rgba(0,0,0,0.08)" />
        {/* Body - green vest */}
        <rect x="68" y="82" width="64" height="75" rx="14" fill="#d1fae5" stroke="#a7f3d0" strokeWidth="1" />
        {/* Vest details */}
        <rect x="72" y="85" width="56" height="50" rx="8" fill="#059669" opacity="0.15" />
        {/* Head */}
        <circle cx="100" cy="55" r="27" fill="#fef3c7" />
        {/* CHW cap */}
        <path d="M73 42 C73 20, 127 20, 127 42" fill="#059669" />
        <rect x="70" y="40" width="60" height="8" rx="4" fill="#047857" />
        <rect x="85" y="35" width="30" height="8" rx="4" fill="#22c55e" opacity="0.6" />
        {/* Hair */}
        <path d="M75 40 C80 30, 95 25, 110 28" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Eyes */}
        <circle cx="91" cy="52" r="3" fill="#1e293b" />
        <circle cx="109" cy="52" r="3" fill="#1e293b" />
        <circle cx="90" cy="51" r="1" fill="white" />
        <circle cx="108" cy="51" r="1" fill="white" />
        {/* Big warm smile */}
        <path d="M88 62 Q100 72 112 62" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M92 64 Q100 70 108 64" fill="#1e293b" opacity="0.2" />
        {/* Medical bag */}
        <motion.g animate={animated ? { y: [0, -3, 0] } : undefined} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
          <rect x="132" y="95" width="26" height="22" rx="6" fill="#059669" />
          <rect x="136" y="98" width="18" height="14" rx="3" fill="white" />
          <path d="M132 95 Q145 88 158 95" stroke="#059669" strokeWidth="2.5" fill="none" />
          {/* Cross on bag */}
          <rect x="143" y="102" width="4" height="6" rx="1" fill="#059669" />
          <rect x="141" y="104" width="8" height="2" rx="0.5" fill="#059669" />
        </motion.g>
        {/* Walking legs with animation */}
        <motion.g animate={animated ? { x: [0, 3, 0, -3, 0] } : undefined} transition={{ duration: 1.5, repeat: Infinity }}>
          <path d="M82 157 L78 180 L70 180" stroke="#1e293b" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M118 157 L122 180 L130 180" stroke="#1e293b" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>
        {/* Motion lines */}
        {animated && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <path d="M55 100 L42 100" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
            <path d="M50 112 L38 112" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
            <path d="M55 124 L42 124" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
          </motion.g>
        )}
        {/* CHW badge */}
        <rect x="95" y="118" width="14" height="8" rx="2" fill="white" stroke="#059669" strokeWidth="0.5" />
        <text x="97" y="124" fill="#059669" fontSize="4" fontWeight="bold" fontFamily="monospace">CHW</text>
      </W>
    </div>
  );
}

export function GlobeIllustration({ className = '', animated = true }: IllustrationProps) {
  const ref = use3DTilt(className);
  const W = animated ? motion.svg : 'svg';
  const animProps = animated ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8 },
  } : {};
  return (
    <div ref={ref} className="transition-transform duration-200 ease-out" style={{ transformStyle: 'preserve-3d' }}>
      <W viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...animProps}>
        {/* Outer glow */}
        <circle cx="100" cy="100" r="65" fill="#22c55e" opacity="0.06" />
        <circle cx="100" cy="100" r="60" fill="#22c55e" opacity="0.04" />
        {/* Globe base */}
        <circle cx="100" cy="100" r="55" fill="#f0fdf4" stroke="#22c55e" strokeWidth="2.5" />
        {/* Inner gradient sphere effect */}
        <circle cx="90" cy="90" r="30" fill="#bbf7d0" opacity="0.3" />
        {/* Continents - detailed */}
        <path d="M65 75 Q75 65 88 72 Q93 78 85 88 Q78 94 72 88 Z" fill="#22c55e" opacity="0.5" />
        <path d="M105 65 Q120 60 132 72 Q138 82 128 90 Q118 86 112 78 Z" fill="#22c55e" opacity="0.5" />
        <path d="M92 90 Q108 84 122 96 Q128 108 116 114 Q104 110 98 102 Z" fill="#22c55e" opacity="0.5" />
        <path d="M75 95 Q82 100 78 110 Q70 116 65 108 Q68 98 75 95Z" fill="#22c55e" opacity="0.5" />
        <path d="M108 108 Q115 112 118 120 Q112 126 105 122 Q102 116 108 108Z" fill="#22c55e" opacity="0.5" />
        {/* Latitude/Longitude lines */}
        <ellipse cx="100" cy="78" rx="42" ry="8" fill="none" stroke="#86efac" strokeWidth="1" />
        <ellipse cx="100" cy="100" rx="52" ry="10" fill="none" stroke="#86efac" strokeWidth="1" />
        <ellipse cx="100" cy="122" rx="42" ry="8" fill="none" stroke="#86efac" strokeWidth="1" />
        <ellipse cx="100" cy="100" rx="8" ry="52" fill="none" stroke="#86efac" strokeWidth="1" />
        <ellipse cx="100" cy="100" rx="20" ry="52" fill="none" stroke="#86efac" strokeWidth="1" />
        {/* 3D arc effect */}
        <path d="M48 100 Q100 25 152 100" stroke="#22c55e" strokeWidth="0.5" opacity="0.3" fill="none" />
        <path d="M48 100 Q100 175 152 100" stroke="#22c55e" strokeWidth="0.5" opacity="0.3" fill="none" />
        {/* Pulsing markers */}
        {animated && (
          <>
            <motion.circle cx="82" cy="88" r="5" fill="#22c55e"
              animate={{ r: [4, 7, 4], opacity: [0.8, 0.3, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }} />
            <motion.circle cx="120" cy="78" r="4" fill="#059669"
              animate={{ r: [3, 6, 3], opacity: [0.8, 0.3, 0.8] }}
              transition={{ duration: 2, delay: 0.5, repeat: Infinity }} />
            <motion.circle cx="92" cy="118" r="4" fill="#16a34a"
              animate={{ r: [3, 6, 3], opacity: [0.8, 0.3, 0.8] }}
              transition={{ duration: 2, delay: 1, repeat: Infinity }} />
            <motion.circle cx="112" cy="105" r="3" fill="#22c55e"
              animate={{ r: [2, 5, 2], opacity: [0.8, 0.3, 0.8] }}
              transition={{ duration: 2, delay: 1.5, repeat: Infinity }} />
          </>
        )}
        {/* Center crosshair */}
        <circle cx="100" cy="100" r="4" fill="#16a34a" />
        <path d="M100 86 V94" stroke="#16a34a" strokeWidth="2" />
        <path d="M100 106 V114" stroke="#16a34a" strokeWidth="2" />
        <path d="M86 100 H94" stroke="#16a34a" strokeWidth="2" />
        <path d="M106 100 H114" stroke="#16a34a" strokeWidth="2" />
        {/* Satellite arc */}
        {animated && (
          <motion.path d="M25 140 Q100 185 175 140" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 4" fill="none"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
        )}
      </W>
    </div>
  );
}

export function HeartBeatIllustration({ className = '', animated = true }: IllustrationProps) {
  return (
    <motion.svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Gradient def */}
      <defs>
        <linearGradient id="hbGrad" x1="0" y1="0" x2="200" y2="0">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="50%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      {/* Flat line */}
      <path d="M5 30 L40 30 L50 30" stroke="#e2e8f0" strokeWidth="2.5" />
      {/* Heartbeat spike with gradient */}
      <motion.path
        d="M50 30 L60 30 L65 5 L75 55 L85 15 L95 45 L105 15 L115 55 L125 30 L135 30"
        stroke="url(#hbGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
        animate={animated ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Continue flat */}
      <path d="M135 30 L145 30 L195 30" stroke="#e2e8f0" strokeWidth="2.5" />
      {/* Heart at end */}
      <motion.path
        d="M190 28 C188 26, 185 27, 185 30 C185 33, 190 37, 190 37 C190 37, 195 33, 195 30 C195 27, 192 26, 190 28Z"
        fill="#ef4444"
        animate={animated ? { scale: [1, 1.2, 1] } : undefined}
        transition={{ duration: 1, repeat: Infinity }}
        style={{ originX: '190px', originY: '30px' }} />
    </motion.svg>
  );
}

export function USSDPhoneIllustration({ className = '', animated = true }: IllustrationProps) {
  return (
    <motion.svg
      viewBox="0 0 100 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      initial={animated ? { y: 20, opacity: 0 } : undefined}
      animate={animated ? { y: 0, opacity: 1 } : undefined}
      transition={animated ? { duration: 0.6, type: 'spring', stiffness: 100 } : undefined}
    >
      {/* Phone shadow */}
      <rect x="12" y="10" width="80" height="165" rx="18" fill="rgba(0,0,0,0.15)" />
      {/* Phone body */}
      <rect x="10" y="5" width="80" height="165" rx="16" fill="#1e293b" />
      {/* Phone border highlight */}
      <rect x="11" y="6" width="78" height="163" rx="15" fill="none" stroke="#334155" strokeWidth="1" />
      {/* Screen */}
      <rect x="16" y="22" width="68" height="128" rx="4" fill="#0f172a" />
      {/* Screen glare */}
      <rect x="16" y="22" width="68" height="15" rx="4" fill="rgba(255,255,255,0.03)" />
      {/* Status bar */}
      <rect x="16" y="22" width="68" height="20" rx="4" fill="#16a34a" />
      <text x="28" y="35" fill="white" fontSize="7" fontWeight="bold" fontFamily="monospace">HealthBridge</text>
      <circle cx="74" cy="31" r="2.5" fill="#86efac" />
      {/* Signal bars */}
      <rect x="64" y="28" width="2" height="6" rx="0.5" fill="white" opacity="0.5" />
      <rect x="67" y="27" width="2" height="7" rx="0.5" fill="white" opacity="0.6" />
      <rect x="70" y="26" width="2" height="8" rx="0.5" fill="white" opacity="0.8" />
      {/* USSD menu */}
      <rect x="20" y="48" width="60" height="16" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
      <text x="25" y="59" fill="#22c55e" fontSize="6" fontWeight="bold" fontFamily="monospace">*800#</text>
      <rect x="20" y="68" width="60" height="14" rx="3" fill="#1e293b" />
      <text x="25" y="78" fill="#94a3b8" fontSize="5" fontFamily="monospace">1. Report symptoms</text>
      <rect x="20" y="85" width="60" height="14" rx="3" fill="#1e293b" />
      <text x="25" y="95" fill="#94a3b8" fontSize="5" fontFamily="monospace">2. Medical history</text>
      <rect x="20" y="102" width="60" height="14" rx="3" fill="#1e293b" />
      <text x="25" y="112" fill="#94a3b8" fontSize="5" fontFamily="monospace">3. First aid guide</text>
      <rect x="20" y="119" width="60" height="14" rx="3" fill="#1e293b" />
      <text x="25" y="129" fill="#94a3b8" fontSize="5" fontFamily="monospace">4. Talk to CHW</text>
      <rect x="20" y="136" width="60" height="10" rx="3" fill="#1e293b" />
      <text x="25" y="144" fill="#ef4444" fontSize="5" fontFamily="monospace">5. SOS Emergency</text>
      {/* Home button */}
      <rect x="40" y="155" width="20" height="6" rx="3" fill="#334155" />
      {/* Notification dot */}
      {animated && (
        <motion.circle cx="76" cy="26" r="3" fill="#ef4444"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }} />
      )}
      {/* Screen glow */}
      <rect x="16" y="22" width="68" height="128" rx="4" fill="rgba(34,197,94,0.03)" />
    </motion.svg>
  );
}

export function VaccineIllustration({ className = '', animated = true }: IllustrationProps) {
  const ref = use3DTilt(className);
  const W = animated ? motion.svg : 'svg';
  const animProps = animated ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  } : {};
  return (
    <div ref={ref} className="transition-transform duration-200 ease-out" style={{ transformStyle: 'preserve-3d' }}>
      <W viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...animProps}>
        {/* Barrel */}
        <rect x="45" y="20" width="12" height="55" rx="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
        {/* Liquid inside */}
        <motion.rect x="47" y="35" width="8" height="35" rx="3" fill="#22c55e" opacity="0.4"
          animate={animated ? { opacity: [0.3, 0.5, 0.3] } : undefined}
          transition={{ duration: 2, repeat: Infinity }} />
        {/* Plunger */}
        <rect x="48" y="10" width="6" height="12" rx="2" fill="#64748b" />
        <rect x="50" y="0" width="2" height="12" fill="#94a3b8" />
        {/* Needle hub */}
        <path d="M45 75 L45 87 L57 87 L57 75" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
        {/* Needle */}
        <line x1="51" y1="87" x2="51" y2="112" stroke="#94a3b8" strokeWidth="2.5" />
        <path d="M51 112 L49.5 107 L52.5 107 Z" fill="#94a3b8" />
        {/* Needle shine */}
        <line x1="51" y1="90" x2="51" y2="108" stroke="white" strokeWidth="0.5" opacity="0.5" />
        {/* Droplet */}
        {animated && (
          <motion.g animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <path d="M51 118 C48 118, 46 122, 46 125 C46 128, 48 131, 51 131 C54 131, 56 128, 56 125 C56 122, 54 118, 51 118Z" fill="#22c55e" opacity="0.6" />
            <path d="M51 118 L51 124" stroke="white" strokeWidth="0.8" opacity="0.5" />
          </motion.g>
        )}
        {/* Medical cross badge */}
        <motion.g animate={animated ? { rotate: [0, 5, -5, 0] } : undefined} transition={{ duration: 4, repeat: Infinity }}>
          <rect x="18" y="48" width="18" height="18" rx="4" fill="#22c55e" />
          <rect x="24" y="51" width="6" height="12" rx="1.5" fill="white" />
          <rect x="21" y="54" width="12" height="6" rx="1.5" fill="white" />
        </motion.g>
        {/* Label */}
        <rect x="46" y="42" width="10" height="8" rx="2" fill="white" stroke="#cbd5e1" strokeWidth="0.5" />
        <text x="48" y="48" fill="#16a34a" fontSize="4" fontWeight="bold" fontFamily="monospace">CVX</text>
      </W>
    </div>
  );
}

export function StethoscopeIllustration({ className = '', animated = true }: IllustrationProps) {
  return (
    <motion.svg
      viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      initial={animated ? { rotate: -10, opacity: 0 } : undefined}
      animate={animated ? { rotate: 0, opacity: 1 } : undefined}
      transition={animated ? { type: 'spring', stiffness: 200 } : undefined}
    >
      {/* Earpieces */}
      <path d="M18 18 C18 8, 34 8, 38 18" stroke="#64748b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M82 18 C82 8, 66 8, 62 18" stroke="#64748b" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Earpiece tips */}
      <circle cx="18" cy="16" r="5" fill="#1e293b" />
      <circle cx="82" cy="16" r="5" fill="#1e293b" />
      {/* Tubing */}
      <path d="M38 18 C38 28, 50 24, 50 34" stroke="#64748b" strokeWidth="3" fill="none" />
      <path d="M62 18 C62 28, 50 24, 50 34" stroke="#64748b" strokeWidth="3" fill="none" />
      <path d="M50 34 L50 58" stroke="#64748b" strokeWidth="3" fill="none" />
      {/* Y-connector */}
      <circle cx="50" cy="34" r="4" fill="#64748b" />
      {/* Tube to chestpiece */}
      <path d="M50 58 L50 82 C50 98, 28 94, 28 108" stroke="#64748b" strokeWidth="3" fill="none" />
      {/* Chestpiece */}
      <circle cx="28" cy="116" r="18" fill="#e2e8f0" stroke="#64748b" strokeWidth="2.5" />
      <circle cx="28" cy="116" r="10" fill="#22c55e" opacity="0.15" />
      <circle cx="28" cy="116" r="4" fill="#22c55e" />
      {/* Heartbeat on chestpiece */}
      {animated && (
        <motion.path d="M14 116 L22 116 L24 111 L26 121 L28 114 L30 121 L32 111 L34 116 L42 116"
          stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
      )}
    </motion.svg>
  );
}

export function MedicalCrossIllustration({ className = '', animated = true }: IllustrationProps) {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="crossGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="25" fill="url(#crossGlow)" />
      <motion.rect
        x="10" y="10" width="40" height="40" rx="8"
        fill="#22c55e"
        animate={animated ? { rotate: [0, 5, -5, 0], scale: [1, 1.03, 0.97, 1] } : undefined}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ originX: '30px', originY: '30px' }} />
      <rect x="24" y="16" width="12" height="28" rx="3" fill="white" />
      <rect x="16" y="24" width="28" height="12" rx="3" fill="white" />
    </svg>
  );
}

export function PregnantWomanIllustration({ className = '', animated = true }: IllustrationProps) {
  const ref = use3DTilt(className);
  const W = animated ? motion.svg : 'svg';
  const animProps = animated ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: 0.3 },
  } : {};
  return (
    <div ref={ref} className="transition-transform duration-200 ease-out" style={{ transformStyle: 'preserve-3d' }}>
      <W viewBox="0 0 140 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...animProps}>
        {/* Shadow */}
        <ellipse cx="70" cy="175" rx="35" ry="5" fill="rgba(0,0,0,0.06)" />
        {/* Dress/body */}
        <path d="M55 80 L55 130 Q70 142 85 130 L85 80 Z" fill="#f472b6" opacity="0.6" />
        {/* Dress detail */}
        <path d="M60 80 L60 125 Q70 135 80 125 L80 80" fill="#ec4899" opacity="0.3" />
        {/* Pregnancy bump */}
        <ellipse cx="70" cy="115" rx="24" ry="20" fill="#f9a8d4" opacity="0.4" />
        <ellipse cx="70" cy="118" rx="12" ry="8" fill="#22c55e" opacity="0.15" />
        <motion.circle cx="70" cy="118" r="5" fill="#22c55e" opacity="0.25"
          animate={animated ? { scale: [1, 1.2, 1] } : undefined}
          transition={{ duration: 2, repeat: Infinity }} />
        {/* Head */}
        <circle cx="70" cy="55" r="24" fill="#fef3c7" />
        {/* Hair */}
        <path d="M46 50 C46 28, 94 28, 94 50" fill="#78350f" />
        <path d="M48 52 C54 33, 72 28, 85 36" stroke="#78350f" strokeWidth="2" fill="none" />
        <path d="M50 48 C56 38, 68 32, 80 35" stroke="#92400e" strokeWidth="1" fill="none" />
        {/* Eyes */}
        <ellipse cx="63" cy="53" rx="3" ry="2.5" fill="#1e293b" />
        <ellipse cx="77" cy="53" rx="3" ry="2.5" fill="#1e293b" />
        <circle cx="62" cy="52" r="1" fill="white" />
        <circle cx="76" cy="52" r="1" fill="white" />
        {/* Smile */}
        <path d="M64 62 Q70 68 76 62" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Blush */}
        <ellipse cx="58" cy="58" rx="4" ry="2" fill="#f472b6" opacity="0.2" />
        <ellipse cx="82" cy="58" rx="4" ry="2" fill="#f472b6" opacity="0.2" />
        {/* Arms */}
        <path d="M55 90 L40 108" stroke="#fef3c7" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M85 90 L100 108" stroke="#fef3c7" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* Hands on belly */}
        <path d="M40 108 C38 104, 44 100, 50 104" stroke="#fef3c7" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M100 108 C102 104, 96 100, 90 104" stroke="#fef3c7" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Floating hearts */}
        {animated && (
          <>
            <motion.path d="M95 42 C92 38, 88 40, 88 44 C88 48, 95 54, 95 54 C95 54, 102 48, 102 44 C102 40, 98 38, 95 42Z"
              fill="#f43f5e"
              animate={{ y: [0, -12, 0], opacity: [1, 0.4, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }} />
            <motion.path d="M42 38 C40 35, 37 36, 37 39 C37 42, 42 47, 42 47 C42 47, 47 42, 47 39 C47 36, 44 35, 42 38Z"
              fill="#f43f5e"
              animate={{ y: [0, -10, 0], opacity: [1, 0.4, 1] }}
              transition={{ duration: 3, delay: 0.8, repeat: Infinity }} />
          </>
        )}
      </W>
    </div>
  );
}

export function PatientGroupIllustration({ className = '', animated = true }: IllustrationProps) {
  const ref = use3DTilt(className);
  return (
    <div ref={ref} className="transition-transform duration-200 ease-out" style={{ transformStyle: 'preserve-3d' }}>
      <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Person 1 - Doctor */}
        <motion.g
          initial={animated ? { opacity: 0, x: -20 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.5 }}>
          <rect x="30" y="55" width="30" height="40" rx="6" fill="#e2e8f0" />
          <circle cx="45" cy="40" r="15" fill="#fef3c7" />
          <path d="M30 35 C30 22, 60 22, 60 35" fill="#1e293b" />
          <circle cx="41" cy="39" r="2" fill="#1e293b" />
          <circle cx="49" cy="39" r="2" fill="#1e293b" />
          <path d="M40 44 Q45 49 50 44" stroke="#1e293b" strokeWidth="1.5" fill="none" />
          <path d="M45 55 L45 65 L40 68" stroke="#16a34a" strokeWidth="1.5" fill="none" />
          <circle cx="40" cy="68" r="3" fill="none" stroke="#16a34a" strokeWidth="1.5" />
          {/* Cross */}
          <rect x="8" y="30" width="12" height="12" rx="3" fill="#22c55e" />
          <rect x="12" y="33" width="4" height="6" rx="1" fill="white" />
        </motion.g>

        {/* Person 2 - Patient */}
        <motion.g
          initial={animated ? { opacity: 0, y: 20 } : undefined}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.15 }}>
          <rect x="105" y="55" width="30" height="40" rx="6" fill="#dbeafe" />
          <circle cx="120" cy="40" r="15" fill="#fef3c7" />
          <path d="M105 36 C108 26, 120 20, 132 28" stroke="#78350f" strokeWidth="2.5" fill="none" />
          <circle cx="116" cy="39" r="2" fill="#1e293b" />
          <circle cx="124" cy="39" r="2" fill="#1e293b" />
          <path d="M114 44 Q120 50 126 44" stroke="#1e293b" strokeWidth="1.5" fill="none" />
          <path d="M135 62 L145 65 L143 75" stroke="#fef3c7" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="139" y="75" width="8" height="14" rx="2" fill="#1e293b" />
          <rect x="140" y="77" width="6" height="10" rx="1" fill="#22c55e" opacity="0.3" />
          {/* Heart pulse */}
          <motion.path d="M148 62 Q153 60 156 64" stroke="#22c55e" strokeWidth="1" fill="none"
            animate={animated ? { opacity: [0, 1, 0] } : undefined}
            transition={{ duration: 1.5, repeat: Infinity }} />
        </motion.g>

        {/* Person 3 - CHW */}
        <motion.g
          initial={animated ? { opacity: 0, x: 20 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.3 }}>
          <rect x="180" y="55" width="30" height="40" rx="6" fill="#d1fae5" />
          <circle cx="195" cy="40" r="15" fill="#fef3c7" />
          <path d="M180 35 C180 22, 210 22, 210 35" fill="#059669" />
          <rect x="178" y="33" width="34" height="5" rx="2.5" fill="#047857" />
          <circle cx="191" cy="39" r="2" fill="#1e293b" />
          <circle cx="199" cy="39" r="2" fill="#1e293b" />
          <path d="M189 44 Q195 50 201 44" stroke="#1e293b" strokeWidth="1.5" fill="none" />
          <rect x="210" y="65" width="14" height="12" rx="3" fill="#059669" />
          <rect x="213" y="68" width="8" height="6" rx="1.5" fill="white" />
          <rect x="216" y="70" width="2" height="2" rx="0.5" fill="#059669" />
          {/* Motion lines */}
          {animated && (
            <motion.g animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <path d="M175 65 L168 65" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M173 72 L166 72" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
            </motion.g>
          )}
        </motion.g>

        {/* Connection lines */}
        <motion.path d="M60 70 Q82 55 105 70" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 3" opacity="0.3"
          initial={animated ? { pathLength: 0 } : undefined}
          animate={animated ? { pathLength: 1 } : undefined}
          transition={{ duration: 1, delay: 0.5 }} />
        <motion.path d="M135 70 Q157 55 180 70" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 3" opacity="0.3"
          initial={animated ? { pathLength: 0 } : undefined}
          animate={animated ? { pathLength: 1 } : undefined}
          transition={{ duration: 1, delay: 0.7 }} />
      </svg>
    </div>
  );
}

export function TelemedicineIllustration({ className = '', animated = true }: IllustrationProps) {
  const ref = use3DTilt(className);
  return (
    <div ref={ref} className="transition-transform duration-200 ease-out" style={{ transformStyle: 'preserve-3d' }}>
      <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Monitor base */}
        <rect x="20" y="20" width="160" height="110" rx="12" fill="#1e293b" />
        <rect x="24" y="24" width="152" height="102" rx="8" fill="#0f172a" />
        {/* Screen - video call */}
        <rect x="28" y="32" width="108" height="86" rx="6" fill="#1e293b" />
        {/* Doctor on screen */}
        <circle cx="82" cy="65" r="20" fill="#fef3c7" />
        <rect x="68" y="82" width="28" height="30" rx="6" fill="#e2e8f0" />
        <path d="M65 55 C65 40, 99 40, 99 55" fill="#1e293b" />
        <circle cx="78" cy="63" r="2.5" fill="#1e293b" />
        <circle cx="86" cy="63" r="2.5" fill="#1e293b" />
        <path d="M76 70 Q82 76 88 70" stroke="#22c55e" strokeWidth="1.5" fill="none" />
        {/* Cross overlay */}
        <rect x="140" y="32" width="36" height="86" rx="6" fill="#0f172a" />
        {/* Patient info sidebar */}
        <rect x="144" y="38" width="28" height="6" rx="2" fill="#22c55e" opacity="0.5" />
        <rect x="144" y="48" width="28" height="4" rx="1.5" fill="#334155" />
        <rect x="144" y="56" width="20" height="4" rx="1.5" fill="#334155" />
        <rect x="144" y="64" width="24" height="4" rx="1.5" fill="#334155" />
        <rect x="144" y="72" width="18" height="4" rx="1.5" fill="#334155" />
        {/* Heart rate */}
        <motion.path d="M144 90 L148 90 L150 85 L152 95 L154 88 L156 92 L158 85 L160 90 L164 90"
          stroke="#22c55e" strokeWidth="1.5" fill="none"
          initial={animated ? { pathLength: 0 } : undefined}
          animate={animated ? { pathLength: 1 } : undefined}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
        {/* Monitor stand */}
        <rect x="90" y="130" width="20" height="6" rx="2" fill="#64748b" />
        <rect x="102" y="136" width="4" height="12" fill="#64748b" />
        <rect x="70" y="146" width="60" height="6" rx="3" fill="#64748b" />
        {/* Recording indicator */}
        {animated && (
          <motion.circle cx="32" cy="28" r="3" fill="#ef4444"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }} />
        )}
      </svg>
    </div>
  );
}
