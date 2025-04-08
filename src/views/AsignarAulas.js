// src/views/AsignarAulas.js
import React, { useEffect, useState } from 'react';
import '../styles/Gestion.css';

const AsignarAulas = ({ aula, setActiveSection }) => {
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState([]);
  const [asignaturasAsignadas, setAsignaturasAsignadas] = useState([]);
  const [nuevaAsignatura, setNuevaAsignatura] = useState('');
  const [diaSemana, setDiaSemana] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ✅ Cargar datos cuando cambia el aula
  useEffect(() => {
    if (!aula) return;

    const cargarAsignadas = async () => {
      const res = await fetch(`http://localhost:3001/api/aulas/${aula.idaula}/asignaturas`);
      const data = await res.json();
      setAsignaturasAsignadas(data);
    };

    cargarAsignadas();

    fetch('http://localhost:3001/api/asignaturas')
      .then(res => res.json())
      .then(setAsignaturasDisponibles);
  }, [aula]);

  const asignarAsignatura = async () => {
    setErrorMsg('');
    if (!nuevaAsignatura || !diaSemana || !horaInicio || !horaFin) {
      setErrorMsg('Debes completar todos los campos.');
      return;
    }

    const res = await fetch(`http://localhost:3001/api/aulas/${aula.idaula}/asignaturas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idAsignatura: nuevaAsignatura,
        diaSemana,
        horaInicio,
        horaFin
      })
    });

    if (res.ok) {
      const data = await res.json();
      setAsignaturasAsignadas(data);
      setNuevaAsignatura('');
      setDiaSemana('');
      setHoraInicio('');
      setHoraFin('');
    } else {
      const error = await res.json();
      setErrorMsg(error.message || 'Error al asignar aula');
    }
  };

  const eliminarAsignatura = async (idAsignatura) => {
    if (!window.confirm('¿Quitar esta asignatura del aula?')) return;

    await fetch(`http://localhost:3001/api/aulas/${aula.idaula}/asignaturas/${idAsignatura}`, {
      method: 'DELETE'
    });

    // Recargar asignadas
    const res = await fetch(`http://localhost:3001/api/aulas/${aula.idaula}/asignaturas`);
    const data = await res.json();
    setAsignaturasAsignadas(data);
  };

  return (
    <div className="form-container">
      <h2>Asignar Asignaturas a: {aula.nombreaula}</h2>
      <p><strong>Código:</strong> {aula.codeaula}</p>

      {errorMsg && <div className="error-msg">{errorMsg}</div>}

      <div className="form-flex">
        <select value={nuevaAsignatura} onChange={(e) => setNuevaAsignatura(e.target.value)} required>
          <option value="">Seleccionar asignatura</option>
          {asignaturasDisponibles.map(a => (
            <option key={a.idasignatura} value={a.idasignatura}>{a.nombreasignatura}</option>
          ))}
        </select>

        <select value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)} required>
          <option value="">Día</option>
          <option value="Lunes">Lunes</option>
          <option value="Martes">Martes</option>
          <option value="Miércoles">Miércoles</option>
          <option value="Jueves">Jueves</option>
          <option value="Viernes">Viernes</option>
          <option value="Sábado">Sábado</option>
        </select>

        <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
        <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} required />

        <button onClick={asignarAsignatura}>Asignar</button>
      </div>

      <h4 style={{ marginTop: '2rem' }}>Asignaturas asignadas:</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Asignatura</th>
            <th>Día</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asignaturasAsignadas.length > 0 ? asignaturasAsignadas.map(a => (
            <tr key={a.idasignatura}>
              <td>{a.nombreasignatura}</td>
              <td>{a.diasemana}</td>
              <td>{a.horainicio}</td>
              <td>{a.horafin}</td>
              <td>
                <button className="action-btn delete" onClick={() => eliminarAsignatura(a.idasignatura)}>Quitar</button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="5">No hay asignaturas asignadas.</td></tr>
          )}
        </tbody>
      </table>

      <div className="paginacion" style={{ justifyContent: 'center', marginTop: '2rem' }}>
        <button onClick={() => setActiveSection('aulas')}>⬅ Volver a Aulas</button>
      </div>
    </div>
  );
};

export default AsignarAulas;
