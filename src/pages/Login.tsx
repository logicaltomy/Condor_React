import React, { useState } from "react";
import logoNegro from '../img/logo_negro.png';
import fondo from '../img/fondo_final.jpeg';
import { obtenerUsuarios } from "../User";
import { Link, useNavigate } from "react-router-dom";
import { iniciarSesion } from "../Sesion";
import usuarioService from "../services/usuarioService";
import { extractErrorMessage } from '../services/apiClient';
import Notification from "../components/Notification";
import RecoverPasswordModal from "../components/RecoverPasswordModal";

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

    // Mostrar mensaje de recuperación si viene desde la pantalla de recuperar
    React.useEffect(() => {
      const msg = localStorage.getItem('recoveryMessage');
      if (msg) {
        setNotification({ type: 'success', message: msg });
        localStorage.removeItem('recoveryMessage');
      }
    }, []);

    const [showRecover, setShowRecover] = useState(false);

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

          // Guardar información de usuario en localStorage para mostrar role/admin
          try {
            localStorage.setItem('usuarioDTO', JSON.stringify(usuarioDTO || { correo: Correo }));
          } catch (e) {}

          setCorreo("");
          setContrasenia("");
          setErrores({ Correo: "", Contrasenia: "" });
          iniciarSesion(Correo);
          setSesionIniciada(true);
          navigate("/perfil");
          localStorage.setItem("usuarioActual", Correo);
        } catch (err: any) {
          // Prefer a friendly message based on HTTP status, otherwise extract text
          const status = err?.response?.status;
          let userMessage = '';
          if (status === 401) {
            userMessage = 'Correo o contraseña incorrectos.';
          } else if (status === 404) {
            userMessage = 'Usuario no encontrado.';
          } else if (status === 400) {
            userMessage = extractErrorMessage(err) || 'Solicitud inválida.';
          } else if (status >= 500) {
            userMessage = 'Error del servidor. Intenta nuevamente más tarde.';
          } else {
            userMessage = extractErrorMessage(err) || 'Error de autenticación.';
          }
          setNotification({ type: 'danger', message: userMessage });
        }
      }

    return (
    <>
      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
    <div className="main-content" style={{backgroundImage: `url(${fondo})`, backgroundSize: "cover", minHeight: "100vh", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
      <div className="d-flex align-items-center mb-4">
        <img src={logoNegro} className="logo_forms" alt="logo_forms" style={{marginRight: "20px"}} />
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
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <button type="button" onClick={() => setShowRecover(true)} className="btn btn-link" style={{ color: '#c82333', fontWeight: '700' }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
        </form>
    </div>
    <RecoverPasswordModal show={showRecover} onClose={() => setShowRecover(false)} />
    </>
  );
}

export default Login;