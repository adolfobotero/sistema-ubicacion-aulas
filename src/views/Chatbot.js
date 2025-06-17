import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiSend } from 'react-icons/fi';
import '../styles/Chatbot.css';
import { jwtDecode } from 'jwt-decode';
import PopupNotificacion from '../components/PopupNotificacion';
import MapaAula from '../components/MapaAula';
import axios from 'axios';

const Chatbot = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    { from: 'bot', text: '¡Hola! 👋 Soy Auli, tu asistente de aulas. ¿Qué aula necesitas encontrar hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [usuario, setUsuario] = useState(null);

  // Aula por defecto
  const [coordenadas, setCoordenadas] = useState({
    lat: 5.055975734921131,
    lng: -75.49280038325303
  });

  // Estado para la ubicación actual del usuario
  const [miUbicacion, setMiUbicacion] = useState(null);

  // Captura token desde URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenFromURL = query.get('token');

    if (tokenFromURL) {
      localStorage.setItem('token', tokenFromURL);
      setToken(tokenFromURL);
      navigate('/chatbot', { replace: true });
    }
  }, [location, navigate]);

  // Decodifica token y usuario
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const usuarioLocal = localStorage.getItem('usuario');

        if (usuarioLocal) {
          setUsuario(JSON.parse(usuarioLocal));
        } else {
          setUsuario(decoded);
        }
      } catch (err) {
        console.error('Error decodificando token:', err.message);
      }
    }
  }, [token]);

  // Obtiene ubicación actual del navegador
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMiUbicacion({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error obteniendo ubicación actual:', error);
        }
      );
    } else {
      console.error('Geolocalización no soportada.');
    }
  }, []);

  // Enviar pregunta
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const preguntaUsuario = input;
    setMessages([...messages, { from: 'user', text: preguntaUsuario }]);
    setInput('');

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/chatbot/consulta`, {
        pregunta: preguntaUsuario
      });

      setMessages(prev => [...prev, { from: 'bot', text: res.data.mensaje }]);
      setCoordenadas(res.data.coordenadas); // Actualiza aula en el mapa
    } catch (error) {
      const mensajeError = error.response?.data?.mensaje || 'No pude encontrar esa aula.';
      setMessages(prev => [...prev, { from: 'bot', text: mensajeError }]);
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="chatbot-container">
      <header className="chatbot-header">
        <img src="/assets/logo-ucaldas.png" alt="Logo Universidad de Caldas" />
        <h1>Asistente Inteligente de Aulas</h1>
        <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>
      </header>

      <div className="chatbot-body">
        <div className="chat-section">
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.from}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="chat-input">
            <input
              type="text"
              placeholder="Escribe tu pregunta o número de aula..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="send-btn">
              <FiSend size={18} style={{ marginRight: 4 }} />
              Enviar
            </button>
          </form>
        </div>

        <div className="map-section">
          <h3>Mapa del Campus</h3>
          <div className="map-placeholder">
            {/* PASA TU UBICACIÓN */}
            <MapaAula coordenadas={coordenadas} miUbicacion={miUbicacion} />
          </div>
        </div>
      </div>

      {/* Popup consentimiento */}
      <PopupNotificacion usuario={usuario} token={token} />
    </div>
  );
};

export default Chatbot;
