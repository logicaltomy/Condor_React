import React, { useEffect, useState } from 'react';
import rutaService from '../services/rutaService';
import type { RutaDto } from '../services/rutaService';
import Notification from '../components/Notification';
import { extractErrorMessage } from '../services/apiClient';
import RouteForm from '../components/RouteForm';

const AdminPanel: React.FC = () => {
  const [rutas, setRutas] = useState<RutaDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<{ type: 'success'|'danger'|'info', message: string } | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RutaDto | null>(null);

  const load = () => {
    setLoading(true);
    rutaService.getAllRutas()
      .then(res => setRutas(res.data || []))
      .catch(err => setNotif({ type: 'danger', message: extractErrorMessage(err) }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = () => {
    setEditing(null);
    setShowForm(true);
  };



  const handleEdit = (r: RutaDto) => {
    setEditing(r);
    setShowForm(true);
  };

  const handleDelete = (r: RutaDto) => {
    if (!r?.idRuta) return;
    if (!window.confirm(`¿Eliminar la ruta "${r.nombre}"? Esta acción es irreversible.`)) return;
    rutaService.deleteRuta(r.idRuta)
      .then(() => {
        setNotif({ type: 'success', message: 'Ruta eliminada.' });
        // quitar de la lista localmente
        setRutas(prev => prev.filter(x => x.idRuta !== r.idRuta));
      })
      .catch(err => setNotif({ type: 'danger', message: err?.response?.data?.message || err?.message || 'Error al eliminar ruta' }));
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleFormSaved = () => {
    setShowForm(false);
    setEditing(null);
    setNotif({ type: 'success', message: 'Cambios guardados.' });
    load();
  };

  return (
    <div className="main-content container py-4">
      <h1>Panel de Administrador - Gestión de Rutas</h1>
      {notif && <Notification type={notif.type} message={notif.message} onClose={() => setNotif(null)} />}
      <div className="mb-3">
        <label>Crear / Editar rutas</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={handleCreate}>Nuevo formulario</button>
        </div>
      </div>

      {showForm && (
        <RouteForm initial={editing ?? undefined} onCancel={handleFormCancel} onSaved={handleFormSaved} />
      )}

      {loading && <div>Cargando...</div>}
      {!loading && (
        <div className="row g-3">
          {rutas.map((r, i) => {
            const key = r.idRuta !== undefined && r.idRuta !== null ? String(r.idRuta) : `r-${i}`;
            const src = r.foto && r.foto.length > 0 ? r.foto[0] : null;
            return (
              <div key={key} className="col-12 col-md-8 mx-auto">
                <div className="card admin-card">
                  {src ? <img src={src} className="card-img-top" alt={r.nombre} /> : null}
                  <div className="card-body">
                    <h5 className="card-title">{r.nombre}</h5>
                    <p>{r.descripcion}</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(r)}>Editar</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r)}>Eliminar</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
