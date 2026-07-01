import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { patientsApi, authApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineUser, HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker,
  HiOutlineCalendar, HiOutlineHeart, HiOutlineExclamationCircle,
  HiOutlineSave, HiOutlineUserGroup, HiOutlineGlobe
} from 'react-icons/hi';

export default function PatientProfile() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [form, setForm] = useState({
    name: '', date_of_birth: '', gender: '', village: '', region: '',
    chronic_conditions: '', allergies: '', blood_type: '',
    emergency_contact_name: '', emergency_contact_phone: '',
  });

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (user.patient_profile?.id
      ? patientsApi.get(user.patient_profile.id)
      : authApi.me()
    ).then(({ data }: any) => {
      const p = data.patient_profile || data;
      setProfile(p);
      setForm({
        name: p.name || user.name || '',
        date_of_birth: p.date_of_birth || '',
        gender: p.gender || '',
        village: p.village || '',
        region: p.region || user.region || '',
        chronic_conditions: (p.chronic_conditions || []).join(', '),
        allergies: (p.allergies || []).join(', '),
        blood_type: p.blood_type || '',
        emergency_contact_name: p.emergency_contact_name || '',
        emergency_contact_phone: p.emergency_contact_phone || '',
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        date_of_birth: form.date_of_birth || undefined,
        gender: form.gender || undefined,
        village: form.village || undefined,
        region: form.region || undefined,
        chronic_conditions: form.chronic_conditions ? form.chronic_conditions.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        allergies: form.allergies ? form.allergies.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        blood_type: form.blood_type || undefined,
        emergency_contact_name: form.emergency_contact_name || undefined,
        emergency_contact_phone: form.emergency_contact_phone || undefined,
      };
      await patientsApi.update(profile.id, payload);
      toast.success(language === 'fr' ? 'Profil mis à jour' : 'Profile updated');
    } catch {
      toast.error(language === 'fr' ? 'Erreur de mise à jour' : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-10 w-10 rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2.5 bg-gray-50 dark:bg-secondary-700 border border-gray-200 dark:border-secondary-600 rounded-xl text-sm text-secondary-800 dark:text-secondary-200 placeholder-secondary-400 focus:ring-2 focus:ring-primary-500/30 focus:outline-none transition-all";
  const labelClass = "block text-xs font-medium text-secondary-500 dark:text-secondary-400 mb-1";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-4 lg:space-y-6 pb-6">
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
          <span className="text-white font-bold text-lg">{user?.name?.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Mon Profil' : 'My Profile'}
          </h1>
          <p className="text-xs text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Gérez vos informations personnelles' : 'Manage your personal information'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 flex items-center space-x-2">
            <HiOutlineUser className="h-4 w-4" />
            <span>{language === 'fr' ? 'Informations personnelles' : 'Personal Info'}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{language === 'fr' ? 'Nom complet' : 'Full Name'}</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>{language === 'fr' ? 'Date de naissance' : 'Date of Birth'}</label>
              <input type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{language === 'fr' ? 'Genre' : 'Gender'}</label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className={inputClass}>
                <option value="">{language === 'fr' ? 'Sélectionner' : 'Select'}</option>
                <option value="male">{language === 'fr' ? 'Homme' : 'Male'}</option>
                <option value="female">{language === 'fr' ? 'Femme' : 'Female'}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{language === 'fr' ? 'Groupe sanguin' : 'Blood Type'}</label>
              <select value={form.blood_type} onChange={e => setForm(f => ({ ...f, blood_type: e.target.value }))} className={inputClass}>
                <option value="">{language === 'fr' ? 'Sélectionner' : 'Select'}</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 flex items-center space-x-2">
            <HiOutlineLocationMarker className="h-4 w-4" />
            <span>{language === 'fr' ? 'Localisation' : 'Location'}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{language === 'fr' ? 'Village / Quartier' : 'Village / Area'}</label>
              <input type="text" value={form.village} onChange={e => setForm(f => ({ ...f, village: e.target.value }))} className={inputClass} placeholder={language === 'fr' ? 'ex: Mvog-Mbi' : 'e.g. Mvog-Mbi'} />
            </div>
            <div>
              <label className={labelClass}>{language === 'fr' ? 'Région' : 'Region'}</label>
              <input type="text" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} className={inputClass} placeholder={language === 'fr' ? 'ex: Centre' : 'e.g. Centre'} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 flex items-center space-x-2">
            <HiOutlineHeart className="h-4 w-4" />
            <span>{language === 'fr' ? 'Informations médicales' : 'Medical Info'}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{language === 'fr' ? 'Maladies chroniques' : 'Chronic Conditions'}</label>
              <input type="text" value={form.chronic_conditions} onChange={e => setForm(f => ({ ...f, chronic_conditions: e.target.value }))} className={inputClass} placeholder={language === 'fr' ? 'ex: Diabète, Hypertension' : 'e.g. Diabetes, Hypertension'} />
              <p className="text-[10px] text-secondary-400 mt-0.5">{language === 'fr' ? 'Séparés par des virgules' : 'Comma-separated'}</p>
            </div>
            <div>
              <label className={labelClass}>{language === 'fr' ? 'Allergies' : 'Allergies'}</label>
              <input type="text" value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} className={inputClass} placeholder={language === 'fr' ? 'ex: Pénicilline, Arachides' : 'e.g. Penicillin, Peanuts'} />
              <p className="text-[10px] text-secondary-400 mt-0.5">{language === 'fr' ? 'Séparés par des virgules' : 'Comma-separated'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 flex items-center space-x-2">
            <HiOutlineUserGroup className="h-4 w-4" />
            <span>{language === 'fr' ? 'Contact d\'urgence' : 'Emergency Contact'}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{language === 'fr' ? 'Nom' : 'Name'}</label>
              <input type="text" value={form.emergency_contact_name} onChange={e => setForm(f => ({ ...f, emergency_contact_name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{language === 'fr' ? 'Téléphone' : 'Phone'}</label>
              <input type="tel" value={form.emergency_contact_phone} onChange={e => setForm(f => ({ ...f, emergency_contact_phone: e.target.value }))} className={inputClass} placeholder="+237" />
            </div>
          </div>
        </div>

        <motion.button
          type="submit" disabled={saving}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {saving ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-5 w-5 rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <HiOutlineSave className="h-5 w-5" />
          )}
          <span>{saving ? (language === 'fr' ? 'Enregistrement...' : 'Saving...') : (language === 'fr' ? 'Enregistrer les modifications' : 'Save Changes')}</span>
        </motion.button>
      </form>
    </motion.div>
  );
}
