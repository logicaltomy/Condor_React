// 1.8.0 - Agregamos la propiedad opcional "foto"
export interface User {
  username: string;
  email: string;
  password: string;
  foto?: string; // Propiedad opcional para la foto de perfil
}

const usuariosGuardados = localStorage.getItem("usuarios");

export let usuarios: User[] = usuariosGuardados
  ? JSON.parse(usuariosGuardados)
  : [
      { username: "Admin", email: "Admin@gmail.com", password: "Admin123!" },
      { username: "Cris", email: "Cris@gmail.com", password: "Cris123!" },
      { username: "Tomas", email: "a@a.com", password: "a" },
    ];


// Función para agregar un nuevo usuario y actualizar localStorage
export const agregarUsuario = (nuevoUsuario: User) => {
  usuarios.push(nuevoUsuario);
  // Guardar lista completa en localStorage
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
};

// 1.8.0 - Soporte para foto de perfil y actualización parcial de usuario
// de un usuario existente identificado por su email
export const actualizarUsuario = (email: string, cambios: Partial<User>) => {
  // Buscar el índice del usuario a actualizar
  const indice = usuarios.findIndex((u) => u.email === email);
  // Si se encuentra, actualizar sus datos
  if (indice !== -1) {
    usuarios[indice] = { ...usuarios[indice], ...cambios };
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }
  // recargar el array desde localStorage por seguridad
  usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
};

export const obtenerUsuarios = (): User[] => {
  const datos = localStorage.getItem("usuarios");
  return datos ? JSON.parse(datos) : usuarios; // si no hay nada, devuelve los por defecto
};