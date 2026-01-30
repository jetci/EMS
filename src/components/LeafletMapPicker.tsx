import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl, FeatureGroup, Popup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

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

interface LeafletMapPickerProps {
    onLocationChange: (coords: { lat: number; lng: number }) => void;
    position: { lat: number; lng: number };
    height?: string;
    showLayerControl?: boolean;
    showInstructions?: boolean;
    showDrawingTools?: boolean;
    markerTitle?: string;
    markerDescription?: string;
    showPopup?: boolean;
}

// Component to update map center when position prop changes
const MapUpdater: React.FC<{ position: { lat: number; lng: number } }> = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        map.setView([position.lat, position.lng], map.getZoom());
    }, [position, map]);

    // Fix map size issues
    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, [map]);

    return null;
};

// Component to handle map clicks
const LocationMarker: React.FC<{
    position: { lat: number; lng: number };
    onLocationChange: (coords: { lat: number; lng: number }) => void;
    markerTitle?: string;
    markerDescription?: string;
    showPopup?: boolean;
}> = ({ position, onLocationChange, markerTitle, markerDescription, showPopup = true }) => {
    const [markerPosition, setMarkerPosition] = useState<[number, number]>([position.lat, position.lng]);

    useEffect(() => {
        setMarkerPosition([position.lat, position.lng]);
    }, [position]);

    useMapEvents({
        click(e) {
            const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
            setMarkerPosition(newPos);
            onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    const handleDragEnd = useCallback((e: any) => {
        const marker = e.target;
        const position = marker.getLatLng();
        setMarkerPosition([position.lat, position.lng]);
        onLocationChange({ lat: position.lat, lng: position.lng });
    }, [onLocationChange]);

    return (
        <Marker
            position={markerPosition}
            draggable={true}
            eventHandlers={{
                dragend: handleDragEnd,
            }}
        >
            {showPopup && (
                <Popup>
                    <div className="p-2 min-w-[200px]">
                        <h3 className="font-bold text-sm mb-2 text-gray-800">
                            {markerTitle || '📍 ตำแหน่งที่เลือก'}
                        </h3>
                        {markerDescription && (
                            <p className="text-xs text-gray-600 mb-2">{markerDescription}</p>
                        )}
                        <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex justify-between">
                                <span className="font-semibold">Latitude:</span>
                                <span className="font-mono">{markerPosition[0].toFixed(6)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Longitude:</span>
                                <span className="font-mono">{markerPosition[1].toFixed(6)}</span>
                            </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-500 italic">
                                💡 ลากหมุดเพื่อปรับตำแหน่ง
                            </p>
                        </div>
                    </div>
                </Popup>
            )}
        </Marker>
    );
};

const LeafletMapPicker: React.FC<LeafletMapPickerProps> = ({
    onLocationChange,
    position,
    height = '400px',
    showLayerControl = true,
    showInstructions = true,
    showDrawingTools = false,
    markerTitle,
    markerDescription,
    showPopup = true
}) => {
    const featureGroupRef = useRef<any>(null);

    const handleCreated = (e: any) => {
        const { layerType, layer } = e;

        // If it's a marker from drawing tools, update the position
        if (layerType === 'marker') {
            const { lat, lng } = layer.getLatLng();
            onLocationChange({ lat, lng });

            // Add popup to drawn marker
            if (showPopup) {
                layer.bindPopup(`
                    <div class="p-2">
                        <h3 class="font-bold text-sm mb-2">📍 หมุดใหม่</h3>
                        <div class="text-xs text-gray-500">
                            <div><strong>Lat:</strong> ${lat.toFixed(6)}</div>
                            <div><strong>Lng:</strong> ${lng.toFixed(6)}</div>
                        </div>
                    </div>
                `);
            }
        }

        console.log('Created:', layerType, layer);
    };

    const handleEdited = (e: any) => {
        console.log('Edited:', e);
    };

    const handleDeleted = (e: any) => {
        console.log('Deleted:', e);
    };

    return (
        <div className="relative w-full border border-gray-200 rounded-lg overflow-hidden" style={{ height }}>
            <MapContainer
                center={[position.lat, position.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <MapUpdater position={position} />

                {showLayerControl ? (
                    <LayersControl position="topright">
                        {/* Base Layers */}
                        <LayersControl.BaseLayer checked name="🗺️ แผนที่ถนน (Street Map)">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                        </LayersControl.BaseLayer>

                        <LayersControl.BaseLayer name="🛰️ ภาพดาวเทียม (Satellite)">
                            <TileLayer
                                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            />
                        </LayersControl.BaseLayer>

                        <LayersControl.BaseLayer name="🌍 แผนที่ภูมิประเทศ (Terrain)">
                            <TileLayer
                                attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
                            />
                        </LayersControl.BaseLayer>

                        {/* Overlay Layers */}
                        <LayersControl.Overlay name="🏷️ ป้ายชื่อ (Labels)">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                            />
                        </LayersControl.Overlay>
                    </LayersControl>
                ) : (
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                )}

                {/* Drawing Tools */}
                {showDrawingTools ? (
                    <FeatureGroup ref={featureGroupRef}>
                        <EditControl
                            position="topleft"
                            onCreated={handleCreated}
                            onEdited={handleEdited}
                            onDeleted={handleDeleted}
                            draw={{
                                rectangle: true,
                                circle: true,
                                circlemarker: false,
                                marker: true,
                                polyline: true,
                                polygon: true,
                            }}
                            edit={{
                                edit: true,
                                remove: true,
                            }}
                        />
                    </FeatureGroup>
                ) : (
                    <LocationMarker
                        position={position}
                        onLocationChange={onLocationChange}
                        markerTitle={markerTitle}
                        markerDescription={markerDescription}
                        showPopup={showPopup}
                    />
                )}
            </MapContainer>

            {/* Instructions overlay */}
            {showInstructions && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 px-4 py-2 rounded-lg shadow-lg text-sm text-gray-700 pointer-events-none z-[1000] backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        {showDrawingTools ? (
                            <span><strong>ใช้เครื่องมือด้านซ้าย</strong> เพื่อวาดบนแผนที่ หรือ <strong>คลิก/ลากหมุด</strong></span>
                        ) : (
                            <span><strong>คลิกบนแผนที่</strong> หรือ <strong>ลากหมุด</strong> เพื่อเลือกตำแหน่ง • <strong>คลิกที่หมุด</strong> เพื่อดูรายละเอียด</span>
                        )}
                    </div>
                </div>
            )}

            {/* Coordinates display */}
            <div className="absolute top-4 left-4 bg-white/95 px-3 py-2 rounded-lg shadow-md text-xs text-gray-700 z-[1000] backdrop-blur-sm">
                <div className="font-mono">
                    <div><strong>Lat:</strong> {position.lat.toFixed(6)}</div>
                    <div><strong>Lng:</strong> {position.lng.toFixed(6)}</div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(LeafletMapPicker);
