// lib/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User } from '../types/user';
import { LogListResponse, LogSearchResult } from '../types/log';
import { BackupFile } from '../types/backup';
import { MandrillActivity, MandrillActivityResponse } from '../types/mandrill';

const api: AxiosInstance = axios.create({
  baseURL: 'https://apioptima-log.xva-rnd.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors (e.g., 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const getUsers = (): Promise<AxiosResponse<User[]>> => {
  return api.get('/api/users');
};

export const login = (username: string, password: string): Promise<AxiosResponse<any>> => {
  return api.post('/api/login', { username, password });
};

export const getLogFiles = (
  date: string,
  server: 'ui' | 'api',
  env: 'dev' | 'prod',
  platform: 'XVA' | 'DANONE'
): Promise<AxiosResponse<LogListResponse>> => {
  return api.get(`/api/logs/list?date=${date}&server=${server}&env=${env}&platform=${platform}`);
};

export const getLogContent = (
  server: 'ui' | 'api',
  date: string,
  env: 'dev' | 'prod',
  file: string,
  platform: 'XVA' | 'DANONE'
): Promise<AxiosResponse<string>> => {
  return api.get(`/api/logs/get/${server}/${date}/${env}/${file}?platform=${platform}`);
};

export const searchLogs = (
  date: string,
  server: 'ui' | 'api',
  env: 'dev' | 'prod',
  platform: 'XVA' | 'DANONE',
  keyword: string
): Promise<AxiosResponse<LogSearchResult[]>> => {
  return api.get(`/api/logs/search?date=${date}&server=${server}&env=${env}&platform=${platform}&keyword=${keyword}`);
};

export const downloadLogs = (
  server: 'ui' | 'api',
  date: string,
  env: 'dev' | 'prod',
  platform: 'XVA' | 'DANONE',
  files: string[]
): Promise<AxiosResponse<Blob>> => {
  return api.get(`/api/logs/download?server=${server}&date=${date}&env=${env}&platform=${platform}&files=${files.join(',')}`, {
    responseType: 'blob',
  });
};

export const getBackupFiles = (
  env: 'dev' | 'prod',
  platform: 'XVA' | 'DANONE',
  date: string
): Promise<AxiosResponse<BackupFile[]>> => {
  return api.get(`/api/db-backups/list?env=${env}&platform=${platform}&date=${date}`);
};

export const downloadBackup = (
  env: 'dev' | 'prod',
  platform: 'XVA' | 'DANONE',
  date: string,
  file_name: string
): Promise<AxiosResponse<Blob>> => {
  return api.get(`/api/db-backups/download?env=${env}&platform=${platform}&date=${date}&file_name=${file_name}`, {
    responseType: 'blob',
  });
};

export const getMandrillActivity = (
  status: string[], // Updated to accept an array of statuses
  date_from: string,
  date_to: string,
  limit: number,
  offset: number
): Promise<AxiosResponse<MandrillActivityResponse>> => {
  return api.post('/api/mandrill/activity', { status, date_from, date_to, limit, offset });
};

export const exportMandrillActivity = (
  status: string[], // Updated to accept an array of statuses
  date_from: string,
  date_to: string,
  limit: number,
  offset: number
): Promise<AxiosResponse<Blob>> => {
  return api.post('/api/mandrill/export', { status, date_from, date_to, limit, offset }, { responseType: 'blob' });
};

export const getMandrillContent = (
  id: string
): Promise<AxiosResponse<{
  content: string;
  subject: string;
  from_email: string;
  from_name: string;
  to: { email: string; name: string; type: string }[];
}>> => {
  return api.get(`/api/mandrill/content/${id}`);
};

export default api;