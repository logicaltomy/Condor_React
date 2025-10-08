import React from "react";

// Declara un componente funcional llamado Nosotros, significa React Functional Component, y le dice a TypeScript que Nosotros es un componente de React.
const Nosotros: React.FC = () => {
  return (
    <div className="main-content">
      <h1 className="text-white fw-bold display-5">Sobre Nosotros 🐶</h1>
      <p className="lead text-white">
        En <strong>AdoptaPet</strong> trabajamos con amor y compromiso para ayudar a perros y gatos a encontrar un hogar lleno de cariño.
      </p>
      <p className="text-white">
        Nuestro objetivo es promover la adopción responsable, brindar asistencia veterinaria y crear conciencia sobre el respeto hacia los animales.
      </p>
    </div>
  );
};

export default Nosotros;