import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import { HiOutlineClock, HiOutlineClipboardCheck, HiOutlineUserGroup } from 'react-icons/hi';

interface TimelineEvent {
  id: string;
  type: 'consultation' | 'prescription' | 'visit' | 'adherence' | 'appointment';
  title: string;
  description: string;
  date: string;
  meta?: Record<string, any>;
}

export default function PatientTimeline() {
  const { language } = useLanguage();
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  async function loadData() {
    try {
      const [patientRes, consultationsRes, prescriptionsRes] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get(`/patients/${id}/consultations`),
        api.get(`/patients/${id}/prescriptions`),
      ]);
      setPatient(patientRes.data);

      const timeline: TimelineEvent[] = [];

      (consultationsRes.data || []).forEach((c: any) => {
        timeline.push({
          id: c.id,
          type: 'consultation',
          title: language === 'fr' ? 'Consultation' : 'Consultation',
          description: c.symptoms,
          date: c.created_at,
          meta: { status: c.status, diagnosis: c.diagnosis, triage: c.triage_level },
        });
      });

      (prescriptionsRes.data || []).forEach((p: any) => {
        timeline.push({
          id: p.id,
          type: 'prescription',
          title: language === 'fr' ? 'Prescription' : 'Prescription',
          description: `${p.medication_name} - ${p.dosage}, ${p.frequency}`,
          date: p.created_at,
          meta: { medication: p.medication_name, dosage: p.dosage },
        });
      });

      timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEvents(timeline);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoading(false);
    }
  }

  const typeStyles: Record<string, string> = {
    consultation: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10',
    prescription: 'border-l-green-500 bg-green-50 dark:bg-green-900/10',
    visit: 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/10',
    adherence: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
    appointment: 'border-l-primary-500 bg-primary-50 dark:bg-primary-900/10',
  };

  const typeIcons: Record<string, any> = {
    consultation: HiOutlineClipboardCheck,
    prescription: HiOutlineClock,
    visit: HiOutlineUserGroup,
  };

  if (loading) return <div className="p-8 text-center text-secondary-400">{language === 'fr' ? 'Chargement...' : 'Loading...'}</div>;
  if (!patient) return <div className="p-8 text-center text-secondary-400">{language === 'fr' ? 'Patient non trouvé' : 'Patient not found'}</div>;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">{patient.name}</h1>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          {patient.phone} | {patient.village}, {patient.region}
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: language === 'fr' ? 'Consultations' : 'Consultations', value: events.filter(e => e.type === 'consultation').length, color: 'text-blue-500' },
          { label: language === 'fr' ? 'Prescriptions' : 'Prescriptions', value: events.filter(e => e.type === 'prescription').length, color: 'text-green-500' },
          { label: language === 'fr' ? 'Âge' : 'Age', value: patient.age || '-', color: 'text-primary-500' },
        ].map((stat, i) => (
          <div key={i} className="card text-center dark:bg-secondary-800 dark:border-secondary-700">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        {events.length === 0 ? (
          <div className="text-center py-12 text-secondary-400">
            <HiOutlineUserGroup className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{language === 'fr' ? 'Aucun événement dans l\'historique' : 'No events in timeline'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, i) => {
              const Icon = typeIcons[event.type] || HiOutlineClipboardCheck;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`pl-4 border-l-4 ${typeStyles[event.type] || 'border-l-secondary-300'} p-3 rounded-r-lg`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-secondary-500" />
                      <span className="font-medium text-sm dark:text-white">{event.title}</span>
                      {event.meta?.status && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          event.meta.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          event.meta.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-secondary-100 text-secondary-600'
                        }`}>{event.meta.status}</span>
                      )}
                    </div>
                    <span className="text-xs text-secondary-400">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">{event.description}</p>
                  {event.meta?.diagnosis && <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">Diagnosis: {event.meta.diagnosis}</p>}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
