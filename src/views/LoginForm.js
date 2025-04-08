import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import '../styles/Login.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const googleError = query.get('error');
  
    if (googleError === 'google') {
      setErrorMsg('Falló la autenticación con Google. Intente nuevamente.');
    }
    //Si hay token en la URL, se guarda en el localStorage y se redirige al usuario según su rol
    if (token) {
      try {
        localStorage.setItem('token', token);

        const { rol } = jwtDecode(token); // Decodifica el token para obtener el rol del usuario

        if (rol === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/chatbot');
        }
        
        window.history.replaceState({}, document.title, "/"); // Elimina el token de la URL para evitar que se vuelva a usar

      } catch (err) {
        console.error('Token inválido');
        setErrorMsg('Sesión inválida. Intente nuevamente.');
      }
    }
  }, [location, navigate]);
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
      <div
        className="login-left"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL + '/assets/fondo-login.png'})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#001f5b',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '2rem',
          color: 'white',
          fontFamily: '"Times New Roman", serif'
        }}
      >
        <h2 style={{ zIndex: 1 }}>
          "Tradición que inspira, tecnología que conecta.<br />¡Encuentra tu aula con inteligencia artificial!"
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
          { /*<div className="recover">Recuperar contraseña</div>*/ }
          <button type="submit" className="login-btn">Iniciar sesión</button>
        </form>

        <div className="divider">O continuar con</div>
        <button onClick={handleGoogleLogin} className="google-btn">
          <img src="/assets/g-logo.png" alt="Google logo" />
          Google
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
