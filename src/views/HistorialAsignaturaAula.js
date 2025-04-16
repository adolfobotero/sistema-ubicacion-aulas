import React, { useEffect, useState } from 'react';
import '../styles/Gestion.css';

const HistorialAsignaturaAula = ({ asignatura, setActiveSection }) => {
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState('');
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const porPagina = 5;

  useEffect(() => {
    if (!asignatura) return;

    const fetchHistorial = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `http://localhost:3001/api/asignaturas/${asignatura.idasignatura}/historial?pagina=${pagina}&limite=${porPagina}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const data = await res.json();
        setHistorial(data.registros);
        setTotal(data.total);
      } catch (err) {
        console.error(err);
        setError('Error al cargar el historial de la asignatura.');
      }
    };

    fetchHistorial();
  }, [asignatura, pagina]);

  return (
    <div className="form-container">
      <h2>Historial de Ubicación - {asignatura?.nombreasignatura}</h2>
      <p><strong>Código:</strong> {asignatura?.codeasignatura}</p>

      <div className="paginacion" style={{ justifyContent: 'start', marginBottom: '1.5rem' }}>
        <button onClick={() => setActiveSection('asignaturas')} className="logout-btn">
          ← Volver a Asignaturas
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Aula Anterior</th>
            <th>Aula Nueva</th>
            <th>Día Anterior</th>
            <th>Horario Anterior</th>
            <th>Día Nuevo</th>
            <th>Horario Nuevo</th>
            <th>Responsable</th>
            <th>Fecha</th>
            <th>Motivo</th>
          </tr>
        </thead>
        <tbody>
          {historial.length > 0 ? (
            historial.map((h, i) => (
              <tr key={i}>
                <td>{h.nombreaulaanterior || '—'}</td>
                <td>{h.nombreaulanueva || '—'}</td>
                <td>{h.diasemanaanterior || '—'}</td>
                <td>{h.horainicioanterior && h.horafinanterior ? `${h.horainicioanterior} - ${h.horafinanterior}` : '—'}</td>
                <td>{h.diasemananuevo || '—'}</td>
                <td>{h.horainicionuevo && h.horafinnuevo ? `${h.horainicionuevo} - ${h.horafinnuevo}` : '—'}</td>
                <td>{h.usuariocambio || '—'}</td>
                <td>{new Date(h.fechacambio).toLocaleString()}</td>
                <td>{h.motivo || '—'}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="9">No hay historial disponible.</td></tr>
          )}
        </tbody>
      </table>

      <div className="paginacion" style={{ justifyContent: 'center', marginTop: '2rem' }}>
        <button onClick={() => setPagina(p => Math.max(p - 1, 1))} disabled={pagina === 1}>
          ⬅ Anterior
        </button>
        <span>Página {pagina} de {Math.ceil(total / porPagina)}</span>
        <button
          onClick={() => setPagina(p => Math.min(p + 1, Math.ceil(total / porPagina)))}
          disabled={pagina >= Math.ceil(total / porPagina)}
        >
          Siguiente ➡
        </button>
      </div>
    </div>
  );
};

export default HistorialAsignaturaAula;
