export interface User {
  username: string;
  email: string;
  password: string;
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

export const obtenerUsuarios = (): User[] => {
  const datos = localStorage.getItem("usuarios");
  return datos ? JSON.parse(datos) : usuarios; // si no hay nada, devuelve los por defecto
};