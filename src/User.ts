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


// 1.12.0 - Función para obtener usuarios con normalización de claves antiguas
/*
🔹 Define y exporta una función llamada obtenerUsuarios.
🔹 Su tipo de retorno es un arreglo de User[], es decir, una lista de objetos con la estructura definida por tu interfaz User (por ejemplo: { username, email, password, foto }).
🔹 El export permite que esta función sea importada desde otros módulos, como Login.tsx o Register.tsx.
*/ 
export const obtenerUsuarios = (): User[] => {
  // Busca en el localStorage la clave "usuarios".
  const datos = localStorage.getItem("usuarios");
  // Si encuentra datos, los parsea desde JSON; si no, usa el array usuarios por defecto.
  const raw = datos ? JSON.parse(datos) : usuarios;
  // Normalizar posibles claves antiguas (correo/nombre) a las actuales (email/username)
  // y devolver el array de usuarios con la estructura correcta
  return (raw as any[]).map((u) => ({
    // Mapea cada objeto u del array raw a un nuevo objeto con las claves normalizadas
    username: u.username ?? u.nombre ?? "",
    // Usa la clave "username" si existe; si no, usa "nombre"; si ninguna existe, asigna cadena vacía
    email: u.email ?? u.correo ?? "",
    // Similar para email: usa "email" o "correo"
    password: u.password ?? "",
    // Incluye la propiedad opcional
    foto: u.foto
  })); // si no hay nada, devuelve los por defecto pero normalizados
};

// 1.13.0 - Eliminar usuario por email
export const eliminarUsuario = (email: string) => {
  // normalizar email de entrada
  const objetivo = email.trim().toLowerCase();
  // obtener la lista normalizada de usuarios
  const lista = obtenerUsuarios();

  // crear una nueva lista sin el usuario y persistir (comparando normalizado)
  const nueva = lista.filter((u) => u.email.trim().toLowerCase() !== objetivo);
  localStorage.setItem("usuarios", JSON.stringify(nueva));
};

export const obtenerUsuarioPorEmail = (email: string): Boolean => {
  const objetivo = email.trim().toLowerCase();
  const lista = obtenerUsuarios();
  const encontrado = lista.find((u) => u.email.trim().toLowerCase() === objetivo);
  if (encontrado) {
    return true;
  }
  return false;
}