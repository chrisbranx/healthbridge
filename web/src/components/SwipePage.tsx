import { ReactNode, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const tabSequence: Record<string, string[]> = {
  patient: ['/patient/dashboard', '/patient/consultation', '/patient/history'],
  doctor: ['/doctor/dashboard', '/doctor/consultations', '/doctor/patients'],
  chw: ['/chw/dashboard', '/chw/patients', '/chw/tasks', '/chw/escalations'],
  admin: ['/admin/dashboard', '/admin/users', '/admin/clinics', '/admin/analytics'],
};

export default function SwipePage({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const dragProgress = useTransform(x, [-100, 0, 100], [-1, 0, 1]);

  if (!user) return <>{children}</>;

  const tabs = tabSequence[user.role];
  if (!tabs || tabs.length === 0) return <>{children}</>;

  const currentIdx = tabs.indexOf(location.pathname);
  if (currentIdx === -1) return <>{children}</>;

  const canGoPrev = currentIdx > 0;
  const canGoNext = currentIdx < tabs.length - 1;

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    const threshold = 60;
    if (info.offset.x < -threshold && canGoNext) {
      navigate(tabs[currentIdx + 1]);
    } else if (info.offset.x > threshold && canGoPrev) {
      navigate(tabs[currentIdx - 1]);
    }
    animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden touch-pan-y">
      {/* Swipe hints */}
      {canGoPrev && (
        <motion.div
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center text-secondary-300"
          style={{ opacity: useTransform(dragProgress, [-1, 0], [1, 0]) }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </motion.div>
      )}
      {canGoNext && (
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center text-secondary-300"
          style={{ opacity: useTransform(dragProgress, [0, 1], [0, 1]) }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </motion.div>
      )}

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>

      {/* Page dots indicator on mobile */}
      {tabs.length > 1 && (
        <div className="flex items-center justify-center space-x-1.5 py-3 lg:hidden">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => navigate(tab)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIdx ? 'w-6 bg-primary-500' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
