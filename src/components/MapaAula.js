import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// ICONOS
const aulaIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/128/684/684908.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/128/3429/3429191.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

// Routing robusto
const Routing = ({ from, to }) => {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!from || !to) return;

    // Crear una nueva instancia SOLO si no existe
    if (!routingRef.current) {
      routingRef.current = L.Routing.control({
        waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
        lineOptions: {
          styles: [{ color: '#007bff', weight: 5 }],
        },
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        routeWhileDragging: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        createMarker: () => null,
      }).addTo(map);
    } else {
      // Actualiza solo los waypoints sin recrear la instancia
      routingRef.current.setWaypoints([
        L.latLng(from.lat, from.lng),
        L.latLng(to.lat, to.lng),
      ]);
    }

    return () => {
      // Limpia robusto
      if (routingRef.current) {
        try {
          routingRef.current.spliceWaypoints(0, 2); // quita waypoints sin reventar capa
          map.removeControl(routingRef.current);
        } catch (err) {
          console.warn('Error al limpiar Routing:', err);
        }
        routingRef.current = null;
      }
    };
  }, [from, to, map]);

  return null;
};

const MapaAula = ({ coordenadas, miUbicacion }) => {
  if (!coordenadas) return <p>Ubicación del aula no disponible</p>;

  const center = miUbicacion || coordenadas;

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={17}
      style={{ height: '440px', width: '100%', borderRadius: '10px', overflow: 'hidden' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[coordenadas.lat, coordenadas.lng]} icon={aulaIcon}>
        <Popup>📚 Aquí está tu aula</Popup>
      </Marker>

      {miUbicacion && (
        <Marker position={[miUbicacion.lat, miUbicacion.lng]} icon={userIcon}>
          <Popup>📍 Tu ubicación actual</Popup>
        </Marker>
      )}

      {miUbicacion && (
        <Routing from={miUbicacion} to={coordenadas} />
      )}
    </MapContainer>
  );
};

export default MapaAula;
