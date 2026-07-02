import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

function isSupabaseConfigured() {
  return supabaseUrl.length > 10 && supabaseServiceKey.length > 10
    && !supabaseUrl.includes('your-project')
    && !supabaseServiceKey.includes('your-');
}

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export const supabaseAnon = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type Database = {
  public: {
    Tables: {
      users: {};
      patients: {};
      consultations: {};
      prescriptions: {};
      medication_adherence: {};
      chw_patient_assignments: {};
      chw_tasks: {};
      escalation_alerts: {};
      ussd_sessions: {};
      sms_log: {};
      clinics: {};
      analytics_events: {};
      notifications: {};
    };
  };
};
