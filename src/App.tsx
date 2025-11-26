import React, { useState, useEffect } from "react";
import logo from './img/logo.png';
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "./pages/Inicio";
import Nosotros from "./pages/Nosotros";
import Contacto from "./pages/Contacto";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Perfil from "./pages/Perfil";
import Oficiales from "./pages/Oficiales";
import Comunitarias from "./pages/Comunitarias";
import RutaDetalle from "./pages/RutaDetalle";
import Ayuda from "./pages/Ayuda";
import Ajustes from "./pages/Ajustes";
import AdminPanel from "./pages/AdminPanel";

import ScrollToTop from "./pages/ScrollToTop";
import Moderador from "./pages/Moderador";
import Gestor from "./pages/Gestor";
import MisLogros from "./pages/MisLogros";
import { sesionActiva } from "./Sesion"; 

function App() {
  const [sesionIniciada, setSesionIniciada] = useState(sesionActiva());
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    // Determinar si el usuario es administrador leyendo el usuario guardado en localStorage
    const computeAdmin = () => {
      // Solo considerar admin/monitor si además hay sesión iniciada
      if (!sesionActiva()) {
        setIsAdmin(false);
        setIsModerator(false);
        return;
      }
      try {
        const raw = localStorage.getItem('usuarioDTO');
        if (raw) {
          const u = JSON.parse(raw);
          const rolId = u?.idRol ?? u?.rol?.id ?? null;
          const rolNombre = (u?.rol?.nombre || '').toString().toLowerCase();
          const admin = (rolId === 1) || rolNombre.includes('admin') || rolNombre.includes('administrador');
            setIsAdmin(Boolean(admin));
          // En la BD por defecto el id para Moderador es 2 (Administrador=1, Moderador=2, Usuario=3)
          const moderator = (rolId === 2) || rolNombre.includes('moder') || rolNombre.includes('moderador');
            setIsModerator(Boolean(moderator));
          return;
        }
      } catch {
        // ignore parse errors
      }
      setIsAdmin(false);
      setIsModerator(false);
    };

    // Escuchar evento personalizado para cambios de sesión (logout desde la app)
    const onSessionChanged = () => computeAdmin();

    computeAdmin();

    // Recompute when session changes (login/logout) and when localStorage is updated in another tab
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === 'usuarioDTO' || ev.key === 'sesionIniciada') computeAdmin();
      // recompute moderator as well
      if (ev.key === 'usuarioDTO' || ev.key === 'sesionIniciada') {
        try { const raw = localStorage.getItem('usuarioDTO'); if (raw) { const u = JSON.parse(raw); const rolId = u?.idRol ?? u?.rol?.id ?? null; const rolNombre = (u?.rol?.nombre || '').toString().toLowerCase(); const moderator = (rolId === 2) || rolNombre.includes('moder') || rolNombre.includes('moderador'); setIsModerator(Boolean(moderator)); } else setIsModerator(false);} catch { setIsModerator(false); }
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('session-changed', onSessionChanged);

    const updatePadding = () => {
      const navbar = document.querySelector(".navbar") as HTMLElement;
      const mainContent = document.querySelector(".main-content") as HTMLElement;
      if (navbar && mainContent) {
        const navbarHeight = navbar.offsetHeight;
        mainContent.style.paddingTop = `${navbarHeight}px`;
      }
    };
    updatePadding();
    window.addEventListener("resize", updatePadding);

    return () => {
      window.removeEventListener("resize", updatePadding);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('session-changed', onSessionChanged);
    };

  }, [sesionIniciada]);

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg fixed-top w-100 shadow">
        <div className="container-fluid">
          <div>
            <img
              src={logo}
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
                <Link className="btn btn-lg" to={sesionIniciada ? "/perfil" : "/login"}>
                  Perfil
                </Link>              
              </li>
              {isAdmin && (
                <li className="nav-item">
                  <Link className="btn btn-lg btn-secondary" to="/admin">Panel de Administrador</Link>
                </li>
              )}
                {isModerator && (
                  <li className="nav-item">
                      <Link className="btn btn-lg btn-secondary" to="/moderador">Panel de Moderador</Link>
                    </li>
                )}
                {isModerator && (
                  <li className="nav-item">
                      <Link className="btn btn-lg btn-secondary" to="/gestor">Gestor</Link>
                    </li>
                )}
            </ul>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div className="main-content">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/oficiales" element={<Oficiales />} /> 
          <Route path="/comunitarias" element={<Comunitarias />} />     
          <Route path="/rutas/:tipo/:idRuta" element={<RutaDetalle />} />
          <Route path="/admin" element={isAdmin ? <AdminPanel /> : <Navigate to="/" replace />} />
          <Route path="/moderador" element={isModerator ? <React.Suspense fallback={<div>Cargando...</div>}><React.Fragment><Moderador /></React.Fragment></React.Suspense> : <Navigate to="/" replace />} />
          <Route path="/gestor" element={isModerator ? <Gestor /> : <Navigate to="/" replace />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/mis-logros" element={<MisLogros />} />
          <Route path="/login" element={<Login setSesionIniciada={setSesionIniciada} />} />
          <Route path="/perfil" element={<Perfil setSesionIniciada={setSesionIniciada} />} />
          <Route path="/ajustes" element={<Ajustes setSesionIniciada={setSesionIniciada}/>} />
          <Route path="/register" element={<Register />} />
          <Route path="/ayuda" element={<Ayuda />} />
        </Routes>
      </div>

      {/* FOOTER */}
      <footer className="footer text-center py-3 text-white">
        <div>© 2025 Condor - Todos los derechos reservados</div>
        <div className="footer-links" style={{ marginTop: 8 }}>
          <span>Equipo: </span>
          <a href="https://www.linkedin.com/in/crist%C3%B3bal-barrientos-30931b2b2/" target="_blank" rel="noopener noreferrer" className="link-cristobal">Cristóbal Barrientos</a>

          <span style={{ margin: '0 6px' }}>|</span>
          <a href="https://www.linkedin.com/in/tom%C3%A1s-zapata-labra/" target="_blank" rel="noopener noreferrer" className="link-tomas">Tomás Zapata</a>
        </div>
      </footer>
    </div>
  );
}

export default App;