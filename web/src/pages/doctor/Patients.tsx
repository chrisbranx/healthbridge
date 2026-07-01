import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { doctorsApi } from '../../services/api';
import { api } from '../../services/api';
import HospitalMap from '../../components/HospitalMap';
import toast from 'react-hot-toast';
import {
  HiOutlineUserGroup, HiOutlineLocationMarker, HiOutlinePhone,
  HiOutlineOfficeBuilding, HiOutlineHeart, HiOutlineSearch,
  HiOutlineGlobe, HiOutlineShieldCheck, HiOutlineClock,
  HiOutlineChevronRight, HiOutlineX, HiOutlineClipboardList,
  HiOutlineUser, HiOutlineCheck
} from 'react-icons/hi';

export default function DoctorPatients() {
  const { language } = useLanguage();
  const [patients, setPatients] = useState<any[]>([]);
  const [chws, setChws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [recommendedClinic, setRecommendedClinic] = useState<any>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([loadPatients(), loadChws()]);
  }, []);

  async function loadPatients() {
    try {
      const { data } = await doctorsApi.patients();
      setPatients(data || []);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadChws() {
    try {
      const { data } = await doctorsApi.chws();
      setChws(data || []);
    } catch (err) {
      console.error('Failed to load CHWs:', err);
    }
  }

  const handleAssignChw = async (chwId: string) => {
    if (!selectedPatient) return;
    setAssigning(chwId);
    try {
      await doctorsApi.assignChw({ patient_id: selectedPatient.id, chw_id: chwId });
      toast.success(
        language === 'fr'
          ? `Patient assigné au CHW avec succès`
          : `Patient assigned to CHW successfully`
      );
      setShowAssignModal(false);
      setSelectedPatient(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Échec de l\'assignation' : 'Assignment failed'));
    } finally {
      setAssigning(null);
    }
  };

  const handleRecommendClinic = (clinic: any) => {
    setRecommendedClinic(clinic);
    toast.success(
      language === 'fr'
        ? `Hôpital recommandé: ${clinic.name}`
        : `Hospital recommended: ${clinic.name}`
    );
  };

  const filteredPatients = patients.filter((p: any) => {
    if (!patientSearch) return true;
    const q = patientSearch.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.phone?.includes(q) || p.village?.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
          {language === 'fr' ? 'Mes patients' : 'My Patients'}
        </h1>
        <p className="text-sm lg:text-base text-secondary-500 dark:text-secondary-400">
          {language === 'fr' ? 'Gérer, assigner et recommander des soins' : 'Manage, assign, and recommend care'}
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-md">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
        <input
          type="text"
          value={patientSearch}
          onChange={(e) => setPatientSearch(e.target.value)}
          placeholder={language === 'fr' ? 'Rechercher un patient...' : 'Search patients...'}
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {filteredPatients.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-16 text-secondary-400 dark:text-secondary-500">
          <HiOutlineUserGroup className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">{language === 'fr' ? 'Aucun patient trouvé' : 'No patients found'}</p>
          <p className="text-sm">{language === 'fr' ? 'Répondez aux consultations pour constituer votre liste' : 'Respond to consultations to build your list'}</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((p: any) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-sm border border-secondary-100 dark:border-secondary-700 hover:shadow-lg hover:border-primary-100 dark:hover:border-primary-700 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {p.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900 dark:text-white">{p.name}</h3>
                    <p className="text-xs text-secondary-400 flex items-center space-x-1">
                      <HiOutlinePhone className="h-3 w-3" />
                      <span>{p.phone}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-secondary-500 dark:text-secondary-400 mb-4">
                {p.village && (
                  <p className="flex items-center space-x-1.5">
                    <HiOutlineLocationMarker className="h-3.5 w-3.5 text-secondary-400 shrink-0" />
                    <span>{p.village}{p.region ? `, ${p.region}` : ''}</span>
                  </p>
                )}
                {p.gender && (
                  <p className="flex items-center space-x-1.5">
                    <HiOutlineUser className="h-3.5 w-3.5 text-secondary-400 shrink-0" />
                    <span>{p.gender === 'male' ? (language === 'fr' ? 'Homme' : 'Male') : p.gender === 'female' ? (language === 'fr' ? 'Femme' : 'Female') : p.gender}</span>
                  </p>
                )}
                {p.chronic_conditions?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.chronic_conditions.map((c: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-full text-[10px] font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-3 border-t border-secondary-100 dark:border-secondary-700">
                <button
                  onClick={() => { setSelectedPatient(p); setShowAssignModal(true); }}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                >
                  <HiOutlineHeart className="h-3.5 w-3.5" />
                  <span>{language === 'fr' ? 'Assigner CHW' : 'Assign CHW'}</span>
                </button>
                <button
                  onClick={() => { setSelectedPatient(p); setShowMapModal(true); }}
                  className="flex items-center justify-center px-3 py-2 text-xs font-semibold text-accent-600 bg-accent-50 dark:bg-accent-900/30 dark:text-accent-400 rounded-xl hover:bg-accent-100 dark:hover:bg-accent-900/50 transition-colors"
                >
                  <HiOutlineOfficeBuilding className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* CHW Assignment Modal */}
      <AnimatePresence>
        {showAssignModal && selectedPatient && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAssignModal(false)}
              className="fixed inset-0 bg-black/40 z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] z-50 bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-secondary-100 dark:border-secondary-700">
                <div>
                  <h2 className="text-lg font-bold text-secondary-900 dark:text-white">
                    {language === 'fr' ? 'Assigner un CHW' : 'Assign a CHW'}
                  </h2>
                  <p className="text-sm text-secondary-500">
                    {language === 'fr' ? 'Patient:' : 'Patient:'} {selectedPatient.name}
                  </p>
                </div>
                <button onClick={() => setShowAssignModal(false)}
                  className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
                  <HiOutlineX className="h-5 w-5 text-secondary-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {chws.length === 0 ? (
                  <div className="text-center py-8 text-secondary-400">
                    <HiOutlineUserGroup className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">
                      {language === 'fr' ? 'Aucun CHW disponible' : 'No CHWs available'}
                    </p>
                    <p className="text-xs mt-1">
                      {language === 'fr' ? 'Les CHW apparaîtront ici après inscription' : 'CHWs will appear here after registration'}
                    </p>
                  </div>
                ) : (
                  chws.map((chw: any) => (
                    <div
                      key={chw.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-pointer border border-transparent hover:border-primary-200 dark:hover:border-primary-800"
                      onClick={() => !assigning && handleAssignChw(chw.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent-400 to-primary-500 flex items-center justify-center text-white font-bold">
                          {chw.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-secondary-900 dark:text-white">{chw.name}</p>
                          <div className="flex items-center space-x-3 text-xs text-secondary-400 mt-0.5">
                            <span>{chw.region || 'N/A'}</span>
                            <span>·</span>
                            <span>{chw.active_patients} {language === 'fr' ? 'patients' : 'patients'}</span>
                            {chw.pending_tasks > 0 && (
                              <>
                                <span>·</span>
                                <span className="text-yellow-600">{chw.pending_tasks} {language === 'fr' ? 'tâches' : 'tasks'}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {assigning === chw.id ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full" />
                      ) : (
                        <HiOutlineChevronRight className="h-5 w-5 text-secondary-300" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hospital Map Modal */}
      <AnimatePresence>
        {showMapModal && selectedPatient && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMapModal(false)}
              className="fixed inset-0 bg-black/40 z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-8 lg:inset-x-16 lg:inset-y-12 z-50 bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-secondary-100 dark:border-secondary-700">
                <div>
                  <h2 className="text-lg font-bold text-secondary-900 dark:text-white">
                    {language === 'fr' ? 'Hôpitaux à proximité' : 'Nearby Hospitals'}
                  </h2>
                  <p className="text-sm text-secondary-500">
                    {language === 'fr' ? 'Recommander pour' : 'Recommend for'}: {selectedPatient.name}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {recommendedClinic && (
                    <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full font-medium">
                      <HiOutlineCheck className="h-3 w-3 inline mr-1" />
                      {recommendedClinic.name}
                    </span>
                  )}
                  <button onClick={() => setShowMapModal(false)}
                    className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
                    <HiOutlineX className="h-5 w-5 text-secondary-400" />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4">
                <HospitalMap
                  onSelectClinic={(clinic) => {
                    handleRecommendClinic(clinic);
                  }}
                  selectedClinicId={recommendedClinic?.id}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
