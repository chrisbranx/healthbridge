import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { devDb } from '../lib/devDb';

export const seedRouter = Router();

const ADMIN_PHONE = '+237999999999';
const ADMIN_PASSWORD = 'Admin@2026Secure!';

seedRouter.post('/all', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = devDb.findWhere('users' as any, (u: any) => u.phone === ADMIN_PHONE);
    const isSeeded = existing.length > 0;

    const existingRequests = devDb.get('role_requests' as any) as any[];
    const hasRequests = existingRequests.length > 0;

    if (isSeeded && hasRequests) {
      return res.json({ message: 'Already seeded', admin: { phone: ADMIN_PHONE } });
    }

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const admin = devDb.insert('users' as any, {
      phone: ADMIN_PHONE,
      password_hash: hash,
      name: 'System Administrator',
      role: 'admin',
      language: 'en',
      region: 'Centre',
      phone_verified: true,
      is_active: true,
      email: 'admin@healthbridge.cm',
    });

    const doctorHash = await bcrypt.hash('Doctor@123', 12);
    const chwHash = await bcrypt.hash('Chw@123', 12);
    const patientHash = await bcrypt.hash('Patient@123', 12);

    const doctors = [
      devDb.insert('users' as any, { phone: '+237611111111', password_hash: doctorHash, name: 'Dr. Marie Claire', role: 'doctor', language: 'fr', region: 'Centre', phone_verified: true, is_active: true, email: 'marie.claire@healthbridge.cm' }),
      devDb.insert('users' as any, { phone: '+237622222222', password_hash: doctorHash, name: 'Dr. Paul Nkwi', role: 'doctor', language: 'en', region: 'Littoral', phone_verified: true, is_active: true, email: 'paul.nkwi@healthbridge.cm' }),
      devDb.insert('users' as any, { phone: '+237633333333', password_hash: doctorHash, name: 'Dr. Amina Bello', role: 'doctor', language: 'fr', region: 'Far North', phone_verified: true, is_active: true, email: 'amina.bello@healthbridge.cm' }),
      devDb.insert('users' as any, { phone: '+237644444444', password_hash: doctorHash, name: 'Dr. Jean-Pierre Fotso', role: 'doctor', language: 'fr', region: 'West', phone_verified: true, is_active: true, email: 'jp.fotso@healthbridge.cm' }),
    ];

    const chws = [
      devDb.insert('users' as any, { phone: '+237655555555', password_hash: chwHash, name: 'Christine Mbah', role: 'chw', language: 'en', region: 'Centre', phone_verified: true, is_active: true }),
      devDb.insert('users' as any, { phone: '+237666666666', password_hash: chwHash, name: 'Samuel Tchinda', role: 'chw', language: 'fr', region: 'West', phone_verified: true, is_active: true }),
      devDb.insert('users' as any, { phone: '+237677777777', password_hash: chwHash, name: 'Esther Ngo Dinga', role: 'chw', language: 'fr', region: 'Littoral', phone_verified: true, is_active: true }),
      devDb.insert('users' as any, { phone: '+237688888888', password_hash: chwHash, name: 'Peter Fonyuy', role: 'chw', language: 'en', region: 'Northwest', phone_verified: true, is_active: true }),
    ];

    const patients = [
      devDb.insert('users' as any, { phone: '+237700000001', password_hash: patientHash, name: 'Alice Ngannou', role: 'patient', language: 'en', region: 'Centre', phone_verified: true, is_active: true }),
      devDb.insert('users' as any, { phone: '+237700000002', password_hash: patientHash, name: 'Benoît Mbida', role: 'patient', language: 'fr', region: 'Centre', phone_verified: true, is_active: true }),
      devDb.insert('users' as any, { phone: '+237700000003', password_hash: patientHash, name: 'Clarisse Eyanga', role: 'patient', language: 'fr', region: 'Littoral', phone_verified: true, is_active: true }),
      devDb.insert('users' as any, { phone: '+237700000004', password_hash: patientHash, name: 'David Taku', role: 'patient', language: 'en', region: 'Northwest', phone_verified: true, is_active: true }),
      devDb.insert('users' as any, { phone: '+237700000005', password_hash: patientHash, name: 'Esther Bah', role: 'patient', language: 'en', region: 'West', phone_verified: true, is_active: true }),
    ];

    patients.forEach((p: any) => {
      devDb.insert('patients' as any, { user_id: p.id, name: p.name, phone: p.phone, region: p.region, blood_type: 'O+', chronic_conditions: 'None' });
    });

    devDb.insert('health_alerts' as any, { title: 'Cholera Outbreak Alert', description: 'Confirmed cholera cases in Yaoundé and surrounding areas.', severity: 'high', disease: 'Cholera', regions: ['Centre', 'Littoral'], instructions: 'Wash hands frequently. Drink boiled water. Report to nearest clinic if symptoms appear.', source: 'Ministry of Health', status: 'active' });
    devDb.insert('health_alerts' as any, { title: 'COVID-19 New Variant', description: 'New Omicron subvariant detected in Douala. Vaccination strongly advised.', severity: 'warning', disease: 'COVID-19', regions: ['Littoral', 'Centre', 'West'], instructions: 'Get vaccinated. Wear masks in crowded places. Test if symptomatic.', source: 'WHO', status: 'active' });
    devDb.insert('health_alerts' as any, { title: 'Malaria Peak Season', description: 'High malaria transmission expected during rainy season.', severity: 'info', disease: 'Malaria', regions: ['Far North', 'North', 'Adamawa', 'East'], instructions: 'Sleep under insecticide-treated nets. Clear stagnant water. Seek treatment for fever within 24h.', source: 'National Malaria Control Program', status: 'active' });
    devDb.insert('health_alerts' as any, { title: 'Measles Vaccination Campaign', description: 'Nationwide measles vaccination drive for children under 5.', severity: 'info', disease: 'Measles', regions: ['Centre', 'Littoral', 'North', 'South', 'Southwest', 'Northwest', 'West', 'Adamawa', 'East', 'Far North'], instructions: 'Take children aged 6-59 months to nearest health center. Free vaccination.', source: 'Ministry of Health', status: 'active' });

    if (!hasRequests) {
      const requestHash = await bcrypt.hash('Doctor@123', 12);
      devDb.insert('role_requests' as any, {
        phone: '+237699999991', password_hash: requestHash, name: 'Dr. Kameni Blanche',
        role: 'doctor', email: 'kameni.blanche@email.com', language: 'fr', region: 'Littoral',
        qualifications: 'MD, University of Yaoundé I', license_number: 'CM-MD-2024-0842',
        experience_years: 8, specialization: 'General Medicine', status: 'pending',
      });
      devDb.insert('role_requests' as any, {
        phone: '+237699999992', password_hash: requestHash, name: 'Emmanuel Nfor',
        role: 'chw', email: 'emmanuel.nfor@email.com', language: 'en', region: 'Northwest',
        qualifications: 'CHW Certificate, Bamenda School of Health',
        license_number: 'CM-CHW-2025-0311', experience_years: 3, status: 'pending',
      });
      devDb.insert('role_requests' as any, {
        phone: '+237699999993', password_hash: requestHash, name: 'Dr. Fatima Aboubakar',
        role: 'doctor', email: 'fatima.aboubakar@email.com', language: 'fr', region: 'Far North',
        qualifications: 'MD, PhD Public Health', license_number: 'CM-MD-2023-0561',
        experience_years: 12, specialization: 'Pediatrics', status: 'pending',
      });
    }

    devDb.insert('inventory_items' as any, { clinic_id: null, medication_name: 'Artemether-Lumefantrine (Coartem)', category: 'medication', quantity: 240, unit: 'tablets', reorder_level: 50 });

    res.status(201).json({
      message: 'Seeded successfully',
      admin: { phone: ADMIN_PHONE, password: ADMIN_PASSWORD },
      sample_users: {
        doctors: [{ phone: '+237611111111', password: 'Doctor@123', name: 'Dr. Marie Claire' }, { phone: '+237622222222', password: 'Doctor@123', name: 'Dr. Paul Nkwi' }, { phone: '+237633333333', password: 'Doctor@123', name: 'Dr. Amina Bello' }, { phone: '+237644444444', password: 'Doctor@123', name: 'Dr. Jean-Pierre Fotso' }],
        chws: [{ phone: '+237655555555', password: 'Chw@123', name: 'Christine Mbah' }, { phone: '+237666666666', password: 'Chw@123', name: 'Samuel Tchinda' }, { phone: '+237677777777', password: 'Chw@123', name: 'Esther Ngo Dinga' }, { phone: '+237688888888', password: 'Chw@123', name: 'Peter Fonyuy' }],
        patients: [{ phone: '+237700000001', password: 'Patient@123', name: 'Alice Ngannou' }, { phone: '+237700000002', password: 'Patient@123', name: 'Benoît Mbida' }, { phone: '+237700000003', password: 'Patient@123', name: 'Clarisse Eyanga' }, { phone: '+237700000004', password: 'Patient@123', name: 'David Taku' }, { phone: '+237700000005', password: 'Patient@123', name: 'Esther Bah' }],
      },
    });
  } catch (error) {
    next(error);
  }
});
