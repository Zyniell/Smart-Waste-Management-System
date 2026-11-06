import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default LAN IP for physical device / Expo Go on the local network
export const DEFAULT_HOST = '192.168.1.14';

export const getBaseUrl = async (): Promise<string> => {
  const customIp = await AsyncStorage.getItem('custom_backend_ip');
  const host = customIp || (Platform.OS === 'android' && !customIp ? DEFAULT_HOST : DEFAULT_HOST);
  return `http://${host}:8000`;
};

export const getFullImageUrl = async (path?: string): Promise<string> => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = await getBaseUrl();
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

export async function appendImageToFormData(
  formData: FormData,
  fieldName: string,
  imageUri: string,
  fileObj?: any
) {
  if (Platform.OS === 'web') {
    if (fileObj instanceof Blob || (typeof File !== 'undefined' && fileObj instanceof File)) {
      formData.append(fieldName, fileObj, (fileObj as File).name || 'photo.jpg');
    } else {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const filename = imageUri.split('/').pop()?.split('?')[0] || 'photo.jpg';
      const safeName = filename.includes('.') ? filename : `${filename}.jpg`;
      formData.append(fieldName, blob, safeName);
    }
  } else {
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append(fieldName, {
      uri: imageUri,
      name: filename,
      type,
    } as any);
  }
}

const createApiClient = async () => {
  const base = await getBaseUrl();
  const token = await AsyncStorage.getItem('auth_token');

  const instance = axios.create({
    baseURL: `${base}/api`,
    timeout: 20000,
  });

  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  return instance;
};

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  is_active: boolean;
  created_at: string;
}

export type WasteCategory = 'ORGANIC' | 'PLASTIC' | 'PAPER';
export type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface Report {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: WasteCategory;
  status: ReportStatus;
  image_url: string;
  latitude: number;
  longitude: number;
  address?: string;
  ai_prediction?: string;
  ai_confidence?: number;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface PredictionResult {
  category: string;
  confidence: number;
  probabilities: Record<string, number>;
  message: string;
}

export const mobileApi = {
  login: async (email: string, password: string) => {
    const client = await createApiClient();
    const res = await client.post<{ access_token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    return res.data;
  },

  register: async (name: string, email: string, password: string) => {
    const client = await createApiClient();
    const res = await client.post<{ access_token: string; user: User }>('/auth/register', {
      name,
      email,
      password,
    });
    return res.data;
  },

  getMe: async () => {
    const client = await createApiClient();
    const res = await client.get<User>('/auth/me');
    return res.data;
  },

  getReports: async (myOnly: boolean = true) => {
    const client = await createApiClient();
    const res = await client.get<Report[]>('/reports', {
      params: { my_only: myOnly },
    });
    return res.data;
  },

  getReportById: async (id: number) => {
    const client = await createApiClient();
    const res = await client.get<Report>(`/reports/${id}`);
    return res.data;
  },

  createReport: async (formData: FormData) => {
    const client = await createApiClient();
    const headers: Record<string, string> = {};
    if (Platform.OS !== 'web') {
      headers['Content-Type'] = 'multipart/form-data';
    }
    const res = await client.post<Report>('/reports', formData, {
      headers,
    });
    return res.data;
  },

  predictImage: async (imageUri: string, fileObj?: any) => {
    const client = await createApiClient();
    const formData = new FormData();
    await appendImageToFormData(formData, 'image', imageUri, fileObj);

    const headers: Record<string, string> = {};
    if (Platform.OS !== 'web') {
      headers['Content-Type'] = 'multipart/form-data';
    }

    const res = await client.post<PredictionResult>('/predict', formData, {
      headers,
    });
    return res.data;
  },

  getDashboardStats: async () => {
    const client = await createApiClient();
    const res = await client.get('/stats/dashboard');
    return res.data;
  },
};
