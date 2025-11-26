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
import calificacionesService from '../services/calificacionesService';

// badgeClass: devuelve la clase CSS apropiada según la dificultad (case-insensitive)
const badgeClass = (dif?: string) => {
  if (!dif) return 'badge bg-secondary';
  const d = String(dif).toUpperCase();
  if (d.includes('FACIL') || d === 'FACIL') return 'badge bg-success';
  if (d.includes('MODERADO') || d.includes('NORMAL')) return 'badge bg-warning text-dark';
  if (d.includes('DIFICIL') || d.includes('EXTREMO')) return 'badge bg-danger';
  return 'badge bg-secondary';
};

const renderStars = (avg?: number | null) => {
  const raw = typeof avg === 'number' ? avg : Number(avg ?? 0);
  const filled = Math.min(5, Math.max(0, Math.floor(raw || 0))); // ignorar decimales
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
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
  const [ruta, setRuta] = useState<RutaDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [puedeCalificar, setPuedeCalificar] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [puntuacion, setPuntuacion] = useState<number>(5);
  const [comentario, setComentario] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [totalCalificaciones, setTotalCalificaciones] = useState<number>(0);
  const fetchPromedioRuta = React.useCallback((rutaId: number) => {
    if (!rutaId) return;
    calificacionesService.promedioPorRuta(rutaId)
      .then(resp => {
        if (!resp.data) {
          setTotalCalificaciones(0);
          setRuta(prev => prev ? { ...prev, promCalificacion: 0 } : prev);
          return;
        }
        const promedio = Number(resp.data.promedio ?? resp.data.promedio_calificacion ?? 0);
        const conteo = Number(resp.data.conteo ?? 0);
        setRuta(prev => prev ? { ...prev, promCalificacion: Number.isNaN(promedio) ? 0 : promedio } : prev);
        setTotalCalificaciones(Number.isNaN(conteo) ? 0 : conteo);
      })
      .catch(() => {
        setTotalCalificaciones(0);
      });
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!idRuta) {
      setError('Ruta no válida');
      setLoading(false);
      return;
    }
    setLoading(true);
    rutaService.getRutaById(Number(idRuta))
      .then(res => {
        if (!mounted) return;
        setRuta(res.data);
        fetchPromedioRuta(Number(idRuta));
      })
      .catch(err => { if (!mounted) return; setError(extractErrorMessage(err)); })
      .finally(() => { if (!mounted) return; setLoading(false); });
    return () => { mounted = false; };
  }, [idRuta, fetchPromedioRuta]);

  const promedioParaMostrar = ruta?.promCalificacion ?? 0;

  // Obtener id de usuario desde localStorage y comprobar si ya calificó
  useEffect(() => {
    const raw = localStorage.getItem('usuarioDTO') || localStorage.getItem('usuarioActual');
    let id: number | null = null;
    try {
      if (!raw) {
        id = null;
      } else {
        const parsed = JSON.parse(raw);
        id = parsed?.id ?? parsed?.idUsuario ?? parsed?.id_usuario ?? null;
      }
    } catch {
      id = null;
    }
    setUsuarioId(id);

    if (id && idRuta) {
      calificacionesService.existeCalificacion(id, Number(idRuta))
        .then(r => {
          const existe = r.data?.existe === true;
          setPuedeCalificar(!existe);
        })
        .catch(() => {
          // si falla la comprobación, permitimos intentar calificar y manejamos errores al enviar
          setPuedeCalificar(true);
        });
    }
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

              {/* Estrellas: solo se consideran los enteros hacia abajo */}
              <div className="ms-auto text-warning" aria-label={`${Math.floor(promedioParaMostrar ?? 0)} de 5 estrellas`}>
                {renderStars(promedioParaMostrar)}
                <small className="text-muted ms-2">
                  {totalCalificaciones > 0
                    ? `${(promedioParaMostrar ?? 0).toFixed(1)} · ${totalCalificaciones} ${totalCalificaciones === 1 ? 'calificación' : 'calificaciones'}`
                    : 'Sin calificaciones aún'}
                </small>
              </div>
              <div className="ms-3">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowModal(true)}
                  disabled={!usuarioId || !puedeCalificar}
                  title={!usuarioId ? 'Inicia sesión para calificar' : (!puedeCalificar ? 'Ya calificaste esta ruta' : 'Calificar esta ruta')}
                >
                  Calificar ruta
                </button>
              </div>
            </div>
          </header>

          {/* Meta: datos clave de la ruta en formato compacto */}
          <section className="panel-meta d-flex flex-wrap gap-3 mb-3">
            <div className="meta-item">Distancia: <strong>{ruta.distancia ?? '-'} km</strong></div>
            <div className="meta-item">Duración: <strong>{formatTime((ruta as any).tiempo_segundos ?? (ruta as any).tiempoSegundos ?? (ruta as any).tiempo)}</strong></div>
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

        {/* Modal simple de calificación */}
        {showModal && (
          <>
            <div className="modal-backdrop fade show" style={{ position: 'fixed', inset: 0, zIndex: 1050 }} />
            <div className="modal d-block" tabIndex={-1} role="dialog" style={{ zIndex: 1060 }}>
              <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Calificar ruta</h5>
                    <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setShowModal(false)} />
                  </div>
                  <div className="modal-body">
                    <p>Selecciona la calificación (1-5 estrellas):</p>
                    <div className="d-flex gap-2 mb-3">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} className={`btn ${s <= puntuacion ? 'btn-warning' : 'btn-outline-secondary'}`} onClick={() => setPuntuacion(s)}>
                          {s} ★
                        </button>
                      ))}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Comentario (opcional)</label>
                      <textarea className="form-control" value={comentario} onChange={e => setComentario(e.target.value)} maxLength={120} />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>Cancelar</button>
                    <button type="button" className="btn btn-primary" onClick={async () => {
                      if (!usuarioId) return alert('Inicia sesión para calificar');
                      setSubmitting(true);
                      try {
                        const payload = { idUsuario: usuarioId, idRuta: Number(idRuta), puntuacion, comentario };
                        const resp = await calificacionesService.crearCalificacion(payload);
                        const prom = resp.data?.promedio ?? null;
                        const conteo = resp.data?.conteo ?? null;
                        if (prom !== null) {
                          setRuta(prev => prev ? { ...prev, promCalificacion: Number(prom) } : prev);
                        }
                        if (conteo !== null) {
                          setTotalCalificaciones(Number(conteo));
                        }
                        setPuedeCalificar(false);
                        setShowModal(false);
                      } catch (err: any) {
                        const msg = extractErrorMessage(err);
                        alert(msg || 'Error al enviar calificación');
                        if (err?.response?.status === 409) setPuedeCalificar(false);
                      } finally {
                        setSubmitting(false);
                      }
                    }} disabled={submitting}>
                      {submitting ? 'Enviando...' : 'Enviar calificación'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RutaDetalle;
