import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hb_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (phone: string, password: string) => api.post('/auth/login', { phone, password }),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const patientsApi = {
  list: (params?: any) => api.get('/patients', { params }),
  get: (id: string) => api.get(`/patients/${id}`),
  update: (id: string, data: any) => api.patch(`/patients/${id}`, data),
  consultations: (id: string) => api.get(`/patients/${id}/consultations`),
  prescriptions: (id: string) => api.get(`/patients/${id}/prescriptions`),
};

export const consultationsApi = {
  create: (data: any) => api.post('/consultations', data),
  list: (params?: any) => api.get('/consultations', { params }),
  get: (id: string) => api.get(`/consultations/${id}`),
  respond: (id: string, data: any) => api.patch(`/consultations/${id}/respond`, data),
  updateStatus: (id: string, status: string) => api.patch(`/consultations/${id}/status`, { status }),
};

export const doctorsApi = {
  dashboard: () => api.get('/doctors/dashboard'),
  patients: () => api.get('/doctors/patients'),
  analytics: (days?: number) => api.get('/doctors/analytics', { params: { days } }),
  chws: () => api.get('/doctors/chws'),
  assignChw: (data: { patient_id: string; chw_id: string }) => api.post('/doctors/assign-chw', data),
  clinics: () => api.get('/doctors/clinics'),
};

export const chwApi = {
  dashboard: () => api.get('/chw/dashboard'),
  patients: () => api.get('/chw/patients'),
  assignPatient: (patientId: string) => api.post('/chw/patients', { patient_id: patientId }),
  tasks: (params?: any) => api.get('/chw/tasks', { params }),
  updateTask: (id: string, data: any) => api.patch(`/chw/tasks/${id}`, data),
  logAdherence: (data: any) => api.post('/chw/adherence', data),
  createEscalation: (data: any) => api.post('/chw/escalations', data),
  escalations: () => api.get('/chw/escalations'),
};

export const adminApi = {
  users: (params?: any) => api.get('/admin/users', { params }),
  clinics: () => api.get('/admin/clinics'),
  createClinic: (data: any) => api.post('/admin/clinics', data),
  stats: () => api.get('/admin/stats'),
  regions: () => api.get('/admin/regions'),
};

export const analyticsApi = {
  overview: () => api.get('/analytics/overview'),
  adherence: () => api.get('/analytics/adherence'),
  chwPerformance: () => api.get('/analytics/chw-performance'),
  events: (days?: number) => api.get('/analytics/events', { params: { days } }),
};

export const notificationsApi = {
  list: () => api.get('/notifications'),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const adminFullApi = {
  users: (params?: any) => api.get('/admin/users', { params }),
  user: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}`, data),
  updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  toggleUserStatus: (id: string, is_active: boolean) => api.patch(`/admin/users/${id}/status`, { is_active }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  activity: () => api.get('/admin/activity'),
  system: () => api.get('/admin/system'),
  clinics: () => api.get('/admin/clinics'),
  createClinic: (data: any) => api.post('/admin/clinics', data),
  regions: () => api.get('/admin/regions'),
  stats: () => api.get('/admin/stats'),
  seed: () => api.post('/seed/all'),
  roleRequests: (params?: any) => api.get('/admin/role-requests', { params }),
  approveRoleRequest: (id: string, notes?: string) => api.post(`/admin/role-requests/${id}/approve`, { admin_notes: notes }),
  rejectRoleRequest: (id: string, reason: string) => api.post(`/admin/role-requests/${id}/reject`, { reason }),
};
