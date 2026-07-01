import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineOfficeBuilding, HiOutlinePlusCircle } from 'react-icons/hi';

interface Clinic {
  id: string;
  name: string;
  region: string;
  district: string;
  phone: string;
  email: string;
  address: string;
  is_active: boolean;
}

export default function AdminClinics() {
  const { language } = useLanguage();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', region: '', district: '', phone: '', email: '', address: '' });

  useEffect(() => { loadClinics(); }, []);

  async function loadClinics() {
    try {
      const { data } = await adminApi.clinics();
      setClinics(data || []);
    } catch (err) {
      console.error('Failed to load clinics:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createClinic(e: React.FormEvent) {
    e.preventDefault();
    try {
      await adminApi.createClinic(form);
      toast.success(language === 'fr' ? 'Clinique ajoutée avec succès' : 'Clinic added successfully');
      setShowForm(false);
      setForm({ name: '', region: '', district: '', phone: '', email: '', address: '' });
      loadClinics();
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Échec de l\'ajout de la clinique' : 'Failed to add clinic'));
    }
  }

  if (loading) return <div className="text-center py-12 text-secondary-400 dark:text-secondary-300">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">{language === 'fr' ? 'Cliniques' : 'Clinics'}</h1>
          <p className="text-sm lg:text-base text-secondary-500 dark:text-secondary-400">{language === 'fr' ? 'Gérer les établissements de santé du réseau' : 'Manage healthcare facilities in the network'}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary shrink-0">
          <HiOutlinePlusCircle className="h-5 w-5 mr-1" />
          {language === 'fr' ? 'Ajouter une clinique' : 'Add Clinic'}
        </button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={createClinic} className="card space-y-3 dark:bg-secondary-800 dark:border-secondary-700">
            <h2 className="font-semibold dark:text-white">{language === 'fr' ? 'Ajouter une nouvelle clinique' : 'Add New Clinic'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Nom de la clinique' : 'Clinic Name'}</label>
                <input type="text" className="input dark:bg-secondary-700 dark:text-white dark:border-secondary-600" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Région' : 'Region'}</label>
                <select className="input dark:bg-secondary-700 dark:text-white dark:border-secondary-600" value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })} required>
                  <option value="">{language === 'fr' ? 'Sélectionner' : 'Select'}</option>
                  <option value="Adamawa">Adamawa</option>
                  <option value="Centre">Centre</option>
                  <option value="Far North">Far North</option>
                  <option value="Littoral">Littoral</option>
                  <option value="North">North</option>
                </select>
              </div>
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'District' : 'District'}</label>
                <input type="text" className="input dark:bg-secondary-700 dark:text-white dark:border-secondary-600" value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })} />
              </div>
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Téléphone' : 'Phone'}</label>
                <input type="tel" className="input dark:bg-secondary-700 dark:text-white dark:border-secondary-600" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Email' : 'Email'}</label>
                <input type="email" className="input dark:bg-secondary-700 dark:text-white dark:border-secondary-600" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Adresse' : 'Address'}</label>
                <input type="text" className="input dark:bg-secondary-700 dark:text-white dark:border-secondary-600" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="btn-primary">{language === 'fr' ? 'Enregistrer la clinique' : 'Save Clinic'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary dark:bg-secondary-700 dark:text-secondary-200">{language === 'fr' ? 'Annuler' : 'Cancel'}</button>
            </div>
          </form>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {clinics.map((c) => (
          <div key={c.id} className="card dark:bg-secondary-800 dark:border-secondary-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <HiOutlineOfficeBuilding className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold dark:text-white">{c.name}</h3>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">{c.district}, {c.region}</p>
              </div>
            </div>
            <div className="text-sm text-secondary-500 dark:text-secondary-400 space-y-1">
              {c.phone && <p>📞 {c.phone}</p>}
              {c.email && <p>✉️ {c.email}</p>}
              {c.address && <p>📍 {c.address}</p>}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
