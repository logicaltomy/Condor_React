import { extractErrorMessage, createApi } from './apiClient';

// Base URL: usa variable Vite si está definida, si no hace fallback al puerto del microservicio de logros (8084)
const BASE = (import.meta as any).env?.VITE_LOGROS_API_URL ?? 'http://localhost:8084';
const api = createApi(BASE);

const getRoleHeader = () => {
  try {
    const raw = localStorage.getItem('usuarioDTO');
    if (!raw) return null;
    const u = JSON.parse(raw);
    const role = u?.idRol ?? u?.rol?.id ?? u?.rol?.nombre ?? null;
    return role ? role.toString() : null;
  } catch {
    return null;
  }
};

export const obtenerLogrosConConteo = async () => {
  try {
    const headers: any = {};
    const role = getRoleHeader();
    if (role) headers['X-User-Role'] = role;
    const resp = await api.get('/api/v1/logros/conConteo', { headers });
    return resp.data;
  } catch (err: any) {
    throw new Error(extractErrorMessage(err) || err?.message || 'Error al obtener logros.');
  }
};

export const crearLogro = async (payload: any) => {
  try {
    const headers: any = {};
    const role = getRoleHeader();
    if (role) headers['X-User-Role'] = role;
    const resp = await api.post('/api/v1/logros', payload, { headers });
    return resp.data;
  } catch (err: any) {
    throw new Error(extractErrorMessage(err) || err?.message || 'Error al crear logro.');
  }
};

export const actualizarEstado = async (id: number, estado: number) => {
  try {
    const headers: any = {};
    const role = getRoleHeader();
    if (role) headers['X-User-Role'] = role;
    const resp = await api.patch(`/api/v1/logros/${id}/estado`, estado, { headers });
    return resp.data;
  } catch (err: any) {
    throw new Error(extractErrorMessage(err) || err?.message || 'Error al actualizar estado.');
  }
};

export const obtenerCondiciones = async () => {
  try {
    const resp = await api.get('/api/v1/logros/condiciones');
    return resp.data;
  } catch (err: any) {
    throw new Error(extractErrorMessage(err) || err?.message || 'Error al obtener condiciones.');
  }
};

export const obtenerTrofeosPorUsuario = async (idUsuario: number) => {
  try {
    const resp = await api.get(`/api/v1/logros/trofeos/usuario/${idUsuario}`);
    return resp.data;
  } catch (err: any) {
    throw new Error(extractErrorMessage(err) || err?.message || 'Error al obtener trofeos del usuario.');
  }
};

export default { obtenerLogrosConConteo, crearLogro, actualizarEstado, obtenerCondiciones, obtenerTrofeosPorUsuario };
