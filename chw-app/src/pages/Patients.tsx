import { useState, useEffect } from 'react';
import { chwApi } from '../services/api';
import { getCachedPatients, cachePatients, savePendingAdherence, getPendingAdherenceCount } from '../services/db';
import toast from 'react-hot-toast';
import { HiOutlineUserGroup, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineRefresh } from 'react-icons/hi';

interface Patient {
  id: string; name: string; phone: string; village: string; region: string;
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [taken, setTaken] = useState(true);

  useEffect(() => { loadPatients(); }, []);

  async function loadPatients() {
    if (!navigator.onLine) {
      setPatients(await getCachedPatients());
      setLoading(false);
      return;
    }
    try {
      const { data } = await chwApi.patients();
      setPatients(data || []);
      await cachePatients(data || []);
    } catch {
      setPatients(await getCachedPatients());
    } finally {
      setLoading(false);
    }
  }

  async function logAdherence() {
    if (!selected) return;
    const data = { patient_id: selected.id, was_taken: taken, notes: '' };

    if (!navigator.onLine) {
      await savePendingAdherence(data);
      toast.success('Saved offline — will sync when online');
      setSelected(null);
      return;
    }

    try {
      await chwApi.logAdherence(data);
      toast.success('Adherence logged');
      setSelected(null);
    } catch {
      await savePendingAdherence(data);
      toast.success('Saved offline — will sync when online');
      setSelected(null);
    }
  }

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">My Patients</h1>
          <p className="text-sm text-gray-500">{patients.length} assigned</p>
        </div>
        <button onClick={loadPatients} className="btn-secondary p-2">
          <HiOutlineRefresh className="h-5 w-5" />
        </button>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <HiOutlineUserGroup className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No patients assigned</p>
          <p className="text-sm">Patients appear here when doctors order follow-up</p>
        </div>
      ) : (
        <div className="space-y-2">
          {patients.map((p) => (
            <div key={p.id} className="card flex items-center space-x-3" onClick={() => setSelected(p)}>
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-700 font-semibold">{p.name?.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{p.name}</h3>
                <p className="text-sm text-gray-500">{p.village || p.region || p.phone}</p>
              </div>
              <span className="text-primary-600 text-sm font-medium">Log &rarr;</span>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-t-2xl w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-1">Log Adherence</h2>
            <p className="text-sm text-gray-500 mb-4">{selected.name}</p>

            <div className="flex space-x-3 mb-4">
              <button
                onClick={() => setTaken(true)}
                className={`flex-1 py-3 rounded-xl font-medium text-center transition-all ${taken ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'bg-gray-100 text-gray-500'}`}
              >
                <HiOutlineCheckCircle className="h-6 w-6 mx-auto mb-1" />
                Taken
              </button>
              <button
                onClick={() => setTaken(false)}
                className={`flex-1 py-3 rounded-xl font-medium text-center transition-all ${!taken ? 'bg-red-100 text-red-700 border-2 border-red-500' : 'bg-gray-100 text-gray-500'}`}
              >
                <HiOutlineXCircle className="h-6 w-6 mx-auto mb-1" />
                Missed
              </button>
            </div>

            <div className="flex space-x-3">
              <button onClick={logAdherence} className="btn-primary flex-1">Confirm</button>
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
