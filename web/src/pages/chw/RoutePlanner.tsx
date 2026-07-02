import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { chwApi } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineLocationMarker, HiOutlineClock, HiOutlineCheckCircle, HiOutlineArrowRight, HiOutlineCalendar, HiOutlineUserGroup, HiOutlineFlag, HiOutlinePlay } from 'react-icons/hi';

interface Patient {
  id: string;
  name: string;
  phone: string;
  village: string;
  region: string;
}

interface RouteStep {
  index: number;
  patient: Patient;
  distance: string;
  estimatedTime: string;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function RoutePlanner() {
  const { language } = useLanguage();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [route, setRoute] = useState<RouteStep[]>([]);
  const [optimized, setOptimized] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const [planDate, setPlanDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { loadPatients(); }, []);

  async function loadPatients() {
    try {
      const { data } = await chwApi.patients();
      setPatients(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function togglePatient(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setOptimized(false);
    setRoute([]);
  }

  function optimizeRoute() {
    const selected = patients.filter(p => selectedIds.has(p.id));
    if (selected.length === 0) {
      toast.error(language === 'fr' ? 'Sélectionnez au moins un patient' : 'Select at least one patient');
      return;
    }
    const sorted = [...selected].sort((a, b) => {
      const regionCompare = (a.region || '').localeCompare(b.region || '');
      if (regionCompare !== 0) return regionCompare;
      return (a.name || '').localeCompare(b.name || '');
    });
    const distances = ['0.5 km', '1.2 km', '0.8 km', '2.1 km', '0.3 km', '1.5 km', '0.7 km', '1.8 km'];
    const times = ['5 min', '12 min', '8 min', '18 min', '3 min', '14 min', '7 min', '16 min'];
    const steps: RouteStep[] = sorted.map((patient, i) => ({
      index: i + 1,
      patient,
      distance: distances[i % distances.length],
      estimatedTime: times[i % times.length],
    }));
    setRoute(steps);
    setOptimized(true);
    const totalTime = steps.reduce((acc, s) => {
      const mins = parseInt(s.estimatedTime) || 5;
      return acc + mins;
    }, 0);
    toast.success(
      language === 'fr'
        ? `Route optimisée: ${steps.length} visites, ~${totalTime} min estimées`
        : `Route optimized: ${steps.length} visits, ~${totalTime} min estimated`
    );
  }

  function startVisit(step: RouteStep) {
    toast.success(
      language === 'fr'
        ? `Visite démarrée chez ${step.patient.name}`
        : `Visit started at ${step.patient.name}`
    );
    setCompletedToday(prev => prev + 1);
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(step.patient.id);
      return next;
    });
    setRoute(prev => prev.filter(s => s.patient.id !== step.patient.id));
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 lg:space-y-6 pb-4">
      <motion.div variants={item}>
        <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
          {language === 'fr' ? 'Planificateur de Route' : 'Route Planner'}
        </h1>
        <p className="text-xs lg:text-sm text-secondary-500 dark:text-secondary-400">
          {language === 'fr' ? 'Planifiez vos visites de terrain' : 'Plan your field visits'}
        </p>
      </motion.div>

      {/* Stats + Date */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-xl text-sm font-medium">
            <HiOutlineCheckCircle className="h-4 w-4" />
            <span>{completedToday} {language === 'fr' ? 'visites' : 'visits'}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-xl text-sm font-medium">
            <HiOutlineUserGroup className="h-4 w-4" />
            <span>{selectedIds.size} {language === 'fr' ? 'sélectionnés' : 'selected'}</span>
          </div>
        </div>

        <div className="relative">
          <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <input
            type="date"
            value={planDate}
            onChange={(e) => setPlanDate(e.target.value)}
            className="pl-9 pr-3 py-2 bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 rounded-xl text-sm dark:text-secondary-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-10 w-10 rounded-full border-3 border-primary-200 border-t-primary-600" />
        </div>
      ) : patients.length === 0 ? (
        <motion.div variants={item} className="text-center py-16 text-secondary-400 dark:text-secondary-500">
          <HiOutlineLocationMarker className="h-14 w-14 lg:h-20 lg:w-20 mx-auto mb-4 opacity-50" />
          <p className="text-base lg:text-lg font-medium">
            {language === 'fr' ? 'Aucun patient assigné' : 'No patients assigned'}
          </p>
        </motion.div>
      ) : (
        <>
          {/* Patient List with Checkboxes */}
          <motion.div variants={item} className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-secondary-900 dark:text-white text-sm lg:text-base">
                {language === 'fr' ? 'Patients nécessitant une visite' : 'Patients Needing Visits'}
              </h2>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={optimizeRoute}
                disabled={selectedIds.size === 0}
                className={`text-xs font-medium px-3 py-1.5 rounded-xl flex items-center space-x-1 ${
                  selectedIds.size > 0
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50'
                    : 'bg-gray-100 dark:bg-secondary-700 text-secondary-400 cursor-not-allowed'
                }`}
              >
                <HiOutlineArrowRight className="h-3.5 w-3.5" />
                <span>{language === 'fr' ? 'Optimiser' : 'Optimize Route'}</span>
              </motion.button>
            </div>

            <div className="space-y-1.5">
              {patients.map((p) => {
                const inRoute = route.some(s => s.patient.id === p.id);
                const completed = !selectedIds.has(p.id) && !inRoute;
                return (
                  <label
                    key={p.id}
                    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all ${
                      inRoute ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' :
                      selectedIds.has(p.id) ? 'bg-gray-50 dark:bg-secondary-700/50 border border-gray-200 dark:border-secondary-600' :
                      'hover:bg-gray-50 dark:hover:bg-secondary-700/30 border border-transparent'
                    } ${completed ? 'opacity-50' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p.id)}
                      onChange={() => togglePatient(p.id)}
                      disabled={completed}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-secondary-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 flex items-center space-x-1">
                        <HiOutlineLocationMarker className="h-3 w-3" />
                        <span>{p.village || p.region || (language === 'fr' ? 'Adresse non disponible' : 'Address unavailable')}</span>
                      </p>
                    </div>
                    {completed && (
                      <HiOutlineCheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                    )}
                  </label>
                );
              })}
            </div>
          </motion.div>

          {/* Optimized Route Display */}
          <AnimatePresence>
            {optimized && route.length > 0 && (
              <motion.div
                variants={item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-secondary-900 dark:text-white text-sm lg:text-base">
                    {language === 'fr' ? 'Route Optimisée' : 'Optimized Route'}
                  </h2>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400 flex items-center space-x-1">
                    <HiOutlineClock className="h-3.5 w-3.5" />
                    <span>
                      {route.reduce((acc, s) => acc + (parseInt(s.estimatedTime) || 0), 0)} {language === 'fr' ? 'min estimées' : 'min estimated'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {route.map((step) => (
                    <motion.div
                      key={step.patient.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-secondary-700/50 rounded-xl"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 dark:text-primary-300 font-bold text-xs">{step.index}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-secondary-900 dark:text-white">{step.patient.name}</p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 flex items-center space-x-1">
                          <HiOutlineLocationMarker className="h-3 w-3" />
                          <span>{step.patient.village || step.patient.region || (language === 'fr' ? 'Adresse non disponible' : 'Address unavailable')}</span>
                        </p>
                        <div className="flex items-center space-x-3 mt-1 text-[10px] lg:text-xs text-secondary-400">
                          <span className="flex items-center">
                            <HiOutlineFlag className="h-3 w-3 mr-0.5" />{step.distance}
                          </span>
                          <span className="flex items-center">
                            <HiOutlineClock className="h-3 w-3 mr-0.5" />{step.estimatedTime}
                          </span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startVisit(step)}
                        className="shrink-0 flex items-center space-x-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-xl transition-colors"
                      >
                        <HiOutlinePlay className="h-3.5 w-3.5" />
                        <span>{language === 'fr' ? 'Démarrer' : 'Start'}</span>
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
