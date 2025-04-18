import React, { useEffect, useState } from 'react';
import '../styles/Gestion.css';

const MoverAsignatura = ({ setActiveSection }) => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState(null);
  const [profesoresAsignatura, setProfesoresAsignatura] = useState([]);
  const [idProfesor, setIdProfesor] = useState('');
  const [aulas, setAulas] = useState([]);
  const [nuevaAula, setNuevaAula] = useState('');
  const [nuevoDia, setNuevoDia] = useState('');
  const [nuevaHoraInicio, setNuevaHoraInicio] = useState('');
  const [nuevaHoraFin, setNuevaHoraFin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/aulas/asignadas`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => setAsignaturas(data))
      .catch(() => setErrorMsg('No se pudieron cargar las asignaturas.'));

    fetch(`${process.env.REACT_APP_API_URL}/api/aulas?limite=1000`)
      .then(res => res.json())
      .then(data => setAulas(data.registros || data))
      .catch(() => setErrorMsg('No se pudieron cargar las aulas.'));
  }, []);

  const handleSeleccionAsignatura = async (id) => {
    const seleccionada = asignaturas.find(a => a.idasignatura === id);
    setAsignaturaSeleccionada(seleccionada || null);
    setNuevaAula('');
    setNuevoDia('');
    setNuevaHoraInicio('');
    setNuevaHoraFin('');
    setIdProfesor('');
    setSuccessMsg('');
    setErrorMsg('');

    if (id) {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/asignaturas/${id}/profesores`);
        const data = await res.json();
        setProfesoresAsignatura(data);
      } catch (err) {
        console.error('Error al cargar profesores:', err);
        setProfesoresAsignatura([]);
      }
    }
  };

  const moverAsignatura = async () => {
    setErrorMsg('');
    const token = localStorage.getItem('token');

    if (!asignaturaSeleccionada || !nuevaAula || !nuevoDia || !nuevaHoraInicio || !nuevaHoraFin || !idProfesor) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/aulas/${nuevaAula}/mover-asignatura`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          idAsignatura: asignaturaSeleccionada.idasignatura,
          aulaAnterior: asignaturaSeleccionada.idaula,
          diaAnterior: asignaturaSeleccionada.diasemana,
          horaInicioAnterior: asignaturaSeleccionada.horainicio,
          horaFinAnterior: asignaturaSeleccionada.horafin,
          nuevoDia,
          nuevaHoraInicio,
          nuevaHoraFin,
          idProfesor
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al mover la asignatura');
      }

      setSuccessMsg('Asignatura reubicada correctamente.');
      setAsignaturaSeleccionada(null);
      setNuevaAula('');
      setNuevoDia('');
      setNuevaHoraInicio('');
      setNuevaHoraFin('');
      setIdProfesor('');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error al mover la asignatura.');
    }
  };

  return (
    <div className="form-container">
      <h2>Reubicar Asignaturas 🧭</h2>

      {errorMsg && <div className="error-msg">{errorMsg}</div>}
      {successMsg && <div className="success-msg">{successMsg}</div>}

      <div className="form-flex">
        <select
          value={asignaturaSeleccionada?.idasignatura || ''}
          onChange={(e) => handleSeleccionAsignatura(e.target.value)}
          required
        >
          <option value="">Selecciona una asignatura</option>
          {asignaturas.map(a => (
            <option key={a.idasignatura} value={a.idasignatura}>
              {a.nombreasignatura} ({a.diasemana} {a.horainicio} - {a.horafin})
            </option>
          ))}
        </select>

        {asignaturaSeleccionada && (
          <div style={{ width: '100%', marginTop: '1rem' }}>
            <p><strong>Aula actual:</strong> {asignaturaSeleccionada.nombreaula}</p>
            <p><strong>Horario actual:</strong> {asignaturaSeleccionada.diasemana} – {asignaturaSeleccionada.horainicio} a {asignaturaSeleccionada.horafin}</p>
            <p><strong>Profesor asignado:</strong> {asignaturaSeleccionada.nombreprofesor}</p>
            <p><strong>Correo:</strong> {asignaturaSeleccionada.mailprofesor}</p>
          </div>
        )}

        {asignaturaSeleccionada && (
          <select value={idProfesor} onChange={e => setIdProfesor(e.target.value)} required>
            <option value="">Seleccionar profesor</option>
            {profesoresAsignatura.map(p => (
              <option key={p.idprofesor} value={p.idprofesor}>
                {p.nombreprofesor} - {p.mailprofesor}
              </option>
            ))}
          </select>
        )}

        <select value={nuevaAula} onChange={(e) => setNuevaAula(e.target.value)} required>
          <option value="">Seleccionar nueva aula</option>
          {aulas.map(a => (
            <option key={a.idaula} value={a.idaula}>
              {a.codeaula} - {a.nombreaula}
            </option>
          ))}
        </select>

        <select value={nuevoDia} onChange={(e) => setNuevoDia(e.target.value)} required>
          <option value="">Día</option>
          <option value="Lunes">Lunes</option>
          <option value="Martes">Martes</option>
          <option value="Miércoles">Miércoles</option>
          <option value="Jueves">Jueves</option>
          <option value="Viernes">Viernes</option>
          <option value="Sábado">Sábado</option>
        </select>

        <input type="time" value={nuevaHoraInicio} onChange={(e) => setNuevaHoraInicio(e.target.value)} required />
        <input type="time" value={nuevaHoraFin} onChange={(e) => setNuevaHoraFin(e.target.value)} required />

        <button onClick={moverAsignatura}>Confirmar Movimiento</button>
      </div>

      <div className="paginacion" style={{ justifyContent: 'center', marginTop: '2rem' }}>
        <button onClick={() => setActiveSection('aulas')}>⬅ Volver a Aulas</button>
      </div>
    </div>
  );
};

export default MoverAsignatura;
