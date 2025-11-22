import axios from "axios"; // Necesitas importar axios
import { usuarios } from "./User";

// URL base de tu microservicio de Rutas
const RUTAS_API_URL = "http://localhost:8080/api/v1/rutas";
const REGIONES_API_URL = "http://localhost:8081/api/v1/regiones";
const ESTADO_API_URL = "http://localhost:8082/api/v1/estados";

// --- INTERFACES (Las mantienes) ---

export interface Region {
    idRegion: number;
    nombre: string;
}

export interface TipoRuta {
    idTipo: number;
    nombre: string;
}

export interface Dificultad {
    idDificultad: number;
    nombre: string; // "Fácil", "Media", "Difícil"
}

export interface Fotos {
    idFoto: number;
    nombre: string;
    imagen: string; // Base64 del binario (byte[])
    idRuta: number;
}

export interface Estado {
    idEstado: number;
    nombre: string;
}

export interface Ruta {
    idRuta: number; 
    nombre: string;
    descripcion: string;
    distancia?: number; // km
    f_public?: string; // fecha de publicación en ISO
    f_baneo?: string; // fecha de baneo en ISO
    geometriaPolyline: string; // polyline encodeada
    tiempoSegundos?: number;
    promCalificacion?: number; // 1..5
    f_creacion?: string; // fecha de creación en ISO
    f_actualizacion?: string; // fecha de última actualización en ISO
    id_region?: number;
    id_tipo?: number;
    id_dificultad?: number;
    id_estado?: number;

    region?: string;
    tipo?: string;
    dificultad?: string;
    foto?: Fotos[]; 
    estado?: string;
}

async function enriquecerRuta(ruta: Ruta): Promise<Ruta> {
    
    // 1. Peticiones de datos de la API de RUTAS (Tipo y Dificultad)
    const tipoPromise = axios.get<TipoRuta>(`${RUTAS_API_URL}/tipo/${ruta.id_tipo}`);
    const dificultadPromise = axios.get<Dificultad>(`${RUTAS_API_URL}/dificultad/${ruta.id_dificultad}`);

    // 2. Peticiones de datos de la API de USUARIOS (Región y Estado)
    const regionPromise = axios.get<Region>(`${REGIONES_API_URL}/regiones/${ruta.id_region}`);
    // Asumo que hay un endpoint similar para Estado en la API de Usuarios
    const estadoPromise = axios.get<Estado>(`${ESTADO_API_URL}/estados/${ruta.id_estado}`); 

    // Ejecutar todas las promesas en paralelo para optimizar la espera (aunque sigue siendo N peticiones)
    const [tipoRes, dificultadRes, regionRes, estadoRes] = await Promise.all([
        tipoPromise, 
        dificultadPromise, 
        regionPromise, 
        estadoPromise
    ]).catch(err => {
         console.error(`Error al enriquecer ruta ${ruta.idRuta}:`, err);
         // Devolver nulos para que la ruta se muestre sin detalles
         return [null, null, null, null]; 
    });

    // Mapear los datos obtenidos de vuelta a la ruta
    const rutaEnriquecida: Ruta = {
        ...ruta,
        tipo: tipoRes?.data.nombre,
        dificultad: dificultadRes?.data.nombre,
        region: regionRes?.data.nombre,
        estado: estadoRes?.data.nombre,
    };

    return rutaEnriquecida;
}


// --- FUNCIONES API (Reemplazando localStorage) ---

/**
 * Obtiene todas las rutas registradas en la API.
 */
export async function obtenerRutas(): Promise<Ruta[]> {
    console.log("Iniciando petición principal a:", RUTAS_API_URL);
    
    // Petición 1: Obtener la lista inicial de rutas con IDs
    const response = await axios.get<Ruta[]>(RUTAS_API_URL);
    const rutasConFKs = response.data;

    if (!rutasConFKs || rutasConFKs.length === 0) {
        return [];
    }

    // Petición 2 a N: Enriquecer cada ruta en paralelo
    console.log(`Enriqueciendo ${rutasConFKs.length} rutas con peticiones N+1...`);
    const rutasEnriquecidas = await Promise.all(
        rutasConFKs.map(ruta => enriquecerRuta(ruta))
    );

    return rutasEnriquecidas;
}

export const obtenerRutaById = async (idRuta: number): Promise<Ruta> => {
    const response = await axios.get<Ruta>(`${RUTAS_API_URL}/${idRuta}`);
    const rutaEnriquecida = await enriquecerRuta(response.data);
    return rutaEnriquecida;
}

/**
 * Agrega una nueva ruta a la API.
 */
export const agregarRuta = async (ruta: Ruta): Promise<Ruta> => {
    const rutaParaEnviar: Partial<Ruta> = { ...ruta };
    // Omitir idRuta para que el backend lo genere
    delete (rutaParaEnviar as any).idRuta; 

    const response = await axios.post<Ruta>(RUTAS_API_URL, rutaParaEnviar);
    return response.data;
};

/**
 * Actualiza parcialmente una ruta existente por su ID (usando PATCH para el nombre como ejemplo).
 */
export const actualizarRutaNombre = async (idRuta: number, nombre: string): Promise<Ruta> => {
    // Nota: Usamos el endpoint específico que creaste: /{id}/nombre
    const response = await axios.patch<Ruta>(
        `${RUTAS_API_URL}/${idRuta}/nombre`, 
        nombre,
        { headers: { 'Content-Type': 'text/plain' } } // PATCH para strings usa text/plain
    );
    return response.data;
};

export const obtenerFotosByRutaId = async (idRuta: number): Promise<Fotos[]> => {
    const response = await axios.get<Fotos[]>(`${RUTAS_API_URL}/fotos/${idRuta}`);
    return response.data;
}

/**
 * Elimina una ruta por su ID (Usando el endpoint de borrar foto como referencia al 204).
 */
export const eliminarFoto = async (idFoto: number): Promise<void> => {
    // Usaremos el endpoint DELETE que ya definiste en tu controlador
    await axios.delete(`${RUTAS_API_URL}/${idFoto}/borrarFoto`);
};


export default {
    obtenerRutas,
    agregarRuta,
    actualizarRutaNombre,
    obtenerRutaById,
    obtenerFotosByRutaId,
    eliminarFoto,
};
