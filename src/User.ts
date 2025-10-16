export interface User {
  username: string;
  email: string;
  password: string;
}

export const usuarios: User[] = [
  { username: "Admin", email: "Admin@gmail.com", password: "Admin123!" },
  { username: "Cris", email: "Cris@gmail.com", password: "Cris123!" },
  ];