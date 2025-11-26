import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import usuarioService from "../services/usuarioService";
import { cerrarSesion } from "../Sesion";
import Notification from "../components/Notification";
import { extractErrorMessage } from '../services/apiClient';

type AjustesProps = {
  setSesionIniciada?: React.Dispatch<React.SetStateAction<boolean>>;
};

const Ajustes: React.FC<AjustesProps> = ({ setSesionIniciada }) => {
  const navigate = useNavigate();
  const [emailAEliminar, setEmailAEliminar] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success'|'danger'|'info', message: string} | null>(null);

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
      const usuario: any = resp.data;
      if (!usuario?.id) throw new Error('No se pudo obtener id del usuario');

      await usuarioService.deleteUsuario(usuario.id);
      cerrarSesion();
      setNotification({ type: 'success', message: `Usuario ${emailAEliminar} desactivado correctamente.` });
      setEmailAEliminar("");
      setSesionIniciada?.(false);
      setTimeout(() => navigate('/login', { replace: true }), 1000);
    } catch (err: any) {
      const mensaje = extractErrorMessage(err) || 'Error al eliminar usuario.';
      setNotification({ type: 'danger', message: mensaje });
    }
  };

  return (
    <div className="main-content perfil-container">
      <div className="card perfil-card">
        <div className="perfil-body">
          <h2 className="perfil-titulo">¿Desea eliminar su usuario?</h2>
          <p className="text-muted">Desde aquí puedes administrar tu cuenta.</p>

          <div style={{ marginTop: 16 }}>
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
