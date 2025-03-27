import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const tokenInURL = new URLSearchParams(location.search).get('token');

  if (tokenInURL) {
    localStorage.setItem('token', tokenInURL);
  }

  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" />;

  try {
    const decoded = jwtDecode(token);
    if (requireAdmin && decoded.rol !== 'admin') {
      return <Navigate to="/" />;
    }
    return children;
  } catch {
    return <Navigate to="/" />;
  }
};

export default PrivateRoute;
