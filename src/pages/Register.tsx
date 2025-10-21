import { obtenerUsuarios, agregarUsuario } from "../User";
import type { User } from "../User";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";

//FALTA ESTO, AQUI TE QUEDASTE


const Register: React.FC = () => { // Declara un componente funcional llamado Inicio, significa React Functional Component, y le dice a TypeScript que Inicio es un componente de React.
  
  const navigate = useNavigate();
  const [Correo, setCorreo] = useState(""); //React actualiza el estado y vuelve a renderizar el componente con el nuevo valor.
  const [Contrasenia, setContrasenia] = useState("");
  const [ConfirmarContrasenia, setConfirmarContrasenia] = useState("");
  const [Username, setUsername] = useState("");

  const [errores, setErrores] = useState({
      Correo: "",
      Contrasenia: "",
      ConfirmarContrasenia: "",
      Username: ""
    }); // Estado para manejar errores de validación

  const validarFormulario = () => {
      const nuevosErrores = { Correo: "", Contrasenia: "", ConfirmarContrasenia: "", Username: "" };
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const usuarios = obtenerUsuarios();
      if (!Correo.trim()) {
        nuevosErrores.Correo = "El Correo es obligatorio.";
      }else if (Correo && !emailRegex.test(Correo)) {
        nuevosErrores.Correo = "El Correo no es válido.";
      }else if (usuarios.find(user => user.email === Correo)) {
        nuevosErrores.Correo = "El Correo ya está registrado.";
      }
      if (!Username.trim()) {
        nuevosErrores.Username = "El Username es obligatorio.";
      }
      if (!Contrasenia.trim()) {
        nuevosErrores.Contrasenia = "La Contraseña es obligatoria.";
      } else if (Contrasenia.length < 6) {
        nuevosErrores.Contrasenia = "La Contraseña debe tener al menos 6 caracteres.";
      }
      if (ConfirmarContrasenia !== Contrasenia) {
        nuevosErrores.ConfirmarContrasenia = "Las contraseñas no coinciden.";
      }

      setErrores(nuevosErrores);
      return nuevosErrores;
    };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const nuevosErrores = validarFormulario();
      //Guardamos el usuario nuevo si no hay errores
      if (!nuevosErrores.Correo && !nuevosErrores.Contrasenia && !nuevosErrores.ConfirmarContrasenia && !nuevosErrores.Username) {
        const nuevoUsuario: User = {
          username: Username,
          email: Correo,
          password: Contrasenia
        };
        agregarUsuario(nuevoUsuario);
        setCorreo("");
        setContrasenia("");
        setConfirmarContrasenia("");
        setUsername("");
        setErrores({ Correo: "", Contrasenia: "", ConfirmarContrasenia: "", Username: "" });
        navigate("/login");
        alert(`Gracias ${Username}, te has registrado con exito!`);
      };

  };
  return (
    <div className="main-content" style={{backgroundImage: "url('../src/img/fondo_final.jpeg')", backgroundSize: "cover", minHeight: "100vh", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
      <div className="d-flex align-items-center mb-4">
              <img src="../src/img/logo_negro.png" className="logo_forms" alt="logo_forms" style={{marginRight: "20px"}}></img>
              <h1>CONDOR</h1>
            </div>
              <form onSubmit={handleSubmit} className="w-100">
                  <h2 style={{textAlign: "center"}}>Crear Usuario</h2>
                  <div className="mb-3">
                      <label htmlFor="correo" className="form-label">Correo</label>
                      <input 
                          type="text" 
                          className="form-control" 
                          id="correo"
                          value={Correo}
                          onChange={(e) => {
                              setCorreo(e.target.value)
                              validarFormulario()
                          }}
                          
                      />
                      {errores.Correo && <p className="text-danger">{errores.Correo}</p>}
                  </div>
                  <div className="mb-3">
                      <label htmlFor="username" className="form-label">Nombre de Usuario</label>
                      <input 
                          type="text" 
                          className="form-control" 
                          id="username"
                          value={Username}
                          onChange={(e) => {
                              setUsername(e.target.value)
                              validarFormulario()
                          }}
                          
                      />
                      {errores.Username && <p className="text-danger">{errores.Username}</p>}
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
                                validarFormulario()
                          }}
                      />
                      {errores.Contrasenia && <p className="text-danger">{errores.Contrasenia}</p>}
                  </div>
                  <div className="mb-3">
                      <label htmlFor="confirmarPassword" className="form-label">Confirmar Contraseña</label>
                      <input 
                          type="password" 
                          className="form-control" 
                          id="confirmarPassword"
                          value={ConfirmarContrasenia}
                          onChange={(e) => 
                              {setConfirmarContrasenia(e.target.value)
                                validarFormulario()
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
    </div>
  );
}

export default Register;