import { createApi } from './apiClient';

// Leer base URL desde variables Vite, con fallback
const BASE = (import.meta as any).env?.VITE_CONTACTO_API_URL ?? 'http://localhost:8085';

const api = createApi(BASE);

const crearContacto = (data: { nombre: string; correo: string; mensaje: string }) => {
  // El backend espera { nombre, correo, mensaje }
  return api.post('/api/v1/contacto', {
    nombre: data.nombre,
    correo: data.correo,
    mensaje: data.mensaje,
  });
};

const listarContactos = () => api.get('/api/v1/contacto');

export default {
  crearContacto,
  listarContactos,
};
