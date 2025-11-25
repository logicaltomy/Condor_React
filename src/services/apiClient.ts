import axios from 'axios';
import type { AxiosInstance } from 'axios';

// Crea una instancia Axios con interceptores para token y manejo global de errores.
export function createApi(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  // Attach auth token if present in localStorage
  instance.interceptors.request.use((config) => {
    try {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore in non-browser env
    }
    return config;
  });

  // Global response handler (can be extended)
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Example: handle unauthorized globally
      if (error?.response?.status === 401) {
        // optionally: redirect to login or clear tokens
        try { localStorage.removeItem('token'); } catch (e) {}
      }
      return Promise.reject(error);
    }
  );

  return instance;
}
