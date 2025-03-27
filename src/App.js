import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import AdminDashboard from './views/AdminDashboard';
import Chatbot from './views/Chatbot';
import PrivateRoute from './utils/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/admin/dashboard" element={<PrivateRoute requireAdmin={true}><AdminDashboard /></PrivateRoute>} />
        <Route path="/chatbot" element={<PrivateRoute><Chatbot /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
