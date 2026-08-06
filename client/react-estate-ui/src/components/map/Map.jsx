// Map.jsx
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import "./map.scss";

// Watches the map's container element and tells Leaflet to
// recalculate its size whenever that element resizes
// (e.g. when a CSS breakpoint changes .mapcontainer's height).
function ResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, [map]);

  return null;
}

function Map({ items = [] }) {
  const defaultCenter = [25.7617, -80.1918];

  const center = items.length > 0
    ? [items[0].latitude, items[0].longitude]
    : defaultCenter;

  return (
    <div className="mapWrapper">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ResizeHandler />
      </MapContainer>
    </div>
  );
}

export default Map;