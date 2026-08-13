import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons in Vite
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -34],
  shadowSize: [45, 45]
});

interface TrackingMapProps {
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
  driverLat?: number;
  driverLng?: number;
  driverName?: string;
  trackingNumber?: string;
}

export const TrackingMap: React.FC<TrackingMapProps> = ({
  pickupLat,
  pickupLng,
  pickupAddress,
  dropoffLat,
  dropoffLng,
  dropoffAddress,
  driverLat,
  driverLng,
  driverName = 'Assigned Driver',
  trackingNumber
}) => {
  const centerLat = driverLat || (pickupLat + dropoffLat) / 2;
  const centerLng = driverLng || (pickupLng + dropoffLng) / 2;

  const routePoints: [number, number][] = [
    [pickupLat, pickupLng],
    ...(driverLat && driverLng ? [[driverLat, driverLng] as [number, number]] : []),
    [dropoffLat, dropoffLng]
  ];

  return (
    <div className="relative w-full h-[380px] rounded-xl overflow-hidden shadow-lg border border-slate-700">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={8}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pickup Marker */}
        <Marker position={[pickupLat, pickupLng]} icon={pickupIcon}>
          <Popup>
            <div className="p-1">
              <strong className="text-emerald-600">📍 Pickup Point</strong>
              <p className="text-xs text-slate-700 mt-1">{pickupAddress}</p>
            </div>
          </Popup>
        </Marker>

        {/* Dropoff Marker */}
        <Marker position={[dropoffLat, dropoffLng]} icon={dropoffIcon}>
          <Popup>
            <div className="p-1">
              <strong className="text-rose-600">🎯 Customer Destination</strong>
              <p className="text-xs text-slate-700 mt-1">{dropoffAddress}</p>
            </div>
          </Popup>
        </Marker>

        {/* Driver Live Marker */}
        {driverLat && driverLng && (
          <Marker position={[driverLat, driverLng]} icon={driverIcon}>
            <Popup>
              <div className="p-1">
                <strong className="text-blue-600">🚗 Driver: {driverName}</strong>
                <p className="text-xs text-slate-700 mt-1">Live tracking #{trackingNumber}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Connecting Route */}
        <Polyline positions={routePoints} color="#3b82f6" weight={4} dashArray="6, 8" opacity={0.8} />
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white backdrop-blur-md px-3 py-2 rounded-lg text-xs flex items-center space-x-3 shadow-md z-[400] border border-slate-700">
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Pickup</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
          <span>Driver Live</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
          <span>Destination</span>
        </div>
      </div>
    </div>
  );
};
