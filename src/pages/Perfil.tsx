import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

const Perfil: React.FC = () => {
  return (
    <div className="main-content perfil-container">
      <div className="card perfil-card">
        <div className="perfil-body">
          <h2 className="perfil-titulo">Perfil del Usuario</h2>

          <div className="perfil-avatar">👤</div>

          <div className="perfil-info">
            <p><strong>Nombre:</strong> Nombre</p>
            <p><strong>Correo:</strong> nombre@correo.com</p>
          </div>

          <button className="btn btn-primary perfil-boton">
            Cerrar Sesión
          </button>

          <Link to="/" className="btn btn-link perfil-volver">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
