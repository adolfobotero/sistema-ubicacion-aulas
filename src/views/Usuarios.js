import React, { useState, useEffect } from 'react';
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
  const usuariosPorPagina = 5;

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/usuarios');
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      setError('Error al cargar los usuarios.');
      console.error(err);
    }
  };

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
      ? `http://localhost:3001/api/usuarios/${editandoId}`
      : 'http://localhost:3001/api/usuarios';
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
      await fetch(`http://localhost:3001/api/usuarios/${id}`, { method: 'DELETE' });
      fetchUsuarios();
    } catch (err) {
      setError('Error al eliminar usuario');
      console.error(err);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombrecompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.mailusuario.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
  const indiceInicial = (paginaActual - 1) * usuariosPorPagina;
  const usuariosEnPagina = usuariosFiltrados.slice(indiceInicial, indiceInicial + usuariosPorPagina);

  return (
    <div className="form-container">
      <h2>Gestión de Usuarios 👤</h2>

      <form onSubmit={handleSubmit} className="form-flex">
        <input
          type="text"
          name="codeUsuario"
          placeholder="Código"
          value={form.codeUsuario}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="nombreCompleto"
          placeholder="Nombre completo"
          value={form.nombreCompleto}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="mailUsuario"
          placeholder="Correo institucional"
          value={form.mailUsuario}
          onChange={handleInputChange}
          required
        />
        <input
          type="password"
          name="passUsuario"
          placeholder="Contraseña"
          value={form.passUsuario}
          onChange={handleInputChange}
          required={!editandoId}
        />
        <select
          name="rolUsuario"
          value={form.rolUsuario}
          onChange={handleInputChange}
          required
        >
          <option value="">Rol</option>
          <option value="admin">Admin</option>
          <option value="estudiante">Estudiante</option>
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
            {/* <th>ID</th> */}
            <th>Código</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Método</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosEnPagina.map((u) => (
            <tr key={u.idusuario}>
              {/* <td>{u.idusuario}</td> */}
              <td>{u.codeusuario}</td>
              <td>{u.nombrecompleto}</td>
              <td>{u.mailusuario}</td>
              <td>
                <span className={`rol-tag ${u.rolusuario}`}>{u.rolusuario}</span>
              </td>
              <td>{u.metodologin}</td>
              <td>
                <ActionButton text="Editar" type="edit" onClick={() => handleEdit(u)} />
                <ActionButton text="Eliminar" type="delete" onClick={() => handleDelete(u.idusuario)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="paginacion">
        <button onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))} disabled={paginaActual === 1}>
          ⬅ Anterior
        </button>
        <span>Página {paginaActual} de {totalPaginas}</span>
        <button onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))} disabled={paginaActual === totalPaginas}>
          Siguiente ➡
        </button>
      </div>
    </div>
  );
};

export default Usuarios;