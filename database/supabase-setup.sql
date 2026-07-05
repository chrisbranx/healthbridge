-- ===================================================================
-- HealthBridge Supabase Setup
-- Paste this entire file into Supabase SQL Editor and run it.
-- SQL Editor: https://supabase.com/dashboard/project/<YOUR_PROJECT>/sql/new
-- ===================================================================

-- 1. Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create ENUM types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'chw', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE consultation_channel AS ENUM ('ussd', 'web');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE consultation_status AS ENUM ('pending', 'active', 'resolved', 'escalated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE escalation_status AS ENUM ('pending', 'acknowledged', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE language_preference AS ENUM ('en', 'fr');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role user_role NOT NULL DEFAULT 'patient',
  name TEXT NOT NULL,
  language language_preference NOT NULL DEFAULT 'en',
  region TEXT,
  village TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_region ON users(region);

CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  region TEXT NOT NULL,
  district TEXT,
  phone TEXT,
  email TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinics_region ON clinics(region);

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  village TEXT,
  region TEXT,
  nearest_clinic_id UUID REFERENCES clinics(id),
  chronic_conditions TEXT[],
  allergies TEXT[],
  blood_type TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_user ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_region ON patients(region);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id),
  channel consultation_channel NOT NULL,
  symptoms TEXT NOT NULL,
  triage_level alert_severity DEFAULT 'low',
  diagnosis TEXT,
  prescription TEXT,
  doctor_notes TEXT,
  status consultation_status NOT NULL DEFAULT 'pending',
  requires_follow_up BOOLEAN DEFAULT false,
  follow_up_instructions TEXT,
  responded_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_created ON consultations(created_at);

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES users(id),
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation ON prescriptions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);

CREATE TABLE IF NOT EXISTS medication_adherence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES users(id),
  taken_at TIMESTAMPTZ NOT NULL,
  was_taken BOOLEAN NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adherence_prescription ON medication_adherence(prescription_id);
CREATE INDEX IF NOT EXISTS idx_adherence_patient ON medication_adherence(patient_id);
CREATE INDEX IF NOT EXISTS idx_adherence_date ON medication_adherence(taken_at);

CREATE TABLE IF NOT EXISTS chw_patient_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chw_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(chw_id, patient_id)
);

CREATE INDEX IF NOT EXISTS idx_chw_assignments_chw ON chw_patient_assignments(chw_id);
CREATE INDEX IF NOT EXISTS idx_chw_assignments_patient ON chw_patient_assignments(patient_id);

CREATE TABLE IF NOT EXISTS chw_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chw_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES consultations(id),
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('medication_check', 'follow_up', 'escalation', 'patient_visit', 'health_education', 'other')),
  status task_status NOT NULL DEFAULT 'pending',
  priority alert_severity DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chw_tasks_chw ON chw_tasks(chw_id);
CREATE INDEX IF NOT EXISTS idx_chw_tasks_status ON chw_tasks(status);
CREATE INDEX IF NOT EXISTS idx_chw_tasks_patient ON chw_tasks(patient_id);

CREATE TABLE IF NOT EXISTS escalation_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chw_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  consultation_id UUID REFERENCES consultations(id),
  reason TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'high',
  status escalation_status NOT NULL DEFAULT 'pending',
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escalations_status ON escalation_alerts(status);
CREATE INDEX IF NOT EXISTS idx_escalations_severity ON escalation_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_escalations_clinic ON escalation_alerts(clinic_id);

CREATE TABLE IF NOT EXISTS ussd_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  phone_number TEXT NOT NULL,
  language language_preference DEFAULT 'en',
  current_step TEXT NOT NULL DEFAULT 'menu',
  patient_id UUID REFERENCES patients(id),
  symptoms TEXT,
  consultation_id UUID REFERENCES consultations(id),
  metadata JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ussd_sessions_session ON ussd_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_ussd_sessions_phone ON ussd_sessions(phone_number);

CREATE TABLE IF NOT EXISTS sms_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('consultation_ack', 'prescription', 'follow_up', 'escalation', 'reminder', 'other')),
  related_entity_type TEXT,
  related_entity_id UUID,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_log_phone ON sms_log(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_log_type ON sms_log(message_type);

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(created_at);

-- 4. Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chw_tasks_updated_at
  BEFORE UPDATE ON chw_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Additional feature tables (scheduling, inventory, alerts, etc.)
CREATE TABLE IF NOT EXISTS video_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES users(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  consultation_id UUID REFERENCES consultations(id),
  room_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'missed')),
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointment_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_patients INT DEFAULT 10,
  booked_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES users(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  slot_id UUID REFERENCES appointment_slots(id),
  reason TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'rescheduled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medication_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT,
  reminder_time TIME NOT NULL,
  channel TEXT DEFAULT 'sms' CHECK (channel IN ('sms', 'whatsapp')),
  phone_number TEXT,
  created_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  next_reminder_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_number TEXT NOT NULL,
  message_body TEXT,
  bot_response TEXT,
  message_id TEXT,
  direction TEXT DEFAULT 'inbound',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id),
  chw_id UUID REFERENCES users(id),
  medication_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('medication', 'supply', 'equipment', 'vaccine')),
  quantity INT NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  expiry_date DATE,
  reorder_level INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  previous_qty INT NOT NULL,
  new_qty INT NOT NULL,
  delta INT NOT NULL,
  reason TEXT,
  adjusted_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'high', 'critical')),
  disease TEXT,
  regions TEXT[] NOT NULL,
  instructions TEXT,
  source TEXT DEFAULT 'Ministry of Health',
  created_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS insurance_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  provider TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  coverage_type TEXT NOT NULL CHECK (coverage_type IN ('basic', 'standard', 'premium', 'mutuelle')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS insurance_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id),
  provider TEXT,
  amount DECIMAL(12,2),
  description TEXT,
  status TEXT DEFAULT 'submitted',
  submitted_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chw_adherence_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chw_id UUID NOT NULL REFERENCES users(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  status TEXT NOT NULL CHECK (status IN ('visited', 'medication_taken', 'missed', 'refused')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'info',
  related_entity_type TEXT,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- 6. Role requests table (Doctor/CHW approval workflow)
CREATE TABLE IF NOT EXISTS role_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  email TEXT,
  language language_preference NOT NULL DEFAULT 'en',
  region TEXT,
  qualifications TEXT,
  license_number TEXT,
  experience_years INT,
  specialization TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_requests_status ON role_requests(status);

-- 7. Seed clinics
INSERT INTO clinics (name, region, district, phone) VALUES
  ('Yaounde Central Hospital', 'Centre', 'Yaounde', '+237690000001'),
  ('Douala General Hospital', 'Littoral', 'Douala', '+237690000002'),
  ('Garoua Regional Hospital', 'North', 'Garoua', '+237690000003'),
  ('Maroua District Hospital', 'Far North', 'Maroua', '+237690000004'),
  ('Ngaoundere Protestant Hospital', 'Adamawa', 'Ngaoundere', '+237690000005')
ON CONFLICT DO NOTHING;

-- 8. Seed default admin (password: Admin@2026Secure!)
INSERT INTO users (phone, password_hash, name, role, language, region, is_active, email)
SELECT '+237999999999', '$2a$12$KpqMFixuA1oNGPmV6FxkyO1LlnfTKw5uOPq/D94ZePiAyNubCTS3m', 'System Administrator', 'admin', 'en', 'Centre', true, 'admin@healthbridge.cm'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone = '+237999999999');
