import React, { useEffect, useState } from 'react';
import logrosService from '../services/logrosService';

type Condicion = {
  id_condicion?: number;
  condicion?: string;
  id_tipo_condicion?: number;
  // alias fields the backend may return
  id?: number;
  nombre?: string;
  tipo?: number;
};

type Logro = {
  idLogro?: number;
  nombre?: string;
  descripcion?: string;
  conteoUsuarios?: number;
  id_estado?: number;
  id_condicion?: number;
  restriccion?: number;
};

const Gestor: React.FC = () => {
  const [logros, setLogros] = useState<Logro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoDescripcion, setNuevoDescripcion] = useState('');
  // Validación local para el formulario de creación
  const [errores, setErrores] = useState<{ nombre?: string; descripcion?: string; restriccion?: string }>({});
  const [condiciones, setCondiciones] = useState<Condicion[]>([]);
  const [selectedCondicion, setSelectedCondicion] = useState<number | null>(null);
  const [restriccion, setRestriccion] = useState<string>('');

  const extractMsg = (err: unknown) => {
    try {
      if (!err) return '';
      if (typeof err === 'string') return err;
      if (typeof err === 'object' && err !== null && 'message' in err) {
        const m = (err as { message?: unknown }).message;
        if (typeof m === 'string') return m;
        if (m !== undefined) return String(m);
      }
      return String(err);
    } catch {
      return 'Error inesperado';
    }
  };

  const condicionHint = (tipo?: number) => {
    switch (tipo) {
      case 1:
        return 'Recorrer (n) kilómetros en total';
      case 2:
        return 'Haber terminado (n) rutas en diferentes regiones';
      case 3:
        return 'Haber terminado (n) rutas en total';
      default:
        return 'Condición específica (n)';
    }
  };

  const generarTextoPreview = () => {
    if (!selectedCondicion) return '';
    const c = condiciones.find(x => (x.id_condicion ?? x.id) === selectedCondicion);
    const r = restriccion.trim();
    const n = r ? r : 'N';
    // Template preferido: usar la descripción de la BD si contiene el marcador (n),
    // si no, usar la plantilla genérica de acuerdo al tipo (que incluye (n)).
    const template = c?.condicion ?? c?.nombre ?? condicionHint(c?.id_tipo_condicion ?? c?.tipo);
    // Reemplazar (n) por el número. Si no existe, reemplazar el primer número encontrado.
    if (/\(n\)/i.test(template)) {
      return template.replace(/\(n\)/gi, String(n));
    }
    // buscar primer número en la plantilla y reemplazarlo
    const numMatch = template.match(/\d+[.,]?\d*/);
    if (numMatch) {
      return template.replace(numMatch[0], String(n));
    }
    // si no hay números ni (n), insertar el número en el lugar lógico (al final sin paréntesis)
    return `${template} ${n}`;
  };

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await logrosService.obtenerLogrosConConteo();
      setLogros(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg = extractMsg(err) || 'No se pudo obtener logros.';
      if (msg.includes('403') || msg.toLowerCase().includes('acceso denegado') || msg.toLowerCase().includes('no autorizado')) {
        setError('No autorizado — solo moderadores pueden acceder.');
      } else if (msg.includes('404') || msg.toLowerCase().includes('no encontrado')) {
        setError('Recurso no encontrado en el servidor de logros.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Llamada inicial: fetch está definido en el scope; evitar warning de deps intencionalmente
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    const fetchCond = async () => {
      try {
        const data = await logrosService.obtenerCondiciones();
        setCondiciones(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length>0) setSelectedCondicion(data[0].id_condicion ?? data[0].id ?? null);
      } catch {
        // ignore, UI will show if needed
      }
    };
    fetchCond();
  }, []);

  const handleCrear = async () => {
    try {
      setLoading(true);
      // Validaciones: nombre no vacío y <=30, descripción entre 10 y 100 caracteres
      const nombreTrim = nuevoNombre.trim();
      const descTrim = nuevoDescripcion.trim();
      const nuevosErrores: Record<string,string> = {};
      if (!nombreTrim) nuevosErrores.nombre = 'El nombre es obligatorio.';
      else if (nombreTrim.length > 30) nuevosErrores.nombre = 'El nombre no puede exceder 30 caracteres.';
      if (descTrim.length < 10) nuevosErrores.descripcion = 'La descripción debe tener al menos 10 caracteres.';
      else if (descTrim.length > 100) nuevosErrores.descripcion = 'La descripción no puede exceder 100 caracteres.';
      // Condicion seleccionada
      if (!selectedCondicion) {
        nuevosErrores.descripcion = nuevosErrores.descripcion || '';
        nuevosErrores.descripcion = (nuevosErrores.descripcion ? nuevosErrores.descripcion + ' ' : '') + 'Selecciona una condición.';
      }
      // Restricción: debe ser número positivo (> 0)
      const rTrim = restriccion.trim();
      const rNum = Number(rTrim);
      if (!rTrim || isNaN(rNum) || rNum <= 0) {
        nuevosErrores.restriccion = 'Ingresa una restricción numérica positiva (mayor que 0).';
      }
      setErrores(nuevosErrores);
      if (Object.keys(nuevosErrores).length > 0) return;

      const payload = { nombre: nombreTrim, descripcion: descTrim, id_condicion: selectedCondicion, restriccion: Number(rTrim), id_estado: 1 };
      await logrosService.crearLogro(payload);
      setNuevoNombre(''); setNuevoDescripcion('');
      await fetch();
    } catch (err: unknown) {
      const msg = extractMsg(err) || 'Error al crear logro';
      if (msg.includes('403') || msg.toLowerCase().includes('acceso denegado') || msg.toLowerCase().includes('no autorizado')) {
        setError('No autorizado — solo moderadores pueden crear logros.');
      } else if (msg.includes('404') || msg.toLowerCase().includes('no encontrado')) {
        setError('Recurso no encontrado en el servidor de logros.');
      } else {
        setError(msg);
      }
    } finally { setLoading(false); }
  };

  const toggleEstado = async (id: number, current: number) => {
    try {
      setLoading(true);
      const nuevo = current === 1 ? 2 : 1;
      await logrosService.actualizarEstado(id, nuevo);
      await fetch();
    } catch (err: unknown) {
      const msg = extractMsg(err) || 'Error al actualizar estado';
      if (msg.includes('403') || msg.toLowerCase().includes('acceso denegado') || msg.toLowerCase().includes('no autorizado')) {
        setError('No autorizado — solo moderadores pueden actualizar estado.');
      } else if (msg.includes('404') || msg.toLowerCase().includes('no encontrado')) {
        setError('Recurso no encontrado en el servidor de logros.');
      } else {
        setError(msg);
      }
    } finally { setLoading(false); }
  };

  const crearDisabled = loading || !nuevoNombre.trim() || !!errores.nombre || !!errores.descripcion || !!errores.restriccion || !selectedCondicion || !restriccion.trim();

  return (
    <div className="container mt-4">
      <h2>Gestor de Logros</h2>
      <p className="text-muted">Acciones disponibles para moderadores: crear logros y desactivarlos/activarlos.</p>

      <div className="card mb-3 p-3">
        <h5>Crear nuevo logro</h5>
        <div className="mb-2">
          <input className="form-control" placeholder="Nombre" value={nuevoNombre} onChange={e=>{ const v = e.target.value; setNuevoNombre(v); const vt = v.trim(); if (!vt) setErrores(prev=>({...prev, nombre: 'El nombre es obligatorio.'})); else if (vt.length>30) setErrores(prev=>({...prev, nombre: 'El nombre no puede exceder 30 caracteres.'})); else setErrores(prev=>{ const copy = {...prev}; delete copy.nombre; return copy; }); }} />
          {errores.nombre && <p className="text-danger mt-1">{errores.nombre}</p>}
        </div>
        <div className="mb-2">
          <textarea className="form-control" placeholder="Descripción" value={nuevoDescripcion} onChange={e=>{ const v = e.target.value; setNuevoDescripcion(v); const vt = v.trim(); if (vt.length<10) setErrores(prev=>({...prev, descripcion: 'La descripción debe tener al menos 10 caracteres.'})); else if (vt.length>100) setErrores(prev=>({...prev, descripcion: 'La descripción no puede exceder 100 caracteres.'})); else setErrores(prev=>{ const copy = {...prev}; delete copy.descripcion; return copy; }); }} />
          {errores.descripcion && <p className="text-danger mt-1">{errores.descripcion}</p>}
        </div>
        <div className="mb-2">
          <label>Condición</label>
          <select className="form-control" value={selectedCondicion ?? ''} onChange={e => setSelectedCondicion(e.target.value ? Number(e.target.value) : null)}>
            <option value="">-- Seleccione --</option>
            {condiciones.map(c => {
              const id = c.id_condicion ?? c.id;
              // Mostrar siempre la plantilla genérica según el tipo
              const label = condicionHint(c.id_tipo_condicion ?? c.tipo);
              return <option key={id} value={id}>{label}</option>;
            })}
          </select>
        </div>
        <div className="mb-2">
          <label>Restricción (valor numérico positivo)</label>
          <input type="number" min="0.0000001" step="any" className="form-control" placeholder="Ej: 40" value={restriccion} onChange={e=>{ setRestriccion(e.target.value); if (errores.restriccion) setErrores(prev=>{ const copy = {...prev}; delete copy.restriccion; return copy; }); }} />
          {errores.restriccion && <p className="text-danger mt-1">{errores.restriccion}</p>}
        </div>
        {selectedCondicion && (
          <div className="mb-2">
            <label>Vista previa del texto generado</label>
            <div className="p-2 bg-light border">{generarTextoPreview()}</div>
          </div>
        )}
        {/* id_condicion está controlado internamente; no se muestra input numérico al moderador */}
        <button className="btn btn-primary" onClick={handleCrear} disabled={crearDisabled}>Crear</button>
      </div>

      {loading && <div>Cargando...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && logros && (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Usuarios</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {logros.length === 0 && <tr><td colSpan={6}>No hay logros</td></tr>}
              {logros.map((l) => (
                <tr key={l.idLogro}>
                  <td>{l.idLogro}</td>
                  <td>{l.nombre}</td>
                  <td style={{maxWidth:300, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} title={l.descripcion}>{l.descripcion}</td>
                  <td>{l.conteoUsuarios}</td>
                  <td>{l.id_estado === 1 ? 'Activo' : l.id_estado === 2 ? 'Inactivo' : l.id_estado}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => { if (l.idLogro != null && l.id_estado != null) toggleEstado(l.idLogro, l.id_estado); }}>Cambiar Estado</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Gestor;
