import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCube, HiOutlineExclamation, HiOutlinePlus, HiOutlineSearch, HiOutlineCamera } from 'react-icons/hi';
import BarcodeScanner from '../../components/BarcodeScanner';

interface InventoryItem {
  id: string;
  medication_name: string;
  category: string;
  quantity: number;
  unit: string;
  expiry_date: string;
  reorder_level: number;
}

export default function Inventory() {
  const { language } = useLanguage();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [filterLow, setFilterLow] = useState(false);
  const [newItem, setNewItem] = useState({ medication_name: '', category: 'medication', quantity: 0, unit: 'tablets', reorder_level: 10 });

  useEffect(() => { loadItems(); }, [filterLow]);

  async function loadItems() {
    try {
      const { data } = await api.get('/inventory/items', { params: { low_stock: filterLow || undefined } });
      setItems(data || []);
    } catch (err) { console.error(err); }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/inventory/items', newItem);
      toast.success(language === 'fr' ? 'Article ajouté' : 'Item added');
      setShowAdd(false);
      loadItems();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
  }

  const filtered = items.filter(i => i.medication_name.toLowerCase().includes(search.toLowerCase()));
  const lowStock = items.filter(i => i.quantity <= i.reorder_level);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">
            {language === 'fr' ? 'Gestion des Stocks' : 'Inventory Management'}
          </h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            {language === 'fr' ? 'Suivre les médicaments et fournitures' : 'Track medications and supplies'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setShowScanner(true)} className="btn-secondary"><HiOutlineCamera className="h-5 w-5" /></button>
          <button onClick={() => setShowAdd(true)} className="btn-primary"><HiOutlinePlus className="h-5 w-5 mr-1" /> {language === 'fr' ? 'Ajouter' : 'Add'}</button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card dark:bg-secondary-800 dark:border-secondary-700">
          <p className="text-2xl font-bold text-primary-600">{items.length}</p>
          <p className="text-xs text-secondary-500">{language === 'fr' ? 'Articles total' : 'Total Items'}</p>
        </div>
        <div className="card dark:bg-secondary-800 dark:border-secondary-700">
          <p className="text-2xl font-bold text-red-500">{lowStock.length}</p>
          <p className="text-xs text-secondary-500">{language === 'fr' ? 'Stock faible' : 'Low Stock'}</p>
        </div>
        <div className="card dark:bg-secondary-800 dark:border-secondary-700">
          <p className="text-2xl font-bold text-green-500">{items.filter(i => i.category === 'medication').length}</p>
          <p className="text-xs text-secondary-500">{language === 'fr' ? 'Médicaments' : 'Medications'}</p>
        </div>
        <div className="card dark:bg-secondary-800 dark:border-secondary-700">
          <p className="text-2xl font-bold text-yellow-500">{items.filter(i => i.category === 'supply').length}</p>
          <p className="text-xs text-secondary-500">{language === 'fr' ? 'Fournitures' : 'Supplies'}</p>
        </div>
      </div>

      <div className="card dark:bg-secondary-800 dark:border-secondary-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              className="input pl-10 dark:bg-secondary-700 dark:text-white dark:border-secondary-600"
              placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <label className="flex items-center space-x-2 text-sm text-secondary-600 dark:text-secondary-300 cursor-pointer">
            <input type="checkbox" checked={filterLow} onChange={() => setFilterLow(!filterLow)} className="rounded border-gray-300 text-primary-600" />
            <span>{language === 'fr' ? 'Stock faible' : 'Low stock'}</span>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-secondary-700 text-secondary-500 dark:text-secondary-400">
                <th className="text-left py-2 font-medium">{language === 'fr' ? 'Article' : 'Item'}</th>
                <th className="text-left py-2 font-medium">{language === 'fr' ? 'Catégorie' : 'Category'}</th>
                <th className="text-right py-2 font-medium">{language === 'fr' ? 'Quantité' : 'Qty'}</th>
                <th className="text-right py-2 font-medium">{language === 'fr' ? 'Seuil' : 'Reorder'}</th>
                <th className="text-right py-2 font-medium">{language === 'fr' ? 'Statut' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isLow = item.quantity <= item.reorder_level;
                return (
                  <tr key={item.id} className="border-b dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/30">
                    <td className="py-2.5 dark:text-white">{item.medication_name}</td>
                    <td className="py-2.5 text-secondary-500 dark:text-secondary-400">{item.category}</td>
                    <td className="py-2.5 text-right dark:text-white">{item.quantity} {item.unit}</td>
                    <td className="py-2.5 text-right text-secondary-400">{item.reorder_level}</td>
                    <td className="py-2.5 text-right">
                      {isLow ? (
                        <span className="inline-flex items-center text-red-600 dark:text-red-400"><HiOutlineExclamation className="h-4 w-4 mr-1" />{language === 'fr' ? 'Rupture' : 'Low'}</span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400">{language === 'fr' ? 'OK' : 'OK'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-secondary-400">{language === 'fr' ? 'Aucun article trouvé' : 'No items found'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAdd(false)}>
          <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4 dark:text-white">{language === 'fr' ? 'Ajouter un article' : 'Add Item'}</h3>
            <form onSubmit={addItem} className="space-y-3">
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Nom' : 'Name'}</label>
                <input className="input dark:bg-secondary-700 dark:text-white" value={newItem.medication_name} onChange={(e) => setNewItem({ ...newItem, medication_name: e.target.value })} required />
              </div>
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Catégorie' : 'Category'}</label>
                <select className="input dark:bg-secondary-700 dark:text-white" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
                  <option value="medication">{language === 'fr' ? 'Médicament' : 'Medication'}</option>
                  <option value="supply">{language === 'fr' ? 'Fourniture' : 'Supply'}</option>
                  <option value="equipment">{language === 'fr' ? 'Équipement' : 'Equipment'}</option>
                  <option value="vaccine">{language === 'fr' ? 'Vaccin' : 'Vaccine'}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Quantité' : 'Quantity'}</label>
                  <input type="number" className="input dark:bg-secondary-700 dark:text-white" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })} min={0} />
                </div>
                <div>
                  <label className="label dark:text-secondary-200">{language === 'fr' ? 'Unité' : 'Unit'}</label>
                  <input className="input dark:bg-secondary-700 dark:text-white" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label dark:text-secondary-200">{language === 'fr' ? 'Seuil de réapprovisionnement' : 'Reorder level'}</label>
                <input type="number" className="input dark:bg-secondary-700 dark:text-white" value={newItem.reorder_level} onChange={(e) => setNewItem({ ...newItem, reorder_level: parseInt(e.target.value) || 0 })} min={0} />
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center">{language === 'fr' ? 'Ajouter' : 'Add'}</button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1 justify-center">{language === 'fr' ? 'Annuler' : 'Cancel'}</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
      {showScanner && (
        <BarcodeScanner
          onScan={(code) => {
            setNewItem({ ...newItem, medication_name: code });
            setShowScanner(false);
            setShowAdd(true);
            toast.success(`Scanned: ${code}`);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
