import React, { useEffect, useState } from 'react';
import '../styles/Gestion.css';

const AsignarProfesores = ({ asignatura, setActiveSection }) => {
  const [profesoresDisponibles, setProfesoresDisponibles] = useState([]);
  const [profesoresAsignados, setProfesoresAsignados] = useState([]);
  const [nuevoProfesor, setNuevoProfesor] = useState('');
  const [nuevoHorario, setNuevoHorario] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Cargar profesores asignados y disponibles al cargar el componente
  // y cada vez que cambie la asignatura seleccionada
  useEffect(() => {
    if (!asignatura) return;
  
    const cargarProfesoresAsignados = async () => {
      const res = await fetch(`http://localhost:3001/api/asignaturas/${asignatura.idasignatura}/profesores`);
      const data = await res.json();
      setProfesoresAsignados(data);
    };
  
    cargarProfesoresAsignados();
  
    fetch('http://localhost:3001/api/profesores')
      .then(res => res.json())
      .then(setProfesoresDisponibles);
  }, [asignatura]);
  
  const cargarProfesoresAsignados = async () => {
    const res = await fetch(`http://localhost:3001/api/asignaturas/${asignatura.idasignatura}/profesores`);
    const data = await res.json();
    setProfesoresAsignados(data);
  };

  const asignarProfesor = async () => {
    setErrorMsg('');
    if (!nuevoProfesor || !nuevoHorario.trim()) {
      setErrorMsg('Debes seleccionar un profesor y especificar el horario.');
      return;
    }

    const res = await fetch(`http://localhost:3001/api/asignaturas/${asignatura.idasignatura}/profesores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idProfesor: nuevoProfesor, horarioAsignatura: nuevoHorario.trim() })
    });

    if (res.ok) {
      const data = await res.json();
      setProfesoresAsignados(data);
      setNuevoProfesor('');
      setNuevoHorario('');
    } else {
      const error = await res.json();
      setErrorMsg(error.message || 'Error al asignar profesor');
    }
  };

  const eliminarProfesor = async (idProfesor, horarioAsignatura) => {
    if (!window.confirm('¿Quitar este profesor de la asignatura?')) return;

    await fetch(`http://localhost:3001/api/asignaturas/${asignatura.idasignatura}/profesores/${idProfesor}/${encodeURIComponent(horarioAsignatura)}`, {
      method: 'DELETE'
    });

    cargarProfesoresAsignados();
  };

  return (
    <div className="form-container">
      <h2>Asignar Profesores a: {asignatura.nombreasignatura}</h2>
      <p><strong>Código:</strong> {asignatura.codeasignatura}</p>

      {errorMsg && <div className="error-msg">{errorMsg}</div>}

      <div className="form-flex">
        <select value={nuevoProfesor} onChange={e => setNuevoProfesor(e.target.value)} required>
          <option value="">Seleccionar profesor</option>
          {profesoresDisponibles.map(p => (
            <option key={p.idprofesor} value={p.idprofesor}>{p.nombreprofesor}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Horario (ej: Lunes 8-10am)"
          value={nuevoHorario}
          onChange={(e) => setNuevoHorario(e.target.value)}
          required
        />

        <button onClick={asignarProfesor}>Asignar</button>
      </div>

      <h4 style={{ marginTop: '2rem' }}>Profesores asignados:</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Profesor</th>
            <th>Horario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {profesoresAsignados.length > 0 ? profesoresAsignados.map(p => (
            <tr key={p.idprofesor}>
              <td>{p.nombreprofesor}</td>
              <td>{p.horarioasignatura || 'Sin horario'}</td>
              <td>
                <button className="action-btn delete" onClick={() => eliminarProfesor(p.idprofesor, p.horarioasignatura)}>Quitar</button>
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
