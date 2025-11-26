import React, { useEffect, useState } from 'react';
import { extractErrorMessage } from '../services/apiClient';

interface AuditLog {
  id?: number;
  usuario?: string;
  accion?: string;
  entidad?: string;
  fecha?: string;
  detalles?: string;
}

const Auditoria: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        // Intentamos llamar a un endpoint de auditoría si existe.
        const resp = await fetch('/api/v1/auditoria/logs');
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(extractErrorMessage(err) || err?.message || 'No fue posible obtener logs de auditoría.');
        setLogs(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Auditoría</h2>
      <p className="text-muted">Zona accesible para moderadores: registros de acciones del sistema.</p>

      {loading && <div>Cargando registros...</div>}
      {error && (
        <div className="alert alert-warning">
          <strong>No se encontraron logs:</strong> {error}
          <div className="mt-2">Si esperabas ver datos, asegúrate de que exista un endpoint de auditoría en el backend en <code>/api/v1/auditoria/logs</code>.</div>
        </div>
      )}

      {!loading && !error && logs && (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Entidad</th>
                <th>Fecha</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={6}>No hay registros de auditoría disponibles.</td></tr>
              )}
              {logs.map((l, idx) => (
                <tr key={l.id ?? idx}>
                  <td>{l.id}</td>
                  <td>{l.usuario}</td>
                  <td>{l.accion}</td>
                  <td>{l.entidad}</td>
                  <td>{l.fecha}</td>
                  <td style={{maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={l.detalles}>{l.detalles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Auditoria;
