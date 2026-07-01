import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineHeart } from 'react-icons/hi';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(phone, password);
      if (data.user.role !== 'chw' && data.user.role !== 'admin') {
        toast.error('This app is for Community Health Workers only');
        return;
      }
      localStorage.setItem('hb_token', data.token);
      toast.success('Welcome!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineHeart className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">HealthBridge CHW</h1>
          <p className="text-sm text-gray-500 mt-1">Community Health Worker Toolkit</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">Phone Number</label>
            <input type="tel" className="input" placeholder="+237 6XX XXX XXX" value={phone}
              onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="Enter password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Offline-capable. Works without internet.
          </p>
        </div>
      </div>
    </div>
  );
}
