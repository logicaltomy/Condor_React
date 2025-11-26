import type { AxiosResponse } from 'axios';
import { createApi } from './apiClient';

// Base URL: usa variable Vite si está definida, si no hace fallback al puerto asignado (Contacto -> 8085)
const BASE = (import.meta as any).env?.VITE_CONTACTO_API_URL ?? 'http://localhost:8085';
const api = createApi(BASE);

export interface ContactoPayload {
  nombre: string;
  correo: string;
  mensaje: string;
}

export const crearContacto = (data: ContactoPayload): Promise<AxiosResponse<unknown>> => {
  return api.post('/api/v1/contacto', data);
};

export const listarContactos = (): Promise<AxiosResponse<unknown>> => {
  return api.get('/api/v1/contacto');
};

export const eliminarContacto = (id: number): Promise<AxiosResponse<unknown>> => {
  const headers = getRoleHeader();
  // Si no hay role válido, rechazar antes de hacer la petición para dar feedback claro
  if (!headers || !headers['X-User-Role']) {
    return Promise.reject(new Error('No autorizado: rol de usuario no encontrado. Inicia sesión como moderador.'));
  }
  return api.delete(`/api/v1/contacto/${id}`, { headers });
};

export const actualizarContacto = (id: number, payload: { respuesta?: string; resuelto?: boolean }): Promise<AxiosResponse<unknown>> => {
  const headers = getRoleHeader();
  if (!headers || !headers['X-User-Role']) {
    return Promise.reject(new Error('No autorizado: rol de usuario no encontrado. Inicia sesión como moderador.'));
  }
  return api.put(`/api/v1/contacto/${id}`, payload, { headers });
};

function getRoleHeader() {
  try {
    const raw = localStorage.getItem('usuarioDTO');
    if (!raw) return {};
    const u = JSON.parse(raw);
    const role = u?.idRol ?? (u?.rol?.nombre ?? '');
    // Log para depuración: qué valor estamos enviando como role
    console.debug('[contactoService] X-User-Role ->', role);
    return { 'X-User-Role': String(role) };
  } catch {
    return {};
  }
}

export default {
  crearContacto,
  listarContactos,
  eliminarContacto,
  actualizarContacto,
};
