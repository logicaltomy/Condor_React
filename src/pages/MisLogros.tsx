import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logrosService from '../services/logrosService';
// Notifications removed for trofeos to avoid invasive messages; failures are logged silently.

const MisLogros: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [logros, setLogros] = useState<any[]>([]);
  // no notif state for silent failures

  const getUsuarioId = () => {
    try {
      const raw = localStorage.getItem('usuarioActual') || localStorage.getItem('usuarioDTO');
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u?.id ?? u?.idUsuario ?? u?.id_usuario ?? u?.idRol ? u?.id : null;
    } catch { return null; }
  };

  const generarTextoPreview = (template: string, restriccion: any) => {
    if (!template) return '';
    const num = (restriccion !== undefined && restriccion !== null) ? String(restriccion) : '';
    if (template.includes('(n)')) return template.replace('(n)', num);
    const replaced = template.replace(/\d+/, num);
    if (replaced !== template) return replaced;
    return `${template} ${num}`.trim();
  };

  const load = () => {
    const id = getUsuarioId();
    if (!id) {
      // No user in session - don't show invasive notification, leave list empty
      console.warn('MisLogros: no user in session');
      return;
    }
    setLoading(true);
    logrosService.obtenerTrofeosPorUsuario(id)
      .then((res: any) => setLogros(res || []))
      .catch((err: any) => {
        console.warn('No se pudieron cargar los logros:', err?.message || err);
        setLogros([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="main-content container py-4">
      <h1>Mis logros</h1>
      {/* Notifications for trofeos removed to avoid invasive alerts */}

      <div style={{ margin: '12px 0' }}>
        <Link to="/perfil" className="btn btn-link">← Volver al perfil</Link>
        <button className="btn btn-condor" style={{ marginLeft: 8 }} onClick={load}>Recargar</button>
      </div>

      {loading && <div>Cargando...</div>}

      {!loading && logros.length === 0 && (
        <div className="card p-3">No se encontraron logros obtenidos.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {logros.map(lg => (
          <div key={lg.idTrofeo || lg.idLogro} className="card p-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 16 }}>{lg.nombre}</strong>
                <div style={{ color: '#555' }}>{lg.descripcion}</div>
                <div style={{ marginTop: 6, fontStyle: 'italic' }}>{generarTextoPreview(String(lg.condicion_template || lg.condicion || ''), lg.restriccion)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MisLogros;
