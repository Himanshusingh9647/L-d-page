import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5155';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ld_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (expired/invalid token)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ld_token');
      localStorage.removeItem('ld_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  getMe: () =>
    apiClient.get('/auth/me'),
};

// ── Modules API ──────────────────────────────────────────────────────────────
export const modulesApi = {
  getAll: () => apiClient.get('/modules'),
  getById: (id) => apiClient.get(`/modules/${id}`),
  create: (data) => apiClient.post('/modules', data),
  update: (id, data) => apiClient.put(`/modules/${id}`, data),
};

// ── Assignments API ──────────────────────────────────────────────────────────
export const assignmentsApi = {
  getMy: () => apiClient.get('/assignments/my'),
  getForUser: (userId) => apiClient.get(`/assignments/user/${userId}`),
  getMatrix: () => apiClient.get('/assignments/matrix'),
  create: (data) => apiClient.post('/assignments', data),
  remove: (data) => apiClient.delete('/assignments', { data }),
};

// ── Progress API ─────────────────────────────────────────────────────────────
export const progressApi = {
  updateVideoTime: (data) => apiClient.put('/progress/video-time', data),
  completeVideo: (data) => apiClient.put('/progress/complete-video', data),
  consentPdf: (data) => apiClient.put('/progress/consent-pdf', data),
};

// ── Admin API ────────────────────────────────────────────────────────────────
export const adminApi = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
  getEmployees: (search = '') => apiClient.get(`/admin/employees?search=${encodeURIComponent(search)}`),
  getEmployeeDetail: (userId) => apiClient.get(`/admin/employee/${userId}`),
};

// ── Recurring API ────────────────────────────────────────────────────────────
export const recurringApi = {
  getAll: () => apiClient.get('/recurring'),
  create: (data) => apiClient.post('/recurring', data),
  update: (configId, data) => apiClient.put(`/recurring/${configId}`, data),
  delete: (configId) => apiClient.delete(`/recurring/${configId}`),
};

// ── Media API ────────────────────────────────────────────────────────────────
export const mediaApi = {
  getAvailableFiles: () => apiClient.get('/media/available-files'),
};
