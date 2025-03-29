import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ children, allowedRoles }) => {
  const location = useLocation();

  // 1. Si el token está en la URL, lo guardamos
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenFromURL = query.get('token');
    if (tokenFromURL) {
      localStorage.setItem('token', tokenFromURL);
      // Limpia la URL
      window.history.replaceState({}, document.title, location.pathname);
      window.location.reload();
    }
  }, [location]);

  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;

  try {
    const decoded = jwtDecode(token);
    if (!allowedRoles.includes(decoded.rol)) {
      return <Navigate to="/" replace />;
    }
    return children;
  } catch (err) {
    return <Navigate to="/" replace />;
  }
};

export default PrivateRoute;
