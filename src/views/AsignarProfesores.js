import React, { useEffect, useState } from 'react';
import '../styles/Gestion.css';

const AsignarProfesores = ({ asignatura, setActiveSection }) => {
  const [profesoresDisponibles, setProfesoresDisponibles] = useState([]);
  const [profesoresAsignados, setProfesoresAsignados] = useState([]);
  const [nuevoProfesor, setNuevoProfesor] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!asignatura) return;

    const cargarProfesores = async () => {
      try {
        const [resAsignados, resDisponibles] = await Promise.all([
          fetch(`http://localhost:3001/api/asignaturas/${asignatura.idasignatura}/profesores`),
          fetch(`http://localhost:3001/api/profesores?limite=1000`)
        ]);

        const datosAsignados = await resAsignados.json();
        const datosDisponibles = await resDisponibles.json();

        setProfesoresAsignados(Array.isArray(datosAsignados) ? datosAsignados : []);
        setProfesoresDisponibles(Array.isArray(datosDisponibles.registros) ? datosDisponibles.registros : datosDisponibles);

      } catch (err) {
        console.error('Error al cargar profesores:', err);
        setProfesoresDisponibles([]); // Asegurar array vacío en caso de error
      }
    };

    cargarProfesores();
  }, [asignatura]);

  const asignarProfesor = async () => {
    setErrorMsg('');
    if (!nuevoProfesor) {
      setErrorMsg('Debes seleccionar un profesor.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/asignaturas/${asignatura.idasignatura}/profesores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idProfesor: nuevoProfesor
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al asignar profesor');

      setProfesoresAsignados(data);
      setNuevoProfesor('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const eliminarProfesor = async (idProfesor) => {
    if (!window.confirm('¿Quitar este profesor de la asignatura?')) return;

    try {
      await fetch(
        `http://localhost:3001/api/asignaturas/${asignatura.idasignatura}/profesores/${idProfesor}`,
        { method: 'DELETE' }
      );

      const res = await fetch(`http://localhost:3001/api/asignaturas/${asignatura.idasignatura}/profesores`);
      const data = await res.json();
      setProfesoresAsignados(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al quitar profesor:', err);
      setErrorMsg('No se pudo quitar el profesor.');
    }
  };

  return (
    <div className="form-container">
      <h2>Asignar Profesores a: {asignatura.nombreasignatura}</h2>
      <p><strong>Código:</strong> {asignatura.codeasignatura}</p>

      {errorMsg && <div className="error-msg">{errorMsg}</div>}

      <div className="form-flex">
        <select value={nuevoProfesor} onChange={(e) => setNuevoProfesor(e.target.value)} required>
          <option value="">Seleccionar profesor</option>
          {Array.isArray(profesoresDisponibles) && profesoresDisponibles.map(p => (
            <option key={p.idprofesor} value={p.idprofesor}>{p.nombreprofesor}</option>
          ))}
        </select>
        <button onClick={asignarProfesor}>Asignar</button>
      </div>

      <h4 style={{ marginTop: '2rem' }}>Profesores asignados:</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Profesor</th>
            <th>Correo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {profesoresAsignados.length > 0 ? profesoresAsignados.map((p, i) => (
            <tr key={`${p.idprofesor}-${i}`}>
              <td>{p.nombreprofesor}</td>
              <td>{p.mailprofesor}</td>
              <td>
                <button
                  className="action-btn delete"
                  onClick={() => eliminarProfesor(p.idprofesor)}
                >
                  Quitar
                </button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="3">No hay profesores asignados.</td></tr>
          )}
        </tbody>
      </table>

      <div className="volver-container">
        <button
          onClick={() => setActiveSection('asignaturas')}
          className="volver-btn"
        >
          ⬅ Volver
        </button>
      </div>
    </div>
  );
};

export default AsignarProfesores;
