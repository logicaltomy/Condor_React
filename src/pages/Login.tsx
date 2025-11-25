import React, { useState } from "react";
import { obtenerUsuarios } from "../User";
import { Link, useNavigate } from "react-router-dom";
import { iniciarSesion } from "../Sesion";
import usuarioService from "../services/usuarioService";
import Notification from "../components/Notification";

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
    const [notification, setNotification] = React.useState<{type: 'success'|'danger'|'info', message: string} | null>(null);

      const validarFormulario = () => {
        const nuevosErrores = { Correo: "", Contrasenia: "" };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!Correo.trim()) {
          nuevosErrores.Correo = "El Correo es obligatorio.";
        } else if (Correo && !emailRegex.test(Correo)) {
          nuevosErrores.Correo = "El Correo no es válido.";
        }

        if (!Contrasenia.trim()) {
          nuevosErrores.Contrasenia = "La Contraseña es obligatoria.";
        }

        setErrores(nuevosErrores);
        return nuevosErrores;
      };

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const nuevosErrores = validarFormulario();
        if (nuevosErrores.Correo || nuevosErrores.Contrasenia) return;

        try {
          await usuarioService.loginUser({ correo: Correo, password: Contrasenia });
          // Obtener usuario para mostrar nombre y guardar sesión
          const resp = await usuarioService.getUserByCorreo(Correo);
          const usuarioDTO: any = resp.data;
          const username = usuarioDTO?.nombre ?? Correo;

          setCorreo("");
          setContrasenia("");
          setErrores({ Correo: "", Contrasenia: "" });
          iniciarSesion(Correo);
          setSesionIniciada(true);
          navigate("/perfil");
          localStorage.setItem("usuarioActual", Correo);
        } catch (err: any) {
          const msg = err?.response?.data || err?.message || 'Error de autenticación';
          setNotification({ type: 'danger', message: String(msg) });
        }
      }

    return (
    <>
      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
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
    </>
  );
}

export default Login;