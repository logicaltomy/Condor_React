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

// Helper para extraer un mensaje legible de un error Axios
export function extractErrorMessage(error: any): string {
  try {
    const resp = error?.response;
    // If the server responded with a body, prefer its message (and translate common HTTP statuses)
    if (resp) {
      const status = resp.status;
      const data = resp.data;
      if (data) {
        if (typeof data === 'string' && data.trim().length > 0) return data;
        if (typeof data === 'object') {
          if (data.message) return String(data.message);
          if (data.error) return String(data.error);
          // try common validation structures
          if (data.errors) return JSON.stringify(data.errors);
          return JSON.stringify(data);
        }
      }

      // Map common HTTP statuses to friendly Spanish messages
      switch (status) {
        case 400: return 'Solicitud inválida. Verifica los datos enviados.';
        case 401: return 'No autorizado. Revisa tus credenciales.';
        case 403: return 'Acceso denegado.';
        case 404: return 'Recurso no encontrado.';
        case 409: return 'Conflicto: recurso ya existe o estado inválido.';
        case 422: return 'Datos no válidos.';
        case 500: return 'Error interno del servidor.';
        case 503: return 'Servicio no disponible. Intenta más tarde.';
        default: return `Error en la petición (código ${status}).`;
      }
    }

    // No response from server (network error or other client issue)
    const msg = error?.message || '';
    if (msg.includes('Network Error')) return 'Error de red. Comprueba tu conexión.';
    if (msg.includes('Request failed with status code')) {
      const m = msg.match(/status code (\d+)/);
      const code = m ? Number(m[1]) : undefined;
      if (code) return `Error en la petición (código ${code}).`;
    }
    return msg || 'Error desconocido';
  } catch {
    return error?.message || 'Error desconocido';
  }
}
