import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { setupPeriodicSync } from './services/sync';
import { getPendingAdherenceCount } from './services/db';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Tasks from './pages/Tasks';
import Escalations from './pages/Escalations';
import Login from './pages/Login';
import { HiOutlineWifi, HiOutlineBan } from 'react-icons/hi';

function OnlineIndicator() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 text-center text-xs py-1 font-medium ${online ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
      <span className="inline-flex items-center space-x-1">
        {online ? <HiOutlineWifi className="h-3 w-3" /> : <HiOutlineBan className="h-3 w-3" />}
        <span>{online ? 'Online — Data syncing' : 'Offline — Working from cache'}</span>
      </span>
    </div>
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('hb_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const token = localStorage.getItem('hb_token');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (token) {
      setupPeriodicSync();
      const interval = setInterval(async () => {
        setPendingCount(await getPendingAdherenceCount());
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <>
      {token && <OnlineIndicator />}
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute><Layout><Patients /></Layout></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>} />
        <Route path="/escalations" element={<ProtectedRoute><Layout><Escalations /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
