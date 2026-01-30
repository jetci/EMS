// src/components/OpenStreetMapTest.tsx
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';

// ... (existing code)

// Component to update map center when position changes
function MapUpdater({ position }: { position: { lat: number; lng: number } }) {
    const map = useMap();
    useEffect(() => {
        map.setView([position.lat, position.lng], map.getZoom());
    }, [position, map]);
    return null;
}

// ... (existing code)


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

type MapType = 'street' | 'satellite';

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
    const [mapType, setMapType] = useState<MapType>('street');
    const [placeName, setPlaceName] = useState<string>('กำลังค้นหาชื่อสถานที่...');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    // Reverse geocoding to get place name
    useEffect(() => {
        if (position.lat && position.lng) {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`)
                .then(res => res.json())
                .then(data => {
                    if (data.display_name) {
                        setPlaceName(data.display_name);
                    }
                })
                .catch(() => setPlaceName('ไม่สามารถค้นหาชื่อสถานที่ได้'));
        }
    }, [position.lat, position.lng]);

    // Fullscreen toggle handler
    const toggleFullscreen = () => {
        if (!isFullscreen) {
            if (mapContainerRef.current?.requestFullscreen) {
                mapContainerRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    // Listen for fullscreen changes and resize map
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isNowFullscreen = !!document.fullscreenElement;
            setIsFullscreen(isNowFullscreen);

            // Resize map after fullscreen change
            setTimeout(() => {
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.invalidateSize();
                }
            }, 100);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // ESC key to exit fullscreen
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isFullscreen]);

    // Tile layer URLs
    const tileLayerUrl = mapType === 'street'
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    const attribution = mapType === 'street'
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        : '&copy; <a href="https://www.esri.com/">Esri</a>';

    return (
        <div
            ref={mapContainerRef}
            style={isFullscreen ? { width: '100vw', height: '100vh' } : containerStyle}
            className={`border border-gray-200 rounded-lg overflow-hidden relative ${isFullscreen ? 'fixed inset-0 z-[9999]' : ''}`}
        >
            {/* Map Type Toggle + Fullscreen Button */}
            <div className="absolute top-2 right-2 z-[1000] flex gap-2">
                <button
                    type="button"
                    onClick={() => setMapType('street')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-md ${mapType === 'street'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    แผนที่ถนน
                </button>
                <button
                    type="button"
                    onClick={() => setMapType('satellite')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-md ${mapType === 'satellite'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    ดาวเทียม
                </button>
                <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 transition-colors shadow-md"
                    title={isFullscreen ? 'ออกจากโหมดเต็มจอ' : 'ขยายเต็มจอ'}
                >
                    {isFullscreen ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Place Name Display */}
            <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-white bg-opacity-95 rounded-lg p-3 shadow-md">
                <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-600 mb-1">ชื่อสถานที่:</p>
                        <p className="text-sm text-gray-800 break-words">{placeName}</p>
                    </div>
                </div>
            </div>

            <MapContainer
                center={[position.lat, position.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                ref={(map) => {
                    if (map) {
                        mapInstanceRef.current = map;
                    }
                }}
            >
                <TileLayer
                    attribution={attribution}
                    url={tileLayerUrl}
                    key={mapType}
                />
                <DraggableMarker position={position} onLocationChange={onLocationChange} />
                <MapEventHandler onLocationChange={onLocationChange} />
                <MapUpdater position={position} />
            </MapContainer>
        </div>
    );
}

export default React.memo(OpenStreetMapTest);

