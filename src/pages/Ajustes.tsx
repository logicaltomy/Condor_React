import React, { useEffect, useState } from "react";
import type { AxiosResponse } from 'axios';
import { useNavigate } from "react-router-dom";
import usuarioService from "../services/usuarioService";
import { extractErrorMessage } from '../services/apiClient';
import { cerrarSesion } from "../Sesion";
import Notification from "../components/Notification";

type AjustesProps = {
  setSesionIniciada?: React.Dispatch<React.SetStateAction<boolean>>;
};

const Ajustes: React.FC<AjustesProps> = ({ setSesionIniciada }) => {
  const navigate = useNavigate();
  const [emailAEliminar, setEmailAEliminar] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success'|'danger'|'info', message: string} | null>(null);

  const usuarioActual = localStorage.getItem('usuarioActual') || '';

  type UsuarioMinimal = {
    id?: number;
    nombre?: string;
    correo?: string;
  };

  useEffect(() => {
    const cargarUsuario = async () => {
      if (!usuarioActual) return;
      try {
        const resp: AxiosResponse<UsuarioMinimal> = await usuarioService.getUserByCorreo(usuarioActual);
        const usuario = resp.data as UsuarioMinimal;
        setNombre(usuario?.nombre ?? '');
        setCorreo(usuario?.correo ?? usuarioActual);
      } catch (_) {
        // no interrumpir la vista si falla la carga
      }
    };
    cargarUsuario();
  }, [usuarioActual]);

  type AxiosErrorLike = { response?: { status?: number } };

  const handleEliminar = async () => {
    if (!emailAEliminar) {
      setMensaje("Introduce un correo válido.");
      return;
    }

    if (emailAEliminar !== localStorage.getItem("usuarioActual")) {
      setMensaje("Correos no coinciden.");
      return;
    }

    const ok = window.confirm("¿Esta seguro que quiere desactivar su cuenta?, Esta acción es irreversible.");
    if (!ok) return;

    try {
      // Obtener el usuario para extraer su id
      const resp = await usuarioService.getUserByCorreo(emailAEliminar);
      const usuario = resp.data as UsuarioMinimal;
      if (!usuario?.id) throw new Error('No se pudo obtener id del usuario');

      await usuarioService.deleteUsuario(usuario.id);
      cerrarSesion();
      setNotification({ type: 'success', message: `Usuario ${emailAEliminar} desactivado correctamente.` });
      setEmailAEliminar("");
      setSesionIniciada?.(false);
      setTimeout(() => navigate('/login', { replace: true }), 1000);
    } catch (err: unknown) {
      const status = (err as AxiosErrorLike)?.response?.status;
      let userMessage = '';
      if (status === 404) userMessage = 'Usuario no encontrado.';
      else if (status === 400) userMessage = extractErrorMessage(err) || 'Solicitud inválida.';
      else if (typeof status === 'number' && status >= 500) userMessage = 'Error del servidor. Intenta nuevamente más tarde.';
      else userMessage = extractErrorMessage(err) || 'Error al eliminar usuario.';
      setNotification({ type: 'danger', message: userMessage });
    }
  };

  const validarEmail = (em: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(em);
  };

  const handleActualizarPerfil = async () => {
    // Validaciones básicas
    const nombreTrim = nombre.trim();
    if (!nombreTrim) {
      setNotification({ type: 'danger', message: 'El nombre no puede estar vacío.' });
      return;
    }
    if (nombreTrim.length > 100) {
      setNotification({ type: 'danger', message: 'El nombre no puede exceder 100 caracteres.' });
      return;
    }
    if (!validarEmail(correo)) {
      setNotification({ type: 'danger', message: 'Introduce un correo válido.' });
      return;
    }

    try {
      // obtener usuario para id
      const resp = await usuarioService.getUserByCorreo(usuarioActual);
      const usuario = resp.data as UsuarioMinimal;
      if (!usuario?.id) throw new Error('No se pudo obtener id del usuario');
      const id = usuario.id;

      // actualizar nombre si cambió
      if (usuario.nombre !== nombreTrim) {
        await usuarioService.updateNombre(id, nombreTrim);
      }
      // actualizar correo si cambió
      if (usuario.correo !== correo) {
        await usuarioService.updateCorreo(id, correo);
        // actualizar localStorage para mantener sesión
        localStorage.setItem('usuarioActual', correo);
      }

      setNotification({ type: 'success', message: 'Perfil actualizado correctamente.' });
    } catch (err: unknown) {
      const status = (err as AxiosErrorLike)?.response?.status;
      let userMessage = '';
      if (status === 404) userMessage = 'Usuario no encontrado.';
      else if (status === 400) userMessage = extractErrorMessage(err) || 'Solicitud inválida.';
      else if (typeof status === 'number' && status >= 500) userMessage = 'Error del servidor. Intenta nuevamente más tarde.';
      else userMessage = extractErrorMessage(err) || 'Error al actualizar perfil.';
      setNotification({ type: 'danger', message: userMessage });
    }
  };

  return (
    <div className="main-content perfil-container">
      <div className="card perfil-card">
        <div className="perfil-body">
          <h2 className="perfil-titulo">¿Desea eliminar su usuario?</h2>
          <p className="text-muted">Desde aquí puedes administrar tu cuenta.</p>

          <div style={{ marginTop: 16 }}>
            <h3>Editar perfil</h3>
            <p className="text-muted">Modifica tu nombre y correo desde aquí.</p>
            {notification && <Notification type={notification.type} message={notification.message} />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 520 }}>
              <label>Nombre</label>
              <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={100} />
              <small className="text-muted">Máximo 100 caracteres.</small>

              <label>Correo</label>
              <input type="email" className="form-control" value={correo} onChange={(e) => setCorreo(e.target.value)} />

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-primary" onClick={handleActualizarPerfil}>Actualizar perfil</button>
                <button className="btn btn-light" onClick={() => { setNombre(''); setCorreo(''); }}>Limpiar</button>
              </div>
            </div>
            <hr />
            <h3>Eliminar usuario</h3>
            <p className="text-muted">Escriba su correo para confirmar la eliminacion de su usuario.</p>
            {mensaje && <div className="alert alert-info">{mensaje}</div>}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className="form-control"
                value={emailAEliminar}
                onChange={(e) => setEmailAEliminar(e.target.value)}
                style={{ maxWidth: 320 }}
              />
              <button className="btn btn-danger" onClick={handleEliminar}>Eliminar</button>
            </div>
          </div>

        </div>
      </div>
      <button
        className="btn btn-condor"
        style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, fontWeight: "bold" }}
        onClick={() => navigate("/")}
      >
        Ir a Inicio
      </button>
    </div>
  );
};

export default Ajustes;
