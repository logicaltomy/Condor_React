/*
  RutaDetalle.tsx
  ----------------
  Página de detalle reutilizable para una "Ruta".

  Responsabilidades:
  - Leer parámetros de la URL (idRuta, tipo) con useParams()
  - Buscar la ruta correspondiente usando el helper obtenerRutas()
  - Renderizar un carrusel con fotos (si las hay)
  - Mostrar metadatos (dificultad, región, distancia, duración)
  - Mostrar descripción y un mapa embebido (embed público)
  - Manejar el caso "ruta no encontrada"

  Comentarios extensos dentro del archivo explican cada bloque.
*/

import React from "react";
import { useParams, Link } from "react-router-dom"; // useParams para leer :idRuta y :tipo de la URL
import { obtenerRutas } from "../Ruta"; // helper localStorage + seed
import type { Ruta } from "../Ruta"; // tipo TS para autocompletado y seguridad

// badgeClass: función auxiliar que recibe la dificultad y devuelve la clase CSS apropiada
// Se separa en una función para mantener el JSX limpio y fácil de probar.
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

/*
  formatTime: convierte segundos a una cadena legible.
  - si secs es undefined o 0, devuelve '-' (no disponible)
  - si hay horas (>0) devuelve 'H h M min'
  - si solo minutos, devuelve 'M min'
  Esto es utilizable en la UI para mostrar duración humana.
*/
const formatTime = (secs?: number) => {
  if (!secs) return "-";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
};

const RutaDetalle: React.FC = () => {
  /*
    1) Leer parámetros de la URL:
       - idRuta: identificador único de la ruta (ej: 'cerro-renca')
       - tipo: cadena que indica si viene de 'oficiales' o 'comunitarias',
         la usamos para construir el link de 'volver'.
  */
  const { idRuta, tipo } = useParams();

  /*
    2) Obtener todas las rutas disponibles. `obtenerRutas()` devuelve
       el contenido de localStorage o el seed DEFAULT_RUTAS si no hay datos.
       Este enfoque hace que la página funcione sin backend.
  */
  const rutas = obtenerRutas();

  /*
    3) Buscar la ruta cuyo `idRuta` coincida con el parámetro.
       - Si no existe, renderizamos una respuesta amable "Ruta no encontrada".
  */
  const ruta = rutas.find((r) => r.idRuta === idRuta);

  if (!ruta) {
    return (
      <div className="main-content container py-4">
        <h2>Ruta no encontrada</h2>
        <p>No se encontró la ruta solicitada.</p>
        <Link to={tipo === "comunitarias" ? "/comunitarias" : "/oficiales"} className="btn btn-secondary">Volver</Link>
      </div>
    );
  }

  /*
    4) Preparar datos para render:
       - fotos: array con imágenes; si no hay fotos, usamos un placeholder local.
       - volverTo: construye la ruta de regreso (directorio original: oficiales o comunitarias)
       - mapQuery: texto que usaremos en el embed público de Google Maps.
  */
  const fotos = ruta.foto && ruta.foto.length ? ruta.foto : ["/src/img/card-image.jpg"];
  const volverTo = tipo === "comunitarias" ? "/comunitarias" : "/oficiales";
  const mapQuery = encodeURIComponent(ruta.nombre + (ruta.region ? ` ${ruta.region}` : ""));

  return (
    <div className="main-content">
      <div className="container py-4">
        {/*
           Hero carousel
           - Usamos el markup de Bootstrap para el carrusel (ya incluido en el proyecto)
           - Iteramos `fotos` y hacemos el primer elemento `active` para que arranque mostrado
           - Las imágenes usan la clase global `carousel-img` para mantener styles coherentes
        */}
        <div id="carouselRutaDetalle" className="carousel slide carousel-fade mb-4" data-bs-ride="carousel">
          <div className="carousel-inner">
            {fotos.map((src, idx) => (
              <div key={idx} className={`carousel-item ${idx === 0 ? "active" : ""}`}>
                <img src={src} className="d-block w-100 carousel-img" alt={`${ruta.nombre} - ${idx + 1}`} />
              </div>
            ))}
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselRutaDetalle" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselRutaDetalle" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>

  {/* Link de regreso */}
  <a className="btn btn-light btn-volver mb-3" href={volverTo}>← Volver</a>

        {/*
           Panel principal con información de la ruta
           - Header: título, badges (dificultad y región) y rating visual
           - Meta: distancia, duración y fecha (simplificada)
           - Descripción: texto libre que viene del modelo
           - Mapa: iframe público embebido (q=...&output=embed)
        */}
        <article className="panel bg-white p-4 rounded shadow-sm">
          <header className="panel-head mb-3">
            {/* Título de la ruta */}
            <h1 className="ruta-titulo">{ruta.nombre}</h1>

            {/*
               Row compacto con:
               - Badge de dificultad (color según dificultad)
               - Badge de región (si está presente)
               - A la derecha, renderizado visual de estrellas y la nota numérica
            */}
            <div className="d-flex gap-2 align-items-center mb-2">
              <span className={badgeClass(ruta.dificultad)}>{ruta.dificultad}</span>
              <span className="badge bg-secondary">{ruta.region ?? "-"}</span>

              {/* Estrellas: repetimos '★' según la calificación redondeada */}
              <div className="ms-auto text-warning" aria-label={`${ruta.promCalificacion ?? 0} de 5 estrellas`}>
                {'★'.repeat(Math.round(ruta.promCalificacion ?? 0))}{'☆'.repeat(5 - Math.round(ruta.promCalificacion ?? 0))}
                <small className="text-muted ms-2">({(ruta.promCalificacion ?? 0).toFixed(1)})</small>
              </div>
            </div>
          </header>

          {/* Meta: datos clave de la ruta en formato compacto */}
          <section className="panel-meta d-flex flex-wrap gap-3 mb-3">
            <div className="meta-item">Distancia: <strong>{ruta.distancia ?? '-'} km</strong></div>
            <div className="meta-item">Duración: <strong>{formatTime(ruta.tiempoSegundos)}</strong></div>
            {/* Fecha: simplificada con toLocaleDateString para no complicarnos */}
            <div className="meta-item">Publicado: <strong>{new Date(ruta.f_public).toLocaleDateString()}</strong></div>
          </section>

          {/* Descripción larga de la ruta */}
          <section className="panel-desc mb-4">
            <h2>Descripción</h2>
            <p>{ruta.descripcion}</p>
          </section>

          {/* Mapa embebido: usamos el endpoint público de Google Maps (q=...&output=embed)
              - Ventaja: no requiere clave API
              - Limitación: menos control / personalización que la API
          */}
          <section className="panel-desc mb-4 text-center">
            <h2>Lugar de inicio</h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <iframe
                className="iframe"
                title={`mapa-${ruta.idRuta}`}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                width="600"
                height="360"
                style={{ border: 0, maxWidth: '100%' }}
                loading="lazy"
              />
            </div>
          </section>
        </article>
      </div>
    </div>
  );
};

export default RutaDetalle;
