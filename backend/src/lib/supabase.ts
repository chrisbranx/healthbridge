import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

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
