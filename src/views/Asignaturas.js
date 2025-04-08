// src/views/Asignaturas.js
import React, { useState, useEffect } from 'react';
import '../styles/Gestion.css';
import ActionButton from '../components/ActionButton';

const Asignaturas = ({ setAsignaturaSeleccionada, setActiveSection }) => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [form, setForm] = useState({
    codeAsignatura: '',
    nombreAsignatura: ''
  });
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 5;

  useEffect(() => {
    fetchAsignaturas();
  }, []);

  const fetchAsignaturas = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/asignaturas');
      const data = await res.json();
      setAsignaturas(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar asignaturas.');
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editandoId
      ? `http://localhost:3001/api/asignaturas/${editandoId}`
      : 'http://localhost:3001/api/asignaturas';
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error('Error al guardar asignatura');
      await fetchAsignaturas();
      setForm({ codeAsignatura: '', nombreAsignatura: '' });
      setEditandoId(null);
      setError('');
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar la asignatura.');
    }
  };

  const handleEdit = (a) => {
    setForm({
      codeAsignatura: a.codeasignatura,
      nombreAsignatura: a.nombreasignatura
    });
    setEditandoId(a.idasignatura);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta asignatura?')) return;
    try {
      await fetch(`http://localhost:3001/api/asignaturas/${id}`, {
        method: 'DELETE'
      });
      fetchAsignaturas();
    } catch (err) {
      setError('Error al eliminar la asignatura.');
      console.error(err);
    }
  };

  const asignaturasFiltradas = asignaturas.filter((a) =>
    a.nombreasignatura.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.codeasignatura.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(asignaturasFiltradas.length / porPagina);
  const inicio = (paginaActual - 1) * porPagina;
  const asignaturasEnPagina = asignaturasFiltradas.slice(inicio, inicio + porPagina);

  return (
    <div className="form-container">
      <h2>Gestión de Asignaturas 📚</h2>

      <form onSubmit={handleSubmit} className="form-flex">
        <input
          type="text"
          name="codeAsignatura"
          placeholder="Código"
          value={form.codeAsignatura}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="nombreAsignatura"
          placeholder="Nombre"
          value={form.nombreAsignatura}
          onChange={handleInputChange}
          required
        />
        <button type="submit">{editandoId ? 'Actualizar' : 'Agregar Asignatura'}</button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      <div className="import-container">
        <input
          type="text"
          placeholder="Buscar asignatura..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaActual(1);
          }}
          className="search-input"
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Profesores</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asignaturasEnPagina.map((a) => (
            <tr key={a.idasignatura}>
              <td>{a.codeasignatura}</td>
              <td>{a.nombreasignatura}</td>
              <td>{a.profesores || 'No asignado'}</td>
              <td>
                <ActionButton
                  text="Profesores"
                  type="view"
                  onClick={() => {
                    setAsignaturaSeleccionada(a);
                    setActiveSection('asignarProfesores');
                  }}
                />
                <ActionButton text="Editar" type="edit" onClick={() => handleEdit(a)} />
                <ActionButton text="Eliminar" type="delete" onClick={() => handleDelete(a.idasignatura)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="paginacion">
        <button onClick={() => setPaginaActual(p => Math.max(p - 1, 1))} disabled={paginaActual === 1}>
          ⬅ Anterior
        </button>
        <span>Página {paginaActual} de {totalPaginas}</span>
        <button onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))} disabled={paginaActual === totalPaginas}>
          Siguiente ➡
        </button>
      </div>
    </div>
  );
};

export default Asignaturas;
