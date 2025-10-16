// src/Sesion.ts
export const iniciarSesion = () => {
  localStorage.setItem("sesionIniciada", "true");
};

export const cerrarSesion = () => {
  localStorage.removeItem("sesionIniciada");
};

export const sesionActiva = () => {
  return localStorage.getItem("sesionIniciada") === "true";
};

