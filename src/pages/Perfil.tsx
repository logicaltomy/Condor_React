import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // <- agrega useNavigate
import { obtenerUsuarios } from "../User"; // kept for compatibility with older helpers
import usuarioService from "../services/usuarioService";
import Notification from "../components/Notification";

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
// cuando se encuentre dicho usuario, se reemplaza el null en cuestión por el objeto con su información


// UseEffect se usa para ejecutar código cuando el componente se monta o actualiza
  useEffect(() => {
    const correoGuardado = localStorage.getItem("usuarioActual");
    if (!correoGuardado) return;

    // Traer usuario real desde backend
    usuarioService.getUserByCorreo(correoGuardado)
      .then(resp => {
        setUsuarioActual(resp.data);
      })
      .catch(err => {
        // fallback a helper local si falla
        const usuarios = obtenerUsuarios();
        const usuarioEncontrado = usuarios.find(user => user.email === correoGuardado);
        if (usuarioEncontrado) setUsuarioActual(usuarioEncontrado);
      });
  }, []);


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
