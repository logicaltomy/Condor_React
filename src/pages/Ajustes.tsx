import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { eliminarUsuario, obtenerUsuarioPorEmail } from "../User";
import { cerrarSesion } from "../Sesion";

type AjustesProps = {
  setSesionIniciada: React.Dispatch<React.SetStateAction<boolean>>;
};

const Ajustes: React.FC<AjustesProps> = ( {setSesionIniciada} ) => {
  const navigate = useNavigate();
  const [emailAEliminar, setEmailAEliminar] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleEliminar = () => {
    if (!emailAEliminar) {
      setMensaje("Introduce un correo válido.");
      return;
    }


    if (emailAEliminar === localStorage.getItem("usuarioActual")) {
      const ok = window.confirm(`¿Esta seguro de eliminar su cuenta ${emailAEliminar}?`);
       if (!ok) return;
      setMensaje(`Usuario ${emailAEliminar} eliminado.`);
      eliminarUsuario(emailAEliminar);
      cerrarSesion();
      navigate("/login", { replace: true });
      setEmailAEliminar("");
      setSesionIniciada(false);
    } else {
      setMensaje("Correos no coinciden.");
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
