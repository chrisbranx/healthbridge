import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineHeart, HiOutlineSearch, HiOutlineLocationMarker, HiOutlinePhone, HiOutlineCalendar, HiOutlineX, HiOutlinePlus, HiOutlineExclamationCircle, HiOutlineClock } from 'react-icons/hi';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const bloodTypeColors: Record<string, string> = {
  'A+': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'A-': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'B+': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'B-': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'AB+': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'AB-': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'O+': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'O-': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const urgencyColors: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function BloodDonor() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [tab, setTab] = useState<'donors' | 'requests'>('donors');
  const [donors, setDonors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myDonorProfile, setMyDonorProfile] = useState<any>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [bloodFilter, setBloodFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [newDonor, setNewDonor] = useState({ blood_type: 'O+', region: '', phone: '' });
  const [newRequest, setNewRequest] = useState({ blood_type: 'O+', urgency: 'Medium', region: '', hospital: '', notes: '' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [dRes, rRes] = await Promise.all([
        api.get('/blood-donors'),
        api.get('/blood-requests'),
      ]);
      setDonors(dRes.data || []);
      setRequests(rRes.data || []);
      const myProfile = (dRes.data || []).find((d: any) => d.user_id === user?.id);
      setMyDonorProfile(myProfile || null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleRegisterDonor(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data } = await api.post('/blood-donors', newDonor);
      setMyDonorProfile(data);
      toast.success(language === 'fr' ? 'Inscription réussie' : 'Registered successfully');
      setShowRegisterModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Erreur' : 'Error'));
    }
  }

  async function handleEditDonor(e: React.FormEvent) {
    e.preventDefault();
    if (!myDonorProfile) return;
    try {
      await api.patch(`/blood-donors/${myDonorProfile.id}`, newDonor);
      toast.success(language === 'fr' ? 'Profil mis à jour' : 'Profile updated');
      setShowEditModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Erreur' : 'Error'));
    }
  }

  async function handleCreateRequest(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/blood-requests', newRequest);
      toast.success(language === 'fr' ? 'Demande créée' : 'Request created');
      setShowRequestModal(false);
      setNewRequest({ blood_type: 'O+', urgency: 'Medium', region: '', hospital: '', notes: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Erreur' : 'Error'));
    }
  }

  const filteredDonors = donors.filter(d => {
    if (bloodFilter && d.blood_type !== bloodFilter) return false;
    if (regionFilter && !d.region?.toLowerCase().includes(regionFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 lg:space-y-6 pb-4">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Don de Sang' : 'Blood Donor Registry'}
          </h1>
          <p className="text-xs lg:text-sm text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Donneurs et demandes de sang' : 'Donors and blood requests'}
          </p>
        </div>
        {tab === 'donors' ? (
          myDonorProfile ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setNewDonor({ blood_type: myDonorProfile.blood_type, region: myDonorProfile.region || '', phone: myDonorProfile.phone || '' }); setShowEditModal(true); }}
              className="btn-primary text-xs lg:text-sm"
            >
              <HiOutlineHeart className="h-4 w-4 mr-1" />
              {language === 'fr' ? 'Modifier Profil' : 'Edit Profile'}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowRegisterModal(true)}
              className="btn-primary text-xs lg:text-sm"
            >
              <HiOutlinePlus className="h-4 w-4 mr-1" />
              {language === 'fr' ? 'Devenir Donneur' : 'Register as Donor'}
            </motion.button>
          )
        ) : user?.role === 'doctor' && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowRequestModal(true)}
            className="btn-primary text-xs lg:text-sm"
          >
            <HiOutlinePlus className="h-4 w-4 mr-1" />
            {language === 'fr' ? 'Demander du Sang' : 'Request Blood'}
          </motion.button>
        )}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex space-x-2">
        {(['donors', 'requests'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                : 'bg-gray-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-gray-200 dark:hover:bg-secondary-600'
            }`}
          >
            {t === 'donors'
              ? (language === 'fr' ? 'Donneurs' : 'Donors')
              : (language === 'fr' ? 'Demandes' : 'Requests')}
          </button>
        ))}
      </motion.div>

      {/* My Donor Profile Card */}
      {tab === 'donors' && myDonorProfile && (
        <motion.div variants={item} className="bg-gradient-to-r from-red-50 to-primary-50 dark:from-red-900/20 dark:to-primary-900/20 rounded-xl lg:rounded-2xl p-4 lg:p-5 border border-red-100 dark:border-red-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <HiOutlineHeart className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-secondary-900 dark:text-white">
                  {language === 'fr' ? 'Votre Profil Donneur' : 'Your Donor Profile'}
                </p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-medium ${bloodTypeColors[myDonorProfile.blood_type]}`}>
                    {myDonorProfile.blood_type}
                  </span>
                  {myDonorProfile.region && (
                    <span className="text-xs text-secondary-500 dark:text-secondary-400 flex items-center">
                      <HiOutlineLocationMarker className="h-3 w-3 mr-0.5" />
                      {myDonorProfile.region}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      {tab === 'donors' && (
        <motion.div variants={item} className="flex items-center space-x-2">
          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="input w-28 dark:bg-secondary-700 dark:text-white dark:border-secondary-600 text-sm"
          >
            <option value="">{language === 'fr' ? 'Tous' : 'All'}</option>
            {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
          </select>
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              placeholder={language === 'fr' ? 'Région...' : 'Region...'}
              className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 rounded-xl text-sm dark:text-secondary-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all placeholder-secondary-400"
            />
          </div>
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-10 w-10 rounded-full border-3 border-primary-200 border-t-primary-600" />
        </div>
      ) : tab === 'donors' ? (
        filteredDonors.length === 0 ? (
          <motion.div variants={item} className="text-center py-16 text-secondary-400 dark:text-secondary-500">
            <HiOutlineHeart className="h-14 w-14 lg:h-20 lg:w-20 mx-auto mb-4 opacity-50" />
            <p className="text-base lg:text-lg font-medium">
              {language === 'fr' ? 'Aucun donneur trouvé' : 'No donors found'}
            </p>
            {!myDonorProfile && (
              <p className="text-sm mt-1">
                {language === 'fr' ? 'Soyez le premier à vous inscrire' : 'Be the first to register'}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div variants={item} className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDonors.map((d) => (
              <div key={d.id} className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-5">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-400 to-primary-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {d.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-secondary-900 dark:text-white truncate">{d.name}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-medium ${bloodTypeColors[d.blood_type]}`}>
                      {d.blood_type}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-secondary-500 dark:text-secondary-400">
                  {d.region && (
                    <p className="flex items-center space-x-1.5">
                      <HiOutlineLocationMarker className="h-3.5 w-3.5 text-secondary-400 shrink-0" />
                      <span>{d.region}</span>
                    </p>
                  )}
                  {d.last_donation && (
                    <p className="flex items-center space-x-1.5">
                      <HiOutlineCalendar className="h-3.5 w-3.5 text-secondary-400 shrink-0" />
                      <span>{language === 'fr' ? 'Dernier don' : 'Last donation'}: {new Date(d.last_donation).toLocaleDateString()}</span>
                    </p>
                  )}
                  {d.phone && (
                    <p className="flex items-center space-x-1.5">
                      <HiOutlinePhone className="h-3.5 w-3.5 text-secondary-400 shrink-0" />
                      <span>{d.phone}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )
      ) : (
        requests.length === 0 ? (
          <motion.div variants={item} className="text-center py-16 text-secondary-400 dark:text-secondary-500">
            <HiOutlineExclamationCircle className="h-14 w-14 lg:h-20 lg:w-20 mx-auto mb-4 opacity-50" />
            <p className="text-base lg:text-lg font-medium">
              {language === 'fr' ? 'Aucune demande' : 'No requests yet'}
            </p>
          </motion.div>
        ) : (
          <motion.div variants={item} className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-medium ${bloodTypeColors[r.blood_type]}`}>
                      {r.blood_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-medium ${urgencyColors[r.urgency] || 'bg-gray-100 text-gray-700'}`}>
                      {r.urgency}
                    </span>
                  </div>
                  <span className="text-[10px] lg:text-xs text-secondary-400 flex items-center">
                    <HiOutlineClock className="h-3 w-3 mr-1" />
                    {new Date(r.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-GB')}
                  </span>
                </div>
                <div className="space-y-1 text-xs lg:text-sm text-secondary-600 dark:text-secondary-400">
                  {r.region && <p>{language === 'fr' ? 'Région' : 'Region'}: {r.region}</p>}
                  {r.hospital && <p>{language === 'fr' ? 'Hôpital' : 'Hospital'}: {r.hospital}</p>}
                  {r.notes && <p className="text-secondary-500 dark:text-secondary-500 mt-1">{r.notes}</p>}
                </div>
              </div>
            ))}
          </motion.div>
        )
      )}

      {/* Register Donor Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowRegisterModal(false)} className="fixed inset-0 bg-black/40 z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[15%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[480px] z-50 bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-secondary-100 dark:border-secondary-700">
                <h2 className="text-lg font-bold text-secondary-900 dark:text-white">
                  {language === 'fr' ? 'Devenir Donneur' : 'Register as Donor'}
                </h2>
                <button onClick={() => setShowRegisterModal(false)} className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700">
                  <HiOutlineX className="h-5 w-5 text-secondary-400" />
                </button>
              </div>
              <form onSubmit={handleRegisterDonor} className="p-5 space-y-4">
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Groupe Sanguin' : 'Blood Type'}</label>
                  <select className="input dark:bg-secondary-700 dark:text-white" value={newDonor.blood_type} onChange={(e) => setNewDonor({ ...newDonor, blood_type: e.target.value })} required>
                    {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Région' : 'Region'}</label>
                  <input className="input dark:bg-secondary-700 dark:text-white" value={newDonor.region} onChange={(e) => setNewDonor({ ...newDonor, region: e.target.value })} required />
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Téléphone' : 'Phone'}</label>
                  <input className="input dark:bg-secondary-700 dark:text-white" value={newDonor.phone} onChange={(e) => setNewDonor({ ...newDonor, phone: e.target.value })} required />
                </div>
                <div className="flex space-x-2 pt-2">
                  <button type="submit" className="btn-primary flex-1 justify-center">{language === 'fr' ? 'S\'inscrire' : 'Register'}</button>
                  <button type="button" onClick={() => setShowRegisterModal(false)} className="btn-secondary flex-1 justify-center">{language === 'fr' ? 'Annuler' : 'Cancel'}</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Donor Modal */}
      <AnimatePresence>
        {showEditModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)} className="fixed inset-0 bg-black/40 z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[15%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[480px] z-50 bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-secondary-100 dark:border-secondary-700">
                <h2 className="text-lg font-bold text-secondary-900 dark:text-white">
                  {language === 'fr' ? 'Modifier Profil' : 'Edit Profile'}
                </h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700">
                  <HiOutlineX className="h-5 w-5 text-secondary-400" />
                </button>
              </div>
              <form onSubmit={handleEditDonor} className="p-5 space-y-4">
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Groupe Sanguin' : 'Blood Type'}</label>
                  <select className="input dark:bg-secondary-700 dark:text-white" value={newDonor.blood_type} onChange={(e) => setNewDonor({ ...newDonor, blood_type: e.target.value })} required>
                    {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Région' : 'Region'}</label>
                  <input className="input dark:bg-secondary-700 dark:text-white" value={newDonor.region} onChange={(e) => setNewDonor({ ...newDonor, region: e.target.value })} required />
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Téléphone' : 'Phone'}</label>
                  <input className="input dark:bg-secondary-700 dark:text-white" value={newDonor.phone} onChange={(e) => setNewDonor({ ...newDonor, phone: e.target.value })} required />
                </div>
                <div className="flex space-x-2 pt-2">
                  <button type="submit" className="btn-primary flex-1 justify-center">{language === 'fr' ? 'Enregistrer' : 'Save'}</button>
                  <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary flex-1 justify-center">{language === 'fr' ? 'Annuler' : 'Cancel'}</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Request Blood Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowRequestModal(false)} className="fixed inset-0 bg-black/40 z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[540px] z-50 bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-secondary-100 dark:border-secondary-700">
                <h2 className="text-lg font-bold text-secondary-900 dark:text-white">
                  {language === 'fr' ? 'Demander du Sang' : 'Request Blood'}
                </h2>
                <button onClick={() => setShowRequestModal(false)} className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700">
                  <HiOutlineX className="h-5 w-5 text-secondary-400" />
                </button>
              </div>
              <form onSubmit={handleCreateRequest} className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Groupe Sanguin' : 'Blood Type'}</label>
                  <select className="input dark:bg-secondary-700 dark:text-white" value={newRequest.blood_type} onChange={(e) => setNewRequest({ ...newRequest, blood_type: e.target.value })} required>
                    {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Urgence' : 'Urgency'}</label>
                  <select className="input dark:bg-secondary-700 dark:text-white" value={newRequest.urgency} onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Région' : 'Region'}</label>
                  <input className="input dark:bg-secondary-700 dark:text-white" value={newRequest.region} onChange={(e) => setNewRequest({ ...newRequest, region: e.target.value })} required />
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Hôpital' : 'Hospital'}</label>
                  <input className="input dark:bg-secondary-700 dark:text-white" value={newRequest.hospital} onChange={(e) => setNewRequest({ ...newRequest, hospital: e.target.value })} required />
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Notes' : 'Notes'}</label>
                  <textarea className="input min-h-[60px] dark:bg-secondary-700 dark:text-white" value={newRequest.notes} onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })} />
                </div>
                <div className="flex space-x-2 pt-2">
                  <button type="submit" className="btn-primary flex-1 justify-center">{language === 'fr' ? 'Envoyer' : 'Submit'}</button>
                  <button type="button" onClick={() => setShowRequestModal(false)} className="btn-secondary flex-1 justify-center">{language === 'fr' ? 'Annuler' : 'Cancel'}</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
