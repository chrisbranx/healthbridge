import { useState, useEffect } from 'react';
import { chwApi } from '../services/api';
import { getCachedEscalations, cacheEscalations } from '../services/db';
import toast from 'react-hot-toast';
import { HiOutlineExclamationCircle, HiOutlinePlusCircle, HiOutlineRefresh } from 'react-icons/hi';

interface Escalation {
  id: string;
  patient: { name: string; phone: string; village: string };
  reason: string; severity: string; status: string;
  created_at: string;
}

export default function Escalations() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient_phone: '', reason: '', severity: 'high' });

  useEffect(() => { loadEscalations(); }, []);

  async function loadEscalations() {
    if (!navigator.onLine) {
      setEscalations(await getCachedEscalations());
      setLoading(false);
      return;
    }
    try {
      const { data } = await chwApi.escalations();
      setEscalations(data || []);
      await cacheEscalations(data || []);
    } catch {
      setEscalations(await getCachedEscalations());
    } finally {
      setLoading(false);
    }
  }

  async function createEscalation(e: React.FormEvent) {
    e.preventDefault();
    if (!navigator.onLine) {
      toast.error('Cannot escalate while offline');
      return;
    }
    try {
      await chwApi.createEscalation({
        patient_id: form.patient_phone,
        reason: form.reason,
        severity: form.severity,
      });
      toast.success('Escalation alert sent');
      setShowForm(false);
      setForm({ patient_phone: '', reason: '', severity: 'high' });
      loadEscalations();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  }

  const pendingEscalations = escalations.filter(e => e.status === 'pending');

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Escalations</h1>
          <p className="text-sm text-gray-500">{pendingEscalations.length} pending</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setShowForm(true)} className="btn-primary p-2">
            <HiOutlinePlusCircle className="h-5 w-5" />
          </button>
          <button onClick={loadEscalations} className="btn-secondary p-2">
            <HiOutlineRefresh className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={createEscalation} className="card space-y-3">
          <h2 className="font-semibold">New Escalation</h2>
          <div>
            <label className="label">Patient Phone</label>
            <input type="tel" className="input" value={form.patient_phone}
              onChange={(e) => setForm({ ...form, patient_phone: e.target.value })} required />
          </div>
          <div>
            <label className="label">Severity</label>
            <select className="input" value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="label">Reason</label>
            <textarea className="input min-h-[100px]" value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="btn-primary flex-1">Send Alert</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      )}

      {pendingEscalations.length > 0 && (
        <div className="card bg-red-50 border-red-100">
          <p className="text-sm text-red-700 font-medium">
            {pendingEscalations.length} escalation(s) awaiting clinic response
          </p>
        </div>
      )}

      {escalations.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <HiOutlineExclamationCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No escalations</p>
        </div>
      ) : (
        <div className="space-y-2">
          {escalations.map((e) => (
            <div key={e.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`badge ${
                      e.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      e.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{e.severity}</span>
                    <span className={`badge ${
                      e.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>{e.status}</span>
                  </div>
                  <p className="text-sm mb-1">{e.reason}</p>
                  <p className="text-xs text-gray-400">
                    {e.patient?.name} | {e.patient?.phone} | {new Date(e.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
