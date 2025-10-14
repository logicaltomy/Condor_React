import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Inicio";
import Nosotros from "./pages/Nosotros";
import Contacto from "./pages/Contacto";

function App() {
  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg fixed-top w-100 shadow">
        <div className="container-fluid">
          <div>
            <img
              src="src/img/logo.png"
              alt="Logo"
              style={{ width: "40px", height: "40px", marginRight: "10px" }}
            />
          </div>
          <h1>
            Condor
          </h1>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="btn btn-lg" to="/"> Inicio</Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-lg" to="/nosotros">
                  Nosotros
                </Link>                
              </li>
              <li className="nav-item">
                <Link className="btn btn-lg" to="/contacto">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
        </Routes>
      </div>

      {/* FOOTER */}
      <footer className="footer text-center py-3 text-white">
        © 2025 Condor - Todos los derechos reservados
      </footer>
    </div>
  );
}

export default App;