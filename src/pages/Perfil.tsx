import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // <- agrega useNavigate
import { obtenerUsuarios } from "../User"; // kept for compatibility with older helpers
import usuarioService from "../services/usuarioService";
import Notification from "../components/Notification";
import logrosService from "../services/logrosService";
import calificacionesService from "../services/calificacionesService";

import { cerrarSesion } from "../Sesion"; // <- importa el helper para cerrar sesión desde la 1.7.0


type PerfilProps = {
  setSesionIniciada: React.Dispatch<React.SetStateAction<boolean>>;
};

const Perfil: React.FC<PerfilProps> = ({ setSesionIniciada }) => {
const navigate = useNavigate(); // <- para redirigir sin recargar


  // se crea una variable reactiva para almacenar la informacion del usuario actual
    // usuarioActual es un objeto que contiene el username y el email, o null si no hay usuario
      // setUsuarioActual es la función para actualizar el estado de usuarioActual y React vuelve a renderizar el componente cuando cambia este estado
const [usuarioActual, setUsuarioActual] = useState<any | null>(null); // usuario desde backend
const [notification, setNotification] = useState<{type: 'success'|'danger'|'info', message: string} | null>(null);
const [logrosGanados, setLogrosGanados] = useState<Array<any>>([]);
const [calificacionStats, setCalificacionStats] = useState<{ total: number; cantidad: number }>({ total: 0, cantidad: 0 });
// cuando se encuentre dicho usuario, se reemplaza el null en cuestión por el objeto con su información


// UseEffect se usa para ejecutar código cuando el componente se monta o actualiza
  useEffect(() => {
    // Preferir objeto en localStorage (usuarioDTO / usuarioActual) que ya contiene id
    const rawDTO = localStorage.getItem('usuarioDTO') || localStorage.getItem('usuarioActual');
    if (rawDTO) {
      try {
        const parsed = JSON.parse(rawDTO);
        const idFromStorage = parsed?.id ?? parsed?.idUsuario ?? parsed?.id_usuario ?? null;
        if (idFromStorage) {
          const numericId = Number(idFromStorage);
          setUsuarioActual(parsed);
          fetchTrofeos(numericId);
          fetchCalificacionesUsuario(numericId);
          return;
        }
      } catch (e) {
        // rawDTO no es JSON, puede ser un correo: caemos al flujo por correo
      }
    }

    const correoGuardado = localStorage.getItem("usuarioActual");
    if (!correoGuardado) return;

    // Traer usuario real desde backend por correo (compatibilidad)
    usuarioService.getUserByCorreo(correoGuardado)
      .then(resp => {
        setUsuarioActual(resp.data);
        const id = resp.data?.id ?? resp.data?.idUsuario ?? resp.data?.id_usuario ?? null;
        if (id) {
          const numericId = Number(id);
          fetchTrofeos(numericId);
          fetchCalificacionesUsuario(numericId);
        }
      })
      .catch(() => {
        // fallback a helper local si falla
        const usuarios = obtenerUsuarios();
        const usuarioEncontrado = usuarios.find(user => user.email === correoGuardado);
        if (usuarioEncontrado) {
          setUsuarioActual(usuarioEncontrado);
          const id = (usuarioEncontrado?.id ?? usuarioEncontrado?.idUsuario ?? usuarioEncontrado?.id_usuario) ?? null;
          if (id) {
            const numericId = Number(id);
            fetchTrofeos(numericId);
            fetchCalificacionesUsuario(numericId);
          }
        }
      });
  }, []);

  const fetchTrofeos = (idUsuario: number) => {
    logrosService.obtenerTrofeosPorUsuario(idUsuario)
      .then((res: any) => setLogrosGanados(res || []))
      .catch(err => {
        // No mostrar notificaciones invasivas aquí; fallos de carga de logros son silenciosos.
        // Dejar el array vacío y registrar para depuración.
        console.warn('No se pudieron cargar los logros:', err?.message || err);
        setLogrosGanados([]);
      });
  };

  const fetchCalificacionesUsuario = (idUsuario: number) => {
    calificacionesService.calificacionesPorUsuario(idUsuario)
      .then(resp => {
        const lista = Array.isArray(resp.data) ? resp.data : [];
        const cantidad = lista.length;
        const total = lista.reduce((acc, cal) => acc + (Number(cal?.puntuacion ?? cal?.score ?? 0) || 0), 0);
        setCalificacionStats({ total, cantidad });
      })
      .catch(err => {
        console.warn('No se pudieron cargar las calificaciones del usuario:', err?.message || err);
        setCalificacionStats({ total: 0, cantidad: 0 });
      });
  };

  const generarTextoPreview = (template: string, restriccion: any) => {
    if (!template) return '';
    const num = (restriccion !== undefined && restriccion !== null) ? String(restriccion) : '';
    if (template.includes('(n)')) {
      return template.replace('(n)', num);
    }
    // If template has a number, replace first found number
    const replaced = template.replace(/\d+/, num);
    if (replaced !== template) return replaced;
    // else append
    return `${template} ${num}`.trim();
  };


  const handleCerrarSesion = () => {
    cerrarSesion();            // limpia localStorage (usuarioActual, sesionIniciada)
    setSesionIniciada(false);  // 👈 actualiza la UI del navbar
    navigate("/login", { replace: true });
  };
  // Maneja el cambio de foto de perfil
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !usuarioActual) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Enviar al backend la base64 (la API backend aceptará el dataUrl completo)
      usuarioService.updateFotoPerfil(usuarioActual.id, dataUrl)
        .then(resp => {
          // Actualizamos la vista local
          setUsuarioActual((prev: any) => ({ ...prev, fotoPerfil: dataUrl }));
          setNotification({ type: 'success', message: 'Foto de perfil actualizada correctamente.' });
        })
        .catch(err => {
          const msg = err?.response?.data || err?.message || 'Error al subir foto';
          setNotification({ type: 'danger', message: String(msg) });
        });
    };
    reader.readAsDataURL(file);
  };

// En localStorage solo se guarda el correo del usuario que inició sesion mas recientemente. Fijarse en esto -> localStorage.setItem("usuarioActual", Correo);
  return (
    <div className="main-content perfil-container">
      <div className="card perfil-card">
        <div className="perfil-body">
          <h2 className="perfil-titulo">Perfil del Usuario</h2>

          <div className="perfil-avatar">
            {usuarioActual?.fotoPerfil ? (
              (() => {
                const foto = usuarioActual.fotoPerfil;
                let src: string | undefined;
                if (typeof foto === 'string') {
                  src = foto.startsWith('data:') ? foto : `data:image/png;base64,${foto}`;
                } else if (Array.isArray(foto)) {
                  // convertir array de bytes a base64
                  try {
                    const bytes = new Uint8Array(foto as any);
                    let binary = '';
                    for (let i = 0; i < bytes.length; i++) {
                      binary += String.fromCharCode(bytes[i]);
                    }
                    const b64 = btoa(binary);
                    src = `data:image/png;base64,${b64}`;
                  } catch (e) {
                    src = undefined;
                  }
                } else {
                  src = `data:image/png;base64,${String(foto)}`;
                }

                return src ? (
                  <img src={src} alt="Foto de perfil" style={{ width: 120, height: 120, borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#eee', display: 'grid', placeItems: 'center' }}>👤</div>
                );
              })()
            ) : (
              <div style={{ width: 120, height: 120, borderRadius: "50%", background: "#eee", display: "grid", placeItems: "center" }}>👤</div>
            )}
          </div>

          <div>
            <label className="btn btn-secondary">
              Cambiar foto
              <input type="file" accept="image/*" onChange={handleFotoChange} style={{ display: "none" }} />
            </label>
          </div>

          <div className="perfil-info">
          {usuarioActual ? (
            <div className="perfil-info">
              <p><strong>Nombre:</strong> {usuarioActual.nombre || usuarioActual.username}</p>
              <p><strong>Correo:</strong> {usuarioActual.correo || usuarioActual.email}</p>
              {usuarioActual.rutasRecorridas !== undefined && <p><strong>Rutas recorridas:</strong> {usuarioActual.rutasRecorridas}</p>}
              {usuarioActual.kmRecorridos !== undefined && <p><strong>KM recorridos:</strong> {usuarioActual.kmRecorridos}</p>}
              {/* Mostrar número de logros conseguidos como texto plano (no notificaciones invasivas) */}
              <p><strong>Logros conseguidos:</strong> {Array.isArray(logrosGanados) ? logrosGanados.length : 0}</p>
              <p>
                <strong>Calificaciones realizadas:</strong> {calificacionStats.cantidad}
                <span className="text-muted ms-2">Total otorgado: {calificacionStats.total} ★</span>
              </p>
          </div>
          ) : (
            <p>No se encontró información del usuario. Inicia sesión nuevamente.</p>
          )}
          </div>

          <button className="btn btn-primary perfil-boton" onClick={handleCerrarSesion}>
            Cerrar Sesión
          </button>

          {/* La opción de eliminar usuario fue movida a la página /ajustes */}

          <Link to="/" className="btn btn-link perfil-volver">
            Volver al inicio
          </Link>
        </div>
      </div>
      {/* botón para ir a ajustes */}
      <button
        className="btn btn-secondary perfil-ajustes"
        style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, fontWeight: "bold" }}
        onClick={() => navigate("/ajustes")}
      >
        Ir a Ajustes
      </button>
      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
    </div>
  );
};

export default Perfil;
