import React from "react";
import { Link } from "react-router-dom";
import { obtenerRutas } from "../Ruta";
import type { Ruta } from "../Ruta";

/// Función para obtener la clase CSS del badge según la dificultad
const badgeClass = (dif: Ruta["dificultad"]) => {
  switch (dif) {
    case "FACIL":
      return "badge bg-success";
    case "MODERADO":
    case "NORMAL":
      return "badge bg-warning text-dark";
    case "DIFICIL":
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
  const rutas = obtenerRutas().filter((r) => r.tipo === "OFICIAL");

  // Retorno del componente con la estructura JSX
  return (
    <div className="main-content container py-4">
      <div className="text-center mb-4">
        <h1 className="display-5">Rutas Oficiales</h1>
        <h2 className="h5 text-secondary">Explora las rutas oficiales de Chile</h2>
        <br />
        <p>Las rutas oficiales son gestionadas por entidades reconocidas y ofrecen senderos bien mantenidos y señalizados.</p>
      </div>

      <div className="row g-4 justify-content-center">
        {(() => {
          // Construimos un array de elementos usando un for para permitir
          const elementos: React.ReactElement[] = [];
          // Recorremos las rutas oficiales
          for (const r of rutas) {
            elementos.push(
              <div key={r.idRuta} className="ruta-full">
                <Link to={`/rutas/oficiales/${r.idRuta}`} className="text-decoration-none" aria-label={`Ver detalle ${r.nombre}`}>
                  <img className="ruta-img" src={r.foto[0]} alt={r.nombre} />
                </Link>
                <div className="ruta-body">
                  <h3>{r.nombre}</h3>
                  <p>
                    Dificultad: <span className={badgeClass(r.dificultad)}>{r.dificultad}</span>
                  </p>
                  <p className="text-warning" aria-label={`${r.promCalificacion ?? 0} de 5 estrellas`}>
                    {stars(r.promCalificacion)} <span className="text-muted">({((r.promCalificacion ?? 0) as number).toFixed(1)})</span>
                  </p>
                  <p>{r.descripcion}</p>
                </div>
              </div>
            );
          }
          return elementos;
        })()}
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
