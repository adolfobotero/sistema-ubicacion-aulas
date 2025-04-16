import React, { useEffect, useState } from 'react';
import '../styles/Gestion.css';

const AsignarAulas = ({ aula, setActiveSection }) => {
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState([]);
  const [asignaturasAsignadas, setAsignaturasAsignadas] = useState([]);
  const [profesoresDeAsignatura, setProfesoresDeAsignatura] = useState([]);
  const [nuevaAsignatura, setNuevaAsignatura] = useState('');
  const [idProfesorSeleccionado, setIdProfesorSeleccionado] = useState('');
  const [diaSemana, setDiaSemana] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [editando, setEditando] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!aula) return;

    fetch(`http://localhost:3001/api/aulas/${aula.idaula}/asignaturas`)
      .then(res => res.json())
      .then(setAsignaturasAsignadas);

    fetch('http://localhost:3001/api/asignaturas?limite=1000')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.registros)) {
          setAsignaturasDisponibles(data.registros);
        } else {
          setAsignaturasDisponibles(data);
        }
      });
  }, [aula]);

  // Cuando cambia la asignatura, cargar sus profesores
  useEffect(() => {
    if (!nuevaAsignatura) {
      setProfesoresDeAsignatura([]);
      setIdProfesorSeleccionado('');
      return;
    }

    fetch(`http://localhost:3001/api/asignaturas/${nuevaAsignatura}/profesores`)
      .then(res => res.json())
      .then(data => {
        setProfesoresDeAsignatura(Array.isArray(data) ? data : []);
        if (data.length === 1) setIdProfesorSeleccionado(data[0].idprofesor);
      })
      .catch(err => {
        console.error('Error al cargar profesores:', err);
        setProfesoresDeAsignatura([]);
      });
  }, [nuevaAsignatura]);

  const limpiar = () => {
    setNuevaAsignatura('');
    setIdProfesorSeleccionado('');
    setDiaSemana('');
    setHoraInicio('');
    setHoraFin('');
    setEditando(null);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const guardarAsignacion = async () => {
    setErrorMsg('');
    const token = localStorage.getItem('token');

    if (!diaSemana || !horaInicio || !horaFin || !nuevaAsignatura || !idProfesorSeleccionado) {
      setErrorMsg('Todos los campos son obligatorios');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/aulas/${aula.idaula}/asignaturas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          idAsignatura: nuevaAsignatura,
          idProfesor: idProfesorSeleccionado,
          diaSemana,
          horaInicio,
          horaFin
        })
      });

      if (!res.ok) throw new Error((await res.json()).message || 'Error');

      const data = await res.json();
      setAsignaturasAsignadas(data);
      setSuccessMsg(editando ? 'Horario actualizado' : 'Asignación guardada');
      limpiar();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Asignar Asignaturas a: {aula.nombreaula}</h2>
      <p><strong>Código:</strong> {aula.codeaula}</p>

      {errorMsg && <div className="error-msg">{errorMsg}</div>}
      {successMsg && <div className="success-msg">{successMsg}</div>}

      <div className={`form-flex ${editando ? 'reasignando' : ''}`}>
        <select value={nuevaAsignatura} onChange={e => setNuevaAsignatura(e.target.value)} disabled={editando} required>
          <option value="">Seleccionar asignatura</option>
          {asignaturasDisponibles.map(a => (
            <option key={a.idasignatura} value={a.idasignatura}>
              {a.nombreasignatura}
            </option>
          ))}
        </select>

        <select value={idProfesorSeleccionado} onChange={e => setIdProfesorSeleccionado(e.target.value)} required>
          <option value="">Seleccionar profesor</option>
          {profesoresDeAsignatura.map(p => (
            <option key={p.idprofesor} value={p.idprofesor}>
              {p.nombreprofesor} - {p.mailprofesor}
            </option>
          ))}
        </select>

        <select value={diaSemana} onChange={e => setDiaSemana(e.target.value)} required>
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

        <button onClick={guardarAsignacion}>{editando ? 'Actualizar' : 'Asignar'}</button>
        {editando && <button className="action-btn cancel" onClick={limpiar}>Cancelar</button>}
      </div>
      
      <h4 style={{ marginTop: '2rem' }}>Asignaturas asignadas:</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Asignatura</th>
            <th>Profesor</th>
            <th>Día</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asignaturasAsignadas.length > 0 ? (
            asignaturasAsignadas.map((a) => (
              <tr key={a.idasignatura}>
                <td>{a.nombreasignatura}</td>
                <td>{a.nombreprofesor || '—'}</td>
                <td>{a.diasemana}</td>
                <td>{a.horainicio}</td>
                <td>{a.horafin}</td>
                <td>
                  <button
                    className="action-btn edit"
                    onClick={() => {
                      setNuevaAsignatura(a.idasignatura);
                      setDiaSemana(a.diasemana);
                      setHoraInicio(a.horainicio);
                      setHoraFin(a.horafin);
                      setEditando(a);
                    }}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))
          ) : (
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
