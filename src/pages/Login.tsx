import React, { useState } from "react";
import { obtenerUsuarios } from "../User";
import { Link, useNavigate } from "react-router-dom";
import { iniciarSesion } from "../Sesion";

interface LoginProps {
    setSesionIniciada: React.Dispatch<React.SetStateAction<boolean>>;
}


const Login: React.FC<LoginProps> = ({setSesionIniciada}) => { // Declara un componente funcional llamado Inicio, significa React Functional Component, y le dice a TypeScript que Inicio es un componente de React.
    const navigate = useNavigate();
    const [Correo, setCorreo] = useState(""); //React actualiza el estado y vuelve a renderizar el componente con el nuevo valor.
    const [Contrasenia, setContrasenia] = useState("");

    const [errores, setErrores] = useState({
        Correo: "",
        Contrasenia: ""
      }); // Estado para manejar errores de validación

      const validarFormulario = () => {
        const nuevosErrores = { Correo: "", Contrasenia: "" };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usuarios = obtenerUsuarios();
        if (!Correo.trim()) {
          nuevosErrores.Correo = "El Correo es obligatorio.";
        }
        else if (Correo && !emailRegex.test(Correo)) {
          nuevosErrores.Correo = "El Correo no es válido.";
        }
        else if (!usuarios.find(user => user.email === Correo)) {
          nuevosErrores.Correo = "El Correo no está registrado.";
        }

        if (usuarios.find(user => user.email === Correo)) {
            const usuario = usuarios.find(user => user.email === Correo);
            if (usuario && usuario.password !== Contrasenia) {
                nuevosErrores.Contrasenia = "La Contraseña es incorrecta.";
            }
        }

        setErrores(nuevosErrores);
        return nuevosErrores;
      };

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const usuarios = obtenerUsuarios();

        const nuevosErrores = validarFormulario();
        const usuario = usuarios.find(user => user.email === Correo);
        const username = usuario ? usuario.username : "";

        if (!nuevosErrores.Correo && !nuevosErrores.Contrasenia) {
          alert(`Gracias ${username}, has iniciado sesion!`); //Todo lo que pongas dentro de ${} se evalúa y se reemplaza por su valor.
          setCorreo("");
          setContrasenia("");
          setErrores({ Correo: "", Contrasenia: "" });
          // 1.7.0 - Se ajusta iniciarSesion para que guarde el estado global
          iniciarSesion(Correo);
          setSesionIniciada(true);
          navigate("/perfil");
          localStorage.setItem("usuarioActual", Correo); // Guardar el usuario actual en localStorage
        }
      }

    return (
    <div className="main-content" style={{backgroundImage: "url('../src/img/fondo_final.jpeg')", backgroundSize: "cover", minHeight: "100vh", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
      <div className="d-flex align-items-center mb-4">
        <img src="../src/img/logo_negro.png" className="logo_forms" alt="logo_forms" style={{marginRight: "20px"}}></img>
        <h1>CONDOR</h1>
      </div>
        <form onSubmit={handleSubmit} className="w-100">
            <h2 style={{textAlign: "center"}}>Iniciar Sesion</h2>
            <div className="mb-3">
                <label htmlFor="correo" className="form-label">Correo</label>
                <input 
                    type="text" 
                    className="form-control" 
                    id="correo"
                    value={Correo}
                    onChange={(e) => {
                        setCorreo(e.target.value)
                    }}
                    
                />
                {errores.Correo && <p className="text-danger">{errores.Correo}</p>}
            </div>
            <div className="mb-3">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input 
                    type="password" 
                    className="form-control" 
                    id="password"
                    value={Contrasenia}
                    onChange={(e) => 
                        {setContrasenia(e.target.value)
                    }}
                />
                {errores.Contrasenia && <p className="text-danger">{errores.Contrasenia}</p>}
            </div>
            <button type="submit" className="btn-condor-submit" style={{alignItems: "center"}}>
                Entrar
            </button>
            <Link to="/register" className="btn btn-link" style={{display: "block", textAlign: "center", marginTop: "10px", color: "white"}}>
                ¿No tienes una cuenta? Regístrate
            </Link>
        </form>
    </div>
  );
}

export default Login;