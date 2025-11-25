import axios from 'axios';

/**
 * Servicio Axios para el microservicio de Contacto.
 * BaseURL apunta a http://localhost:8085 según configuración del backend.
 */
const api = axios.create({
  baseURL: 'http://localhost:8085',
  headers: { 'Content-Type': 'application/json' }
});

const crearContacto = (data: { nombre: string; correo: string; mensaje: string }) => {
  // Enviar el payload con la propiedad `correo` que espera el backend.
  const payload = {
    nombre: data.nombre,
    correo: data.correo,
    mensaje: data.mensaje,
  };
  return api.post('/api/v1/contacto', payload);
};

const listarContactos = () => {
  return api.get('/api/v1/contacto');
};

export default {
  crearContacto,
  listarContactos
};
