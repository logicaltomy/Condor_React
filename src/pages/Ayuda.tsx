import React from "react";
import { Link } from "react-router-dom";

const Ayuda: React.FC = () => {
  return (
    <div className="main-content" style={{ padding: 32 }}>
      <div style={{ maxWidth: 980, width: "100%", background: "#fff", borderRadius: 12, padding: 28, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
        <h1 style={{ color: "#153917", fontSize: "2rem", marginBottom: 8 }}>¿Cómo funciona Cóndor?</h1>
        <p style={{ color: "#333", lineHeight: 1.6 }}>
          Cóndor es un proyecto académico de DUOC UC desarrollado dentro del ramo Desarrollo Fullstack II. Se trata de un
          aplicativo web (MVP) enfocado en la exploración de rutas de trekking, combinando naturaleza, tecnología y gamificación.
        </p>

        <section style={{ marginTop: 18 }}>
          <h2 style={{ color: "#153917", fontSize: "1.25rem" }}><strong>Qué hace Cóndor</strong></h2>
          <p style={{ color: "#333", lineHeight: 1.6 }}>
            El proyecto busca motivar la actividad física al aire libre, especialmente el trekking, mediante un sistema de
            recompensas y logros que transforman el ejercicio en un hábito “adictivamente sano”.
          </p>
        </section>

        <section style={{ marginTop: 18 }}>
          <h2 style={{ color: "#153917", fontSize: "1.25rem" }}><strong>Explora</strong></h2>
          <p style={{ color: "#333", lineHeight: 1.6 }}>
            Navega entre rutas oficiales y comunitarias, guarda tus favoritas y marca las que ya realizaste para obtener puntos y
            logros.
          </p>
        </section>

        <section style={{ marginTop: 18 }}>
          <h2 style={{ color: "#153917", fontSize: "1.25rem" }}><strong>Participa</strong></h2>
          <p style={{ color: "#333", lineHeight: 1.6 }}>
            Comparte rutas, sube fotos y contribuye con información útil para la comunidad. Las rutas enviadas por usuarios pueden
            aparecer en la sección comunitaria tras revisión.
          </p>
        </section>

        <div style={{ marginTop: 22, display: 'flex', gap: 12 }}>
          <Link to="/" className="btn-condor-links">Volver al inicio</Link>
          <Link to="/contacto" className="btn-condor-links">Contacto</Link>
        </div>
      </div>
    </div>
  );
};

export default Ayuda;
