import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUserGroup, HiOutlinePlus, HiOutlinePhone, HiOutlineHeart, HiOutlineExclamationCircle, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineStar, HiOutlineShieldCheck } from 'react-icons/hi';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const RELATIONSHIPS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 'Other'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Family() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: '', phone: '', relationship: '', blood_type: '', allergies: '', is_emergency_contact: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const { data } = await api.get('/family/members');
      setMembers(data || []);
    } catch {
      toast.error(language === 'fr' ? 'Échec du chargement' : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', phone: '', relationship: '', blood_type: '', allergies: '', is_emergency_contact: false });
    setShowModal(true);
  };

  const openEdit = (m: any) => {
    setEditing(m);
    setForm({
      name: m.name || '',
      phone: m.phone || '',
      relationship: m.relationship || '',
      blood_type: m.blood_type || '',
      allergies: m.allergies || '',
      is_emergency_contact: m.is_emergency_contact || false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await api.patch(`/family/members/${editing.id}`, form);
        toast.success(language === 'fr' ? 'Membre mis à jour' : 'Member updated');
      } else {
        await api.post('/family/members', form);
        toast.success(language === 'fr' ? 'Membre ajouté' : 'Member added');
      }
      setShowModal(false);
      loadMembers();
    } catch {
      toast.error(language === 'fr' ? 'Échec de l\'opération' : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'fr' ? 'Supprimer ce membre?' : 'Delete this member?')) return;
    try {
      await api.delete(`/family/members/${id}`);
      toast.success(language === 'fr' ? 'Membre supprimé' : 'Member deleted');
      setExpanded(null);
      loadMembers();
    } catch {
      toast.error(language === 'fr' ? 'Échec de la suppression' : 'Delete failed');
    }
  };

  const toggleEmergency = async (m: any) => {
    try {
      await api.patch(`/family/members/${m.id}`, { is_emergency_contact: !m.is_emergency_contact });
      toast.success(language === 'fr' ? 'Contact d\'urgence mis à jour' : 'Emergency contact updated');
      loadMembers();
    } catch {
      toast.error(language === 'fr' ? 'Échec de mise à jour' : 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-10 w-10 rounded-full border-3 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2.5 bg-gray-50 dark:bg-secondary-700 border border-gray-200 dark:border-secondary-600 rounded-xl text-sm text-secondary-800 dark:text-secondary-200 placeholder-secondary-400 focus:ring-2 focus:ring-primary-500/30 focus:outline-none transition-all";
  const labelClass = "block text-xs font-medium text-secondary-500 dark:text-secondary-400 mb-1";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 lg:space-y-6 pb-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
            <HiOutlineUserGroup className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
              {language === 'fr' ? 'Membres de la Famille' : 'Family Members'}
            </h1>
            <p className="text-xs lg:text-sm text-secondary-500 dark:text-secondary-400">
              {language === 'fr' ? 'Gérez les comptes familiaux' : 'Manage family accounts'}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <HiOutlinePlus className="h-4 w-4" />
          <span>{language === 'fr' ? 'Ajouter' : 'Add Member'}</span>
        </motion.button>
      </motion.div>

      {/* Members list */}
      {members.length === 0 ? (
        <motion.div variants={item} className="text-center py-16 text-secondary-400 dark:text-secondary-500">
          <HiOutlineUserGroup className="h-14 w-14 mx-auto mb-4 opacity-50" />
          <p className="text-base font-medium">{language === 'fr' ? 'Aucun membre' : 'No members yet'}</p>
          <p className="text-sm mt-1">{language === 'fr' ? 'Ajoutez des membres de votre famille' : 'Add your family members'}</p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="space-y-3">
          {members.map((m: any, i: number) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 overflow-hidden"
            >
              <div
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                className="p-4 lg:p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-secondary-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{m.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-secondary-900 dark:text-white truncate">{m.name}</p>
                      {m.is_emergency_contact && (
                        <HiOutlineShieldCheck className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-secondary-400 dark:text-secondary-500">{m.relationship} · {m.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:flex items-center space-x-1.5">
                    {m.blood_type && (
                      <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-semibold">{m.blood_type}</span>
                    )}
                    {m.allergies && (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-[10px]">{m.allergies}</span>
                    )}
                  </div>
                  {expanded === m.id ? (
                    <HiOutlineChevronUp className="h-4 w-4 text-secondary-400" />
                  ) : (
                    <HiOutlineChevronDown className="h-4 w-4 text-secondary-400" />
                  )}
                </div>
              </div>

              {/* Expanded actions */}
              {expanded === m.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="border-t border-gray-100 dark:border-secondary-700 px-4 lg:px-5 py-3 bg-gray-50 dark:bg-secondary-700/30 space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2 sm:hidden mb-2">
                    {m.blood_type && (
                      <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-semibold">
                        {m.blood_type}
                      </span>
                    )}
                    {m.allergies && (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-[10px]">
                        {language === 'fr' ? 'Allergie' : 'Allergy'}: {m.allergies}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openEdit(m)}
                      className="flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-white dark:bg-secondary-700 border border-gray-200 dark:border-secondary-600 text-secondary-600 dark:text-secondary-400 text-xs font-medium hover:bg-gray-100 dark:hover:bg-secondary-600 transition-colors"
                    >
                      <HiOutlinePencil className="h-3.5 w-3.5" />
                      <span>{language === 'fr' ? 'Modifier' : 'Edit'}</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleDelete(m.id)}
                      className="flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-white dark:bg-secondary-700 border border-gray-200 dark:border-secondary-600 text-red-500 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <HiOutlineTrash className="h-3.5 w-3.5" />
                      <span>{language === 'fr' ? 'Supprimer' : 'Delete'}</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggleEmergency(m)}
                      className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                        m.is_emergency_contact
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                          : 'bg-white dark:bg-secondary-700 border border-gray-200 dark:border-secondary-600 text-secondary-600 dark:text-secondary-400 hover:bg-gray-100 dark:hover:bg-secondary-600'
                      }`}
                    >
                      <HiOutlineShieldCheck className="h-3.5 w-3.5" />
                      <span className="whitespace-nowrap">{language === 'fr' ? 'Urgence' : 'Emergency'}</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        toast.success(`${language === 'fr' ? 'Appel vers' : 'Calling'} ${m.phone}`);
                      }}
                      className="flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 text-xs font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                    >
                      <HiOutlinePhone className="h-3.5 w-3.5" />
                      <span>{language === 'fr' ? 'Appeler' : 'Call'}</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-white dark:bg-secondary-800 rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 lg:p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-secondary-900 dark:text-white flex items-center space-x-2">
                <HiOutlineUserGroup className="h-5 w-5" />
                <span>
                  {editing
                    ? (language === 'fr' ? 'Modifier le membre' : 'Edit Member')
                    : (language === 'fr' ? 'Ajouter un membre' : 'Add Member')}
                </span>
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg bg-gray-100 dark:bg-secondary-700 text-secondary-500 hover:bg-gray-200 dark:hover:bg-secondary-600 transition-colors">
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>{language === 'fr' ? 'Nom complet' : 'Full Name'}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                  placeholder={language === 'fr' ? 'Nom du membre' : 'Member name'}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>{language === 'fr' ? 'Téléphone' : 'Phone'}</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className={inputClass}
                  placeholder="+237"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>{language === 'fr' ? 'Relation' : 'Relationship'}</label>
                <select
                  value={form.relationship}
                  onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">{language === 'fr' ? 'Sélectionner' : 'Select'}</option>
                  {RELATIONSHIPS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{language === 'fr' ? 'Groupe sanguin' : 'Blood Type'}</label>
                  <select
                    value={form.blood_type}
                    onChange={e => setForm(f => ({ ...f, blood_type: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">{language === 'fr' ? 'Sélectionner' : 'Select'}</option>
                    {BLOOD_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{language === 'fr' ? 'Allergies' : 'Allergies'}</label>
                  <input
                    type="text"
                    value={form.allergies}
                    onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))}
                    className={inputClass}
                    placeholder={language === 'fr' ? 'ex: Pénicilline' : 'e.g. Penicillin'}
                  />
                </div>
              </div>
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_emergency_contact}
                  onChange={e => setForm(f => ({ ...f, is_emergency_contact: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 dark:border-secondary-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-secondary-700 dark:text-secondary-300">{language === 'fr' ? 'Contact d\'urgence' : 'Emergency Contact'}</span>
              </label>
              <motion.button
                type="submit"
                disabled={submitting || !form.name.trim() || !form.phone.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <span>{editing ? (language === 'fr' ? 'Mettre à jour' : 'Update') : (language === 'fr' ? 'Ajouter' : 'Add Member')}</span>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
