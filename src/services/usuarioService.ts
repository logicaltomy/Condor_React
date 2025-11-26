import type { AxiosResponse } from 'axios';
import { createApi } from './apiClient';

// Base URL: usa variable Vite si está definida, si no hace fallback al puerto asignado (Usuarios -> 8081)
const BASE = (import.meta as any).env?.VITE_USUARIOS_API_URL ?? 'http://localhost:8081';
const api = createApi(BASE);

export interface UsuarioPayload {
  nombre: string;
  correo: string;
  contrasena: string;
  idRegion: number;
  idRol: number;
  preguntaSeguridad1: string;
  respuestaSeguridad1: string;
  preguntaSeguridad2: string;
  respuestaSeguridad2: string;
  fotoPerfilBase64?: string; // opcional en registro
}

export interface LoginPayload {
  correo: string;
  password: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export const registerUser = (data: UsuarioPayload): Promise<AxiosResponse<unknown>> => {
  return api.post('/api/v1/usuarios', data);
};

export const loginUser = (data: LoginPayload): Promise<AxiosResponse<unknown>> => {
  return api.post('/api/v1/usuarios/login', data);
};

export const getUserById = (id: number): Promise<AxiosResponse<unknown>> => {
  return api.get(`/api/v1/usuarios/${id}`);
};

export const getUserByCorreo = (correo: string): Promise<AxiosResponse<unknown>> => {
  return api.get('/api/v1/usuarios/buscar', { params: { correo } });
};

export const updateNombre = (id: number, nombre: string): Promise<AxiosResponse<unknown>> => {
  return api.patch(`/api/v1/usuarios/${id}/nombre`, null, { params: { nombre } });
};

export const updateCorreo = (id: number, correo: string): Promise<AxiosResponse<unknown>> => {
  return api.patch(`/api/v1/usuarios/${id}/correo`, null, { params: { correo } });
};

export const updateRegion = (id: number, idRegion: number): Promise<AxiosResponse<unknown>> => {
  return api.patch(`/api/v1/usuarios/${id}/region`, null, { params: { idRegion } });
};

export const updateRutasRecorridas = (id: number, nuevasRutas: number): Promise<AxiosResponse<unknown>> => {
  return api.patch(`/api/v1/usuarios/${id}/rutasRecorridas`, null, { params: { nuevasRutas } });
};

export const updateFotoPerfil = (id: number, fotoBase64: string): Promise<AxiosResponse<unknown>> => {
  return api.patch(`/api/v1/usuarios/${id}/foto`, { foto: fotoBase64 });
};

export const changePassword = (id: number, payload: ChangePasswordPayload): Promise<AxiosResponse<unknown>> => {
  return api.patch(`/api/v1/usuarios/${id}/password`, payload);
};

export const deleteUsuario = (id: number): Promise<AxiosResponse<unknown>> => {
  return api.delete(`/api/v1/usuarios/${id}`);
};

export interface PreguntasResponse {
  correo: string;
  pregunta1: string;
  pregunta2: string;
}

export const getPreguntas = (correo: string): Promise<AxiosResponse<PreguntasResponse>> => {
  return api.get('/api/v1/usuarios/preguntas', { params: { correo } });
};

export interface RecuperacionPayload {
  correo: string;
  respuestaSeguridad1: string;
  respuestaSeguridad2: string;
  nuevaPassword: string;
}

export const recuperarContrasena = (payload: RecuperacionPayload): Promise<AxiosResponse<unknown>> => {
  return api.post('/api/v1/usuarios/recuperar', payload);
};

export const getRegiones = (): Promise<AxiosResponse<any[]>> => {
  return api.get('/api/v1/regiones');
};

export const getEstados = (): Promise<AxiosResponse<any[]>> => {
  return api.get('/api/v1/estados');
};

export default {
  registerUser,
  loginUser,
  getUserById,
  getUserByCorreo,
  updateNombre,
  updateCorreo,
  updateRegion,
  updateRutasRecorridas,
  updateFotoPerfil,
  changePassword,
  deleteUsuario,
  getRegiones,
  getEstados,
};
