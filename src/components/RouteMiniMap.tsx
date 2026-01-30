import React, { useCallback, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import MapPinIcon from './icons/MapPinIcon';
import LoadingSpinner from './LoadingSpinner';

interface RouteMiniMapProps {
  rides: {
    id: string;
    pickupCoordinates?: { lat: number, lng: number };
  }[];
}

const containerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '0.5rem',
  marginBottom: '1rem',
};

const RouteMiniMap: React.FC<RouteMiniMapProps> = ({ rides }) => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return (
        <div 
            style={containerStyle} 
            className="flex flex-col items-center justify-center bg-gray-100 text-gray-600 p-4 text-center border border-gray-200 rounded-lg animate-scale-in"
        >
            <MapPinIcon className="h-12 w-12 mb-3 text-gray-400" />
            <p className="font-semibold">ไม่สามารถแสดงแผนที่ได้</p>
            <p className="text-xs mt-1">(จำเป็นต้องใช้ Google Maps API Key)</p>
        </div>
    );
  }

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-mini',
    googleMapsApiKey: apiKey,
    language: 'th'
  });

  const mapRef = useRef<any | null>(null);

  const onLoad = useCallback((map: any) => {
    mapRef.current = map;
    if ((window as any).google) {
        const bounds = new (window as any).google.maps.LatLngBounds();
        let hasValidCoords = false;
        rides.forEach(ride => {
            if (ride.pickupCoordinates) {
                bounds.extend(ride.pickupCoordinates);
                hasValidCoords = true;
            }
        });
        if (hasValidCoords) {
            map.fitBounds(bounds, 50); // 50px padding
        }
    }
  }, [rides]);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  if (loadError) {
    return (
      <div style={containerStyle} className="flex items-center justify-center bg-red-100 text-red-700 rounded-lg animate-scale-in">
        เกิดข้อผิดพลาดในการโหลดแผนที่
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={containerStyle} className="flex items-center justify-center bg-gray-100 rounded-lg animate-scale-in">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="animate-scale-in">
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={rides[0]?.pickupCoordinates || { lat: 13.7563, lng: 100.5018 }}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            }}
        >
        {rides.map((ride, index) =>
            ride.pickupCoordinates && (
            <Marker
                key={ride.id}
                position={ride.pickupCoordinates}
                label={{
                    text: (index + 1).toString(),
                    color: "white",
                    fontWeight: "bold"
                }}
            />
            )
        )}
        </GoogleMap>
    </div>
  );
};

export default RouteMiniMap;
