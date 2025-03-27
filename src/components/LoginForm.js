import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/Login.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const googleError = query.get('error');
  
    if (googleError === 'google') {
      setErrorMsg('Falló la autenticación con Google. Intente nuevamente.');
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mailUsuario: email, passUsuario: pass })
      });

      // Intentar leer la respuesta como JSON, incluso si no es ok
      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || 'Error al iniciar sesión.');
        return;
      }

      localStorage.setItem('token', data.token);

      if (data.usuario.rolusuario === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/chatbot');
      }

    } catch (err) {
      console.error('Error de conexión:', err.message);
      setErrorMsg('No se pudo conectar con el servidor. Intente más tarde.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/auth/google';
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/assets/logo-ucaldas.png" alt="Universidad de Caldas" />
        <h2>
        <em>"Tradición que inspira, tecnología que conecta.<br />¡Encuentra tu aula con inteligencia artificial!"</em>
        </h2>
      </div>

      <div className="login-right">
        <h2>Iniciar sesión</h2>

        {errorMsg && (
          <div className="error-msg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Ingrese su correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
          />
          <div className="recover">Recuperar contraseña</div>
          <button type="submit" className="login-btn">Iniciar sesión</button>
        </form>

        <div className="divider">O continuar con</div>
        <button onClick={handleGoogleLogin} className="google-btn">
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" />
          Google
        </button>
      </div>
    </div>
  );
};

export default LoginForm;

/* PRUEBAS ANTERIORES DE INICIO DE SESIÓN LOCAL

import React from 'react';
import '../styles/Login.css';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();
  const handleLogin = (e) => {
    e.preventDefault();
    // Aquí irá la lógica para conectar con backend

    const email = e.target[0].value;
      // Simulamos un login local con rol basado en email
    if (email.endsWith('@ucaldas.edu.co')) {
      navigate('/chatbot'); // Gmail => Chatbot
    } else {
      navigate('/admin/dashboard'); // Admin => Dashboard
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3001/auth/google"; // Ruta del backend
  };
  
  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/assets/logo-ucaldas.png" alt="Universidad de Caldas" />
        <h2>"Tradición que inspira, tecnología que conecta.<br />¡Encuentra tu aula con inteligencia artificial!"</h2>
      </div>

      <div className="login-right">
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Ingrese su correo electrónico" required />
          <input type="password" placeholder="Contraseña" required />
          <div className="recover">Recuperar contraseña</div>
          <button type="submit" className="login-btn">Iniciar sesión</button>
        </form>

        <div className="divider">O continuar con</div>
        <button onClick={handleGoogleLogin} className="google-btn">
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" />
          Google
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
*/

