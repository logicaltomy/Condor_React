import { obtenerUsuarios } from "../User";
import usuarioService from "../services/usuarioService";
import Notification from "../components/Notification";
import { extractErrorMessage } from '../services/apiClient';
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import logoNegro from '../img/logo_negro.png';
import fondo from '../img/fondo_final.jpeg';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [Correo, setCorreo] = useState("");
    const [Contrasenia, setContrasenia] = useState("");
    const [ConfirmarContrasenia, setConfirmarContrasenia] = useState("");
    const [Username, setUsername] = useState("");
    const [pregunta1, setPregunta1] = useState("¿Cuál es tu color favorito?");
    const [respuesta1, setRespuesta1] = useState("");
    const [pregunta2, setPregunta2] = useState("¿Cuál fue el nombre de tu primera mascota?");
    const [respuesta2, setRespuesta2] = useState("");

    const [errores, setErrores] = useState({
        Correo: "",
        Contrasenia: "",
        ConfirmarContrasenia: "",
        Username: ""
    });
    const [notification, setNotification] = useState<{type: 'success'|'danger'|'info', message: string} | null>(null);

    // Función de validación de formulario completa (usada en handleSubmit)
    const validarFormularioCompleto = () => {
        const nuevosErrores = { Correo: "", Contrasenia: "", ConfirmarContrasenia: "", Username: "" };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usuarios = obtenerUsuarios();

        // 1. Validar Correo
        if (!Correo.trim()) {
            nuevosErrores.Correo = "El Correo es obligatorio.";
        } else if (Correo && !emailRegex.test(Correo)) {
            nuevosErrores.Correo = "El Correo no es válido.";
        } else if (usuarios.find(user => user.email === Correo)) {
            nuevosErrores.Correo = "El Correo ya está registrado.";
        }

        // 2. Validar Username
        if (!Username.trim()) {
            nuevosErrores.Username = "El Username es obligatorio.";
        }

        // 3. Validar Contraseña
        if (!Contrasenia.trim()) {
            nuevosErrores.Contrasenia = "La Contraseña es obligatoria.";
        } else if (Contrasenia.length < 5) {
            nuevosErrores.Contrasenia = "La Contraseña debe tener al menos 6 caracteres.";
        }

        // 4. Validar Confirmar Contraseña
        if (ConfirmarContrasenia !== Contrasenia) {
            nuevosErrores.ConfirmarContrasenia = "Las contraseñas no coinciden.";
        }

        setErrores(nuevosErrores);
        return nuevosErrores;
    };


    // Función de validación de campo único para la validación INSTANTÁNEA (en onChange)
    const validarCampo = (nombreCampo: string, valor: string) => {
        let error = "";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usuarios = obtenerUsuarios();

        switch (nombreCampo) {
            case 'Correo':
                if (!valor.trim()) {
                    error = "El Correo es obligatorio.";
                } else if (!emailRegex.test(valor)) {
                    error = "El Correo no es válido.";
                } else if (usuarios.find(user => user.email === valor)) {
                    error = "El Correo ya está registrado.";
                }
                break;
            case 'Username':
                if (!valor.trim()) {
                    error = "El Username es obligatorio.";
                }
                break;
            case 'Contrasenia':
                if (!valor.trim()) {
                    error = "La Contraseña es obligatoria.";
                } else if (valor.length < 6) {
                    error = "La Contraseña debe tener al menos 6 caracteres.";
                }
                // Si la contraseña principal cambia, revalida la confirmación
                if (ConfirmarContrasenia && ConfirmarContrasenia !== valor) {
                    setErrores(prev => ({...prev, ConfirmarContrasenia: "Las contraseñas no coinciden."}));
                } else if (ConfirmarContrasenia) {
                    setErrores(prev => ({...prev, ConfirmarContrasenia: ""}));
                }
                break;
            case 'ConfirmarContrasenia':
                if (valor !== Contrasenia) {
                    error = "Las contraseñas no coinciden.";
                }
                break;
            default:
                break;
        }

        setErrores(prev => ({...prev, [nombreCampo]: error}));
        return error;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const nuevosErrores = validarFormularioCompleto(); // Usamos la validación completa en el submit

        // Guardamos el usuario nuevo si no hay errores
        if (!nuevosErrores.Correo && !nuevosErrores.Contrasenia && !nuevosErrores.ConfirmarContrasenia && !nuevosErrores.Username) {
                try {
                // Construir payload compatible con backend
                const payload = {
                    nombre: Username,
                    correo: Correo,
                    contrasena: Contrasenia,
                    idRegion: 1, // default region
                    preguntaSeguridad1: pregunta1,
                    respuestaSeguridad1: respuesta1,
                    preguntaSeguridad2: pregunta2,
                    respuestaSeguridad2: respuesta2
                };

                await usuarioService.registerUser(payload);
                setCorreo("");
                setContrasenia("");
                setConfirmarContrasenia("");
                setUsername("");
                setRespuesta1("");
                setRespuesta2("");
                setErrores({ Correo: "", Contrasenia: "", ConfirmarContrasenia: "", Username: "" });
                setNotification({ type: 'success', message: `Gracias ${Username}, te has registrado con exito!` });
                setTimeout(() => navigate('/login'), 1200);
                } catch (err: any) {
                    const status = err?.response?.status;
                    let userMessage = '';
                    if (status === 409) {
                        userMessage = 'El correo ya está registrado.';
                    } else if (status === 400) {
                        userMessage = extractErrorMessage(err) || 'Datos inválidos.';
                    } else if (status >= 500) {
                        userMessage = 'Error del servidor. Intenta nuevamente más tarde.';
                    } else {
                        userMessage = extractErrorMessage(err) || 'Error al registrar.';
                    }
                    setNotification({ type: 'danger', message: userMessage });
                }
        }
    };

    return (
        <div className="main-content" style={{backgroundImage: `url(${fondo})`, backgroundSize: "cover", minHeight: "100vh", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                <div className="d-flex align-items-center mb-4">
                    <img src={logoNegro} className="logo_forms" alt="logo_forms" style={{marginRight: "20px"}} />
                    <h1>CONDOR</h1>
                </div>
            <form onSubmit={handleSubmit} className="w-100">
                <h2 style={{textAlign: "center"}}>Crear Usuario</h2>
                
                {/* Correo */}
                <div className="mb-3">
                    <label htmlFor="correo" className="form-label">Correo</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="correo"
                        value={Correo}
                        onChange={(e) => {
                            const nuevoValor = e.target.value;
                            setCorreo(nuevoValor); // Actualiza el estado
                            validarCampo('Correo', nuevoValor); // Valida con el nuevo valor
                        }}
                    />
                    {errores.Correo && <p className="text-danger">{errores.Correo}</p>}
                </div>

                {/* Nombre de Usuario */}
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Nombre de Usuario</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="username"
                        value={Username}
                        onChange={(e) => {
                            const nuevoValor = e.target.value;
                            setUsername(nuevoValor); // Actualiza el estado
                            validarCampo('Username', nuevoValor); // Valida con el nuevo valor
                        }}
                    />
                    {errores.Username && <p className="text-danger">{errores.Username}</p>}
                </div>

                {/* Preguntas de seguridad */}
                <div className="mb-3">
                    <label className="form-label">Pregunta seguridad 1</label>
                    <select className="form-control" value={pregunta1} onChange={e => setPregunta1(e.target.value)}>
                        <option>¿Cuál es tu color favorito?</option>
                        <option>¿Cuál fue el nombre de tu primera escuela?</option>
                        <option>¿Cuál es el nombre de tu ciudad natal?</option>
                    </select>
                    <input className="form-control mt-2" placeholder="Respuesta 1" value={respuesta1} onChange={e => setRespuesta1(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Pregunta seguridad 2</label>
                    <select className="form-control" value={pregunta2} onChange={e => setPregunta2(e.target.value)}>
                        <option>¿Cuál fue el nombre de tu primera mascota?</option>
                        <option>¿Cuál es el segundo nombre de tu padre?</option>
                        <option>¿Cuál es el nombre de tu mejor amigo de la infancia?</option>
                    </select>
                    <input className="form-control mt-2" placeholder="Respuesta 2" value={respuesta2} onChange={e => setRespuesta2(e.target.value)} />
                </div>

                {/* Contraseña */}
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        id="password"
                        value={Contrasenia}
                        onChange={(e) => {
                            const nuevoValor = e.target.value;
                            setContrasenia(nuevoValor); // Actualiza el estado
                            validarCampo('Contrasenia', nuevoValor); // Valida con el nuevo valor
                        }}
                    />
                    {errores.Contrasenia && <p className="text-danger">{errores.Contrasenia}</p>}
                </div>

                {/* Confirmar Contraseña */}
                <div className="mb-3">
                    <label htmlFor="confirmarPassword" className="form-label">Confirmar Contraseña</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        id="confirmarPassword"
                        value={ConfirmarContrasenia}
                        onChange={(e) => {
                            const nuevoValor = e.target.value;
                            setConfirmarContrasenia(nuevoValor); // Actualiza el estado
                            validarCampo('ConfirmarContrasenia', nuevoValor); // Valida con el nuevo valor
                        }}
                    />
                    {errores.ConfirmarContrasenia && <p className="text-danger">{errores.ConfirmarContrasenia}</p>}
                </div>

                <button type="submit" className="btn-condor-submit" style={{alignItems: "center"}}>
                    Registrarse
                </button>
                <Link to="/login" className="btn btn-link"style={{display: "block", textAlign: "center", marginTop: "10px", color: "white"}}>
                    ¿Ya tienes una cuenta? Inicia Sesión
                </Link>
            </form>
            {notification && (
                <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
            )}
        </div>
    );
}

export default Register;