import React, { useState } from "react"; //permite manejar valores dinámicos, como los campos del formulario
import contactoService from "../services/contactoService";

// Declara un componente funcional llamado Contacto, significa React Functional Component, y le dice a TypeScript que Home es un componente de React.
  const Contacto: React.FC = () => {
  const [nombre, setNombre] = useState(""); //React actualiza el estado y vuelve a renderizar el componente con el nuevo valor.
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState(""); //useState("") crea un estado inicial vacío para mensaje.
  
  const [errores, setErrores] = useState({
    nombre: "",
    correo: "",
    mensaje: ""
  }); // Estado para manejar errores de validación

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validarFormulario = (overrides?: { nombre?: string; correo?: string; mensaje?: string }) => {
    const nombreVal = overrides?.nombre ?? nombre;
    const correoVal = overrides?.correo ?? correo;
    const mensajeVal = overrides?.mensaje ?? mensaje;

    const nuevosErrores = { nombre: "", correo: "", mensaje: "" };
    if (!nombreVal.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoVal.trim()) {
      nuevosErrores.correo = "El correo es obligatorio.";
    } else if (!emailRegex.test(correoVal)) {
      nuevosErrores.correo = "El correo no es válido.";
    }

    if (!mensajeVal.trim()) {
      nuevosErrores.mensaje = "El mensaje es obligatorio.";
    } else if (mensajeVal.length < 10) {
      nuevosErrores.mensaje = "El mensaje debe tener al menos 10 caracteres.";
    } else if (mensajeVal.length > 300) {
      nuevosErrores.mensaje = "El mensaje no puede exceder los 300 caracteres.";
    }

    setErrores(nuevosErrores);
    return nuevosErrores;
  };

  // Función que maneja el envío del formulario, evita que la página se recargue y procesa los datos ingresados
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccessMessage(null);
    setErrorMessage(null);

    const nuevosErrores = validarFormulario();

    if (nuevosErrores.nombre || nuevosErrores.correo || nuevosErrores.mensaje) {
      return;
    }

    setLoading(true);
    try {
      // Llamada al servicio que hace POST al backend de Contacto
      await contactoService.crearContacto({ nombre, correo, mensaje });
      setSuccessMessage("Gracias, tu mensaje ha sido enviado correctamente.");
      setNombre("");
      setCorreo("");
      setMensaje("");
      setErrores({ nombre: "", correo: "", mensaje: "" });
      // Limpiar mensajes después de 4 segundos
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Error al enviar el formulario. Intenta nuevamente.";
      setErrorMessage(msg);
      // Limpiar mensaje de error después de 6 segundos
      setTimeout(() => setErrorMessage(null), 6000);
    } finally {
      setLoading(false);
    }
  };

  const botonDeshabilitado = 
  !nombre.trim() || 
  !correo.trim() || 
  !mensaje.trim() ||
  !!errores.nombre || 
  !!errores.correo || 
  !!errores.mensaje;

  return (
    <div className="main-content">
      <h1>Contacto 📬</h1>
      <p>
        Completa el formulario y nos pondremos en contacto contigo.
      </p>
      <form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: "500px" }}>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label text-white">
            Nombre
          </label>
          <input
            type="text"
            id="nombre"
            className="form-control"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              validarFormulario({ nombre: e.target.value })
            }} // evento que captura la informacion
            disabled={loading}
          />
          {errores.nombre && <p className="text-danger mt-1">{errores.nombre}</p>}
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label text-white">
            Correo
          </label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value)
              validarFormulario({ correo: e.target.value })
            }} // evento que captura la informacion
            disabled={loading}
          />
          {errores.correo && <p className="text-danger mt-1">{errores.correo}</p>}
        </div>
        <div className="mb-3">
          <label htmlFor="mensaje" className="form-label text-white">
            Mensaje
          </label>
          <textarea
            id="mensaje"
            className="form-control"
            value={mensaje}
            rows={4}
            onChange={(e) => {
              setMensaje(e.target.value)
              validarFormulario({ mensaje: e.target.value })
            }} // evento que captura la informacion
            maxLength={300} // Limita el número máximo de caracteres a 300
            disabled={loading}
          ></textarea>
          {errores.mensaje && <p className="text-danger mt-1">{errores.mensaje}</p>}
        </div>
        <button type="submit" className="btn btn-light w-100" disabled={botonDeshabilitado || loading}>
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>
      {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
      {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
    </div>
  );
};

export default Contacto;