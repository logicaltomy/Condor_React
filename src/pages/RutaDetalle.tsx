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

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // useParams para leer :idRuta y :tipo de la URL
import rutaService from '../services/rutaService';
import type { RutaDto } from '../services/rutaService';
import { extractErrorMessage } from '../services/apiClient';

// badgeClass: devuelve la clase CSS apropiada según la dificultad (case-insensitive)
const badgeClass = (dif?: string) => {
  if (!dif) return 'badge bg-secondary';
  const d = String(dif).toUpperCase();
  if (d.includes('FACIL') || d === 'FACIL') return 'badge bg-success';
  if (d.includes('MODERADO') || d.includes('NORMAL')) return 'badge bg-warning text-dark';
  if (d.includes('DIFICIL') || d.includes('EXTREMO')) return 'badge bg-danger';
  return 'badge bg-secondary';
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

const formatDate = (val?: any) => {
  if (!val) return '-';
  // If it's a string or number, try direct parsing
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toLocaleDateString();
  }
  // If backend returned a Java LocalDateTime-like object (year, monthValue, dayOfMonth, hour, minute, second)
  if (typeof val === 'object') {
    const y = (val.year ?? val.Y ?? val.y) as number | undefined;
    const m = (val.monthValue ?? val.month ?? val.M ?? val.m) as number | undefined;
    const day = (val.dayOfMonth ?? val.day ?? val.d) as number | undefined;
    const hour = (val.hour ?? val.H ?? 0) as number | undefined;
    const minute = (val.minute ?? val.min ?? 0) as number | undefined;
    const second = (val.second ?? val.s ?? 0) as number | undefined;
    if (y && m && day) {
      const d = new Date(y, m - 1, day, hour ?? 0, minute ?? 0, second ?? 0);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    }
    // If it's an object containing an ISO string
    if (val.toString) {
      const s = String(val);
      const d2 = new Date(s);
      if (!isNaN(d2.getTime())) return d2.toLocaleDateString();
    }
  }
  return '-';
};

const RutaDetalle: React.FC = () => {
  /*
    1) Leer parámetros de la URL:
       - idRuta: identificador único de la ruta (ej: 'cerro-renca')
       - tipo: cadena que indica si viene de 'oficiales' o 'comunitarias',
         la usamos para construir el link de 'volver'.
  */
  const { idRuta, tipo } = useParams();
  const [ruta, setRuta] = useState<RutaDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!idRuta) {
      setError('Ruta no válida');
      setLoading(false);
      return;
    }
    setLoading(true);
    rutaService.getRutaById(Number(idRuta))
      .then(res => { if (!mounted) return; setRuta(res.data); })
      .catch(err => { if (!mounted) return; setError(extractErrorMessage(err)); })
      .finally(() => { if (!mounted) return; setLoading(false); });
    return () => { mounted = false; };
  }, [idRuta]);

  if (loading) {
    return (
      <div className="main-content container py-4">Cargando...</div>
    );
  }

  if (error || !ruta) {
    return (
      <div className="main-content container py-4">
        <h2>Ruta no encontrada</h2>
        <p>{error || 'No se encontró la ruta solicitada.'}</p>
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
              <span className={badgeClass(ruta.dificultad)}>{ruta.dificultad ?? '-'}</span>
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
            <div className="meta-item">Duración: <strong>{formatTime((ruta as any).tiempo_segundos ?? (ruta as any).tiempoSegundos ?? (ruta as any).tiempo)}</strong></div>
            {/* Fecha: simplificada con toLocaleDateString para no complicarnos */}
            <div className="meta-item">Publicado: <strong>{formatDate((ruta as any).f_public ?? (ruta as any).fecha_publicacion ?? (ruta as any).fecha)}</strong></div>
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
