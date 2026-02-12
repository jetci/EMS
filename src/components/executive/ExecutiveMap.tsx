import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface PatientLocation {
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: string;
}

interface ExecutiveMapProps {
    locations: PatientLocation[];
}

// Component to handle bounds
const SetBounds: React.FC<{ locations: { lat: number; lng: number }[] }> = ({ locations }) => {
    const map = useMap();

    useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [locations, map]);

    return null;
};

const ExecutiveMap: React.FC<ExecutiveMapProps> = ({ locations }) => {
    // Default center (Fang, Chiang Mai)
    const center: [number, number] = [19.9213, 99.2131];

    return (
        <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200 shadow-inner">
            <MapContainer
                center={center}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <SetBounds locations={locations} />
                {locations.map((loc) => (
                    <CircleMarker
                        key={loc.id}
                        center={[loc.lat, loc.lng]}
                        radius={8}
                        pathOptions={{
                            fillColor: '#3B82F6',
                            color: '#1D4ED8',
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.6
                        }}
                    >
                        <Popup>
                            <div className="p-1">
                                <p className="font-bold text-gray-800">{loc.name}</p>
                                <p className="text-xs text-gray-500">ประเภท: {loc.type}</p>
                                <p className="text-xs text-blue-600 mt-1">ID: {loc.id}</p>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
};

export default ExecutiveMap;
