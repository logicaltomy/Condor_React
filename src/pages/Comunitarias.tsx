import React from "react";
import { Link } from "react-router-dom";

type Ruta = {
  slug: string;
  titulo: string;
  dificultad: "FACIL" | "MODERADO" | "DIFICIL";
  estrellas: number; // 0..5
  imagen: string;    // puede ser absoluta (https://...) o /img/...
  alt: string;
};

const RUTAS: Ruta[] = [
  {
    slug: "san-cristobal",
    titulo: "SAN CRISTOBAL",
    dificultad: "FACIL",
    estrellas: 3,
    imagen:
      "https://cdn.shopify.com/s/files/1/0526/8596/3456/files/2_ab7ad3cc-e13b-4fbb-b6d9-43d1865fba57_1024x1024.png?v=1619907413",
    alt: "Foto de la ruta Cerro Carbón",
  },
  {
    slug: "manquehuito",
    titulo: "MANQUEHUITO",
    dificultad: "FACIL",
    estrellas: 2,
    imagen:
      "https://laguiadesantiago.com/wp-content/uploads/2020/02/CerroManquehuito.jpg",
    alt: "Foto de la ruta Parque Metropolitano",
  },
  {
    slug: "salto-de-apoquindo",
    titulo: "SALTO DE APOQUINDO",
    dificultad: "DIFICIL",
    estrellas: 5,
    imagen:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwfgQrOXD2lDD5DSVXyvo83OLXhpsC5ru6dQ&s",
    alt: "Foto de la ruta Quebrada de Macul",
  },
  {
    slug: "cerro-renca",
    titulo: "CERRO RENCA",
    dificultad: "MODERADO",
    estrellas: 1,
    imagen:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Cerro_Renca%2C_Santiago.jpg/1200px-Cerro_Renca%2C_Santiago.jpg",
    alt: "Foto de la ruta Sendero Los Peumos",
  },
];

const badgeClass = (dif: Ruta["dificultad"]) => {
  switch (dif) {
    case "FACIL":
      return "badge bg-success";
    case "MODERADO":
      return "badge bg-warning text-dark";
    case "DIFICIL":
      return "badge bg-danger";
  }
};

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

const RutasComunitarias: React.FC = () => {
  return (
    <div className="main-content container py-4">
      <div className="text-center mb-4">
        <h1 className="display-5">Rutas Comunitarias</h1>
        <h2 className="h5 text-secondary">
          Explora las rutas comunitarias de la comunidad
        </h2>
      </div>

      <div className="row g-4 justify-content-center">
        {RUTAS.map((r) => (
          <div key={r.slug} className="col-12 col-sm-6 col-lg-4 col-xl-3">
            {/* Si más adelante tienes página de detalle en React: to={`/rutas/oficiales/${r.slug}`} */}
            <Link
              to={`/rutas/oficiales/${r.slug}`} // puedes cambiarlo a solo "#" si aún no tienes detalle
              className="text-decoration-none"
              aria-label={`Ver detalle ${r.titulo}`}
            >
              <div className="card h-100 shadow-sm">
                <img
                  src={r.imagen}
                  alt={r.alt}
                  className="card-img-top"
                  style={{ height: 180, objectFit: "cover" }}
                />
                <div className="card-body">
                  <h3 className="h5 card-title mb-2">{r.titulo}</h3>
                  <p className="mb-1">
                    Dificultad:{" "}
                    <span className={badgeClass(r.dificultad)}>
                      {r.dificultad}
                    </span>
                  </p>
                  <p className="mb-0 text-warning" aria-label={`${r.estrellas} de 5 estrellas`}>
                    {stars(r.estrellas)} <span className="text-muted">({r.estrellas.toFixed(1)})</span>
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* CTA simple para volver o navegar */}
      <div className="text-center mt-4">
        <Link to="/" className="btn btn-secondary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default RutasComunitarias;
