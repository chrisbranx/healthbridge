import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
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

export const authApi = {
  login: (phone: string, password: string) => api.post('/auth/login', { phone, password }),
  me: () => api.get('/auth/me'),
};

export const patientsApi = {
  list: (params?: any) => api.get('/patients', { params }),
  get: (id: string) => api.get(`/patients/${id}`),
};
