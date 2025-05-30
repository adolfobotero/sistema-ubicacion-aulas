import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Gestion.css';
import ActionButton from '../components/ActionButton';
import * as XLSX from 'xlsx';

const Asignaturas = ({ setAsignaturaSeleccionada, setActiveSection }) => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [detalleAsignatura, setDetalleAsignatura] = useState(null);
  const [form, setForm] = useState({ codeAsignatura: '', nombreAsignatura: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [total, setTotal] = useState(0);
  const porPagina = 5;

  const fetchAsignaturas = useCallback (async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/asignaturas?pagina=${paginaActual}&limite=${porPagina}&busqueda=${encodeURIComponent(busqueda)}`);
      const data = await res.json();
      setAsignaturas(data.registros);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      setError('Error al cargar asignaturas.');
    }
  }, [paginaActual, busqueda]);

  useEffect(() => {
    fetchAsignaturas();
    setDetalleAsignatura(null);
  }, [fetchAsignaturas]);

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
  
      const asignaturasValidas = rows.filter(a => a.codeAsignatura && a.nombreAsignatura);
      
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/asignaturas/importar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ asignaturas: asignaturasValidas })
        });
  
        const result = await res.json();
        alert(`Se importaron ${result.insertados} asignaturas.\nSe ignoraron ${result.ignorados} registros inválidos o duplicados.`);
        fetchAsignaturas(); // si tienes esta función para refrescar
      } catch (err) {
        console.error(err);
        alert('Error al importar asignaturas.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const cargarDetalle = async (idAsignatura) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/asignaturas/${idAsignatura}/detalle`);
      const data = await res.json();
      setDetalleAsignatura(data);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
      setDetalleAsignatura(null);
    }
  };  

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editandoId
      ? `${process.env.REACT_APP_API_URL}/api/asignaturas/${editandoId}`
      : `${process.env.REACT_APP_API_URL}/api/asignaturas`;
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
    setForm({ codeAsignatura: a.codeasignatura, nombreAsignatura: a.nombreasignatura });
    setEditandoId(a.idasignatura);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta asignatura?')) return;
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/asignaturas/${id}`, { method: 'DELETE' });
      fetchAsignaturas();
    } catch (err) {
      setError('Error al eliminar la asignatura.');
      console.error(err);
    }
  };

  const totalPaginas = Math.ceil(total / porPagina);

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
      <label htmlFor="excel-asignaturas-upload" className="import-btn">Importar desde Excel</label>
      <input id="excel-asignaturas-upload" type="file" accept=".xlsx, .xls" onChange={handleImportExcel} style={{ display: 'none' }} />
      <button onClick={() => window.open(`${process.env.REACT_APP_API_URL}/api/asignaturas/exportar`, '_blank')} className="export-btn">
        Exportar a Excel
      </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '50px' }}>Código</th>
            <th style={{ width: '200px' }}>Nombre</th>
            <th style={{ width: '280px' }}>Profesores</th>
            <th style={{ width: '470px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asignaturas.length > 0 ? (
            asignaturas.map((a) => (
              <tr key={a.idasignatura}>
                <td>{a.codeasignatura}</td>
                <td>{a.nombreasignatura}</td>
                <td>
                  {(a.profesores || 'No asignado')
                    .split(', ')
                    .map((prof, i) => <div key={i}>{prof}</div>)}
                </td>
                <td>
                  <div className="acciones-flex">
                    <ActionButton text="Profesores" type="view" onClick={() => {
                      setAsignaturaSeleccionada(a);
                      setActiveSection('asignarProfesores');
                    }} />
                    <ActionButton text="Detalle" type="view" onClick={() => cargarDetalle(a.idasignatura)} />
                    <ActionButton text="Historial" type="info" onClick={() => {
                      setAsignaturaSeleccionada(a);
                      setActiveSection('historialAsignatura');
                    }} />
                    <ActionButton text="Editar" type="edit" onClick={() => handleEdit(a)} />
                    <ActionButton text="Eliminar" type="delete" onClick={() => handleDelete(a.idasignatura)} />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4">No hay asignaturas registradas.</td></tr>
          )}
        </tbody>
      </table>

      {detalleAsignatura && (
        <div className="detalle-asignatura">
          <button className="ocultar-detalle-btn" onClick={() => setDetalleAsignatura(null)}>
            ✖ Ocultar detalle
          </button>
          <h4>Detalle de Asignatura</h4>
          {detalleAsignatura.length > 0 ? (
            <ul>
              {detalleAsignatura.map((d, i) => (
                <li key={i}>
                  <strong>{d.nombreprofesor}</strong> ({d.mailprofesor}) – {d.codeaula} {d.nombreaula}, {d.diasemana} de {d.horainicio} a {d.horafin}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay asignaciones registradas.</p>
          )}
        </div>
      )}
      
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
