import React from "react";
import { Link} from "react-router-dom";

const Inicio: React.FC = () => { // Declara un componente funcional llamado Inicio, significa React Functional Component, y le dice a TypeScript que Inicio es un componente de React.
  return (
    <div className="main-content">
      <div id="carouselExampleInterval" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner">
          <div className="carousel-item active" data-bs-interval="2000">
            <img
              src="https://images-ext-1.discordapp.net/external/ivaeoc8mQJ7FsqRrQ3nee3gcd8VyjtTddiuEQ50wqvY/https/wallpapers.com/images/hd/waterfalls-in-wide-forest-wvzwuuko0m4bk36i.webp?format=webp&width=1376&height=917"
              className="d-block carousel-img" alt="..." />
          </div>
          <div className="carousel-item" data-bs-interval="2000">
            <img
              src="https://images.unsplash.com/photo-1551632811-561732d1e306?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHJla2tpbmd8ZW58MHx8MHx8fDA%3D"
              className="d-block carousel-img" alt="..." />
          </div>
          <div className="carousel-item">
            <img src="https://tourleadersperu.com/wp-content/uploads/2023/02/Ancascocha-Trek-6-DAYS.jpg"
              className="d-block carousel-img" alt="..." />
          </div>
        </div>

        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleInterval"
          data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleInterval"
          data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      <div className="text-center mt-4">
        <h1 className="display-4">¡Explora el mundo con CONDOR!</h1>
        <h2>Tu compañero ideal para aventuras al aire libre y senderismo.</h2>
      </div>

{/* ÍCONOS DECORATIVOS HORIZONTALES */}
<div className="icon-row" aria-hidden="true">
  <div className="icon-item">
    <svg viewBox="0 0 24 24">
      <path fill="#fff" d="M9 3 3.6 5.2c-.37.15-.6.5-.6.89v12.82c0 .66.66 1.12 1.28.89L9 17l6 3 5.4-2.2c.37-.15.6-.5.6-.89V4.98c0-.66-.66-1.12-1.28-.89L15 7 9 3zM15 9v9l-6-3V6l6 3z"/>
    </svg>
    <span>Mapa</span>
  </div>

  <div className="icon-item">
    <svg viewBox="0 0 24 24">
      <path fill="#fff" d="M3 20h18L14.5 6l-2.7 4.8-1.4-2.3L3 20zm9.5-9.8L14.5 8l1.8 3.8H12l.5-.8z"/>
    </svg>
    <span>Cerros</span>
  </div>

  <div className="icon-item">
    <svg viewBox="0 0 24 24">
      <path fill="#fff" d="M6 22q0-2 1.5-3.5T11 17q1.9-.5 3-1.1t1.1-1.6q0-.8-.7-1.3T12 11q-1.7-.5-2.85-1.3T8 7q0-2.1 2-3.55T15 2v2q-2 .1-3.5 1t-1.5 2q0 .7.7 1.2t2.3.9q2.3.7 3.4 1.7T18 14q0 2.1-2 3.55T10 19q-1.7.4-2.85 1.25T6 22z"/>
    </svg>
    <span>Senderos</span>
  </div>




  <div className="icon-item">
    <svg viewBox="0 0 24 24">
      <path fill="#fff" d="M7 3h10l2 4-7 14L5 7l2-4zm2.2 2L7.9 7h8.2l-1.3-2H9.2z"/>
    </svg>
    <span>Equipo</span>
  </div>
</div>





      <br></br>
      <div className="left-card">
        <div className="left-card-text">
          <h2>Rutas Oficiales</h2>
          <p>
            Nuestra pagina cuenta con rutas oficiales que estan constantemente
            actualizadas y verificadas por expertos en senderismo, asegurando que siempre tengas
            acceso a las mejores y más seguras opciones para tus aventuras al aire libre.         
          </p>
        </div>
        <div className="left-card-img-container">
          <img className="left-card-img" src="../src/img/Rutas-Oficiales.png" alt="Rutas" />
          <button className="btn btn-lg">Ir a Rutas Oficiales</button>
        </div>
      </div>
      <div className="right-card">
        <div className="right-card-text">
          <h2>Rutas Comunitarias</h2>
          <p>
            Contamos con rutas comunitarias creadas y compartidas por
            usuarios apasionados por el senderismo. Estas rutas ofrecen una perspectiva única y
            auténtica de diferentes destinos, permitiéndote descubrir joyas ocultas y experiencias
            locales que enriquecen tus aventuras al aire libre.         
          </p>
        </div>
        <div className="right-card-img-container">
          <img className="right-card-img" src="../src/img/icon-comunity.png" alt="Rutas" />
          <button className="btn btn-lg">Ir a Rutas Comunitarias</button>
        </div>
      </div>
      <br></br>
        <Link className="btn btn-lg" to="/contacto">
          <img src="../src/img/Contact.png" alt="Contacto" style={{ width: "100px", height: "50px", margin: "-12px -22px -12px -42px"}} />
          Contactanos!
        </Link>
    </div>

  );
};

export default Inicio;