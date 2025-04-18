import React, { useEffect, useState } from 'react';
import '../styles/Gestion.css';
import ActionButton from '../components/ActionButton';
import * as XLSX from 'xlsx';

const Sedes = () => {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    codeSede: '',
    nombreSede: '',
    direccionSede: '',
    latitudSede: '',
    longitudSede: ''
  });
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    fetchSedes();
  }, []);

  const fetchSedes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sedes`);
      if (!response.ok) throw new Error('Error al obtener sedes');
      const data = await response.json();
      setSedes(data);
      setLoading(false);
    } catch (err) {
      console.error(err.message);
      setError('No se pudieron cargar las sedes. Intente más tarde.');
      setLoading(false);
    }
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
  
      const sedesValidas = rows.filter(s => s.codeSede && s.nombreSede);
  
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/sedes/importar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ sedes: sedesValidas })
        });
  
        const result = await res.json();
        alert(`Se importaron ${result.insertados} sedes.\nSe ignoraron ${result.ignorados} registros inválidos o duplicados.`);
        fetchSedes(); // Si tienes esta función para recargar
      } catch (err) {
        console.error(err);
        alert('Error al importar sedes.');
      }
    };
    reader.readAsArrayBuffer(file);
  };  

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdateSede = async (e) => {
    e.preventDefault();

    const { codeSede, nombreSede, direccionSede, latitudSede, longitudSede } = form;

    if (!codeSede || !nombreSede || !direccionSede || latitudSede === '' || longitudSede === '') {
      alert('Todos los campos son obligatorios');
      return;
    }

    try {
      const url = editandoId
        ? `${process.env.REACT_APP_API_URL}/api/sedes/${editandoId}`
        : `${process.env.REACT_APP_API_URL}/api/sedes`;

      const method = editandoId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeSede,
          nombreSede,
          direccionSede,
          latitudSede: parseFloat(latitudSede),
          longitudSede: parseFloat(longitudSede)
        })
      });

      if (!response.ok) throw new Error('Error al guardar sede');

      await fetchSedes();
      setForm({ codeSede: '', nombreSede: '', direccionSede: '', latitudSede: '', longitudSede: '' });
      setEditandoId(null);
    } catch (err) {
      console.error(err.message);
      alert('No se pudo guardar la sede. Intente más tarde.');
    }
  };

  const handleEdit = (sede) => {
    setForm({
      codeSede: sede.codesede,
      nombreSede: sede.nombresede,
      direccionSede: sede.direccionsede,
      latitudSede: sede.latitudsede,
      longitudSede: sede.longitudsede
    });
    setEditandoId(sede.idsede);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta sede?')) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sedes/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar sede');
      await fetchSedes();
    } catch (err) {
      console.error(err.message);
      alert('No se pudo eliminar la sede.');
    }
  };

  return (
    <div className="form-container">
      <h2>Gestión de Sedes 🏬</h2>

      <form onSubmit={handleAddOrUpdateSede} className="form-flex">
        <input
          type="text"
          name="codeSede"
          placeholder="Código de sede"
          value={form.codeSede}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="nombreSede"
          placeholder="Nombre de la sede"
          value={form.nombreSede}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="direccionSede"
          placeholder="Dirección"
          value={form.direccionSede}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="latitudSede"
          placeholder="Latitud"
          value={form.latitudSede}
          onChange={handleInputChange}
          required
          step="any"
        />
        <input
          type="number"
          name="longitudSede"
          placeholder="Longitud"
          value={form.longitudSede}
          onChange={handleInputChange}
          required
          step="any"
        />
        <button type="submit">{editandoId ? 'Actualizar Sede' : 'Agregar Sede'}</button>
      </form>

      <div className="import-container">
        <label htmlFor="excel-upload" className="import-btn">Importar desde Excel</label>
        <input id="excel-upload" type="file" accept=".xlsx, .xls" onChange={handleImportExcel} style={{ display: 'none' }} />
        <button onClick={() => window.open(`${process.env.REACT_APP_API_URL}/api/sedes/exportar`, '_blank')} className="export-btn">
          Exportar a Excel
        </button>
      </div>

      {loading && <p>Cargando sedes...</p>}
      {error && <div className="error-msg">{error}</div>}

      {!loading && sedes.length === 0 && <p>No hay sedes registradas.</p>}

      {!loading && sedes.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              {/* <th>ID</th> */}
              <th>Código</th>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Latitud</th>
              <th>Longitud</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sedes.map((sede) => (
              <tr key={sede.idsede}>
                {/* <td>{sede.idsede}</td> */ }
                <td>{sede.codesede}</td>
                <td>{sede.nombresede}</td>
                <td>{sede.direccionsede}</td>
                <td>{sede.latitudsede}</td>
                <td>{sede.longitudsede}</td>
                <td>
                  <ActionButton text="Editar" type="edit" onClick={() => handleEdit(sede)} />
                  <ActionButton text="Eliminar" type="delete" onClick={() => handleDelete(sede.idsede)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Sedes;
