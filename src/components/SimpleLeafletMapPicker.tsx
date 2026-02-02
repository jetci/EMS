import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface SimpleLeafletMapPickerProps {
    position: { lat: number; lng: number };
    onLocationChange: (coords: { lat: number; lng: number }) => void;
    markerTitle?: string;
    markerDescription?: string;
    height?: string;
    onDescriptionChange?: (description: string) => void;
}

// Component to update map center when position prop changes
const MapUpdater: React.FC<{ position: { lat: number; lng: number } }> = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position.lat && position.lng) {
            map.setView([position.lat, position.lng], map.getZoom());
        }
    }, [position, map]);

    // Fix map size issues
    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, [map]);

    return null;
};

// Component to handle map clicks and marker
const LocationMarker: React.FC<{
    position: { lat: number; lng: number };
    onLocationChange: (coords: { lat: number; lng: number }) => void;
    markerTitle?: string;
    markerDescription?: string;
    onDescriptionChange?: (description: string) => void;
}> = ({ position, onLocationChange, markerTitle, markerDescription, onDescriptionChange }) => {
    const [markerPosition, setMarkerPosition] = useState<[number, number]>([position.lat, position.lng]);
    const map = useMap(); // Get map instance to control view

    useEffect(() => {
        if (position.lat && position.lng) {
            setMarkerPosition([position.lat, position.lng]);
        }
    }, [position]);

    useMapEvents({
        click(e) {
            const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
            setMarkerPosition(newPos);
            onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng });
            // Pan map to new position
            map.panTo(e.latlng);
        },
    });

    const handleDragEnd = useCallback((e: any) => {
        const marker = e.target;
        const pos = marker.getLatLng();
        setMarkerPosition([pos.lat, pos.lng]);
        onLocationChange({ lat: pos.lat, lng: pos.lng });
        // Pan map to marker position to keep it visible
        map.panTo(pos);
    }, [onLocationChange, map]);

    return (
        <Marker
            position={markerPosition}
            draggable={true}
            eventHandlers={{
                dragend: handleDragEnd,
            }}
        >
            <Popup>
                <div className="p-2 min-w-[250px]">
                    <h3 className="font-bold text-sm mb-2 text-gray-800">
                        {markerTitle || '📍 ตำแหน่งที่เลือก'}
                    </h3>

                    {onDescriptionChange ? (
                        <div className="mb-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">รายละเอียด/จุดสังเกต:</label>
                            <textarea
                                className="w-full text-xs p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                rows={3}
                                placeholder="ระบุจุดสังเกต..."
                                value={markerDescription || ''}
                                onChange={(e) => onDescriptionChange(e.target.value)}
                            />
                        </div>
                    ) : (
                        markerDescription && (
                            <p className="text-xs text-gray-600 mb-2">{markerDescription}</p>
                        )
                    )}

                    <div className="text-xs text-gray-500 space-y-1 mt-2 pt-2 border-t">
                        <div className="flex justify-between">
                            <span className="font-semibold">Latitude:</span>
                            <span className="font-mono">{markerPosition[0].toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Longitude:</span>
                            <span className="font-mono">{markerPosition[1].toFixed(6)}</span>
                        </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 italic">
                            💡 ลากหมุดเพื่อปรับตำแหน่ง
                        </p>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};

const SimpleLeafletMapPicker: React.FC<SimpleLeafletMapPickerProps> = ({
    position,
    onLocationChange,
    markerTitle,
    markerDescription,
    height = '500px',
    onDescriptionChange
}) => {
    const [isFullScreen, setIsFullScreen] = useState(false);

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    onLocationChange({ lat: latitude, lng: longitude });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("ไม่สามารถระบุตำแหน่งปัจจุบันได้ กรุณาเปิด GPS หรืออนุญาตการเข้าถึงตำแหน่ง");
                }
            );
        } else {
            alert("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง");
        }
    };

    return (
        <div className={`${isFullScreen ? 'fixed inset-0 z-[9999] bg-white p-4' : 'relative w-full'}`} style={{ height: isFullScreen ? '100vh' : height }}>
            <MapContainer
                center={[position.lat || 19.904394846183447, position.lng || 99.19735149982482]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <MapUpdater position={position} />

                <LayersControl position="topright">
                    {/* Base Layers */}
                    <LayersControl.BaseLayer checked name="🗺️ แผนที่ถนน">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="🛰️ ภาพดาวเทียม">
                        <TileLayer
                            attribution='Tiles &copy; Esri'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>

                    {/* Overlay */}
                    <LayersControl.Overlay name="🏷️ ป้ายชื่อ">
                        <TileLayer
                            attribution='&copy; CARTO'
                            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                        />
                    </LayersControl.Overlay>
                </LayersControl>

                <LocationMarker
                    position={position}
                    onLocationChange={onLocationChange}
                    markerTitle={markerTitle}
                    markerDescription={markerDescription}
                    onDescriptionChange={onDescriptionChange}
                />
            </MapContainer>

            {/* Fullscreen Button */}
            <button
                onClick={toggleFullScreen}
                className="absolute top-20 left-4 z-[1000] bg-white/95 hover:bg-white px-3 py-2 rounded-lg shadow-md text-sm font-medium flex items-center gap-2 backdrop-blur-sm transition-colors"
                title={isFullScreen ? 'ออกจากโหมดเต็มจอ' : 'โหมดเต็มจอ'}
            >
                {isFullScreen ? (
                    <>
                        <span>ออกจากเต็มจอ</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </>
                ) : (
                    <>
                        <span>เต็มจอ</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </>
                )}
            </button>

            {/* Get Location Button */}
            <button
                onClick={handleGetCurrentLocation}
                className="absolute top-32 left-4 z-[1000] bg-white/95 hover:bg-white px-3 py-2 rounded-lg shadow-md text-sm font-medium flex items-center gap-2 backdrop-blur-sm transition-colors"
                title="ตำแหน่งปัจจุบัน"
            >
                <span className="text-lg">📍</span>
                <span>ตำแหน่งปัจจุบัน</span>
            </button>

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 px-4 py-2 rounded-lg shadow-lg text-sm text-gray-700 pointer-events-none z-[1000] backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    <span><strong>คลิกบนแผนที่</strong> หรือ <strong>ลากหมุด</strong> เพื่อเลือกตำแหน่ง • <strong>คลิกหมุด</strong> ดูรายละเอียด</span>
                </div>
            </div>
        </div>
    );
};

export default React.memo(SimpleLeafletMapPicker);
