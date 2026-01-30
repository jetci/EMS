import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, DrawingManager, Marker, Polyline, Polygon, InfoWindow } from '@react-google-maps/api';
import LoadingSpinner from '../LoadingSpinner';
import { apiRequest } from '../../services/api';

const containerStyle = {
    width: '100%',
    height: '600px'
};

const center = {
    lat: 19.9213,
    lng: 99.2131
};

interface MapShape {
    id: string;
    type: 'marker' | 'polyline' | 'polygon';
    name: string;
    description?: string;
    coordinates: any;
    properties?: any;
}

const GoogleMapEditor: React.FC = () => {
    const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY;
    const isInvalidKey = !apiKey || apiKey === 'YOUR_DEV_BROWSER_KEY';

    const [shapes, setShapes] = useState<MapShape[]>([]);
    const [selectedShape, setSelectedShape] = useState<MapShape | null>(null);
    const [loading, setLoading] = useState(false);
    const mapRef = useRef<google.maps.Map | null>(null);
    const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script-admin',
        googleMapsApiKey: isInvalidKey ? '' : apiKey,
        libraries: ['drawing', 'geometry'],
        language: 'th',
        preventGoogleFontsLoading: true
    });

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

    const handleOverlayComplete = async (e: google.maps.drawing.OverlayCompleteEvent) => {
        const { type, overlay } = e;
        let newShape: Partial<MapShape> = {
            type: type as any,
            name: `New ${type}`,
            description: '',
            properties: {}
        };

        if (type === google.maps.drawing.OverlayType.MARKER) {
            const marker = overlay as google.maps.Marker;
            const pos = marker.getPosition();
            newShape.coordinates = { lat: pos?.lat(), lng: pos?.lng() };
            marker.setMap(null);
        } else if (type === google.maps.drawing.OverlayType.POLYLINE) {
            const polyline = overlay as google.maps.Polyline;
            const path = polyline.getPath().getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
            newShape.coordinates = path;
            polyline.setMap(null);
        } else if (type === google.maps.drawing.OverlayType.POLYGON) {
            const polygon = overlay as google.maps.Polygon;
            const path = polygon.getPath().getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
            newShape.coordinates = path;
            polygon.setMap(null);
        }

        try {
            const created = await apiRequest('/map-data', {
                method: 'POST',
                body: JSON.stringify(newShape)
            });
            setShapes([...shapes, created]);
        } catch (error) {
            console.error('Failed to save shape:', error);
            alert('Failed to save shape');
        }
    };

    const handleUpdateShape = async (id: string, updates: Partial<MapShape>) => {
        try {
            const updated = await apiRequest(`/map-data/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
            setShapes(shapes.map(s => s.id === id ? updated : s));
            if (selectedShape?.id === id) {
                setSelectedShape(updated);
            }
        } catch (error) {
            console.error('Failed to update shape:', error);
            alert('Failed to update shape');
        }
    };

    const handleDragEnd = (e: google.maps.MapMouseEvent, shape: MapShape) => {
        if (!e.latLng) return;
        const newCoords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        handleUpdateShape(shape.id, { coordinates: newCoords });
    };

    const handlePathChanged = (path: google.maps.MVCArray<google.maps.LatLng>, shape: MapShape) => {
        const newPath = path.getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
        handleUpdateShape(shape.id, { coordinates: newPath });
    };

    // Component for Popup Content to handle local state and prevent re-render issues
    const ShapePopupForm = ({ shape, onUpdate, onDelete }: { shape: MapShape, onUpdate: (id: string, data: Partial<MapShape>) => void, onDelete: (id: string) => void }) => {
        const [name, setName] = useState(shape.name);
        const [description, setDescription] = useState(shape.description || '');
        const [isDirty, setIsDirty] = useState(false);

        const handleSave = () => {
            onUpdate(shape.id, { name, description });
            setIsDirty(false);
        };

        return (
            <div className="p-2 min-w-[200px]">
                <h3 className="font-bold mb-2 text-sm">Edit Shape</h3>
                <p className="text-xs text-gray-500 mb-2">ID: {shape.id}</p>
                <div className="mb-2">
                    <label className="block text-xs font-bold text-gray-700">Name:</label>
                    <input
                        className="border p-1 text-xs w-full rounded"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
                    />
                </div>
                <div className="mb-2">
                    <label className="block text-xs font-bold text-gray-700">Description:</label>
                    <textarea
                        className="border p-1 text-xs w-full rounded"
                        value={description}
                        onChange={(e) => { setDescription(e.target.value); setIsDirty(true); }}
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

    // Custom delete handler
    const handleDeleteShape = async (id: string) => {
        // if (!confirm('Are you sure you want to delete this shape?')) return; // Temporarily removed
        try {
            console.log('Deleting shape:', id);
            await apiRequest(`/map-data/${id}`, { method: 'DELETE' });
            setShapes(shapes.filter(s => s.id !== id));
            setSelectedShape(null);
        } catch (error) {
            console.error('Failed to delete shape:', error);
            alert('Failed to delete shape. Check console for details.');
        }
    };

    // ... (rest of the component)

    // Inside GoogleMap render:
    {
        selectedShape && (
            <InfoWindow
                position={
                    selectedShape.type === 'marker'
                        ? selectedShape.coordinates
                        : selectedShape.coordinates[0]
                }
                onCloseClick={() => setSelectedShape(null)}
            >
                <ShapePopupForm shape={selectedShape} onUpdate={handleUpdateShape} onDelete={handleDeleteShape} />
            </InfoWindow>
        )
    }

    const handleManualAdd = async () => {
        const newShape: Partial<MapShape> = {
            type: 'marker',
            name: `Manual Marker ${shapes.length + 1}`,
            description: 'Created manually for testing',
            coordinates: { lat: 19.9213, lng: 99.2131 },
            properties: {}
        };
        try {
            const created = await apiRequest('/map-data', {
                method: 'POST',
                body: JSON.stringify(newShape)
            });
            setShapes([...shapes, created]);
        } catch (error) {
            console.error('Failed to save shape:', error);
            alert('Failed to save shape');
        }
    };

    const onLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const onUnmount = useCallback(() => {
        mapRef.current = null;
    }, []);

    if (loadError || isInvalidKey) {
        return (
            <div className="flex flex-col space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <strong>Google Maps API Key Missing or Invalid:</strong> The map cannot be loaded.
                                Please update <code>VITE_GOOGLE_MAPS_API_KEY</code> in <code>.env</code>.
                            </p>
                            <p className="text-sm text-yellow-700 mt-2">
                                You can still manage the shape list below.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">Shape List (Backend Connected)</h3>
                        <button onClick={handleManualAdd} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Add Test Shape Manually
                        </button>
                    </div>
                    {/* List Table */}
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
                                {shapes.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No shapes found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    if (!isLoaded) return <LoadingSpinner />;

    return (
        <div className="flex flex-col space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold mb-2">Admin Map Editor</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Draw: Use toolbar. Edit: Click shape to select, then drag points. Delete: Click shape then delete button.
                </p>

                <div className="border rounded-lg overflow-hidden">
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={13}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                    >
                        <DrawingManager
                            onLoad={manager => drawingManagerRef.current = manager}
                            onOverlayComplete={handleOverlayComplete}
                            options={{
                                drawingControl: true,
                                drawingControlOptions: {
                                    position: google.maps.ControlPosition.TOP_CENTER,
                                    drawingModes: [
                                        google.maps.drawing.OverlayType.MARKER,
                                        google.maps.drawing.OverlayType.POLYLINE,
                                        google.maps.drawing.OverlayType.POLYGON,
                                    ],
                                },
                            }}
                        />

                        {shapes.map(shape => (
                            <React.Fragment key={shape.id}>
                                {shape.type === 'marker' && (
                                    <Marker
                                        position={shape.coordinates}
                                        onClick={() => setSelectedShape(shape)}
                                        draggable={true}
                                        onDragEnd={(e) => handleDragEnd(e, shape)}
                                    />
                                )}
                                {shape.type === 'polyline' && (
                                    <Polyline
                                        path={shape.coordinates}
                                        onClick={() => setSelectedShape(shape)}
                                        editable={selectedShape?.id === shape.id}
                                        draggable={selectedShape?.id === shape.id}
                                        onMouseUp={() => {
                                            // Handle path changes if needed
                                        }}
                                        options={{ strokeColor: '#FF0000' }}
                                    />
                                )}
                                {shape.type === 'polygon' && (
                                    <Polygon
                                        paths={shape.coordinates}
                                        onClick={() => setSelectedShape(shape)}
                                        editable={selectedShape?.id === shape.id}
                                        draggable={selectedShape?.id === shape.id}
                                        options={{ fillColor: '#00FF00', fillOpacity: 0.3, strokeColor: '#00FF00' }}
                                    />
                                )}
                            </React.Fragment>
                        ))}

                        {selectedShape && (
                            <InfoWindow
                                position={
                                    selectedShape.type === 'marker'
                                        ? selectedShape.coordinates
                                        : selectedShape.coordinates[0]
                                }
                                onCloseClick={() => setSelectedShape(null)}
                            >
                                <ShapePopupForm shape={selectedShape} onUpdate={handleUpdateShape} onDelete={handleDeleteShape} />
                            </InfoWindow>
                        )}
                    </GoogleMap>
                </div>
            </div>

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
                                <tr key={shape.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedShape(shape)}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shape.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{shape.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteShape(shape.id); }}
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
        </div>
    );
};

export default GoogleMapEditor;
