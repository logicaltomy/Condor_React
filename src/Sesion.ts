// src/Sesion.ts

// Guarda el correo y marca la sesión como activa
export const iniciarSesion = (email: string) => {
  localStorage.setItem("usuarioActual", email);
  localStorage.setItem("sesionIniciada", "true");
};

// Elimina todo al cerrar sesión
export const cerrarSesion = () => {
  localStorage.removeItem("usuarioActual");
  localStorage.removeItem("sesionIniciada");
  // Si más adelante guardas favoritos, tokens, etc. también los limpias aquí.
};

// Verifica si hay sesión activa
export const sesionActiva = (): boolean => {
  return localStorage.getItem("sesionIniciada") === "true";
};
