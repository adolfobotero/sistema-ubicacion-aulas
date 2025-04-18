import React, { useEffect, useState } from 'react';
import '../styles/Gestion.css';

const HistorialAula = ({ aula, setActiveSection }) => {
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState('');
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const porPagina = 5;

  useEffect(() => {
    if (!aula) return;

    const fetchHistorial = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/aulas/${aula.idaula}/historial?pagina=${pagina}&limite=${porPagina}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const data = await res.json();
        setHistorial(data.registros);
        setTotal(data.total);
      } catch (err) {
        console.error(err);
        setError('Error al cargar el historial de ubicación.');
      }
    };

    fetchHistorial();
  }, [aula]);

  return (
    <div className="form-container">
      <h2>Historial de Ubicación del Aula</h2>
      <p><strong>Aula:</strong> {aula.codeaula} - {aula.nombreaula}</p>

      {error && <div className="error-msg">{error}</div>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Sede Anterior</th>
            <th>Sede Nueva</th>
            <th>Edificio (de → a)</th>
            <th>Piso (de → a)</th>
            <th>Usuario</th>
            <th>Observación</th>
          </tr>
        </thead>
        <tbody>
          {historial.length > 0 ? historial.map((h) => (
            <tr key={h.idhistorial}>
              <td>{new Date(h.fechacambio).toLocaleString()}</td>
              <td>{h.nombresedeanterior}</td>
              <td>{h.nombresedenueva}</td>
              <td>{h.edificioanterior} → {h.edificionuevo}</td>
              <td>{h.pisoanterior} → {h.pisonuevo}</td>
              <td>{h.usuariocambio}</td>
              <td>{h.observacion}</td>
            </tr>
          )) : (
            <tr><td colSpan="7">No hay registros de historial para este aula.</td></tr>
          )}
        </tbody>
      </table>

      <div className="paginacion" style={{ justifyContent: 'center', marginTop: '2rem' }}>
        <button onClick={() => setPagina(p => Math.max(p - 1, 1))} disabled={pagina === 1}>
          ⬅ Anterior
        </button>
        <span>Página {pagina} de {Math.ceil(total / porPagina)}</span>
        <button onClick={() => setPagina(p => Math.min(p + 1, Math.ceil(total / porPagina)))}
          disabled={pagina >= Math.ceil(total / porPagina)}>
          Siguiente ➡
        </button>
      </div>
      
      <div className="volver-container">
        <button
          onClick={() => setActiveSection('aulas')}
          className="volver-btn"
        >
          ⬅ Volver
        </button>
      </div>


    </div>
  );
};

export default HistorialAula;
