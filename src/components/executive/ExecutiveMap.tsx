import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAppSettings } from '../../utils/settings';
import { useState, useEffect } from 'react';

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

// Sub-component to handle map resizing and auto-fitting
const MapController: React.FC<{ locations: PatientLocation[] }> = ({ locations }) => {
    const map = useMap();

    useEffect(() => {
        // Handle explicit resize calls
        const resizeMap = () => {
            map.invalidateSize();
        };

        // ResizeObserver to watch container changes
        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                map.invalidateSize();
            });
        });

        const container = map.getContainer();
        if (container) {
            resizeObserver.observe(container);
        }

        // Initial check and auto-fit
        map.whenReady(() => {
            resizeMap();
            // Double check after animation
            setTimeout(resizeMap, 600);
        });

        // Auto-fit to markers
        const fitTimer = setTimeout(() => {
            resizeMap();

            if (locations.length > 0) {
                const validLocations = locations.filter(loc =>
                    typeof loc.lat === 'number' && typeof loc.lng === 'number' &&
                    !isNaN(loc.lat) && !isNaN(loc.lng)
                );

                if (validLocations.length > 0) {
                    const bounds = L.latLngBounds(validLocations.map(loc => [loc.lat, loc.lng]));
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                }
            }
        }, 500);

        return () => {
            resizeObserver.disconnect();
            clearTimeout(fitTimer);
        };
    }, [map, locations]);

    return null;
};

const ExecutiveMap: React.FC<ExecutiveMapProps> = ({ locations }) => {
    const [settings] = useState(getAppSettings());
    const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

    const center: [number, number] = [
        settings.mapCenterLat || 19.904394846183447,
        settings.mapCenterLng || 99.19735149982482
    ];

    return (
        <div className="absolute inset-0 rounded-[3rem] overflow-hidden">
            <MapContainer
                center={center}
                zoom={12}
                style={{ height: '100%', width: '100%', background: '#f8fafc' }}
                scrollWheelZoom={true}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={mapType === 'standard'
                        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    }
                />

                {/* Repositioned Zoom Control (Top Left as requested) */}
                <ZoomControl position="topleft" />

                <MapController locations={locations} />

                {/* Map Style Switcher */}
                <div className="leaflet-bottom leaflet-left" style={{ bottom: '20px', left: '20px', pointerEvents: 'auto', zIndex: 1000 }}>
                    <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-1 rounded-xl shadow-xl flex gap-1">
                        <button
                            onClick={() => setMapType('standard')}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${mapType === 'standard'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                : 'text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            ทั่วไป
                        </button>
                        <button
                            onClick={() => setMapType('satellite')}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${mapType === 'satellite'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                : 'text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            ดาวเทียม
                        </button>
                    </div>
                </div>

                {locations.filter(loc => typeof loc.lat === 'number' && typeof loc.lng === 'number' && !isNaN(loc.lat) && !isNaN(loc.lng)).map((loc) => (
                    <CircleMarker
                        key={loc.id}
                        center={[loc.lat, loc.lng]}
                        radius={10}
                        pathOptions={{
                            fillColor: '#3B82F6',
                            color: '#FFFFFF',
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0.8
                        }}
                    >
                        <Popup className="executive-popup">
                            <div className="p-2 min-w-[150px]">
                                <div className="flex items-center gap-2 mb-2 border-b pb-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                    <p className="font-black text-gray-900 leading-none">{loc.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Village Cluster</p>
                                    <p className="text-xs font-black text-gray-700">{loc.type}</p>
                                </div>
                                <div className="mt-3 pt-2 border-t flex justify-between items-center">
                                    <span className="text-[9px] text-gray-400 font-bold">UID: {loc.id}</span>
                                    <button className="text-[9px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-tighter">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
};

export default ExecutiveMap;
