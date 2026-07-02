import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { doctorsApi } from '../../services/api';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTruck, HiOutlineLocationMarker, HiOutlineClock, HiOutlineX, HiOutlineChevronDown } from 'react-icons/hi';

interface DeliveryOrder {
  id: string;
  medication: string;
  quantity: number;
  address: string;
  notes: string;
  status: string;
  created_at: string;
  patient: { id: string; name: string };
}

interface Patient {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  preparing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_transit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Delivery() {
  const { language } = useLanguage();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newOrder, setNewOrder] = useState({ patient_id: '', medication: '', quantity: 1, address: '', notes: '' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [oRes, pRes] = await Promise.all([
        api.get('/delivery-orders'),
        doctorsApi.patients(),
      ]);
      setOrders(oRes.data || []);
      setPatients(pRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/delivery-orders', newOrder);
      toast.success(language === 'fr' ? 'Commande créée' : 'Order created');
      setShowCreate(false);
      setNewOrder({ patient_id: '', medication: '', quantity: 1, address: '', notes: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Erreur' : 'Error'));
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await api.patch(`/delivery-orders/${id}/status`, { status });
      toast.success(language === 'fr' ? 'Statut mis à jour' : 'Status updated');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || (language === 'fr' ? 'Erreur' : 'Error'));
    }
  }

  const filters = [
    { key: 'all', label: language === 'fr' ? 'Tous' : 'All' },
    { key: 'preparing', label: language === 'fr' ? 'Préparation' : 'Preparing' },
    { key: 'in_transit', label: language === 'fr' ? 'En Transit' : 'In Transit' },
    { key: 'delivered', label: language === 'fr' ? 'Livré' : 'Delivered' },
  ];

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 lg:space-y-6 pb-4">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Livraison de Médicaments' : 'Medicine Delivery'}
          </h1>
          <p className="text-xs lg:text-sm text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Suivi des commandes de livraison' : 'Track delivery orders'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreate(true)}
          className="btn-primary text-xs lg:text-sm"
        >
          <HiOutlinePlus className="h-4 w-4 mr-1" />
          {language === 'fr' ? 'Nouvelle Commande' : 'Create Order'}
        </motion.button>
      </motion.div>

      {/* Filter tabs */}
      <motion.div variants={item} className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs lg:text-sm font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              filter === f.key
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                : 'bg-gray-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-gray-200 dark:hover:bg-secondary-600'
            }`}
          >
            <span>{f.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              filter === f.key ? 'bg-primary-200 dark:bg-primary-800' : 'bg-gray-200 dark:bg-secondary-600'
            }`}>
              {f.key === 'all' ? orders.length : orders.filter(o => o.status === f.key).length}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Orders list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-10 w-10 rounded-full border-3 border-primary-200 border-t-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={item} className="text-center py-16 text-secondary-400 dark:text-secondary-500">
          <HiOutlineTruck className="h-14 w-14 lg:h-20 lg:w-20 mx-auto mb-4 opacity-50" />
          <p className="text-base lg:text-lg font-medium">
            {language === 'fr' ? 'Aucune commande' : 'No orders found'}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="space-y-3">
          {filtered.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-secondary-800 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-secondary-700 p-4 lg:p-5"
            >
              {/* Timeline indicator */}
              <div className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className={`h-3 w-3 rounded-full ${
                    order.status === 'preparing' ? 'bg-yellow-400' :
                    order.status === 'in_transit' ? 'bg-blue-400' :
                    order.status === 'delivered' ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <div className="w-0.5 flex-1 bg-gray-200 dark:bg-secondary-600 min-h-[40px]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status === 'preparing' ? (language === 'fr' ? 'Préparation' : 'Preparing') :
                         order.status === 'in_transit' ? (language === 'fr' ? 'En Transit' : 'In Transit') :
                         order.status === 'delivered' ? (language === 'fr' ? 'Livré' : 'Delivered') :
                         order.status === 'cancelled' ? (language === 'fr' ? 'Annulé' : 'Cancelled') : order.status}
                      </span>
                      <span className="text-[10px] lg:text-xs text-secondary-400 flex items-center">
                        <HiOutlineClock className="h-3 w-3 mr-1" />
                        {new Date(order.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="text-xs bg-gray-50 dark:bg-secondary-700 border border-gray-200 dark:border-secondary-600 rounded-lg px-2 py-1 text-secondary-600 dark:text-secondary-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="preparing">{language === 'fr' ? 'Préparation' : 'Preparing'}</option>
                      <option value="in_transit">{language === 'fr' ? 'En Transit' : 'In Transit'}</option>
                      <option value="delivered">{language === 'fr' ? 'Livré' : 'Delivered'}</option>
                      <option value="cancelled">{language === 'fr' ? 'Annulé' : 'Cancelled'}</option>
                    </select>
                  </div>

                  <h3 className="font-semibold text-secondary-900 dark:text-white text-sm lg:text-base">
                    {order.medication} <span className="font-normal text-secondary-500 dark:text-secondary-400">×{order.quantity}</span>
                  </h3>

                  <div className="mt-2 space-y-1 text-xs text-secondary-500 dark:text-secondary-400">
                    {order.patient && (
                      <p className="font-medium text-secondary-700 dark:text-secondary-300">
                        {order.patient.name}
                      </p>
                    )}
                    {order.address && (
                      <p className="flex items-center space-x-1">
                        <HiOutlineLocationMarker className="h-3 w-3 shrink-0" />
                        <span className="truncate">{order.address}</span>
                      </p>
                    )}
                    {order.notes && (
                      <p className="italic">{order.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Order Modal */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)} className="fixed inset-0 bg-black/40 z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[540px] z-50 bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-secondary-100 dark:border-secondary-700">
                <h2 className="text-lg font-bold text-secondary-900 dark:text-white">
                  {language === 'fr' ? 'Créer une Commande' : 'Create Delivery Order'}
                </h2>
                <button onClick={() => setShowCreate(false)} className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700">
                  <HiOutlineX className="h-5 w-5 text-secondary-400" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Patient' : 'Patient'}</label>
                  <select
                    className="input dark:bg-secondary-700 dark:text-white"
                    value={newOrder.patient_id}
                    onChange={(e) => setNewOrder({ ...newOrder, patient_id: e.target.value })}
                    required
                  >
                    <option value="">{language === 'fr' ? 'Sélectionner un patient' : 'Select a patient'}</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Médicament' : 'Medication'}</label>
                  <input
                    className="input dark:bg-secondary-700 dark:text-white"
                    value={newOrder.medication}
                    onChange={(e) => setNewOrder({ ...newOrder, medication: e.target.value })}
                    placeholder={language === 'fr' ? 'Nom du médicament' : 'Medication name'}
                    required
                  />
                </div>

                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Quantité' : 'Quantity'}</label>
                  <input
                    type="number"
                    className="input dark:bg-secondary-700 dark:text-white"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) || 1 })}
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Adresse' : 'Address'}</label>
                  <textarea
                    className="input min-h-[60px] dark:bg-secondary-700 dark:text-white"
                    value={newOrder.address}
                    onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })}
                    placeholder={language === 'fr' ? 'Adresse de livraison' : 'Delivery address'}
                    required
                  />
                </div>

                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Notes' : 'Notes'}</label>
                  <textarea
                    className="input min-h-[60px] dark:bg-secondary-700 dark:text-white"
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                    placeholder={language === 'fr' ? 'Instructions supplémentaires...' : 'Additional instructions...'}
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    {language === 'fr' ? 'Créer' : 'Create'}
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 justify-center">
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
