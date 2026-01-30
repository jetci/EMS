// src/components/SimpleMapTest.tsx
import React from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import MapPinIcon from './icons/MapPinIcon';
import LoadingSpinner from './LoadingSpinner';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 19.9213, // พิกัดตัวอย่าง อ.ฝาง
  lng: 99.2131
};

function SimpleMapTest() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div
        style={containerStyle}
        className="flex flex-col items-center justify-center h-full bg-gray-100 text-gray-600 p-4 text-center"
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
    id: 'google-map-script-simple',
    googleMapsApiKey: apiKey,
    language: 'th'
  });

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
      center={center}
      zoom={12}
    />
  );
}

export default React.memo(SimpleMapTest);
