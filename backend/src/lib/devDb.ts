import * as fs from 'fs';
import * as path from 'path';

const DB_PATH = path.join(__dirname, '../../data.json');

interface DevDatabase {
  users: any[];
  patients: any[];
  consultations: any[];
  prescriptions: any[];
  medication_adherence: any[];
  chw_patient_assignments: any[];
  chw_tasks: any[];
  escalation_alerts: any[];
  ussd_sessions: any[];
  sms_log: any[];
  clinics: any[];
  analytics_events: any[];
  notifications: any[];
  disease_cases: any[];
  epidemic_alerts: any[];
  health_alerts: any[];
  inventory_items: any[];
  inventory_log: any[];
  appointment_slots: any[];
  appointments: any[];
  medication_reminders: any[];
  video_rooms: any[];
  whatsapp_messages: any[];
  insurance_enrollments: any[];
  insurance_claims: any[];
  chw_adherence_logs: any[];
  family_members: any[];
  forum_questions: any[];
  forum_answers: any[];
  lab_results: any[];
  blood_donors: any[];
  blood_requests: any[];
  delivery_orders: any[];
  voice_triage_sessions: any[];
  sos_alerts: any[];
  role_requests: any[];
}

function getDefaults(): DevDatabase {
  return {
    users: [],
    patients: [],
    consultations: [],
    prescriptions: [],
    medication_adherence: [],
    chw_patient_assignments: [],
    chw_tasks: [],
    escalation_alerts: [],
    ussd_sessions: [],
    sms_log: [],
    clinics: [
      { id: 'clinic-1', name: 'Yaounde Central Hospital', region: 'Centre', district: 'Yaounde', phone: '+237690000001', is_active: true },
      { id: 'clinic-2', name: 'Douala General Hospital', region: 'Littoral', district: 'Douala', phone: '+237690000002', is_active: true },
      { id: 'clinic-3', name: 'Garoua Regional Hospital', region: 'North', district: 'Garoua', phone: '+237690000003', is_active: true },
      { id: 'clinic-4', name: 'Maroua District Hospital', region: 'Far North', district: 'Maroua', phone: '+237690000004', is_active: true },
      { id: 'clinic-5', name: 'Ngaoundere Protestant Hospital', region: 'Adamawa', district: 'Ngaoundere', phone: '+237690000005', is_active: true },
    ],
    analytics_events: [],
    notifications: [],
    disease_cases: [],
    epidemic_alerts: [],
    health_alerts: [],
    inventory_items: [],
    inventory_log: [],
    appointment_slots: [],
    appointments: [],
    medication_reminders: [],
    video_rooms: [],
    whatsapp_messages: [],
    insurance_enrollments: [],
    insurance_claims: [],
    chw_adherence_logs: [],
    family_members: [],
    forum_questions: [],
    forum_answers: [],
    lab_results: [],
    blood_donors: [],
    blood_requests: [],
    delivery_orders: [],
    voice_triage_sessions: [],
    sos_alerts: [],
    role_requests: [],
  };
}

function getData(): DevDatabase {
  try {
    if (fs.existsSync(DB_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      const defaults = getDefaults();
      for (const key of Object.keys(defaults) as (keyof DevDatabase)[]) {
        if (!(key in parsed)) {
          (parsed as any)[key] = defaults[key];
        }
      }
      return parsed;
    }
  } catch {}
  return getDefaults();
}

function saveData(data: DevDatabase) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch {}
}

export const devDb = {
  query: (table: keyof DevDatabase) => {
    const data = getData();
    return {
      data: data[table],
      async insert(item: any) {
        const record = { id: item.id || crypto.randomUUID(), ...item, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        const d = getData();
        (d[table] as any[]).push(record);
        saveData(d);
        return record;
      },
    };
  },

  get: (table: keyof DevDatabase) => getData()[table],

  findById: (table: keyof DevDatabase, id: string) => {
    return (getData()[table] as any[]).find((r: any) => r.id === id) || null;
  },

  findWhere: (table: keyof DevDatabase, predicate: (item: any) => boolean) => {
    return (getData()[table] as any[]).filter(predicate);
  },

  insert: (table: keyof DevDatabase, item: any) => {
    const id = item.id || crypto.randomUUID();
    const record = { ...item, id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const data = getData();
    (data[table] as any[]).push(record);
    saveData(data);
    return record;
  },

  update: (table: keyof DevDatabase, id: string, updates: any) => {
    const data = getData();
    const arr = data[table] as any[];
    const idx = arr.findIndex((r: any) => r.id === id);
    if (idx === -1) return null;
    arr[idx] = { ...arr[idx], ...updates, updated_at: new Date().toISOString() };
    saveData(data);
    return arr[idx];
  },

  delete: (table: keyof DevDatabase, id: string) => {
    const data = getData();
    const arr = data[table] as any[];
    const idx = arr.findIndex((r: any) => r.id === id);
    if (idx === -1) return false;
    arr.splice(idx, 1);
    saveData(data);
    return true;
  },

  count: (table: keyof DevDatabase) => (getData()[table] as any[]).length,
};
