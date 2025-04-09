// ✅ AdminDashboard.js (ajustado para pasar funciones como props)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import Usuarios from './Usuarios';
import Sedes from './Sedes';
import Profesores from './Profesores';
import Asignaturas from './Asignaturas';
import AsignarProfesores from './AsignarProfesores';
import Aulas from './Aulas';
import AsignarAulas from './AsignarAulas';
import HistorialAula from './HistorialAula';
import InicioDashboard from './InicioDashboard';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('inicio');
  const [menuOpen, setMenuOpen] = useState(false);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState(null);
  const [asignaturaAulaSeleccionada, setAsignaturaAulaSeleccionada] = useState(null);
  const [aulaSeleccionada, setAulaSeleccionada] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const renderContent = () => {
    if (activeSection === 'asignarProfesores') {
      return <AsignarProfesores asignatura={asignaturaSeleccionada} setActiveSection={setActiveSection} />;
    }
    if (activeSection === 'asignarAulas') {
      return <AsignarAulas aula={asignaturaAulaSeleccionada} setActiveSection={setActiveSection} />;
    }
    if (activeSection === 'historialAula') {
      return <HistorialAula aula={aulaSeleccionada} setActiveSection={setActiveSection} />;
    }    

    switch (activeSection) {
      case 'aulas':
        return (
          <Aulas
            setAsignaturaAulaSeleccionada={setAsignaturaAulaSeleccionada}
            setAulaSeleccionada={setAulaSeleccionada}
            setActiveSection={setActiveSection}
          />
        );
      case 'asignaturas':
        return (
          <Asignaturas
            setAsignaturaSeleccionada={setAsignaturaSeleccionada}
            setActiveSection={setActiveSection}
          />
        );
      case 'sedes':
        return <Sedes />;
      case 'profesores':
        return <Profesores />;
      case 'usuarios':
        return <Usuarios />;
      default:
        return <InicioDashboard />;
    }
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [activeSection]);

  return (
    <div className="dashboard-container">
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)}></div>}

      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="logo">
          <img src="/assets/logo-ucaldas.png" alt="Logo" />
          <h2>Admin U. Caldas</h2>
        </div>
        <nav>
          <button onClick={() => setActiveSection('inicio')}>Inicio</button>
          <button onClick={() => setActiveSection('aulas')}>Aulas</button>
          <button onClick={() => setActiveSection('asignaturas')}>Asignaturas</button>
          <button onClick={() => setActiveSection('profesores')}>Profesores</button>
          <button onClick={() => setActiveSection('sedes')}>Sedes</button>
          <button onClick={() => setActiveSection('usuarios')}>Usuarios</button>
          <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>
        </nav>
      </aside>

      <main className="main-content">
        <header>
          <h1>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
        </header>
        <section className="content-area">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
