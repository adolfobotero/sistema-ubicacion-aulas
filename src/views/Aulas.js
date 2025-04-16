import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Gestion.css';
import ActionButton from '../components/ActionButton';
import * as XLSX from 'xlsx';

const Aulas = ({ setAsignaturaAulaSeleccionada, setActiveSection}) => {
  const [aulas, setAulas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [form, setForm] = useState({
    codeAula: '',
    nombreAula: '',
    capAula: '',
    idSedeActual: '',
    edificioAula: '',
    pisoAula: ''
  });
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [total, setTotal] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const porPagina = 5;

  const fetchAulas = useCallback (async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/aulas?pagina=${paginaActual}&limite=${porPagina}&busqueda=${encodeURIComponent(busqueda)}`);
      const data = await res.json();
      setAulas(data.registros);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las aulas.');
    }
  }, [paginaActual, busqueda]);

  useEffect(() => {
    fetchAulas();
    fetchSedes();
  }, [fetchAulas]);

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      const aulasValidas = rows.filter(a => a.codeAula && a.nombreAula && a.codeSede);

      try {
        const res = await fetch('http://localhost:3001/api/aulas/importar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ aulas: aulasValidas })
        });

        const result = await res.json();
        alert(`Se importaron ${result.insertados} aulas.\nSe ignoraron ${result.ignorados} registros inválidos o duplicados.`);
        fetchAulas(); // si tienes esta función para refrescar
      } catch (err) {
        console.error(err);
        alert('Error al importar aulas.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportAsignaciones = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
  
      const validas = rows.filter(r =>
        r.codeAula && r.codeAsignatura && r.codeProfesor &&
        r.diaSemana && r.horaInicio && r.horaFin
      );
  
      try {
        const res = await fetch('http://localhost:3001/api/aulas/importar-asignaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ asignaciones: validas })
        });
  
        const result = await res.json();
        alert(`Se importaron ${result.insertados} asignaciones.\nSe ignoraron ${result.ignorados} registros duplicados o inválidos.`);
        if (result.conflictos && result.conflictos.length > 0) {
          exportarConflictosExcel(result.conflictos); // Se genera el archivo de errores automáticamente
        }
      } catch (err) {
        console.error(err);
        alert('Error al importar asignaciones.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const exportarConflictosExcel = (conflictos) => {
    if (!conflictos || conflictos.length === 0) {
      alert("No hay conflictos para exportar.");
      return;
    }
  
    const ws = XLSX.utils.json_to_sheet(conflictos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Conflictos');
  
    XLSX.writeFile(wb, 'conflictos_asignaciones.xlsx');
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
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error('Error al guardar aula');
      await fetchAulas();
      setForm({
        codeAula: '', nombreAula: '', capAula: '',
        idSedeActual: '', edificioAula: '', pisoAula: ''
      });
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
      idSedeActual: aula.idsedeactual,
      edificioAula: aula.edificioaula,
      pisoAula: aula.pisoaula
    });
    setEditandoId(aula.idaula);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta aula?')) return;
    try {
      await fetch(`http://localhost:3001/api/aulas/${id}`, { method: 'DELETE' });
      fetchAulas();
    } catch (err) {
      setError('Error al eliminar el aula.');
    }
  };

  return (
    <div className="form-container">
      <h2>Gestión de Aulas 🏢</h2>

      <form onSubmit={handleSubmit} className="form-flex">
        <input type="text" name="codeAula" placeholder="Código" value={form.codeAula} onChange={handleInputChange} required />
        <input type="text" name="nombreAula" placeholder="Nombre" value={form.nombreAula} onChange={handleInputChange} required />
        <input type="number" name="capAula" placeholder="Capacidad" value={form.capAula} onChange={handleInputChange} required />
        <select name="idSedeActual" value={form.idSedeActual} onChange={handleInputChange} required>
          <option value="">Seleccione Sede</option>
          {sedes.map((s) => (
            <option key={s.idsede} value={s.idsede}>{s.nombresede}</option>
          ))}
        </select>
        <input type="text" name="edificioAula" placeholder="Edificio" value={form.edificioAula} onChange={handleInputChange} required />
        <select name="pisoAula" value={form.pisoAula} onChange={handleInputChange} required>
          <option value="">Seleccione Piso</option>
          <option value="Piso 1">Piso 1</option>
          <option value="Piso 2">Piso 2</option>
          <option value="Piso 3">Piso 3</option>
          <option value="Piso 4">Piso 4</option>
          <option value="Piso 5">Piso 5</option>
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
      <label htmlFor="excel-aulas-upload" className="import-btn">Importar desde Excel</label>
      <input id="excel-aulas-upload" type="file" accept=".xlsx, .xls" onChange={handleImportExcel} style={{ display: 'none' }} />
      <label htmlFor="excel-asignaciones-upload" className="import-btn">Importar Asignaciones</label>
      <input id="excel-asignaciones-upload" type="file" accept=".xlsx, .xls" onChange={handleImportAsignaciones} style={{ display: 'none' }} />
      <button onClick={() => window.open('http://localhost:3001/api/aulas/exportar', '_blank')} className="export-btn">
        Exportar a Excel
      </button>
      </div>

      <div style={{ textAlign: 'right', marginBottom: '1rem' }}>

      </div>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Capacidad</th>
            <th>Sede</th>
            <th>Edificio</th>
            <th>Piso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {aulas.map((aula) => (
            <tr key={aula.idaula}>
              <td>{aula.codeaula}</td>
              <td>{aula.nombreaula}</td>
              <td>{aula.capaula}</td>
              <td>{aula.nombresede}</td>
              <td>{aula.edificioaula}</td>
              <td>{aula.pisoaula}</td>
              <td>
                <ActionButton text="Asignaturas" type="view" onClick={() => {
                  setAsignaturaAulaSeleccionada(aula);
                  setActiveSection('asignarAulas');
                }} />
                <ActionButton text="Editar" type="edit" onClick={() => handleEdit(aula)} />
                <ActionButton text="Eliminar" type="delete" onClick={() => handleDelete(aula.idaula)} />
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

export default Aulas;
