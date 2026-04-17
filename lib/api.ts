import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — unwrap data
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local auth state if needed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:expired'));
      }
    }
    return Promise.reject(error);
  }
);

// ─── Generic helpers ──────────────────────────────────
export const apiGet = async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
  const res = await api.get<ApiResponse<T>>(url, { params });
  return res.data.data as T;
};

export const apiPost = async <T>(url: string, body?: unknown): Promise<T> => {
  const res = await api.post<ApiResponse<T>>(url, body);
  return res.data.data as T;
};

export const apiPut = async <T>(url: string, body?: unknown): Promise<T> => {
  const res = await api.put<ApiResponse<T>>(url, body);
  return res.data.data as T;
};

export const apiDelete = async <T>(url: string): Promise<T> => {
  const res = await api.delete<ApiResponse<T>>(url);
  return res.data.data as T;
};

export const apiUpload = async <T>(url: string, formData: FormData): Promise<T> => {
  const res = await api.post<ApiResponse<T>>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data as T;
};

export default api;
