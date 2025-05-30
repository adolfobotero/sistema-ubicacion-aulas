import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Gestion.css';
import ActionButton from '../components/ActionButton';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    codeUsuario: '',
    nombreCompleto: '',
    mailUsuario: '',
    passUsuario: '',
    rolUsuario: '',
    metodoLogin: 'local'
  });
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [total, setTotal] = useState(0);
  const porPagina = 5;

  const fetchUsuarios = useCallback (async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/usuarios?pagina=${paginaActual}&limite=${porPagina}&busqueda=${encodeURIComponent(busqueda)}`);
      const data = await res.json();
      setUsuarios(data.registros);
      setTotal(data.total);
    } catch (err) {
      setError('Error al cargar los usuarios.');
      console.error(err);
    }
  }, [paginaActual, busqueda]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.mailUsuario.endsWith('@ucaldas.edu.co')) {
      setError('Solo se permiten correos institucionales (@ucaldas.edu.co)');
      return;
    }

    const url = editandoId
      ? `${process.env.REACT_APP_API_URL}/api/usuarios/${editandoId}`
      : `${process.env.REACT_APP_API_URL}/api/usuarios`;
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error('Error al guardar el usuario');

      await fetchUsuarios();
      setForm({
        codeUsuario: '',
        nombreCompleto: '',
        mailUsuario: '',
        passUsuario: '',
        rolUsuario: '',
        metodoLogin: 'local'
      });
      setEditandoId(null);
      setError('');
    } catch (err) {
      setError('No se pudo guardar el usuario.');
      console.error(err);
    }
  };

  const handleEdit = (usuario) => {
    setForm({
      codeUsuario: usuario.codeusuario,
      nombreCompleto: usuario.nombrecompleto,
      mailUsuario: usuario.mailusuario,
      passUsuario: '',
      rolUsuario: usuario.rolusuario,
      metodoLogin: usuario.metodologin
    });
    setEditandoId(usuario.idusuario);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/usuarios/${id}`, { method: 'DELETE' });
      fetchUsuarios();
    } catch (err) {
      setError('Error al eliminar usuario');
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h2>Gestión de Usuarios 👤</h2>

      <form onSubmit={handleSubmit} className="form-flex">
        <input type="text" name="codeUsuario" placeholder="Código" value={form.codeUsuario} onChange={handleInputChange} required />
        <input type="text" name="nombreCompleto" placeholder="Nombre completo" value={form.nombreCompleto} onChange={handleInputChange} required />
        <input type="email" name="mailUsuario" placeholder="Correo institucional" value={form.mailUsuario} onChange={handleInputChange} required />
        <input type="password" name="passUsuario" placeholder="Contraseña" value={form.passUsuario} onChange={handleInputChange} required={!editandoId} />
        <select name="rolUsuario" value={form.rolUsuario} onChange={handleInputChange} required>
          <option value="">Rol</option>
          <option value="admin">Admin</option>
          {/*<option value="estudiante">Estudiante</option>*/}
        </select>
        <button type="submit">{editandoId ? 'Actualizar' : 'Agregar Usuario'}</button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      <div className="import-container">
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
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
            <th>Correo</th>
            <th>Rol</th>
            <th>Método</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.idusuario}>
              <td>{u.codeusuario}</td>
              <td>{u.nombrecompleto}</td>
              <td>{u.mailusuario}</td>
              <td><span className={`rol-tag ${u.rolusuario}`}>{u.rolusuario}</span></td>
              <td>{u.metodologin}</td>
              <td>
                <div className="acciones-flex">
                  <ActionButton text="Editar" type="edit" onClick={() => handleEdit(u)} />
                  <ActionButton text="Eliminar" type="delete" onClick={() => handleDelete(u.idusuario)} />
                </div>
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

export default Usuarios;