// src/views/Aulas.js
import React, { useState, useEffect } from 'react';
import '../styles/Gestion.css';
import ActionButton from '../components/ActionButton';

const Aulas = ({ setActiveSection, setAsignaturaAulaSeleccionada }) => {
  const [aulas, setAulas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [form, setForm] = useState({
    codeAula: '',
    nombreAula: '',
    capAula: '',
    idSedeActual: ''
  });
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 5;

  useEffect(() => {
    fetchAulas();
    fetchSedes();
  }, []);

  const fetchAulas = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/aulas');
      const data = await res.json();
      setAulas(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las aulas.');
    }
  };

  const fetchSedes = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/sedes');
      const data = await res.json();
      setSedes(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las sedes.');
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editandoId
      ? `http://localhost:3001/api/aulas/${editandoId}`
      : 'http://localhost:3001/api/aulas';
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error('Error al guardar aula');
      await fetchAulas();
      setForm({ codeAula: '', nombreAula: '', capAula: '', idSedeActual: '' });
      setEditandoId(null);
      setError('');
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el aula.');
    }
  };

  const handleEdit = (aula) => {
    setForm({
      codeAula: aula.codeaula,
      nombreAula: aula.nombreaula,
      capAula: aula.capaula,
      idSedeActual: aula.idsedeactual
    });
    setEditandoId(aula.idaula);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta aula?')) return;
    try {
      await fetch(`http://localhost:3001/api/aulas/${id}`, {
        method: 'DELETE'
      });
      fetchAulas();
    } catch (err) {
      setError('Error al eliminar el aula.');
      console.error(err);
    }
  };

  const aulasFiltradas = aulas.filter((a) =>
    a.nombreaula.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.codeaula.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(aulasFiltradas.length / porPagina);
  const inicio = (paginaActual - 1) * porPagina;
  const aulasEnPagina = aulasFiltradas.slice(inicio, inicio + porPagina);

  return (
    <div className="form-container">
      <h2>Gestión de Aulas 🏢</h2>

      <form onSubmit={handleSubmit} className="form-flex">
        <input
          type="text"
          name="codeAula"
          placeholder="Código del Aula"
          value={form.codeAula}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="nombreAula"
          placeholder="Nombre del Aula"
          value={form.nombreAula}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="capAula"
          placeholder="Capacidad"
          value={form.capAula}
          onChange={handleInputChange}
          required
        />
        <select
          name="idSedeActual"
          value={form.idSedeActual}
          onChange={handleInputChange}
          required
        >
          <option value="">Seleccione Sede</option>
          {sedes.map((sede) => (
            <option key={sede.idsede} value={sede.idsede}>
              {sede.nombresede}
            </option>
          ))}
        </select>
        <button type="submit">{editandoId ? 'Actualizar' : 'Agregar Aula'}</button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      <div className="import-container">
        <input
          type="text"
          placeholder="Buscar aula..."
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
            <th>Nombre del Aula</th>
            <th>Capacidad</th>
            <th>Sede</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {aulasEnPagina.map((aula) => (
            <tr key={aula.idaula}>
              <td>{aula.codeaula}</td>
              <td>{aula.nombreaula}</td>
              <td>{aula.capaula}</td>
              <td>{aula.nombresede}</td>
              <td>
                <ActionButton
                  text="Asignar"
                  type="view"
                  onClick={() => {
                    setAsignaturaAulaSeleccionada(aula);
                    setActiveSection('asignarAulas');
                  }}
                />
                <ActionButton text="Editar" type="edit" onClick={() => handleEdit(aula)} />
                <ActionButton text="Eliminar" type="delete" onClick={() => handleDelete(aula.idaula)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="paginacion">
        <button onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))} disabled={paginaActual === 1}>
          ⬅ Anterior
        </button>
        <span>Página {paginaActual} de {totalPaginas}</span>
        <button onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))} disabled={paginaActual === totalPaginas}>
          Siguiente ➡
        </button>
      </div>
    </div>
  );
};

export default Aulas;
