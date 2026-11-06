import axios from 'axios';
import type { 
  User, 
  Report, 
  DashboardStats, 
  PredictionResult, 
  ReportStatus, 
  WasteCategory,
  UserRole
} from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export function getFullImageUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      email,
      password,
    });
    return res.data;
  },
  register: async (name: string, email: string, password: string) => {
    const res = await api.post<{ access_token: string; token_type: string; user: User }>('/auth/register', {
      name,
      email,
      password,
    });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
};

export const reportsApi = {
  getAll: async (params?: {
    status?: ReportStatus;
    category?: WasteCategory;
    search?: string;
    my_only?: boolean;
  }) => {
    const res = await api.get<Report[]>('/reports', { params });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<Report>(`/reports/${id}`);
    return res.data;
  },
  create: async (formData: FormData) => {
    const res = await api.post<Report>('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  updateStatus: async (id: number, status: ReportStatus, adminNotes?: string) => {
    const res = await api.patch<Report>(`/reports/${id}/status`, {
      status,
      admin_notes: adminNotes,
    });
    return res.data;
  },
  update: async (id: number, data: Partial<Report>) => {
    const res = await api.put<Report>(`/reports/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete<{ message: string }>(`/reports/${id}`);
    return res.data;
  },
};

export const statsApi = {
  getDashboard: async () => {
    const res = await api.get<DashboardStats>('/stats/dashboard');
    return res.data;
  },
};

export const usersApi = {
  getAll: async (params?: { search?: string; role?: UserRole }) => {
    const res = await api.get<User[]>('/users', { params });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<User>(`/users/${id}`);
    return res.data;
  },
  update: async (id: number, data: { name?: string; role?: UserRole; is_active?: boolean; password?: string }) => {
    const res = await api.put<User>(`/users/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete<{ message: string }>(`/users/${id}`);
    return res.data;
  },
};

export const predictApi = {
  scanImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post<PredictionResult>('/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export default api;
