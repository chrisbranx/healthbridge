import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Layout from './components/Layout';
import AIAssistant from './components/AIAssistant';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/patient/Dashboard';
import PatientConsultation from './pages/patient/Consultation';
import PatientHistory from './pages/patient/History';
import PatientProfile from './pages/patient/Profile';
import HelpSupport from './pages/HelpSupport';
import SettingsPage from './pages/Settings';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorConsultations from './pages/doctor/Consultations';
import DoctorPatients from './pages/doctor/Patients';
import DoctorAnalytics from './pages/doctor/Analytics';
import DoctorScheduling from './pages/doctor/Scheduling';
import DoctorPatientTimeline from './pages/doctor/PatientTimeline';
import DoctorInventory from './pages/doctor/Inventory';
import DoctorHealthAlerts from './pages/doctor/HealthAlerts';
import DoctorMedicationReminders from './pages/doctor/MedicationReminders';
import DoctorChwPerformance from './pages/doctor/ChwPerformance';
import DoctorVideoRooms from './pages/doctor/VideoRooms';
import DoctorDelivery from './pages/doctor/Delivery';
import DoctorEpidemicMap from './pages/doctor/EpidemicMap';
import CHWDashboard from './pages/chw/Dashboard';
import CHWPatients from './pages/chw/Patients';
import CHWTasks from './pages/chw/Tasks';
import CHWEscalations from './pages/chw/Escalations';
import CHWRoutePlanner from './pages/chw/RoutePlanner';
import EmergencySOS from './pages/EmergencySOS';
import Forum from './pages/patient/Forum';
import ForumThread from './pages/patient/ForumThread';
import Family from './pages/patient/Family';
import LabResults from './pages/patient/LabResults';
import BloodDonor from './pages/BloodDonor';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminClinics from './pages/admin/Clinics';
import AdminAnalytics from './pages/admin/Analytics';
import AdminActivityLogs from './pages/admin/ActivityLogs';
import AdminSystemSettings from './pages/admin/SystemSettings';
import Landing from './pages/Landing';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
      {children}
    </motion.div>
  );
}

function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 rounded-full border-4 border-primary-200 border-t-primary-600"
        />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}

function AppRoutes() {
  const { user, token } = useAuth();
  const hbToken = token || localStorage.getItem('hb_token');

  return (
    <SocketProvider token={hbToken}>
      <Routes>
          <Route path="/" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <AnimatedPage><Landing /></AnimatedPage>} />
        <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <AnimatedPage><Login /></AnimatedPage>} />
        <Route path="/register" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <AnimatedPage><Register /></AnimatedPage>} />

        <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><Layout><PatientDashboard /></Layout></ProtectedRoute>} />
        <Route path="/patient/consultation" element={<ProtectedRoute allowedRoles={['patient']}><Layout><PatientConsultation /></Layout></ProtectedRoute>} />
        <Route path="/patient/history" element={<ProtectedRoute allowedRoles={['patient']}><Layout><PatientHistory /></Layout></ProtectedRoute>} />
        <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={['patient']}><Layout><PatientProfile /></Layout></ProtectedRoute>} />
        <Route path="/patient/forum" element={<ProtectedRoute allowedRoles={['patient']}><Layout><Forum /></Layout></ProtectedRoute>} />
        <Route path="/patient/forum/:id" element={<ProtectedRoute allowedRoles={['patient']}><Layout><ForumThread /></Layout></ProtectedRoute>} />
        <Route path="/patient/family" element={<ProtectedRoute allowedRoles={['patient']}><Layout><Family /></Layout></ProtectedRoute>} />
        <Route path="/patient/lab-results" element={<ProtectedRoute allowedRoles={['patient']}><Layout><LabResults /></Layout></ProtectedRoute>} />
        <Route path="/patient/help" element={<ProtectedRoute allowedRoles={['patient']}><Layout><HelpSupport /></Layout></ProtectedRoute>} />
        <Route path="/patient/settings" element={<ProtectedRoute allowedRoles={['patient']}><Layout><SettingsPage /></Layout></ProtectedRoute>} />

        <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><DoctorDashboard /></Layout></ProtectedRoute>} />
        <Route path="/doctor/consultations" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><DoctorConsultations /></Layout></ProtectedRoute>} />
        <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><DoctorPatients /></Layout></ProtectedRoute>} />
        <Route path="/doctor/analytics" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><DoctorAnalytics /></Layout></ProtectedRoute>} />
        <Route path="/doctor/scheduling" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><DoctorScheduling /></Layout></ProtectedRoute>} />
        <Route path="/doctor/reminders" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><DoctorMedicationReminders /></Layout></ProtectedRoute>} />
        <Route path="/doctor/inventory" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><DoctorInventory /></Layout></ProtectedRoute>} />
        <Route path="/doctor/alerts" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><DoctorHealthAlerts /></Layout></ProtectedRoute>} />
        <Route path="/doctor/video" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><DoctorVideoRooms /></Layout></ProtectedRoute>} />
        <Route path="/doctor/delivery" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><DoctorDelivery /></Layout></ProtectedRoute>} />
        <Route path="/doctor/epidemic" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><DoctorEpidemicMap /></Layout></ProtectedRoute>} />
        <Route path="/doctor/chw-performance" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><DoctorChwPerformance /></Layout></ProtectedRoute>} />
        <Route path="/doctor/patient/:id" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><DoctorPatientTimeline /></Layout></ProtectedRoute>} />
        <Route path="/doctor/help" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><HelpSupport /></Layout></ProtectedRoute>} />
        <Route path="/doctor/settings" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><SettingsPage /></Layout></ProtectedRoute>} />

        <Route path="/chw/dashboard" element={<ProtectedRoute allowedRoles={['chw']}><Layout><CHWDashboard /></Layout></ProtectedRoute>} />
        <Route path="/chw/patients" element={<ProtectedRoute allowedRoles={['chw']}><Layout><CHWPatients /></Layout></ProtectedRoute>} />
        <Route path="/chw/tasks" element={<ProtectedRoute allowedRoles={['chw']}><Layout><CHWTasks /></Layout></ProtectedRoute>} />
        <Route path="/chw/escalations" element={<ProtectedRoute allowedRoles={['chw']}><Layout><CHWEscalations /></Layout></ProtectedRoute>} />
        <Route path="/chw/route-planner" element={<ProtectedRoute allowedRoles={['chw']}><Layout><CHWRoutePlanner /></Layout></ProtectedRoute>} />
        <Route path="/chw/help" element={<ProtectedRoute allowedRoles={['chw']}><Layout><HelpSupport /></Layout></ProtectedRoute>} />
        <Route path="/chw/settings" element={<ProtectedRoute allowedRoles={['chw']}><Layout><SettingsPage /></Layout></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminUsers /></Layout></ProtectedRoute>} />
        <Route path="/admin/clinics" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminClinics /></Layout></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminAnalytics /></Layout></ProtectedRoute>} />
        <Route path="/admin/activity" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminActivityLogs /></Layout></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminSystemSettings /></Layout></ProtectedRoute>} />
        <Route path="/admin/help" element={<ProtectedRoute allowedRoles={['admin']}><Layout><HelpSupport /></Layout></ProtectedRoute>} />

        <Route path="/sos" element={<ProtectedRoute><EmergencySOS /></ProtectedRoute>} />
        <Route path="/forum" element={<ProtectedRoute><Layout><Forum /></Layout></ProtectedRoute>} />
        <Route path="/forum/:id" element={<ProtectedRoute><Layout><ForumThread /></Layout></ProtectedRoute>} />
        <Route path="/family" element={<ProtectedRoute><Layout><Family /></Layout></ProtectedRoute>} />
        <Route path="/lab-results" element={<ProtectedRoute><Layout><LabResults /></Layout></ProtectedRoute>} />
        <Route path="/blood-donor" element={<ProtectedRoute><Layout><BloodDonor /></Layout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <AIAssistant />
    </AuthProvider>
  );
}
