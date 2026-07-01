import { motion } from 'framer-motion';

interface LogoProps {
  size?: number;
  animated?: boolean;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 40, animated = true, showText = true, className = '' }: LogoProps) {
  const logoSize = size;
  const textSize = logoSize * 0.55;

  const crossPath = `
    M 50 15
    L 50 40
    L 25 40
    L 25 50
    L 50 50
    L 50 75
    L 60 75
    L 60 50
    L 85 50
    L 85 40
    L 60 40
    L 60 15
    Z
  `;

  const circleCx = 55;
  const circleCy = 45;

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Animated Medical Cross Logo */}
      <div className="relative" style={{ width: logoSize * 2.2, height: logoSize * 2.2 }}>
        <svg
          viewBox="0 0 110 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="crossGrad" x1="0" y1="0" x2="110" y2="90">
              <stop offset="0%" stopColor="#0a5c8a" />
              <stop offset="50%" stopColor="#0a4d7a" />
              <stop offset="100%" stopColor="#0ea5a7" />
            </linearGradient>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="110" y2="90">
              <stop offset="0%" stopColor="#0ea5a7" />
              <stop offset="100%" stopColor="#0a5c8a" />
            </linearGradient>
            <filter id="shadow1">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0a4d7a" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Outer ring */}
          {animated ? (
            <motion.circle
              cx={circleCx} cy={circleCy} r="38"
              stroke="url(#ringGrad)"
              strokeWidth="3"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          ) : (
            <circle cx={circleCx} cy={circleCy} r="38" stroke="url(#ringGrad)" strokeWidth="3" fill="none" opacity="0.8" />
          )}

          {/* Medical Cross */}
          <motion.path
            d={crossPath}
            fill="url(#crossGrad)"
            filter="url(#shadow1)"
            initial={animated ? { scale: 0, rotate: -90, opacity: 0 } : { scale: 1, rotate: 0, opacity: 1 }}
            animate={animated ? { scale: 1, rotate: 0, opacity: 1 } : undefined}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            style={{ transformOrigin: '55px 45px' }}
          />

          {/* Pulse ring */}
          {animated && (
            <motion.circle
              cx={circleCx} cy={circleCy} r="20"
              stroke="#0ea5a7"
              strokeWidth="1.5"
              fill="none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.3, 1.8] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
            />
          )}

          {/* Second pulse ring */}
          {animated && (
            <motion.circle
              cx={circleCx} cy={circleCy} r="20"
              stroke="#0a5c8a"
              strokeWidth="1"
              fill="none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.5, 2.2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 1.2 }}
            />
          )}

          {/* Shine dot */}
          {animated && (
            <motion.circle
              cx="46" cy="36" r="3"
              fill="white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          )}
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <motion.div
          className="flex flex-col leading-tight"
          initial={animated ? { opacity: 0, x: -10 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <span
            className="font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500"
            style={{ fontSize: textSize }}
          >
            HealthBridge
          </span>
          <span className="text-[9px] text-accent-600 font-semibold tracking-[0.15em] uppercase">
            Connecting Care
          </span>
        </motion.div>
      )}
    </div>
  );
}
