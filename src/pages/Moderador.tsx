import React, { useEffect, useState } from 'react';
import contactoService from '../services/contactoService';
import Notification from '../components/Notification';
import { extractErrorMessage } from '../services/apiClient';

type Contacto = {
  id: number;
  nombre: string;
  correo: string;
  mensaje: string;
  fCreacion?: string;
  respuesta?: string;
  resuelto?: boolean;
};

const Moderador: React.FC = () => {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<{ type: 'success'|'danger'|'info', message: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [respuesta, setRespuesta] = useState('');
  const [respuestaError, setRespuestaError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const resp: any = await contactoService.listarContactos();
      setContactos(resp.data || []);
    } catch (err: any) {
      setNotif({ type: 'danger', message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar este mensaje? Esta acción no se puede deshacer.')) return;
    try {
      await contactoService.eliminarContacto(id);
      setNotif({ type: 'success', message: 'Mensaje eliminado.' });
      load();
    } catch (err: any) {
      setNotif({ type: 'danger', message: extractErrorMessage(err) });
    }
  };

  const handleResponder = (c: Contacto) => {
    setEditingId(c.id);
    setRespuesta(c.respuesta ?? '');
    setRespuestaError(null);
  };

  const handleGuardarRespuesta = async (id: number) => {
    // Validar respuesta: al menos 3 caracteres y máximo 300
    const r = respuesta.trim();
    if (r.length < 3) { setRespuestaError('La respuesta es muy corta (mínimo 3 caracteres).'); return; }
    if (r.length > 300) { setRespuestaError('La respuesta no puede exceder 300 caracteres.'); return; }
    try {
      await contactoService.actualizarContacto(id, { respuesta: r, resuelto: true });
      setNotif({ type: 'success', message: 'Respuesta guardada y marcado como resuelto.' });
      setEditingId(null);
      setRespuesta('');
      setRespuestaError(null);
      load();
    } catch (err: any) {
      setNotif({ type: 'danger', message: extractErrorMessage(err) });
    }
  };

  return (
    <div className="main-content container py-4">
      <h1>Panel de Moderador - Mensajes de Contacto</h1>
      {notif && <Notification type={notif.type} message={notif.message} onClose={() => setNotif(null)} />}
      {loading && <div>Cargando mensajes...</div>}
      {!loading && (
        <div className="list-group">
          {contactos.length === 0 && <div className="text-muted">No hay mensajes.</div>}
          {contactos.map(c => (
            <div key={c.id} className="list-group-item">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{c.nombre}</strong> — <small>{c.correo}</small>
                  <div style={{ marginTop: 8, maxWidth: '100%', maxHeight: 160, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }} title={c.mensaje}>{c.mensaje}</div>
                  {c.respuesta && (
                    <div className="alert alert-secondary" style={{ marginTop: 8 }}>
                      <strong>Respuesta:</strong>
                      <div style={{ maxWidth: '100%', maxHeight: 120, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }} title={c.respuesta}>{c.respuesta}</div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleResponder(c)}>Responder</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(c.id)}>Eliminar</button>
                </div>
              </div>

              {editingId === c.id && (
                <div style={{ marginTop: 8 }}>
                  <textarea className="form-control" rows={4} value={respuesta} onChange={e => { const v = e.target.value; setRespuesta(v); const vt = v.trim(); if (vt.length < 3) setRespuestaError('La respuesta es muy corta (mínimo 3 caracteres).'); else if (vt.length > 300) setRespuestaError('La respuesta no puede exceder 300 caracteres.'); else setRespuestaError(null); }} />
                  {respuestaError && <p className="text-danger mt-1">{respuestaError}</p>}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleGuardarRespuesta(c.id)} disabled={!!respuestaError || respuesta.trim().length===0}>Guardar y marcar resuelto</button>
                    <button className="btn btn-sm btn-light" onClick={() => { setEditingId(null); setRespuesta(''); setRespuestaError(null); }}>Cancelar</button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Moderador;
