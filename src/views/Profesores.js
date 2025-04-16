
import React, { useEffect, useState, useCallback } from 'react';
import '../styles/Gestion.css';
import ActionButton from '../components/ActionButton';
import * as XLSX from 'xlsx';

const Profesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [form, setForm] = useState({
    codeProfesor: '',
    nombreProfesor: '',
    mailProfesor: ''
  });
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [total, setTotal] = useState(0);
  const porPagina = 5;

  const fetchProfesores = useCallback (async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/profesores?pagina=${paginaActual}&limite=${porPagina}&busqueda=${encodeURIComponent(busqueda)}`);
      const data = await res.json();
      setProfesores(data.registros);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      setError('Error al cargar profesores.');
    }
  }, [paginaActual, busqueda]);

  useEffect(() => {
    fetchProfesores();
  }, [fetchProfesores]);

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
      const profesoresValidos = rows.filter((p) =>
        p.codeProfesor && p.nombreProfesor && p.mailProfesor && p.mailProfesor.endsWith('@ucaldas.edu.co')
      );
      try {
        const res = await fetch('http://localhost:3001/api/profesores/importar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profesores: profesoresValidos })
        });
        const result = await res.json();
        await fetchProfesores();
        alert(`Se importaron ${result.insertados} profesores.\nSe ignoraron ${result.ignorados} registros inválidos o duplicados.`);
      } catch (err) {
        console.error(err);
        alert('Error al importar profesores.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.codeProfesor || !form.nombreProfesor || !form.mailProfesor) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (!form.mailProfesor.endsWith('@ucaldas.edu.co')) {
      setError('Solo se permiten correos institucionales (@ucaldas.edu.co)');
      return;
    }
    const url = editandoId
      ? `http://localhost:3001/api/profesores/${editandoId}`
      : 'http://localhost:3001/api/profesores';
    const method = editandoId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Error al guardar');
      fetchProfesores();
      setForm({ codeProfesor: '', nombreProfesor: '', mailProfesor: '' });
      setEditandoId(null);
      setError('');
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el profesor.');
    }
  };

  const handleEdit = (p) => {
    setForm({
      codeProfesor: p.codeprofesor,
      nombreProfesor: p.nombreprofesor,
      mailProfesor: p.mailprofesor
    });
    setEditandoId(p.idprofesor);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este profesor?')) return;
    try {
      await fetch(`http://localhost:3001/api/profesores/${id}`, {
        method: 'DELETE'
      });
      fetchProfesores();
    } catch (err) {
      console.error(err);
      setError('Error al eliminar.');
    }
  };

  return (
    <div className="form-container">
      <h2>Gestión de Profesores 👨‍🏫</h2>

      <form onSubmit={handleSubmit} className="form-flex">
        <input type="text" name="codeProfesor" placeholder="Código" value={form.codeProfesor} onChange={handleInputChange} required />
        <input type="text" name="nombreProfesor" placeholder="Nombre completo" value={form.nombreProfesor} onChange={handleInputChange} required />
        <input type="email" name="mailProfesor" placeholder="Correo institucional" value={form.mailProfesor} onChange={handleInputChange} required />
        <button type="submit">{editandoId ? 'Actualizar' : 'Agregar Profesor'}</button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      <div className="import-container">
      <input type="text"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaActual(1);
          }}
          className="search-input"
        />
        <label htmlFor="excel-upload" className="import-btn">Importar desde Excel</label>
        <input id="excel-upload" type="file" accept=".xlsx, .xls" onChange={handleImportExcel} style={{ display: 'none' }} />
        <button onClick={() => window.open('http://localhost:3001/api/profesores/exportar', '_blank')} className="export-btn">
          Exportar a Excel
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {profesores.map((p) => (
            <tr key={p.idprofesor}>
              <td>{p.codeprofesor}</td>
              <td>{p.nombreprofesor}</td>
              <td>{p.mailprofesor}</td>
              <td>
                <ActionButton text="Editar" type="edit" onClick={() => handleEdit(p)} />
                <ActionButton text="Eliminar" type="delete" onClick={() => handleDelete(p.idprofesor)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="paginacion">
        <button onClick={() => setPaginaActual(p => Math.max(p - 1, 1))} disabled={paginaActual === 1}>⬅ Anterior</button>
        <span>Página {paginaActual} de {Math.ceil(total / porPagina)}</span>
        <button onClick={() => setPaginaActual(p => Math.min(p + 1, Math.ceil(total / porPagina)))} disabled={paginaActual >= Math.ceil(total / porPagina)}>Siguiente ➡</button>
      </div>
    </div>
  );
};

export default Profesores;
