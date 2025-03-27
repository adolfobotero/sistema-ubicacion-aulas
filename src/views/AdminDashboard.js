import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('inicio');

  const navigate = useNavigate();
  const handleLogout = () => {
  localStorage.removeItem('token');
  navigate('/');
};

  const renderContent = () => {
    switch (activeSection) {
      case 'aulas':
        return <p>Gestión de Aulas 📚</p>;
      case 'sedes':
        return <p>Gestión de Sedes 🏢</p>;
      case 'profesores':
        return <p>Gestión de Profesores 👨‍🏫</p>;
      default:
        return <p>Bienvenido al Panel de Administración del Sistema de Ubicación de Aulas.</p>;
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">
          <img src="/assets/logo-ucaldas.png" alt="Logo" />
          <h2>Admin U. Caldas</h2>
        </div>
        <nav>
          <button onClick={() => setActiveSection('inicio')}>Inicio</button>
          <button onClick={() => setActiveSection('aulas')}>Aulas</button>
          <button onClick={() => setActiveSection('sedes')}>Sedes</button>
          <button onClick={() => setActiveSection('profesores')}>Profesores</button>
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
