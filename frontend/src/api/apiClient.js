import {
  mockUser,
  mockAdminUser,
  mockAssignments,
  mockModules,
  mockAdminDashboard,
  mockMatrix,
  mockEmployees
} from './mockData';

// Helper to simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const getMediaBaseUrl = () => 'http://localhost:5155';

// ── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (email, password) => {
    await delay();
    if (email.includes('admin')) return mockAdminUser;
    return mockUser;
  },
  getMe: async () => {
    await delay();
    const userStr = localStorage.getItem('ld_user');
    if (userStr) {
      return { data: { data: JSON.parse(userStr) } };
    }
    return mockUser;
  },
};

// ── Modules API ──────────────────────────────────────────────────────────────
export const modulesApi = {
  getAll: async () => { await delay(); return mockModules; },
  getById: async (id) => { await delay(); return { data: { data: mockModules.data.data.find(m => m.moduleId == id) } }; },
  create: async (data) => { await delay(); return { data: { message: "Mock Success" } }; },
  update: async (id, data) => { await delay(); return { data: { message: "Mock Success" } }; },
};

// ── Assignments API ──────────────────────────────────────────────────────────
export const assignmentsApi = {
  getMy: async () => { await delay(); return mockAssignments; },
  getForUser: async (userId) => { await delay(); return mockAssignments; },
  getMatrix: async () => { await delay(); return mockMatrix; },
  create: async (data) => { await delay(); return { data: { message: "Mock Success" } }; },
  remove: async (data) => { await delay(); return { data: { message: "Mock Success" } }; },
};

// ── Progress API ─────────────────────────────────────────────────────────────
export const progressApi = {
  updateVideoTime: async (data) => { await delay(100); return { data: { message: "Mock Success" } }; },
  completeVideo: async (data) => { await delay(); return { data: { message: "Mock Success" } }; },
  consentPdf: async (data) => { await delay(); return { data: { message: "Mock Success" } }; },
};

// ── Admin API ────────────────────────────────────────────────────────────────
export const adminApi = {
  getDashboard: async () => { await delay(); return mockAdminDashboard; },
  getEmployees: async (search = '') => { await delay(); return mockEmployees; },
  getEmployeeDetail: async (userId) => { await delay(); return { data: { data: mockEmployees.data.data.find(u => u.userId == userId) } }; },
};

// ── Recurring API ────────────────────────────────────────────────────────────
export const recurringApi = {
  getAll: async () => { await delay(); return { data: { data: [] } }; },
  create: async (data) => { await delay(); return { data: { message: "Mock Success" } }; },
  update: async (configId, data) => { await delay(); return { data: { message: "Mock Success" } }; },
  delete: async (configId) => { await delay(); return { data: { message: "Mock Success" } }; },
};

// ── Media API ────────────────────────────────────────────────────────────────
export const mediaApi = {
  getAvailableFiles: async () => { await delay(); return { data: { data: [] } }; },
  upload: async (file, onProgress) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (onProgress) onProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          resolve({ data: { message: "Mock Success", url: "/mock-url.mp4" } });
        }
      }, 100);
    });
  },
};

// ── Notifications API ────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: async () => { await delay(); return { data: { data: [] } }; },
  markAsRead: async (id) => { await delay(); return { data: { message: "Mock Success" } }; },
};

// Add a default export to prevent import errors in components expecting `import apiClient from ...`
export default {
  post: async () => { await delay(); return { data: {} }; },
  get: async () => { await delay(); return { data: {} }; },
  put: async () => { await delay(); return { data: {} }; },
  delete: async () => { await delay(); return { data: {} }; },
};
