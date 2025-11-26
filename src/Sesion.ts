// src/Sesion.ts

// Guarda el correo y marca la sesión como activa
export const iniciarSesion = (email: string) => {
  localStorage.setItem("usuarioActual", email);
  localStorage.setItem("sesionIniciada", "true");
};

// Elimina todo al cerrar sesión
export const cerrarSesion = () => {
  // Marcar la sesión como cerrada y limpiar datos de usuario
  localStorage.removeItem("usuarioActual");
  // Usar explicitamente 'false' para que la comprobación sesionActiva() sea consistente
  localStorage.setItem("sesionIniciada", "false");
  // Eliminar el DTO del usuario y cualquier token guardado para que
  // la UI deje de mostrar accesos basados en rol (moderador/admin)
  localStorage.removeItem('usuarioDTO');
  localStorage.removeItem('token');
  // Emitir un evento personalizado para notificar a la app que la sesión cambió
  try {
    window.dispatchEvent(new Event('session-changed'));
  } catch {
    // no bloquear si falla
  }
};

// Verifica si hay sesión activa
export const sesionActiva = (): boolean => {
  return localStorage.getItem("sesionIniciada") === "true";
};
