import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { eliminarUsuario } from "../User";
import { cerrarSesion } from "../Sesion";

const Ajustes: React.FC = () => {
  const navigate = useNavigate();
  const [emailAEliminar, setEmailAEliminar] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleEliminar = () => {
    if (!emailAEliminar) {
      setMensaje("Introduce un correo válido.");
      return;
    }
    const ok = window.confirm(`¿Eliminar al usuario ${emailAEliminar}?`);
    if (!ok) return;

    const eliminado = eliminarUsuario(emailAEliminar);
    if (eliminado) {
      setMensaje(`Usuario ${emailAEliminar} eliminado.`);
      const correoSesion = (localStorage.getItem("usuarioActual") || "").trim().toLowerCase();
      if (correoSesion === emailAEliminar.trim().toLowerCase()) {
        cerrarSesion();
        navigate("/login", { replace: true });
      }
      setEmailAEliminar("");
    } else {
      setMensaje("No se encontró un usuario con ese correo.");
    }
  };

  return (
    <div className="main-content perfil-container">
      <div className="card perfil-card">
        <div className="perfil-body">
          <h2 className="perfil-titulo">Ajustes</h2>
          <p className="text-muted">Desde aquí puedes administrar tu cuenta.</p>

          <div style={{ marginTop: 16 }}>
            <h3>Eliminar usuario</h3>
            <p className="text-muted">Escribe el correo del usuario a eliminar. Esta acción no se puede deshacer.</p>
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
