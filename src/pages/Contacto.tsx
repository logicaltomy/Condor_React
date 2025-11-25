import React, { useState } from "react"; //permite manejar valores dinámicos, como los campos del formulario
import contactoService from "../services/contactoService"; // <<-- agregado

// Declara un componente funcional llamado Contacto, significa React Functional Component, y le dice a TypeScript que Home es un componente de React.
  const Contacto: React.FC = () => {
  const [nombre, setNombre] = useState(""); //React actualiza el estado y vuelve a renderizar el componente con el nuevo valor.
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState(""); //useState("") crea un estado inicial vacío para mensaje.
  
  const [errores, setErrores] = useState({
    nombre: "",
    email: "",
    mensaje: ""
  }); // Estado para manejar errores de validación

  // Mensajes de UI
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const validarFormulario = (overrides?: { nombre?: string; email?: string; mensaje?: string }) => {
    const nombreVal = overrides?.nombre ?? nombre;
    const emailVal = overrides?.email ?? email;
    const mensajeVal = overrides?.mensaje ?? mensaje;

    const nuevosErrores = { nombre: "", email: "", mensaje: "" };
    if (!nombreVal.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal.trim()) {
      nuevosErrores.email = "El email es obligatorio.";
    } else if (!emailRegex.test(emailVal)) {
      nuevosErrores.email = "El email no es válido.";
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
    setSuccessMessage("");
    setSubmitError("");

    // Validación local (usa tu validarFormulario existente)
    const valid = validarFormulario();
    if (!valid) return;

    try {
      await contactoService.crearContacto({
        nombre,
        correo: email,
        mensaje,
      });

      setSuccessMessage("Mensaje enviado correctamente. Gracias por contactarnos.");
      // limpiar formulario
      setNombre("");
      setEmail("");
      setMensaje("");
      setErrores({ nombre: "", email: "", mensaje: "" });
    } catch (error: any) {
      // Mostrar error en UI (intenta leer respuesta del backend)
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Error al enviar el mensaje. Intente nuevamente.";
      setSubmitError(msg);
    }
  };

  const botonDeshabilitado = 
  !nombre.trim() || 
  !email.trim() || 
  !mensaje.trim() ||
  !!errores.nombre || 
  !!errores.email || 
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
          />
          {errores.nombre && <p className="text-danger mt-1">{errores.nombre}</p>}
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label text-white">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              validarFormulario({ email: e.target.value })
            }} // evento que captura la informacion
          />
          {errores.email && <p className="text-danger mt-1">{errores.email}</p>}
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
          ></textarea>
          {errores.mensaje && <p className="text-danger mt-1">{errores.mensaje}</p>}
        </div>
        <button type="submit" className="btn btn-light w-100" disabled={botonDeshabilitado}>
          Enviar
        </button>
      </form>
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {submitError && <div className="alert alert-danger">{submitError}</div>}
    </div>
  );
};

export default Contacto;