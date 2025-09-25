// src/components/OpenStreetMapTest.tsx
import React, { useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface OpenStreetMapTestProps {
    onLocationChange: (coords: { lat: number; lng: number }) => void;
    position: { lat: number; lng: number };
}

// Component to handle map events
function MapEventHandler({ onLocationChange }: { onLocationChange: (coords: { lat: number; lng: number }) => void }) {
    useMapEvents({
        click: (e) => {
            onLocationChange({
                lat: e.latlng.lat,
                lng: e.latlng.lng,
            });
        },
    });
    return null;
}

// Draggable marker component
function DraggableMarker({ position, onLocationChange }: OpenStreetMapTestProps) {
    const markerRef = useRef<L.Marker>(null);

    const eventHandlers = {
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const newPos = marker.getLatLng();
                onLocationChange({
                    lat: newPos.lat,
                    lng: newPos.lng,
                });
            }
        },
    };

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={[position.lat, position.lng]}
            ref={markerRef}
        />
    );
}

function OpenStreetMapTest({ onLocationChange, position }: OpenStreetMapTestProps) {
    const containerStyle = { width: '100%', height: '400px' };

    return (
        <div style={containerStyle} className="border border-gray-200 rounded-lg overflow-hidden">
            <MapContainer
                center={[position.lat, position.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMarker position={position} onLocationChange={onLocationChange} />
                <MapEventHandler onLocationChange={onLocationChange} />
            </MapContainer>
        </div>
    );
}

export default React.memo(OpenStreetMapTest);

