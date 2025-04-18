import React, { useEffect, useState } from 'react';
import '../styles/InicioDashboard.css';
import { jwtDecode } from 'jwt-decode';


const InicioDashboard = () => {
  const [stats, setStats] = useState({
    aulas: 0,
    profesores: 0,
    asignaturas: 0,
    usuarios: 0
  });
  const [nombreUsuario, setNombreUsuario] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setNombreUsuario(decoded.nombreUsuario || 'Usuario');
    }

    const fetchEstadisticas = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/estadisticas`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Error al obtener estadísticas:', err);
      }
    };

    fetchEstadisticas();
  }, []);

  return (
    <div className="inicio-container">
      <h2>Bienvenido al Panel de Administración del Sistema de Ubicación de Aulas</h2>
      <p className="usuario-bienvenida">👋 Hola, <strong>{nombreUsuario}</strong>. Aquí tienes una visión general del sistema:</p>

      <div className="tarjetas-dashboard">
        <div className="tarjeta">
          <h3>{stats.aulas}</h3>
          <p>Aulas registradas</p>
        </div>
        <div className="tarjeta">
          <h3>{stats.asignaturas}</h3>
          <p>Asignaturas creadas</p>
        </div>
        <div className="tarjeta">
          <h3>{stats.profesores}</h3>
          <p>Profesores registrados</p>
        </div>
        <div className="tarjeta">
          <h3>{stats.sedes}</h3>
          <p>Sedes registradas</p>
        </div>
        <div className="tarjeta">
          <h3>{stats.usuarios}</h3>
          <p>Usuarios del sistema</p>
        </div>
      </div>
    </div>
  );
};

export default InicioDashboard;
