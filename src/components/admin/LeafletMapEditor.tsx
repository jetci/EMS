import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Marker, Polyline, Polygon, Popup, useMap, LayersControl } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { apiRequest } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapShape {
    id: string;
    type: 'marker' | 'polyline' | 'polygon';
    name: string;
    description?: string;
    coordinates: any;
    properties?: any;
}

// Component to handle map resize issues
const MapController = () => {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, [map]);
    return null;
};

interface LeafletMapEditorProps {
    title?: string;
    className?: string;
}

const LeafletMapEditor: React.FC<LeafletMapEditorProps> = ({ title = "Leaflet Map Editor (Free Mode)", className = "" }) => {
    const [shapes, setShapes] = useState<MapShape[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const featureGroupRef = useRef<any>(null);

    useEffect(() => {
        fetchShapes();
    }, []);

    const fetchShapes = async () => {
        try {
            setLoading(true);
            const data = await apiRequest('/map-data');
            setShapes(data);
        } catch (error) {
            console.error('Failed to fetch map shapes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreated = async (e: any) => {
        const { layerType, layer } = e;

        let newShape: Partial<MapShape> = {
            type: layerType,
            name: `New ${layerType}`,
            description: '',
            properties: {}
        };

        if (layerType === 'marker') {
            const { lat, lng } = layer.getLatLng();
            newShape.coordinates = { lat, lng };
        } else if (layerType === 'polyline' || layerType === 'polygon') {
            const latlngs = layer.getLatLngs();
            // Leaflet polygons might be nested arrays if they have holes, simplifying for now
            const flatLatLngs = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
            newShape.coordinates = flatLatLngs.map((ll: any) => ({ lat: ll.lat, lng: ll.lng }));
        }

        try {
            const created = await apiRequest('/map-data', {
                method: 'POST',
                body: JSON.stringify(newShape)
            });
            // We reload shapes to ensure sync with backend ID
            fetchShapes();
            // Remove the drawn layer because we will render it from state
            if (featureGroupRef.current) {
                featureGroupRef.current.removeLayer(layer);
            }
        } catch (error) {
            console.error('Failed to save shape:', error);
            alert('Failed to save shape');
        }
    };

    const handleEdited = async (e: any) => {
        const { layers } = e;
        layers.eachLayer(async (layer: any) => {
            // Find the shape ID associated with this layer
            // This is tricky in Leaflet Draw unless we bind ID to layer.
            // For now, we might need a better way to map layers to IDs.
            // A common approach is to not use EditControl for *existing* shapes fetched from DB 
            // if we can't easily map them back.
            // But let's try to see if we can attach ID to layer options.

            // For this iteration, we will just log. Full two-way binding with react-leaflet-draw is complex.
            console.log('Edited layer:', layer);
        });
    };

    const handleDeleted = async (e: any) => {
        const { layers } = e;
        layers.eachLayer(async (layer: any) => {
            // Similar issue as Edit, need ID.
            console.log('Deleted layer:', layer);
        });
    };

    const handleUpdateShape = async (id: string, updates: Partial<MapShape>) => {
        try {
            const updated = await apiRequest(`/map-data/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
            setShapes(shapes.map(s => s.id === id ? updated : s));
        } catch (error) {
            console.error('Failed to update shape:', error);
            alert('Failed to update shape');
        }
    };

    // Custom delete handler for our rendered shapes
    const handleDeleteShape = async (id: string) => {
        // if (!confirm('Are you sure you want to delete this shape?')) return; // Temporarily removed for debugging
        try {
            console.log('Deleting shape:', id);
            await apiRequest(`/map-data/${id}`, { method: 'DELETE' });
            setShapes(shapes.filter(s => s.id !== id));
            // alert('Shape deleted successfully'); // Optional feedback
        } catch (error) {
            console.error('Failed to delete shape:', error);
            alert('Failed to delete shape. Check console for details.');
        }
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    if (loading && shapes.length === 0) return <LoadingSpinner />;

    // Component for Popup Content to handle local state and prevent re-render issues
    const ShapePopupForm = ({ shape, onUpdate, onDelete }: { shape: MapShape, onUpdate: (id: string, data: Partial<MapShape>) => void, onDelete: (id: string) => void }) => {
        const [name, setName] = useState(shape.name);
        const [description, setDescription] = useState(shape.description || '');
        const [isDirty, setIsDirty] = useState(false);

        const handleSave = () => {
            onUpdate(shape.id, { name, description });
            setIsDirty(false);
        };

        // Stop propagation to prevent Leaflet from catching key events
        const stopPropagation = (e: React.KeyboardEvent | React.MouseEvent) => {
            e.stopPropagation();
        };

        return (
            <div className="p-2 min-w-[200px]" onClick={stopPropagation} onKeyDown={stopPropagation} onMouseDown={stopPropagation} onDoubleClick={stopPropagation}>
                <h3 className="font-bold mb-2 text-sm">Edit Shape</h3>
                <div className="mb-2">
                    <label className="block text-xs font-bold text-gray-700">Name:</label>
                    <input
                        className="border p-1 text-xs w-full rounded"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
                        onKeyDown={(e) => e.stopPropagation()}
                    />
                </div>
                <div className="mb-2">
                    <label className="block text-xs font-bold text-gray-700">Description:</label>
                    <textarea
                        className="border p-1 text-xs w-full rounded"
                        value={description}
                        onChange={(e) => { setDescription(e.target.value); setIsDirty(true); }}
                        onKeyDown={(e) => e.stopPropagation()}
                    />
                </div>
                <div className="flex space-x-2">
                    {isDirty && (
                        <button
                            onClick={handleSave}
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex-1"
                        >
                            Save
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(shape.id)}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex-1"
                    >
                        Delete
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className={`flex flex-col space-y-4 ${isFullScreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
            <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${isFullScreen ? 'h-full flex flex-col' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-bold">Leaflet Map Editor (Free Mode)</h2>
                    <button
                        onClick={toggleFullScreen}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded border text-sm font-medium flex items-center"
                    >
                        {isFullScreen ? (
                            <>
                                <span className="mr-1">Exit Fullscreen</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </>
                        ) : (
                            <>
                                <span className="mr-1">Fullscreen</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>

                <div className={`w-full border rounded-lg overflow-hidden relative z-0 ${isFullScreen ? 'flex-grow' : 'h-[600px]'}`}>
                    <MapContainer center={[19.904394846183447, 99.19735149982482]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <MapController />
                        <LayersControl position="topright">
                            <LayersControl.BaseLayer checked name="Street Map (OSM)">
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                            </LayersControl.BaseLayer>

                            <LayersControl.BaseLayer name="Satellite (Esri)">
                                <TileLayer
                                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                />
                            </LayersControl.BaseLayer>

                            <LayersControl.Overlay checked name="Labels (Hybrid)">
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                                />
                            </LayersControl.Overlay>
                        </LayersControl>

                        <FeatureGroup ref={featureGroupRef}>
                            <EditControl
                                position="topright"
                                onCreated={handleCreated}
                                onEdited={handleEdited}
                                onDeleted={handleDeleted}
                                draw={{
                                    rectangle: false,
                                    circle: false,
                                    circlemarker: false,
                                }}
                            />
                        </FeatureGroup>

                        {/* Render existing shapes */}
                        {shapes.map(shape => (
                            <React.Fragment key={shape.id}>
                                {shape.type === 'marker' && (
                                    <Marker position={[shape.coordinates.lat, shape.coordinates.lng]}>
                                        <Popup>
                                            <ShapePopupForm shape={shape} onUpdate={handleUpdateShape} onDelete={handleDeleteShape} />
                                        </Popup>
                                    </Marker>
                                )}
                                {shape.type === 'polyline' && (
                                    <Polyline positions={shape.coordinates.map((c: any) => [c.lat, c.lng])} color="blue">
                                        <Popup>
                                            <ShapePopupForm shape={shape} onUpdate={handleUpdateShape} onDelete={handleDeleteShape} />
                                        </Popup>
                                    </Polyline>
                                )}
                                {shape.type === 'polygon' && (
                                    <Polygon positions={shape.coordinates.map((c: any) => [c.lat, c.lng])} color="green">
                                        <Popup>
                                            <ShapePopupForm shape={shape} onUpdate={handleUpdateShape} onDelete={handleDeleteShape} />
                                        </Popup>
                                    </Polygon>
                                )}
                            </React.Fragment>
                        ))}
                    </MapContainer>
                </div>
            </div>

            {/* Shape List - Hide in fullscreen */}
            {!isFullScreen && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-bold mb-2">Shape List</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {shapes.map(shape => (
                                    <tr key={shape.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shape.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{shape.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button
                                                onClick={() => handleDeleteShape(shape.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeafletMapEditor;
