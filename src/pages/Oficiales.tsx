import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { obtenerRutas } from "../Ruta";
import type { Ruta } from "../Ruta";
import { obtenerFotosByRutaId } from "../Ruta";

/// Función para obtener la clase CSS del badge según la dificultad
const badgeClass = (dif?: String) => {
  switch (dif ? dif.toUpperCase() : "") {
    case "FACIL":
      return "badge bg-success";
    case "NORMAL":
      return "badge bg-warning text-dark";
    case "DIFICIL":
      return "badge bg-danger";
    case "EXTREMO":
      return "badge bg-danger";
  }
};

// Función para generar una cadena de estrellas según la calificación
const stars = (n: number | undefined) => {
  const v = Math.round(n || 0);
  return "★".repeat(v) + "☆".repeat(5 - v);
};

// Componente principal para mostrar las rutas oficiales
const RutasOficiales: React.FC = () => {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
        const cargarRutas = async () => {
            setCargando(true);
            setError("");
            
            try {
                // LLAMADA ASÍNCRONA a la nueva función API
                const data = await obtenerRutas();
                
                // Filtramos las rutas que tengan el nombre de TipoRuta como "OFICIAL"
                const rutasOficiales = data.filter(
                    (r) => r.tipo && r.tipo.toUpperCase() === "PRIVADA"
                );
                
                setRutas(rutasOficiales);

            } catch (err) {
                // Aquí se captura cualquier error de red o de la API
                console.error("Error al cargar rutas:", err);
                setError("Fallo de conexión o error en la API. Revisa la consola.");
            } finally {
                setCargando(false);
            }
        };

        cargarRutas();
    }, []); // El array vacío asegura que se ejecute solo al montar

    // --- Lógica de Renderizado de Estado ---

    if (cargando) {
        return (
            <div className="main-content container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando rutas oficiales desde la API...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-content container py-5 text-center text-danger">
                <h2>Error al obtener datos</h2>
                <p>{error}</p>
            </div>
        );
    }
    
    // --- Retorno principal del componente con datos ---
    return (
        <div className="main-content container py-4">
            <div className="text-center mb-4">
                <h1 className="display-5">Rutas Oficiales</h1>
                <h2 className="h5 text-secondary">Explora las rutas oficiales de Chile</h2>
                <br />
                <p>Las rutas oficiales son gestionadas por entidades reconocidas y ofrecen senderos bien mantenidos y señalizados.</p>
            </div>

            <div className="row g-4 justify-content-center">
                {rutas.length === 0 ? (
                    <div className="col-12 text-center">
                        <p className="text-muted">No se encontraron rutas oficiales en la API.</p>
                    </div>
                ) : (
                    // Mapeamos las rutas usando el diseño que tenías
                    rutas.map((r) => (
                        <div key={r.idRuta} className="ruta-full">
                            <Link 
                                to={`/rutas/oficiales/${r.idRuta}`} 
                                className="text-decoration-none" 
                                aria-label={`Ver detalle ${r.nombre}`}
                            >
                                {/* USANDO EL CAMPO 'IMAGEN' Y CHEQUEANDO QUE EXISTA */}
                                <img 
                                    className="ruta-img" 
                                    // La URL se construye usando el string Base64 del primer objeto 'foto'
                                    src={r.foto && r.foto[0] ? r.foto[0].imagen : "placeholder.jpg"} 
                                    alt={r.nombre} 
                                />
                            </Link>
                            <div className="ruta-body">
                                <h3>{r.nombre}</h3>
                                <p>
                                    {/* USANDO EL CAMPO 'NOMBRE' del objeto 'dificultad' */}
                                    Dificultad: <span className={badgeClass(r.dificultad)}>{r.dificultad}</span>
                                </p>
                                <p className="text-warning" aria-label={`${r.promCalificacion ?? 0} de 5 estrellas`}>
                                    {stars(r.promCalificacion)} <span className="text-muted">({((r.promCalificacion ?? 0)).toFixed(1)})</span>
                                </p>
                                <p>{r.descripcion}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="text-center mt-4">
                <Link to="/" className="btn btn-secondary">
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
};

export default RutasOficiales;

function setCargando(arg0: boolean) {
  throw new Error("Function not implemented.");
}
