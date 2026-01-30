import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Marker, Polyline, Polygon, Popup, useMap, LayersControl, Circle } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { apiRequest } from '../../services/api';
import { onLocationUpdated } from '../../services/socketService';
import LoadingSpinner from '../LoadingSpinner';
import AssignDriverModal from '../modals/AssignDriverModal';
import { dashboardService } from '../../services/dashboardService';

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

// Custom icons for different driver statuses
const createDriverIcon = (status: string) => {
    const color = status === 'AVAILABLE' ? '#22c55e' : status === 'ON_TRIP' ? '#f97316' : '#6b7280';
    return L.divIcon({
        className: 'custom-driver-icon',
        html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
};

interface MapShape {
    id: string;
    type: 'marker' | 'polyline' | 'polygon';
    name: string;
    description?: string;
    coordinates: any;
    properties?: any;
}

interface DriverLocation {
    driverId: string;
    driverName: string;
    latitude: number;
    longitude: number;
    status: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE';
    currentRideId?: string;
    lastUpdated: string;
    vehicleInfo?: {
        licensePlate: string;
        vehicleType: string;
    };
}

interface MapCommandEditorProps {
    title?: string;
    showDriverTracking?: boolean;
    refreshInterval?: number; // in ms
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

const MapCommandEditor: React.FC<MapCommandEditorProps> = ({
    title = "แผนที่สั่งการ - ศูนย์วิทยุ EMS",
    showDriverTracking = true,
    refreshInterval = 10000 // 10 seconds
}) => {
    const [shapes, setShapes] = useState<MapShape[]>([]);
    const [driverLocations, setDriverLocations] = useState<DriverLocation[]>([]);
    const [pendingRides, setPendingRides] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showDrivers, setShowDrivers] = useState(true);
    const [showPatients, setShowPatients] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedRideForAssign, setSelectedRideForAssign] = useState<any>(null);
    const [availableDriversList, setAvailableDriversList] = useState<any[]>([]);
    const featureGroupRef = useRef<any>(null);

    useEffect(() => {
        fetchShapes();
        if (showDriverTracking) {
            fetchData();
            // Set up polling for real-time data (Backup)
            const interval = setInterval(fetchData, refreshInterval);

            // Real-time Location Updates
            const cleanupSocket = onLocationUpdated((data: any) => {
                setDriverLocations(prev => {
                    const exists = prev.find(d => d.driverId === data.driverId);
                    if (exists) {
                        return prev.map(d => d.driverId === data.driverId ? { ...d, ...data, lastUpdated: new Date().toISOString() } : d);
                    } else {
                        // Optionally fetch full details if new driver appears, or just add minimal data
                        return [...prev, {
                            driverId: data.driverId,
                            driverName: data.driverName || 'Unknown Driver',
                            latitude: data.lat,
                            longitude: data.lng,
                            status: data.status || 'AVAILABLE',
                            lastUpdated: new Date().toISOString(),
                            vehicleInfo: data.vehicleInfo
                        }];
                    }
                });
            });

            return () => {
                clearInterval(interval);
                cleanupSocket();
            };
        }
    }, [showDriverTracking, refreshInterval]);

    const fetchData = async () => {
        await Promise.all([
            fetchDriverLocations(),
            fetchPendingRides(),
            fetchAvailableDriversForAssign()
        ]);
        setLastRefresh(new Date());
    };

    const fetchAvailableDriversForAssign = async () => {
        try {
            const data = await dashboardService.getAvailableDrivers();
            setAvailableDriversList(Array.isArray(data) ? data : (data?.drivers || []));
        } catch (error) {
            console.error("Failed to fetch drivers for modal", error);
        }
    };

    const fetchPendingRides = async () => {
        try {
            const data = await apiRequest('/rides');
            // Filter only pending or active rides
            const active = data.filter((r: any) => ['PENDING', 'ASSIGNED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS'].includes(r.status));
            setPendingRides(active);
        } catch (error) {
            console.error('Failed to fetch rides:', error);
        }
    };

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

    const fetchDriverLocations = useCallback(async () => {
        try {
            const data = await apiRequest('/driver-locations');
            setDriverLocations(data);
        } catch (error) {
            console.error('Failed to fetch driver locations:', error);
        }
    }, []);

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
            const flatLatLngs = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
            newShape.coordinates = flatLatLngs.map((ll: any) => ({ lat: ll.lat, lng: ll.lng }));
        }

        try {
            await apiRequest('/map-data', {
                method: 'POST',
                body: JSON.stringify(newShape)
            });
            fetchShapes();
            if (featureGroupRef.current) {
                featureGroupRef.current.removeLayer(layer);
            }
        } catch (error) {
            console.error('Failed to save shape:', error);
            alert('Failed to save shape');
        }
    };

    const handleEdited = async (e: any) => {
        console.log('Edited layers:', e.layers);
    };

    const handleDeleted = async (e: any) => {
        console.log('Deleted layers:', e.layers);
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

    const handleDeleteShape = async (id: string) => {
        if (!confirm('Are you sure you want to delete this shape?')) return;
        try {
            await apiRequest(`/map-data/${id}`, { method: 'DELETE' });
            setShapes(shapes.filter(s => s.id !== id));
        } catch (error) {
            console.error('Failed to delete shape:', error);
        }
    };

    const handleOpenAssignModal = (ride: any) => {
        setSelectedRideForAssign(ride);
        setIsAssignModalOpen(true);
    };

    const handleAssignDriver = async (rideId: string, driverId: string) => {
        try {
            await dashboardService.assignDriver(rideId, driverId);
            setIsAssignModalOpen(false);
            fetchPendingRides(); // Refresh rides
            alert('✅ จ่ายงานสำเร็จ');
        } catch (error: any) {
            alert('❌ เกิดข้อผิดพลาด: ' + error.message);
        }
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    if (loading && shapes.length === 0) return <LoadingSpinner />;

    const renderShapePopup = (shape: MapShape) => (
        <div className="p-2 min-w-[200px]">
            <h3 className="font-bold mb-2 text-sm">Edit Shape</h3>
            <div className="mb-2">
                <label className="block text-xs font-bold text-gray-700">Name:</label>
                <input
                    className="border p-1 text-xs w-full rounded"
                    value={shape.name}
                    onChange={(e) => handleUpdateShape(shape.id, { name: e.target.value })}
                />
            </div>
            <div className="mb-2">
                <label className="block text-xs font-bold text-gray-700">Description:</label>
                <textarea
                    className="border p-1 text-xs w-full rounded"
                    value={shape.description || ''}
                    onChange={(e) => handleUpdateShape(shape.id, { description: e.target.value })}
                />
            </div>
            <button
                onClick={() => handleDeleteShape(shape.id)}
                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 w-full"
            >
                Delete Shape
            </button>
        </div>
    );

    const renderDriverPopup = (driver: DriverLocation) => (
        <div className="p-2 min-w-[200px]">
            <h3 className="font-bold text-sm mb-1">{driver.driverName}</h3>
            <div className="text-xs space-y-1">
                <p><span className="font-medium">ทะเบียน:</span> {driver.vehicleInfo?.licensePlate}</p>
                <p><span className="font-medium">ประเภท:</span> {driver.vehicleInfo?.vehicleType}</p>
                <p>
                    <span className="font-medium">สถานะ:</span>
                    <span className={`ml-1 px-2 py-0.5 rounded text-white ${driver.status === 'AVAILABLE' ? 'bg-green-500' :
                        driver.status === 'ON_TRIP' ? 'bg-orange-500' : 'bg-gray-500'
                        }`}>
                        {driver.status === 'AVAILABLE' ? 'ว่าง' : driver.status === 'ON_TRIP' ? 'กำลังปฏิบัติงาน' : 'ออฟไลน์'}
                    </span>
                </p>
                {driver.currentRideId && (
                    <p><span className="font-medium">งานปัจจุบัน:</span> {driver.currentRideId}</p>
                )}
                <p className="text-gray-400 text-[10px]">อัปเดตล่าสุด: {new Date(driver.lastUpdated).toLocaleTimeString('th-TH')}</p>
            </div>
        </div>
    );

    const availableDrivers = driverLocations.filter(d => d.status === 'AVAILABLE').length;
    const onTripDrivers = driverLocations.filter(d => d.status === 'ON_TRIP').length;

    return (
        <div className={`flex flex-col space-y-4 ${isFullScreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
            <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${isFullScreen ? 'h-full flex flex-col' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <h2 className="text-lg font-bold">{title}</h2>
                        {lastRefresh && (
                            <p className="text-xs text-gray-400">อัปเดตล่าสุด: {lastRefresh.toLocaleTimeString('th-TH')}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {showDriverTracking && (
                            <div className="flex items-center gap-4 mr-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span>ว่าง: {availableDrivers}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                    <span>ปฏิบัติงาน: {onTripDrivers}</span>
                                </div>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showDrivers}
                                        onChange={(e) => setShowDrivers(e.target.checked)}
                                        className="rounded"
                                    />
                                    <span>คนขับ</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showPatients}
                                        onChange={(e) => setShowPatients(e.target.checked)}
                                        className="rounded"
                                    />
                                    <span>จุดรับผู้ป่วย</span>
                                </label>
                            </div>
                        )}
                        <button
                            onClick={toggleFullScreen}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded border text-sm font-medium flex items-center"
                        >
                            {isFullScreen ? 'ออกจากเต็มจอ' : 'เต็มจอ'}
                        </button>
                    </div>
                </div>

                <div className={`w-full border rounded-lg overflow-hidden relative z-0 ${isFullScreen ? 'flex-grow' : 'h-[600px]'}`}>
                    <MapContainer center={[19.9213, 99.2131]} zoom={13} style={{ height: '100%', width: '100%' }}>
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
                                    attribution='Tiles &copy; Esri'
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                />
                            </LayersControl.BaseLayer>

                            <LayersControl.Overlay checked name="Labels">
                                <TileLayer
                                    attribution='&copy; CARTO'
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

                        {/* Render saved shapes */}
                        {shapes.map(shape => (
                            <React.Fragment key={shape.id}>
                                {shape.type === 'marker' && (
                                    <Marker position={[shape.coordinates.lat, shape.coordinates.lng]}>
                                        <Popup>{renderShapePopup(shape)}</Popup>
                                    </Marker>
                                )}
                                {shape.type === 'polyline' && (
                                    <Polyline positions={shape.coordinates.map((c: any) => [c.lat, c.lng])} color="blue">
                                        <Popup>{renderShapePopup(shape)}</Popup>
                                    </Polyline>
                                )}
                                {shape.type === 'polygon' && (
                                    <Polygon positions={shape.coordinates.map((c: any) => [c.lat, c.lng])} color="green">
                                        <Popup>{renderShapePopup(shape)}</Popup>
                                    </Polygon>
                                )}
                            </React.Fragment>
                        ))}

                        {/* Render driver locations */}
                        {showDriverTracking && showDrivers && driverLocations.map(driver => (
                            <Marker
                                key={driver.driverId}
                                position={[driver.latitude, driver.longitude]}
                                icon={createDriverIcon(driver.status)}
                            >
                                <Popup>{renderDriverPopup(driver)}</Popup>
                            </Marker>
                        ))}

                        {/* Render pending rides / patient locations */}
                        {showPatients && pendingRides.map(ride => {
                            // Correctly resolve coordinates (DB field vs API field)
                            const lat = ride.pickup_lat || ride.pickupCoordinates?.lat;
                            const lng = ride.pickup_lng || ride.pickupCoordinates?.lng;

                            if (!lat || !lng) return null;

                            const patientIcon = L.divIcon({
                                className: 'patient-marker',
                                html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                    <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
                                </div>`,
                                iconSize: [24, 24],
                                iconAnchor: [12, 12]
                            });

                            return (
                                <Marker
                                    key={ride.id}
                                    position={[parseFloat(lat), parseFloat(lng)]}
                                    icon={patientIcon}
                                >
                                    <Popup>
                                        <div className="p-2 min-w-[180px]">
                                            <h3 className="font-bold text-sm text-[var(--wecare-blue)] mb-1">{ride.patient_name || ride.patientName}</h3>
                                            <p className="text-xs text-gray-700 font-medium mb-1">{ride.pickup_location || ride.pickupLocation}</p>
                                            <div className="text-xs text-gray-600 mb-2">
                                                <span className="block">{ride.trip_type || ride.tripType}</span>
                                            </div>

                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200">{ride.status}</span>
                                                <span className="text-[10px] text-gray-400">ID: {ride.id.substring(0, 6)}...</span>
                                            </div>

                                            {ride.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleOpenAssignModal(ride)}
                                                    className="w-full mt-1 bg-[var(--wecare-blue)] hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded shadow-sm transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0 1 1 0 002 0z" />
                                                    </svg>
                                                    จ่ายงานด่วน
                                                </button>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>
            </div>

            {/* Shape List - Hide in fullscreen */}
            {!isFullScreen && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-bold mb-2">รายการจุดสำคัญ</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
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
                                                ลบ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {shapes.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-400">ยังไม่มีจุดสำคัญ</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {/* Assign Driver Modal */}
            {selectedRideForAssign && (
                <AssignDriverModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    ride={selectedRideForAssign}
                    onAssign={handleAssignDriver}
                    allDrivers={availableDriversList}
                    allRides={pendingRides}
                />
            )}
        </div>
    );
};

export default MapCommandEditor;
