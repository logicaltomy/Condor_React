import React, { useState } from "react";
import { usuarios } from "../User";
import { useNavigate } from "react-router-dom";
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
                nuevosErrores.Contrasenia = "La Contrasenia es incorrecta.";
            }
        }

        setErrores(nuevosErrores);
        return nuevosErrores;
      };

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const nuevosErrores = validarFormulario();

        if (!nuevosErrores.Correo && !nuevosErrores.Contrasenia) {
          alert(`Gracias ${Correo}, has iniciado sesion!`); //Todo lo que pongas dentro de ${} se evalúa y se reemplaza por su valor.
          setCorreo("");
          setContrasenia("");
          setErrores({ Correo: "", Contrasenia: "" });
          iniciarSesion();
          setSesionIniciada(true);
          navigate("/perfil");
        }
      }

    return (
    <div className="main-content">
        <h2>Iniciar Sesion</h2>
        <form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: "500px" }}>
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
                <label htmlFor="password" className="form-label">Contrasenia</label>
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
            <button type="submit" className="btn btn-primary">
                Entrar
            </button>
        </form>
    </div>
  );
}

export default Login;