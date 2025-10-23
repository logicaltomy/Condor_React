export type Region = "NORTE" | "CENTRO" | "SUR";
export type TipoRuta = "OFICIAL" | "COMUNITARIA";
export type Dificultad = "FACIL" | "MODERADO" | "NORMAL" | "DIFICIL" | "EXTREMO";

export interface Ruta {
  idRuta: string; // uuid o string único
  nombre: string;
  descripcion: string;
  distancia?: number; // km
  f_public?: string; // fecha de publicación en ISO
  tiempoSegundos?: number;
  promCalificacion?: number; // 1..5
  region?: Region;
  tipo: TipoRuta;
  foto: string[]; // rutas o URLs
  dificultad: Dificultad;
}

// Key en localStorage
const STORAGE_KEY = "rutas";

// Rutas por defecto (semilla) - mapeadas desde los ejemplos previos
const DEFAULT_RUTAS: Ruta[] = [
  {
    idRuta: "san-cristobal",
    nombre: "SAN CRISTOBAL",
    descripcion: "Ruta clásica en Santiago con miradores y espacios verdes.",
    distancia: 3.2,
    f_public: new Date().toISOString(),
    tiempoSegundos: 3600,
    promCalificacion: 3.0,
    region: "CENTRO",
    tipo: "OFICIAL",
    foto: [
      "https://cdn.shopify.com/s/files/1/0526/8596/3456/files/2_ab7ad3cc-e13b-4fbb-b6d9-43d1865fba57_1024x1024.png?v=1619907413",
    ],
    dificultad: "FACIL",
  },
  {
    idRuta: "manquehuito",
    nombre: "MANQUEHUITO",
    descripcion: "Pequeña cima con buenas vistas de la ciudad.",
    distancia: 4.1,
    f_public: new Date().toISOString(),
    tiempoSegundos: 5400,
    promCalificacion: 2.0,
    region: "CENTRO",
    tipo: "COMUNITARIA",
    foto: ["https://laguiadesantiago.com/wp-content/uploads/2020/02/CerroManquehuito.jpg"],
    dificultad: "FACIL",
  },
  {
    idRuta: "salto-de-apoquindo",
    nombre: "SALTO DE APOQUINDO",
    descripcion: "Una quebrada con cascadas y tramos técnicos.",
    distancia: 12.5,
    f_public: new Date().toISOString(),
    tiempoSegundos: 4 * 3600,
    promCalificacion: 5.0,
    region: "CENTRO",
    tipo: "OFICIAL",
    foto: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwfgQrOXD2lDD5DSVXyvo83OLXhpsC5ru6dQ&s",
    ],
    dificultad: "DIFICIL",
  },
  {
    idRuta: "cerro-renca",
    nombre: "CERRO RENCA",
    descripcion: "Cerro urbano con senderos y miradores.",
    distancia: 2.8,
    f_public: new Date().toISOString(),
    tiempoSegundos: 3000,
    promCalificacion: 1.0,
    region: "CENTRO",
    tipo: "COMUNITARIA",
    foto: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Cerro_Renca%2C_Santiago.jpg/1200px-Cerro_Renca%2C_Santiago.jpg",
    ],
    dificultad: "MODERADO",
  },
];

export const obtenerRutas = (): Ruta[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_RUTAS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_RUTAS;
    return parsed as Ruta[];
  } catch (e) {
    console.error("Error leyendo rutas desde localStorage", e);
    return DEFAULT_RUTAS;
  }
};

export const guardarRutas = (rutas: Ruta[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rutas));
};

export const agregarRuta = (ruta: Ruta) => {
  const rutas = obtenerRutas();
  rutas.push(ruta);
  guardarRutas(rutas);
};

export const actualizarRuta = (idRuta: string, cambios: Partial<Ruta>) => {
  const rutas = obtenerRutas();
  const idx = rutas.findIndex((r) => r.idRuta === idRuta);
  if (idx === -1) return;
  rutas[idx] = { ...rutas[idx], ...cambios };
  guardarRutas(rutas);
};

export const eliminarRuta = (idRuta: string) => {
  const rutas = obtenerRutas();
  const filtradas = rutas.filter((r) => r.idRuta !== idRuta);
  guardarRutas(filtradas);
};

export default {
  obtenerRutas,
  guardarRutas,
  agregarRuta,
  actualizarRuta,
  eliminarRuta,
};
