import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import Usuarios from './Usuarios';
import Sedes from './Sedes';
import Profesores from './Profesores';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('inicio');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = () => {
  localStorage.removeItem('token');
  navigate('/');
};

  const renderContent = () => {
    switch (activeSection) {
      case 'aulas':
        return <p>Gestión de Aulas 🏢</p>;
      case 'asignaturas':
        return <p>Gestión de Asignaturas 📚</p>;    
      case 'sedes':
        return <Sedes />;
      case 'profesores':
        return <Profesores />;
      case 'usuarios':
        return <Usuarios />;
      default:
        return <p>Bienvenido al Panel de Administración del Sistema de Ubicación de Aulas.</p>;
    }
  };

  useEffect(() => {
    // Cierra menú al cambiar de sección (en móvil)
    setMenuOpen(false);
  }, [activeSection]);

  return (
    <div className="dashboard-container">
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
      ☰
      </button>

      {/* Capa oscura al fondo cuando el menú está abierto */}
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
