"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";

interface PhotoLocationProps {
  latitude: number;
  longitude: number;
}

const markerIcon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function PhotoLocation({
  latitude,
  longitude,
}: PhotoLocationProps) {
  return (
    <div className="h-48 w-full overflow-hidden rounded-xl">
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        attributionControl={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={[latitude, longitude]}
          icon={markerIcon}
        />
      </MapContainer>
    </div>
  );
}