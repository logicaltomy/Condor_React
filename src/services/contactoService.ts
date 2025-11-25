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

export default {
  crearContacto,
  listarContactos,
};
