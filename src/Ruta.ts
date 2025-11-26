// Tipos para Ruta (solo tipos, sin datos en duro)
export type Region = "NORTE" | "CENTRO" | "SUR";
export type TipoRuta = "OFICIAL" | "COMUNITARIA";
export type Dificultad = "FACIL" | "MODERADO" | "NORMAL" | "DIFICIL" | "EXTREMO";

export interface Ruta {
  idRuta?: string | number;
  nombre?: string;
  descripcion?: string;
  distancia?: number;
  f_public?: string;
  tiempoSegundos?: number;
  promCalificacion?: number;
  region?: Region;
  tipo?: TipoRuta;
  foto?: string[];
  dificultad?: Dificultad;
}

// Nota: Este archivo ya no contiene datos en duro. Para obtener rutas y catálogos
// (tipos, dificultades, regiones, estados) el frontend debe consumir los
// endpoints del backend (p. ej. `rutaService`, `usuarioService`).

export default {};
