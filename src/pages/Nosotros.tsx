import React from "react";

// Declara un componente funcional llamado Nosotros, significa React Functional Component, y le dice a TypeScript que Nosotros es un componente de React.
const Nosotros: React.FC = () => {
  return (
    <div className="main-content">
      <img src="../src/img/Sobre Nosotros.png" alt="Banner" className="img-fluid w-100 mb-4" />
      <div className="row justify-content-center">
      <div className="col-12 col-md-4 my-3">
        <div className="card">
          <img src="../src/img/card-image.jpg" className="card-img-top"></img>
          <div className="card-body">
            <p className="card-text">
              En <strong>Condor</strong>, nuestra misión es transformar la experiencia del trekking en una aventura única, divertida y enriquecedora. Creemos que cada sendero tiene una historia que contar, y estamos aquí para ayudarte a descubrirla.
            </p>
          </div>
        </div>
      </div>
      
      <div className="col-12 col-md-4 my-3">
        <div className="card">
          <img src="../src/img/card-image2.jpg" className="card-img-top"></img>
          <div className="card-body">
            <p>
              Nuestro objetivo principal es fomentar la conexión con la naturaleza, promoviendo un estilo de vida activo y saludable. A través de nuestra plataforma, te ofrecemos herramientas interactivas que hacen del trekking una actividad más entretenida y accesible para todos.
            </p>
          </div>
        </div>
      </div>
      </div>
      <br></br>
      <div className="row justify-content-center">
      <div className="col-12 col-md-4 my-3">
        <div className="card">
          <img src="../src/img/card-image3.jpg" className="card-img-top"></img>
          <div className="card-body">
            <p>
              En <strong>Condor</strong>, trabajamos con pasión para brindarte rutas personalizadas, desafíos emocionantes y contenido educativo que te permitirá explorar el mundo natural de una manera completamente nueva. Además, nos esforzamos por crear una comunidad de amantes del trekking, donde puedas compartir tus experiencias, logros y consejos con otros aventureros.
            </p>
          </div>
        </div>
      </div>
      
      <div className="col-12 col-md-4 my-3">
        <div className="card">
          <img src="../src/img/card-image4.jpg" className="card-img-top"></img>
          <div className="card-body">
            <p>
            Ya sea que seas un principiante en busca de tus primeras rutas o un experto explorador en busca de nuevos desafíos, <strong>Condor</strong> está aquí para acompañarte en cada paso del camino. ¡Únete a nosotros y descubre la magia de los senderos con una perspectiva fresca y emocionante!
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Nosotros;