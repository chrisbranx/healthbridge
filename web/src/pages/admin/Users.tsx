import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { adminApi } from '../../services/api';
import { HiOutlineUserGroup, HiOutlineSearch } from 'react-icons/hi';

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  language: string;
  region: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const { language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: '', region: '' });

  useEffect(() => { loadUsers(); }, [filter]);

  async function loadUsers() {
    try {
      const params: any = {};
      if (filter.role) params.role = filter.role;
      if (filter.region) params.region = filter.region;
      const { data } = await adminApi.users(params);
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">{language === 'fr' ? 'Utilisateurs' : 'Users'}</h1>
        <p className="text-sm lg:text-base text-secondary-500 dark:text-secondary-400">{language === 'fr' ? 'Gérer tous les utilisateurs de HealthBridge' : 'Manage all HealthBridge users'}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-2">
        <select className="input max-w-[200px] dark:bg-secondary-700 dark:text-white dark:border-secondary-600" value={filter.role}
          onChange={(e) => setFilter({ ...filter, role: e.target.value })}>
          <option value="">{language === 'fr' ? 'Tous les rôles' : 'All Roles'}</option>
          <option value="patient">{language === 'fr' ? 'Patient' : 'Patient'}</option>
          <option value="doctor">{language === 'fr' ? 'Médecin' : 'Doctor'}</option>
          <option value="chw">{language === 'fr' ? 'ASC' : 'CHW'}</option>
          <option value="admin">{language === 'fr' ? 'Administrateur' : 'Admin'}</option>
        </select>
        <select className="input max-w-[200px] dark:bg-secondary-700 dark:text-white dark:border-secondary-600" value={filter.region}
          onChange={(e) => setFilter({ ...filter, region: e.target.value })}>
          <option value="">{language === 'fr' ? 'Toutes les régions' : 'All Regions'}</option>
          <option value="Adamawa">Adamawa</option>
          <option value="Centre">Centre</option>
          <option value="Far North">Far North</option>
          <option value="Littoral">Littoral</option>
          <option value="North">North</option>
        </select>
      </motion.div>

      {loading ? (
        <div className="text-center py-12 text-secondary-400 dark:text-secondary-300">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="overflow-x-auto rounded-lg border dark:border-secondary-700">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-secondary-800 text-left text-sm text-secondary-500 dark:text-secondary-400">
                <th className="px-4 py-3 font-medium">{language === 'fr' ? 'Nom' : 'Name'}</th>
                <th className="px-4 py-3 font-medium">{language === 'fr' ? 'Téléphone' : 'Phone'}</th>
                <th className="px-4 py-3 font-medium">{language === 'fr' ? 'Rôle' : 'Role'}</th>
                <th className="px-4 py-3 font-medium">{language === 'fr' ? 'Région' : 'Region'}</th>
                <th className="px-4 py-3 font-medium">{language === 'fr' ? 'Langue' : 'Language'}</th>
                <th className="px-4 py-3 font-medium">{language === 'fr' ? 'Statut' : 'Status'}</th>
                <th className="px-4 py-3 font-medium">{language === 'fr' ? 'Inscrit' : 'Joined'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-secondary-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-secondary-800/50 dark:bg-secondary-900">
                  <td className="px-4 py-3 font-medium dark:text-white">{u.name}</td>
                  <td className="px-4 py-3 text-sm dark:text-secondary-300">{u.phone}</td>
                  <td className="px-4 py-3"><span className="badge capitalize bg-gray-100 text-gray-700 dark:bg-secondary-700 dark:text-secondary-300">{u.role === 'patient' ? (language === 'fr' ? 'Patient' : 'Patient') : u.role === 'doctor' ? (language === 'fr' ? 'Médecin' : 'Doctor') : u.role === 'chw' ? (language === 'fr' ? 'ASC' : 'CHW') : u.role === 'admin' ? (language === 'fr' ? 'Administrateur' : 'Admin') : u.role}</span></td>
                  <td className="px-4 py-3 text-sm dark:text-secondary-300">{u.region || '-'}</td>
                  <td className="px-4 py-3 text-sm uppercase dark:text-secondary-300">{u.language}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                      {u.is_active ? (language === 'fr' ? 'Actif' : 'Active') : (language === 'fr' ? 'Inactif' : 'Inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary-400 dark:text-secondary-500">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-center py-8 text-secondary-400 dark:text-secondary-500">{language === 'fr' ? 'Aucun utilisateur trouvé' : 'No users found'}</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
