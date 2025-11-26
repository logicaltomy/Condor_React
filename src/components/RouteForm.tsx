import React, { useState, useEffect } from 'react';
import type { RutaDto } from '../services/rutaService';
import rutaService from '../services/rutaService';
import usuarioService from '../services/usuarioService';
import { extractErrorMessage } from '../services/apiClient';
import Notification from './Notification';

type Props = {
  initial?: RutaDto;
  onCancel: () => void;
  onSaved: () => void;
};

const RouteForm: React.FC<Props> = ({ initial, onCancel, onSaved }) => {
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? '');
  // store selected IDs for backend (id_dificultad, id_tipo, id_region, id_estado)
  const [idDificultad, setIdDificultad] = useState<number | undefined>(undefined);
  const [idTipo, setIdTipo] = useState<number | undefined>(undefined);
  const [idRegion, setIdRegion] = useState<number | undefined>(undefined);
  const [idEstado, setIdEstado] = useState<number | undefined>(undefined);
  const [fotos, setFotos] = useState<string[]>(initial?.foto ?? []);
  const [fotoInput, setFotoInput] = useState('');
  const initialDurationMinutes = initial && ((initial.tiempo_segundos as any) || (initial as any).tiempoSegundos) ? Math.round(((initial.tiempo_segundos as any) || (initial as any).tiempoSegundos) / 60) : undefined;
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>(initialDurationMinutes);
  const [activo, setActivo] = useState<boolean>(initial?.activo ?? true);
  const [dificultades, setDificultades] = useState<Array<any>>([]);
  const [tipos, setTipos] = useState<Array<any>>([]);
  const [regiones, setRegiones] = useState<Array<any>>([]);
  const [estados, setEstados] = useState<Array<any>>([]);
  const [notif, setNotif] = useState<{ type: 'success'|'danger'|'info', message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const addFoto = () => {
    const url = fotoInput.trim();
    if (!url) return;
    setFotos(prev => [...prev, url]);
    setFotoInput('');
  };

  const removeFoto = (idx: number) => {
    setFotos(prev => prev.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    // load catalogs
    rutaService.getAllDificultades().then(res => setDificultades(res.data || [])).catch(() => {});
    rutaService.getAllTipos().then(res => setTipos(res.data || [])).catch(() => {});
    usuarioService.getRegiones().then(res => setRegiones(res.data || [])).catch(() => {});
    usuarioService.getEstados().then(res => setEstados(res.data || [])).catch(() => {});

    // try to initialize ids from initial if provided
    if (initial) {
      // common possible property names
      const id_tipo = (initial as any).id_tipo ?? (initial as any).idTipo ?? undefined;
      const id_dificultad = (initial as any).id_dificultad ?? (initial as any).idDificultad ?? undefined;
      const id_region = (initial as any).id_region ?? (initial as any).idRegion ?? undefined;
      const id_estado = (initial as any).id_estado ?? (initial as any).idEstado ?? undefined;
      if (id_tipo) setIdTipo(Number(id_tipo));
      if (id_dificultad) setIdDificultad(Number(id_dificultad));
      if (id_region) setIdRegion(Number(id_region));
      if (id_estado) setIdEstado(Number(id_estado));
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!nombre.trim()) return setNotif({ type: 'danger', message: 'El nombre es obligatorio.' });
    setSaving(true);

    const payload: any = {
      nombre: nombre.trim(),
      descripcion,
      id_tipo: idTipo ?? null,
      id_dificultad: idDificultad ?? null,
      id_region: idRegion ?? null,
      id_estado: idEstado ?? 1, // default to active if not selected
      foto: fotos,
      activo,
      // Campos no-nulos del backend: proporcionar valores por defecto para evitar SQL Error 1048
      distancia: (initial && typeof initial.distancia === 'number') ? initial.distancia : 0,
      // tiempo_segundos: preferir valor del formulario (minutos -> segundos), si no usar inicial o 0
      tiempo_segundos: typeof durationMinutes === 'number' ? Number(durationMinutes) * 60 : ((initial && typeof (initial as any).tiempo_segundos === 'number') ? (initial as any).tiempo_segundos : 0),
      f_public: (initial && typeof (initial as any).f_public === 'boolean') ? (initial as any).f_public : true,
      f_baneo: (initial && typeof (initial as any).f_baneo === 'boolean') ? (initial as any).f_baneo : false,
      geometria_polyline: (initial && typeof (initial as any).geometria_polyline === 'string') ? (initial as any).geometria_polyline : '',
      prom_calificacion: (initial && typeof (initial as any).prom_calificacion === 'number') ? (initial as any).prom_calificacion : 0,
    };

    try {
      const routeId = initial ? (initial.idRuta ?? (initial as any).id_ruta ?? (initial as any).id) : undefined;
      if (routeId !== undefined && routeId !== null) {
        // determine what changed
        const changes: string[] = [];
        if ((initial.nombre ?? '') !== (nombre ?? '')) changes.push('nombre');
        if ((initial.descripcion ?? '') !== (descripcion ?? '')) changes.push('descripcion');
        if ((initial.id_tipo ?? (initial as any).idTipo) !== (idTipo ?? undefined)) changes.push('id_tipo');
        if ((initial.id_dificultad ?? (initial as any).idDificultad) !== (idDificultad ?? undefined)) changes.push('id_dificultad');
        if ((initial.id_region ?? (initial as any).idRegion) !== (idRegion ?? undefined)) changes.push('id_region');
        if ((initial.id_estado ?? (initial as any).idEstado) !== (idEstado ?? undefined)) changes.push('id_estado');
        if (JSON.stringify(initial.foto ?? []) !== JSON.stringify(fotos)) changes.push('foto');
        if ((initial.activo ?? true) !== activo) changes.push('activo');

        // If only nombre and/or descripcion changed, use dedicated PATCH endpoints
        const onlyNombreDesc = changes.length > 0 && changes.every(c => c === 'nombre' || c === 'descripcion');
          if (onlyNombreDesc) {
            if (changes.includes('nombre')) await rutaService.patchNombre(Number(routeId), nombre.trim());
            if (changes.includes('descripcion')) await rutaService.patchDescripcion(Number(routeId), descripcion);
          } else {
            // full update (PUT) with required FK fields and fotos
            await rutaService.updateRuta(Number(routeId), payload);
          }

        setNotif({ type: 'success', message: 'Ruta actualizada correctamente.' });
      } else {
        await rutaService.createRuta(payload);
        setNotif({ type: 'success', message: 'Ruta creada correctamente.' });
      }
      onSaved();
    } catch (err: any) {
      setNotif({ type: 'danger', message: extractErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        {notif && <Notification type={notif.type} message={notif.message} onClose={() => setNotif(null)} />}
        <form className="route-form" onSubmit={handleSubmit}>
          <div className="left-col">
            <div>
              <label className="form-label">Nombre</label>
              <input className="form-control" value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Duración (min)</label>
              <input
                className="form-control"
                type="number"
                min={0}
                placeholder="Duración en minutos"
                value={typeof durationMinutes === 'number' ? String(durationMinutes) : ''}
                onChange={e => setDurationMinutes(e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            <div className="row g-2">
              <div className="col-6">
                <label className="form-label">Dificultad</label>
                <select className="form-select" value={idDificultad ?? ''} onChange={e => setIdDificultad(e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">Seleccione...</option>
                  {dificultades.map((d: any) => (
                    <option key={d.id_dificultad ?? d.id} value={d.id_dificultad ?? d.id}>{d.nombre ?? d.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={idTipo ?? ''} onChange={e => setIdTipo(e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">Seleccione...</option>
                  {tipos.map((t: any) => (
                    <option key={t.id_tipo ?? t.id} value={t.id_tipo ?? t.id}>{t.nombre ?? t.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-2 fotos-list">
              <label className="form-label">Fotos (URLs)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-control" value={fotoInput} onChange={e => setFotoInput(e.target.value)} placeholder="https://..." />
                <button type="button" className="btn btn-secondary" onClick={addFoto}>Agregar</button>
              </div>
              <div style={{ marginTop: 8 }}>
                {fotos.map((f, i) => (
                  <div key={`foto-${i}`} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <img src={f} alt={`foto-${i}`} style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4 }} onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                    <div style={{ flex: 1 }}>{f}</div>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeFoto(i)}>Eliminar</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-check mb-2">
              <input id="activoCheck" className="form-check-input" type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} />
              <label htmlFor="activoCheck" className="form-check-label">Activo</label>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
              <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
            </div>
          </div>

          <div className="right-col">
            <div>
              <label className="form-label">Descripción</label>
              <textarea className="form-control" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
            </div>

            <div className="row g-2">
              <div className="col-12 mb-2">
                <label className="form-label">Región</label>
                <select className="form-select" value={idRegion ?? ''} onChange={e => setIdRegion(e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">Seleccione...</option>
                  {regiones.map((r: any) => (
                    <option key={r.id_region ?? r.id} value={r.id_region ?? r.id}>{r.nombre ?? r.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Estado</label>
                <select className="form-select" value={idEstado ?? ''} onChange={e => setIdEstado(e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">Seleccione...</option>
                  {estados.map((s: any) => (
                    <option key={s.id_estado ?? s.id} value={s.id_estado ?? s.id}>{s.nombre ?? s.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteForm;
