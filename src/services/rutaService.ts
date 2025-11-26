import type { AxiosResponse } from 'axios';
import { createApi } from './apiClient';

const BASE = (import.meta as any).env?.VITE_RUTAS_API_URL ?? 'http://localhost:8080';
const api = createApi(BASE);

export interface RutaDto {
  idRuta?: number;
  nombre?: string;
  descripcion?: string;
  dificultad?: string;
  tipo?: string;
  id_tipo?: number;
  id_dificultad?: number;
  id_region?: number;
  id_estado?: number;
  foto?: string[];
  promCalificacion?: number;
  activo?: boolean;
  // backend fields that may be required
  distancia?: number;
  tiempo_segundos?: number;
  f_public?: boolean;
  f_baneo?: boolean;
  geometria_polyline?: string;
  prom_calificacion?: number; // backend uses snake_case in some payloads
}

export const getAllRutas = (): Promise<AxiosResponse<RutaDto[]>> => {
  return api.get('/api/v1/rutas');
};

export const getRutaById = (id: number): Promise<AxiosResponse<RutaDto>> => {
  return api.get(`/api/v1/rutas/${id}`);
};

export const createRuta = (payload: RutaDto): Promise<AxiosResponse<RutaDto>> => {
  return api.post('/api/v1/rutas', payload);
};

export const updateRuta = (id: number, payload: RutaDto): Promise<AxiosResponse<RutaDto>> => {
  // backend does not expose a generic PUT for rutas; keep this method but it will attempt a PUT (may fail)
  return api.put(`/api/v1/rutas/${id}`, payload);
};

// Patch helpers for the specific endpoints the backend provides
export const patchNombre = (id: number, nombre: string): Promise<AxiosResponse<RutaDto>> => {
  return api.patch(`/api/v1/rutas/${id}/nombre`, nombre);
};

export const patchDescripcion = (id: number, descripcion: string): Promise<AxiosResponse<RutaDto>> => {
  return api.patch(`/api/v1/rutas/${id}/descripcion`, descripcion);
};

export const patchPolyline = (id: number, polyline: string): Promise<AxiosResponse<RutaDto>> => {
  return api.patch(`/api/v1/rutas/${id}/polyline`, polyline);
};

export const banearRuta = (id: number): Promise<AxiosResponse<RutaDto>> => {
  return api.patch(`/api/v1/rutas/${id}/banear`);
};

export const desbanearRuta = (id: number): Promise<AxiosResponse<RutaDto>> => {
  return api.patch(`/api/v1/rutas/${id}/desbanear`);
};

// Soft-delete / desactivar
export const deleteRuta = (id: number): Promise<AxiosResponse<unknown>> => {
  return api.delete(`/api/v1/rutas/${id}`);
};

export interface TipoDto { id_tipo?: number; nombre?: string }
export interface DificultadDto { id_dificultad?: number; nombre?: string }

export const getAllTipos = (): Promise<AxiosResponse<TipoDto[]>> => {
  return api.get('/api/v1/rutas/tipo');
};

export const getAllDificultades = (): Promise<AxiosResponse<DificultadDto[]>> => {
  return api.get('/api/v1/rutas/dificultad');
};

export const getFotosByRuta = (id: number): Promise<AxiosResponse<any[]>> => {
  return api.get(`/api/v1/rutas/foto/${id}`);
};

export default {
  getAllRutas,
  getRutaById,
  createRuta,
  updateRuta,
  deleteRuta,
  getAllTipos,
  getAllDificultades,
  patchNombre,
  patchDescripcion,
  patchPolyline,
  banearRuta,
  desbanearRuta,
  getFotosByRuta,
};
