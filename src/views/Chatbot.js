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
    { from: 'bot', text: '¡Hola! 👋 Soy tu asistente de aulas. ¿Qué necesitas encontrar hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [usuario, setUsuario] = useState(null);

  // Coordenadas iniciales centradas en la Universidad de Caldas (ejemplo)
  //const [coordenadas, setCoordenadas] = useState({ lat: 5.0703, lng: -75.5138 });
  const [coordenadas, setCoordenadas] = useState({ lat: 5.055760183855939, lng: -75.49397150793457 });
  
  // Captura token desde la URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenFromURL = query.get('token');

    if (tokenFromURL) {
      localStorage.setItem('token', tokenFromURL);
      setToken(tokenFromURL);
      navigate('/chatbot', { replace: true });
    }
  }, [location, navigate]);

  // Decodificar token y establecer usuario
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const usuarioLocal = localStorage.getItem('usuario');

        if (usuarioLocal) {
          const userParsed = JSON.parse(usuarioLocal);
          console.log('Usuario desde localStorage:', userParsed);
          setUsuario(userParsed);
        } else {
          console.log('Token decodificado:', decoded);
          setUsuario(decoded);
        }
      } catch (err) {
        console.error('Error decodificando el token:', err.message);
      }
    }
  }, [token]);

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
      setCoordenadas(res.data.coordenadas); // actualiza el mapa con la nueva ubicación
    } catch (error) {
      const mensajeError = error.response?.data?.mensaje || 'No pude encontrar esa aula.';
      setMessages(prev => [...prev, { from: 'bot', text: mensajeError }]);
    }
  };

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
            <MapaAula coordenadas={coordenadas} />
          </div>
        </div>
      </div>

      {/* Mostrar popup de consentimiento si aplica */}
      <PopupNotificacion usuario={usuario} token={token} />
    </div>
  );
};

export default Chatbot;
