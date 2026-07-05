import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { adminFullApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlineShieldCheck,
  HiOutlineTrash,
  HiOutlineSwitchHorizontal,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineAcademicCap,
  HiOutlineBadgeCheck,
  HiOutlineEye,
} from 'react-icons/hi';

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

interface RoleRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'doctor' | 'chw';
  language: string;
  region: string;
  qualifications: string;
  license_number: string;
  experience_years: number;
  specialization: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
}

const ROLES = ['patient', 'doctor', 'chw', 'admin'];
const REGIONS = ['Adamawa', 'Centre', 'Far North', 'Littoral', 'North', 'North West', 'South', 'South West', 'West', 'East'];

const ROLE_COLORS: Record<string, string> = {
  patient: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  doctor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  chw: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300',
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

export default function AdminUsers() {
  const { language } = useLanguage();
  const [tab, setTab] = useState<'users' | 'pending'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RoleRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    else loadRequests();
  }, [tab]);

  async function loadUsers() {
    try {
      setLoading(true);
      const { data } = await adminFullApi.users();
      setUsers(data || []);
    } catch (err) {
      toast.error(language === 'fr' ? 'Échec du chargement' : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function loadRequests() {
    try {
      setLoading(true);
      const { data } = await adminFullApi.roleRequests({ status: 'pending' });
      setRequests(data || []);
    } catch (err) {
      toast.error(language === 'fr' ? 'Échec du chargement' : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateRole(userId: string, newRole: string) {
    try {
      await adminFullApi.updateUserRole(userId, newRole);
      toast.success(language === 'fr' ? 'Rôle mis à jour' : 'Role updated');
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Échec' : 'Failed'));
    }
  }

  async function handleToggleStatus(userId: string, currentActive: boolean) {
    try {
      await adminFullApi.toggleUserStatus(userId, !currentActive);
      toast.success(
        currentActive
          ? (language === 'fr' ? 'Utilisateur désactivé' : 'User deactivated')
          : (language === 'fr' ? 'Utilisateur activé' : 'User activated')
      );
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Échec' : 'Failed'));
    }
  }

  async function handleDeleteUser(userId: string) {
    try {
      await adminFullApi.deleteUser(userId);
      toast.success(language === 'fr' ? 'Utilisateur supprimé' : 'User deleted');
      setConfirmDelete(null);
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Échec' : 'Failed'));
    }
  }

  async function handleApprove(requestId: string) {
    setProcessingId(requestId);
    try {
      await adminFullApi.approveRoleRequest(requestId);
      toast.success(language === 'fr' ? 'Demande approuvée - compte créé' : 'Request approved - account created');
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setSelectedRequest(null);
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Échec' : 'Failed'));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(requestId: string) {
    if (!rejectReason.trim()) {
      toast.error(language === 'fr' ? 'Veuillez fournir une raison' : 'Please provide a reason');
      return;
    }
    setProcessingId(requestId);
    try {
      await adminFullApi.rejectRoleRequest(requestId, rejectReason);
      toast.success(language === 'fr' ? 'Demande rejetée' : 'Request rejected');
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setSelectedRequest(null);
      setRejectReason('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Échec' : 'Failed'));
    } finally {
      setProcessingId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = !roleFilter || u.role === roleFilter;
      const matchRegion = !regionFilter || u.region === regionFilter;
      const matchSearch = !search.trim() ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search.trim());
      return matchRole && matchRegion && matchSearch;
    });
  }, [users, roleFilter, regionFilter, search]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.is_active).length;
    const roleBreakdown = ROLES.reduce(
      (acc, role) => {
        acc[role] = users.filter((u) => u.role === role).length;
        return acc;
      },
      {} as Record<string, number>
    );
    return { total, active, roleBreakdown };
  }, [users]);

  const t = (en: string, fr: string) => (language === 'fr' ? fr : en);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">{t('Users', 'Utilisateurs')}</h1>
        <p className="text-sm lg:text-base text-secondary-500 dark:text-secondary-400">{t('Manage all HealthBridge users', 'Gérer tous les utilisateurs de HealthBridge')}</p>
      </motion.div>

      <div className="flex gap-1 bg-secondary-100 dark:bg-secondary-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'users' ? 'bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white shadow-sm' : 'text-secondary-500 dark:text-secondary-400 hover:text-secondary-700'}`}
        >
          {t('All Users', 'Tous les utilisateurs')}
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${tab === 'pending' ? 'bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white shadow-sm' : 'text-secondary-500 dark:text-secondary-400 hover:text-secondary-700'}`}
        >
          <HiOutlineClock className="h-4 w-4" />
          {t('Pending Approvals', 'Approbations en attente')}
          {requests.length > 0 && (
            <span className="h-5 min-w-[20px] px-1 rounded-full bg-accent-500 text-white text-xs flex items-center justify-center font-bold">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'users' ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <div className="card dark:bg-secondary-800 dark:border-secondary-700 flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <HiOutlineUserGroup className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-secondary-900 dark:text-white">{stats.total}</p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">{t('Total Users', 'Total')}</p>
              </div>
            </div>
            <div className="card dark:bg-secondary-800 dark:border-secondary-700 flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <HiOutlineShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-secondary-900 dark:text-white">{stats.active}</p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">{t('Active', 'Actif')}</p>
              </div>
            </div>
            {ROLES.map((role) => {
              const colorMap: Record<string, string> = {
                patient: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
                doctor: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
                chw: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
                admin: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
              };
              const labelMap: Record<string, [string, string]> = {
                patient: ['Patient', 'Patient'],
                doctor: ['Doctor', 'Médecin'],
                chw: ['CHW', 'ASC'],
                admin: ['Admin', 'Administrateur'],
              };
              const label = labelMap[role];
              return (
                <div key={role} className="card dark:bg-secondary-800 dark:border-secondary-700 flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-lg ${colorMap[role]} flex items-center justify-center`}>
                    <HiOutlineUserGroup className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-secondary-900 dark:text-white">{stats.roleBreakdown[role] || 0}</p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 capitalize">{t(label[0], label[1])}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-3"
          >
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
              <input
                type="text"
                className="input pl-9 dark:bg-secondary-700 dark:text-white dark:border-secondary-600"
                placeholder={t('Search name or phone...', 'Rechercher nom ou téléphone...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input max-w-[180px] dark:bg-secondary-700 dark:text-white dark:border-secondary-600"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">{t('All Roles', 'Tous les rôles')}</option>
              <option value="patient">{t('Patient', 'Patient')}</option>
              <option value="doctor">{t('Doctor', 'Médecin')}</option>
              <option value="chw">{t('CHW', 'ASC')}</option>
              <option value="admin">{t('Admin', 'Administrateur')}</option>
            </select>
            <select
              className="input max-w-[180px] dark:bg-secondary-700 dark:text-white dark:border-secondary-600"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <option value="">{t('All Regions', 'Toutes les régions')}</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </motion.div>

          {loading ? (
            <div className="text-center py-12 text-secondary-400 dark:text-secondary-300">{t('Loading...', 'Chargement...')}</div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="overflow-x-auto rounded-lg border dark:border-secondary-700 max-h-[600px] overflow-y-auto"
            >
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 dark:bg-secondary-800 text-left text-sm text-secondary-500 dark:text-secondary-400">
                    <th className="px-4 py-3 font-medium">{t('Name', 'Nom')}</th>
                    <th className="px-4 py-3 font-medium">{t('Phone', 'Téléphone')}</th>
                    <th className="px-4 py-3 font-medium">{t('Role', 'Rôle')}</th>
                    <th className="px-4 py-3 font-medium">{t('Region', 'Région')}</th>
                    <th className="px-4 py-3 font-medium">{t('Status', 'Statut')}</th>
                    <th className="px-4 py-3 font-medium">{t('Created At', 'Inscrit')}</th>
                    <th className="px-4 py-3 font-medium">{t('Actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-secondary-700">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-secondary-800/50 dark:bg-secondary-900">
                      <td className="px-4 py-3 font-medium whitespace-nowrap dark:text-white">{u.name}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap dark:text-secondary-300">{u.phone}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`badge capitalize ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700 dark:bg-secondary-700 dark:text-secondary-300'}`}>
                          {u.role === 'patient' ? t('Patient', 'Patient') : u.role === 'doctor' ? t('Doctor', 'Médecin') : u.role === 'chw' ? t('CHW', 'ASC') : u.role === 'admin' ? t('Admin', 'Administrateur') : u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap dark:text-secondary-300">{u.region || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`badge ${u.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                          {u.is_active ? t('Active', 'Actif') : t('Inactive', 'Inactif')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-secondary-400 dark:text-secondary-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <select
                            className="text-xs border rounded px-1 py-0.5 dark:bg-secondary-700 dark:text-white dark:border-secondary-600"
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r === 'patient' ? t('Patient', 'Patient') : r === 'doctor' ? t('Doctor', 'Médecin') : r === 'chw' ? t('CHW', 'ASC') : t('Admin', 'Administrateur')}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleToggleStatus(u.id, u.is_active)}
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-secondary-700 text-secondary-500 dark:text-secondary-400"
                            title={u.is_active ? t('Deactivate', 'Désactiver') : t('Activate', 'Activer')}
                          >
                            <HiOutlineSwitchHorizontal className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(u.id)}
                            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                            title={t('Delete', 'Supprimer')}
                          >
                            <HiOutlineTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <p className="text-center py-8 text-secondary-400 dark:text-secondary-500">{t('No users found', 'Aucun utilisateur trouvé')}</p>
              )}
            </motion.div>
          )}

          {confirmDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-secondary-800 rounded-lg p-6 shadow-xl max-w-sm mx-4"
              >
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                  {t('Confirm Delete', 'Confirmer la suppression')}
                </h3>
                <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">
                  {t('Are you sure you want to delete this user? This action cannot be undone.', 'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')}
                </p>
                <div className="flex justify-end space-x-3">
                  <button onClick={() => setConfirmDelete(null)} className="btn-secondary dark:bg-secondary-700 dark:text-secondary-200">
                    {t('Cancel', 'Annuler')}
                  </button>
                  <button onClick={() => handleDeleteUser(confirmDelete)} className="btn-primary bg-red-600 hover:bg-red-700">
                    {t('Delete', 'Supprimer')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {loading ? (
              <div className="col-span-full text-center py-12 text-secondary-400">{t('Loading...', 'Chargement...')}</div>
            ) : requests.length === 0 ? (
              <div className="col-span-full card p-12 text-center dark:bg-secondary-800 dark:border-secondary-700">
                <HiOutlineShieldCheck className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <p className="text-lg font-medium text-secondary-900 dark:text-white">
                  {t('No pending approvals', 'Aucune approbation en attente')}
                </p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                  {t('All doctor and CHW applications have been processed.', 'Toutes les candidatures de médecins et d\'ASC ont été traitées.')}
                </p>
              </div>
            ) : (
              requests.map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-5 dark:bg-secondary-800 dark:border-secondary-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-secondary-900 dark:text-white text-lg">{req.name}</h3>
                      <span className={`badge capitalize text-xs ${req.role === 'doctor' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300'}`}>
                        {req.role === 'doctor' ? t('Doctor', 'Médecin') : t('CHW', 'ASC')}
                      </span>
                      {req.role === 'doctor' && (
                        <span className="badge text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 ml-1">
                          {t('→ Admin on approve', '→ Admin si approuvé')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-secondary-400 whitespace-nowrap">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-secondary-600 dark:text-secondary-300">
                    <div className="flex items-center gap-2">
                      <HiOutlineBadgeCheck className="h-4 w-4 text-secondary-400" />
                      <span>{req.phone}</span>
                    </div>
                    {req.email && (
                      <div className="flex items-center gap-2">
                        <HiOutlineEye className="h-4 w-4 text-secondary-400" />
                        <span>{req.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <HiOutlineAcademicCap className="h-4 w-4 text-secondary-400" />
                      <span>{req.qualifications || t('Not specified', 'Non spécifié')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiOutlineBadgeCheck className="h-4 w-4 text-secondary-400" />
                      <span>{t('License:', 'Licence:')} {req.license_number || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiOutlineClock className="h-4 w-4 text-secondary-400" />
                      <span>{req.experience_years || 0} {t('years experience', 'ans d\'expérience')} - {req.specialization || req.region || '-'}</span>
                    </div>
                    <div className="pt-1 text-xs text-secondary-400">
                      {t('Region:', 'Région:')} {req.region || '-'} | {t('Language:', 'Langue:')} {req.language?.toUpperCase()}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-secondary-700 flex gap-2">
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={processingId === req.id}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <HiOutlineCheckCircle className="h-4 w-4" />
                      {processingId === req.id ? '...' : t('Approve', 'Approuver')}
                    </button>
                    <button
                      onClick={() => setSelectedRequest(selectedRequest?.id === req.id ? null : req)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 text-sm font-medium transition-colors"
                    >
                      <HiOutlineXCircle className="h-4 w-4" />
                      {t('Reject', 'Rejeter')}
                    </button>
                  </div>

                  {selectedRequest?.id === req.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-red-100 dark:border-red-900/30 space-y-2"
                    >
                      <label className="text-xs font-medium text-red-600 dark:text-red-400">
                        {t('Reason for rejection:', 'Raison du rejet:')}
                      </label>
                      <textarea
                        className="input w-full text-sm dark:bg-secondary-700 dark:text-white"
                        rows={2}
                        placeholder={t('Provide a reason...', 'Donnez une raison...')}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(req.id)}
                          disabled={processingId === req.id}
                          className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {processingId === req.id ? '...' : t('Confirm Reject', 'Confirmer le rejet')}
                        </button>
                        <button
                          onClick={() => { setSelectedRequest(null); setRejectReason(''); }}
                          className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-secondary-700 dark:text-secondary-300 text-sm font-medium transition-colors"
                        >
                          {t('Cancel', 'Annuler')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
