import React from "react";
import { Link } from "react-router-dom";
import rutaService from "../services/rutaService";
import type { RutaDto } from "../services/rutaService";
import { extractErrorMessage } from '../services/apiClient';
import { useEffect, useState } from 'react';

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

// Componente principal para mostrar las rutas oficiales
const RutasOficiales: React.FC = () => {
  const [rutas, setRutas] = useState<RutaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([rutaService.getAllTipos(), rutaService.getAllRutas()])
      .then(async ([tRes, rRes]) => {
        if (!mounted) return;
        const tiposList = tRes.data || [];
        const all = rRes.data || [];
        const oficialTipo = tiposList.find((x: { id_tipo?: number; nombre?: string }) => ((x.nombre || '').toString().toUpperCase() === 'OFICIAL' || (x.nombre || '').toString().toUpperCase() === 'PRIVADA'));
        let oficiales: RutaDto[] = [];
        if (oficialTipo && oficialTipo.id_tipo) {
          oficiales = all.filter((r: RutaDto) => Number(r.id_tipo) === Number(oficialTipo.id_tipo) && (r.activo ?? true));
        } else {
          oficiales = (all || []).filter((r: RutaDto) => (r.tipo || '').toUpperCase() === 'OFICIAL' && (r.activo ?? true));
        }

        // backend returns foto URLs inside the ruta response now; use them directly
        setRutas(oficiales);
      })
      .catch(err => { if (!mounted) return; setError(extractErrorMessage(err)); })
      .finally(() => { if (!mounted) return; setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const rutaItems = !loading && !error ? rutas.map((r, i) => {
    const key = r.idRuta !== undefined && r.idRuta !== null ? String(r.idRuta) : `r-${i}`;
    const src = r.foto && r.foto.length > 0 ? r.foto[0] : null;
    return (
      <div key={key} className="ruta-full">
        <Link to={`/rutas/oficiales/${r.idRuta}`} className="text-decoration-none" aria-label={`Ver detalle ${r.nombre}`}>
          {src ? <img className="ruta-img" src={src} alt={r.nombre} /> : null}
        </Link>
        <div className="ruta-body">
          <h3>{r.nombre}</h3>
          <p>
            Dificultad: <span className={badgeClass(r.dificultad)}>{r.dificultad}</span>
          </p>
          <p>
            Distancia: <strong>{r.distancia !== undefined && r.distancia !== null ? `${Number(r.distancia).toFixed(2)} km` : 'N/D'}</strong>
          </p>
          <p>{r.descripcion}</p>
        </div>
      </div>
    );
  }) : null;

  return (
    <div className="main-content container py-4">
      <div className="text-center mb-4">
        <h1 className="display-5">Rutas Oficiales</h1>
        <h2 className="h5 text-secondary">Explora las rutas oficiales de Chile</h2>
        <br />
        <p>Las rutas oficiales son gestionadas por entidades reconocidas y ofrecen senderos bien mantenidos y señalizados.</p>
      </div>

      <div className="row g-4 justify-content-center">
        {loading && <div>Cargando rutas...</div>}
        {!loading && error && <div className="text-danger">{error}</div>}
        {!loading && !error && rutaItems}
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
