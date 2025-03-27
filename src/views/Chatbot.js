import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiSend } from 'react-icons/fi';
import '../styles/Chatbot.css';

const Chatbot = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    { from: 'bot', text: '¡Hola! 👋 Soy tu asistente de aulas. ¿Qué necesitas encontrar hoy?' }
  ]);
  const [input, setInput] = useState('');

  // ✅ Captura token desde la URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    if (token) {
      console.log('✅ Token recibido del backend:', token);
      localStorage.setItem('token', token);
      navigate('/chatbot', { replace: true });
    }
  }, [location, navigate]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { from: 'user', text: input }]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: 'Estoy procesando tu solicitud 📍...' }]);
    }, 1000);
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
            <p>Aquí se mostrará el mapa con la ubicación de tu aula.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
