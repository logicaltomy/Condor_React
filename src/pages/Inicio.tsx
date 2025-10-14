import React from "react";

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
      <div>


      </div>
      <h1 className="display-4">¡Explora el mundo con CONDOR!</h1>
      <h2>Tu compañero ideal para aventuras al aire libre y senderismo.</h2>
    </div>

  );
};

export default Inicio;