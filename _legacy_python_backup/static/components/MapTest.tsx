// src/components/MapTest.tsx
import React, { useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import MapPinIcon from './icons/MapPinIcon';
import LoadingSpinner from './LoadingSpinner';

interface MapTestProps {
    onLocationChange: (coords: { lat: number; lng: number }) => void;
    position: { lat: number; lng: number };
}

const containerStyle = { width: '100%', height: '400px' };

function MapTest({ onLocationChange, position }: MapTestProps) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return (
        <div 
            style={containerStyle} 
            className="flex flex-col items-center justify-center h-full bg-gray-100 text-gray-600 p-4 text-center border border-gray-200"
        >
            <MapPinIcon className="h-12 w-12 mb-3 text-gray-400" />
            <p className="font-semibold">ไม่สามารถแสดงแผนที่ได้</p>
            <p className="text-xs mt-1">
                (จำเป็นต้องใช้ Google Maps API Key)
            </p>
        </div>
    );
  }

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-test',
    googleMapsApiKey: apiKey,
    language: 'th',
    preventGoogleFontsLoading: true,
  });


  const handleMarkerDragEnd = useCallback((e: any) => {
    if (e.latLng) {
        onLocationChange({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
        });
    }
  }, [onLocationChange]);

  
  if (loadError) {
    return (
        <div style={containerStyle} className="flex items-center justify-center bg-red-100 text-red-700">
            เกิดข้อผิดพลาดในการโหลดแผนที่
        </div>
    );
  }

  if (!isLoaded) {
    return (
        <div style={containerStyle} className="flex items-center justify-center bg-gray-100">
            <LoadingSpinner />
        </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={position}
      zoom={12}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
      }}
    >
        <Marker
            position={position}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
            title="ลากเพื่อปักหมุดตำแหน่ง"
        />
    </GoogleMap>
  );
}

export default React.memo(MapTest);