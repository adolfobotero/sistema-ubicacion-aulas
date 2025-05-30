import React, { useEffect, useState } from 'react';

const PopupNotificacion = ({ usuario, token }) => {
  const [mostrarPopup, setMostrarPopup] = useState(false);

  useEffect(() => {
    const rol = usuario?.rolUsuario || usuario?.rol;
    const consentimiento = usuario?.recibirNotificaciones ?? usuario?.recibirnotificaciones ?? usuario?.recibir_notificaciones;

    console.log('Evaluando condiciones del popup:');
    console.log('Rol:', rol);
    console.log('Consentimiento:', consentimiento);

    if (rol === 'estudiante' && consentimiento === false) {
      console.log('Mostrar popup para estudiante sin consentimiento');
      setMostrarPopup(true);
    }
  }, [usuario]);

  const actualizarConsentimiento = async (valor) => {
    try {
      console.log('Enviando consentimiento:', valor);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/usuarios/notificaciones`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recibirnotificaciones: valor }),
      });

      const data = await response.json();
      console.log('Respuesta del backend:', data);
      console.error('Falló la actualización:', data.detalle || data.error || 'Error desconocido');


      if (response.ok) {
        const usuarioActualizado = { ...usuario, recibirnotificaciones: valor };
        localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
        setMostrarPopup(false);
      } else {
        console.error('Falló la actualización:', data.message);
      }

    } catch (error) {
      console.error('Error en fetch:', error);
    }
  };

  if (!mostrarPopup) return null;

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>¿Deseas recibir notificaciones por correo electrónico?</h3>
        <p>Se te notificará cuando cambie el aula de una asignatura.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={() => actualizarConsentimiento(true)} className="popup-btn aceptar">
            Sí, deseo recibir
          </button>
          <button onClick={() => actualizarConsentimiento(false)} className="popup-btn rechazar">
            No, gracias
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupNotificacion;
