import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import rutaService from "../services/rutaService";
import type { RutaDto } from "../services/rutaService";
import { extractErrorMessage } from '../services/apiClient';
import Notification from "../components/Notification";

const badgeClass = (dif?: string) => {
  switch (dif) {
    case "FACIL":
      return "badge bg-success";
    case "MODERADO":
    case "NORMAL":
      return "badge bg-warning text-dark";
    case "DIFICIL":
    case "EXTREMO":
      return "badge bg-danger";
    default:
      return "badge bg-secondary";
  }
};

const RutasComunitarias: React.FC = () => {
  const [rutas, setRutas] = useState<RutaDto[]>([]);
  const [loading, setLoading] = useState(true);
  // tipos catalog loaded transiently for filtering
  const [notif, setNotif] = useState<{ type: 'success'|'danger'|'info', message: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([rutaService.getAllTipos(), rutaService.getAllRutas()])
      .then(async ([tRes, rRes]) => {
        if (!mounted) return;
        const tiposList = tRes.data || [];
        const all: RutaDto[] = rRes.data || [];
        // Try to map by id_tipo using catalog; fallback to string 'tipo' matching
        const comunitariaTipo = tiposList.find((x: { id_tipo?: number; nombre?: string }) => ((x.nombre || '').toString().toUpperCase() === 'COMUNITARIA' || (x.nombre || '').toString().toUpperCase() === 'PUBLICA'));
        let comunitarias: RutaDto[] = [];
        if (comunitariaTipo && comunitariaTipo.id_tipo) {
          comunitarias = all.filter(r => Number(r.id_tipo) === Number(comunitariaTipo.id_tipo) && (r.activo ?? true));
        } else {
          comunitarias = all.filter(r => (r.tipo || '').toUpperCase() === 'COMUNITARIA' && (r.activo ?? true));
        }

        // backend now returns foto URLs in the ruta response (ruta.foto), so use them directly
        setRutas(comunitarias);
      })
      .catch(err => {
        const m = extractErrorMessage(err);
        setNotif({ type: 'danger', message: m });
      })
      .finally(() => setLoading(false));

    return () => { mounted = false; };
  }, []);

  const rutaItems = !loading ? rutas.map((r, i) => {
    const key = r.idRuta !== undefined && r.idRuta !== null ? String(r.idRuta) : `r-${i}`;
    const src = r.foto && r.foto.length > 0 ? r.foto[0] : null;
    return (
      <div key={key} className="ruta-full">
        <Link to={`/rutas/comunitarias/${r.idRuta}`} className="text-decoration-none" aria-label={`Ver detalle ${r.nombre}`}>
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
        <h1 className="display-5">Rutas Comunitarias</h1>
        <h2 className="h5 text-secondary">Explora las rutas comunitarias de la comunidad</h2>
        <br />
        <p>Las rutas comunitarias son creadas y mantenidas por la comunidad local, ofreciendo experiencias auténticas y únicas.</p>
      </div>

      {notif && <Notification type={notif.type} message={notif.message} onClose={() => setNotif(null)} />}

      <div className="row g-4 justify-content-center">
        {loading && <div>Cargando rutas...</div>}
        {!loading && rutaItems}
      </div>

      <div className="text-center mt-4">
        <Link to="/" className="btn btn-secondary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default RutasComunitarias;
