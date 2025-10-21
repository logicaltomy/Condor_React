import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // <- agrega useNavigate
import "../App.css";
import { obtenerUsuarios, actualizarUsuario, type User } from "../User"; // desde la 1.8.0 - importa el helper para actualizarUsuario

import { cerrarSesion } from "../Sesion"; // <- importa el helper para cerrar sesión desde la 1.7.0


type PerfilProps = {
  setSesionIniciada: React.Dispatch<React.SetStateAction<boolean>>;
};

const Perfil: React.FC<PerfilProps> = ({ setSesionIniciada }) => {
const navigate = useNavigate(); // <- para redirigir sin recargar


  // se crea una variable reactiva para almacenar la informacion del usuario actual
    // usuarioActual es un objeto que contiene el username y el email, o null si no hay usuario
      // setUsuarioActual es la función para actualizar el estado de usuarioActual y React vuelve a renderizar el componente cuando cambia este estado
const [usuarioActual, setUsuarioActual] = useState<User | null>(null); // (null) indica que inicialmente no hay usuario cargado
// cuando se encuentre dicho usuario, se reemplaza el null en cuestión por el objeto con su información


// UseEffect se usa para ejecutar código cuando el componente se monta o actualiza
  useEffect(() => {
    // Busca en el almacenamiento local del navegador (localStorage) el correo del usuario que se guardó al iniciar sesion
    const correoGuardado = localStorage.getItem("usuarioActual");

    // si existe un correo guardado, busca en la lista de usuarios el que coincida con ese correo
    if (correoGuardado) {
      // trae la lista de usuarios desde User.ts
      const usuarios = obtenerUsuarios();
      // .find recorre la lista de usuarios y devuelve el primero que cumpla la condición (que su email coincida con el correo guardado)
      const usuarioEncontrado = usuarios.find(user => user.email === correoGuardado);
      if (usuarioEncontrado) {
        // si se encuentra el usuario, actualiza el estado usuarioActual con su información
        setUsuarioActual(usuarioEncontrado);
      }
    }
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
      actualizarUsuario(usuarioActual.email, { foto: dataUrl });
      setUsuarioActual({ ...usuarioActual, foto: dataUrl }); // Actualiza vista en tiempo real
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
            {usuarioActual?.foto ? (
              <img
                src={usuarioActual.foto}
                alt="Foto de perfil"
                style={{ width: 120, height: 120, borderRadius: "50%" }}
              />
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
              <p><strong>Nombre:</strong> {usuarioActual.username}</p>
              <p><strong>Correo:</strong> {usuarioActual.email}</p>
          </div>
          ) : (
            <p>No se encontró información del usuario. Inicia sesión nuevamente.</p>
          )}
          </div>

          <button className="btn btn-primary perfil-boton" onClick={handleCerrarSesion}>
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
