import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './views/LoginForm';
import AdminDashboard from './views/AdminDashboard';
import Chatbot from './views/Chatbot';
import PrivateRoute from './utils/PrivateRoute';
import Sedes from './views/Sedes';
import Usuarios from './views/Usuarios';
import Profesores from './views/Profesores';
import Asignaturas from './views/Asignaturas';
import AsignarProfesores from './views/AsignarProfesores';
import Aulas from './views/Aulas';
import AsignarAulas from './views/AsignarAulas';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LoginForm />} />

        {/* Rutas admin */}
        <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/sedes" element={<PrivateRoute allowedRoles={['admin']}><Sedes /></PrivateRoute>} />
        <Route path="/admin/usuarios" element={<PrivateRoute allowedRoles={['admin']}><Usuarios /></PrivateRoute>} />
        <Route path="/admin/profesores" element={<PrivateRoute allowedRoles={['admin']}><Profesores /></PrivateRoute>} />
        <Route path="/admin/asignaturas" element={<PrivateRoute allowedRoles={['admin']}><Asignaturas /></PrivateRoute>} />
        <Route path="/admin/asignaturas/:id/profesores" element={<PrivateRoute allowedRoles={['admin']}><AsignarProfesores /></PrivateRoute>} />
        <Route path="/admin/aulas" element={<PrivateRoute allowedRoles={['admin']}><Aulas /></PrivateRoute>} />
        <Route path="/admin/aulas/:id/asignaturas" element={<PrivateRoute allowedRoles={['admin']}><AsignarAulas /></PrivateRoute>} />

        {/* Rutas estudiantes */}
        <Route path="/chatbot" element={<PrivateRoute allowedRoles={['admin', 'estudiante']}><Chatbot /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
