import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const MapaAula = ({ coordenadas }) => {
  if (!coordenadas) return <p>Ubicación no disponible</p>;

  return (
    <MapContainer center={[coordenadas.lat, coordenadas.lng]} zoom={18} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[coordenadas.lat, coordenadas.lng]}>
        <Popup>Aquí está tu aula</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapaAula;
