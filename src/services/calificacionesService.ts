import type { AxiosResponse } from 'axios';
import { createApi } from './apiClient';

const BASE = (import.meta as any).env?.VITE_CALIFICACIONES_API_URL ?? 'http://localhost:8082';
const api = createApi(BASE);

export interface CalificacionPayload {
  idUsuario: number;
  idRuta: number;
  puntuacion: number; // 1..5
  comentario?: string;
}

export const existeCalificacion = (usuario: number, ruta: number): Promise<AxiosResponse<{existe: boolean}>> => {
  return api.get(`/api/v1/calificaciones/existe`, { params: { usuario, ruta } });
};

export const crearCalificacion = (payload: CalificacionPayload): Promise<AxiosResponse<any>> => {
  return api.post('/api/v1/calificaciones', payload);
};

export const promedioPorRuta = (idRuta: number): Promise<AxiosResponse<any>> => {
  return api.get(`/api/v1/calificaciones/ruta/${idRuta}/promedio`);
};

export const calificacionesPorUsuario = (idUsuario: number): Promise<AxiosResponse<any[]>> => {
  return api.get(`/api/v1/calificaciones/usuario/${idUsuario}`);
};

export default { existeCalificacion, crearCalificacion, promedioPorRuta, calificacionesPorUsuario };
