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

// Extrae un mensaje de error legible del objeto de error Axios
export function extractErrorMessage(err: any): string {
  if (!err) return 'Error desconocido.';
  // Preferir body.message (backend normalizado)
  const data = err?.response?.data;
  if (data) {
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data.message) return String(data.message);
    // Si es objeto sin campo message, intentar convertir a texto útil
    try {
      const json = JSON.stringify(data);
      if (json && json !== '{}') return json;
    } catch (e) {
      // ignore
    }
  }
  if (err?.message) return String(err.message);
  return 'Error del servidor. Intenta nuevamente.';
}
