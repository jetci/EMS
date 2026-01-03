import React, { useState } from 'react';
import GoogleMapEditor from './GoogleMapEditor';
import LeafletMapEditor from './LeafletMapEditor';

const AdminMapEditor: React.FC = () => {
    const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY;
    const isGoogleKeyValid = apiKey && apiKey !== 'YOUR_DEV_BROWSER_KEY';

    // Default to Google if key is valid, otherwise Leaflet
    const [useGoogleMaps, setUseGoogleMaps] = useState(isGoogleKeyValid);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Map Management</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Map Provider:</span>
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button
                            type="button"
                            onClick={() => isGoogleKeyValid && setUseGoogleMaps(true)}
                            className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${useGoogleMaps
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                } ${!isGoogleKeyValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!isGoogleKeyValid}
                            title={!isGoogleKeyValid ? "Google Maps API Key required" : "Switch to Google Maps"}
                        >
                            Google Maps
                        </button>
                        <button
                            type="button"
                            onClick={() => setUseGoogleMaps(false)}
                            className={`px-4 py-2 text-sm font-medium border rounded-r-lg ${!useGoogleMaps
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            OpenStreetMap (Free)
                        </button>
                    </div>
                </div>
            </div>

            {!isGoogleKeyValid && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                Running in <strong>Free Mode (OpenStreetMap)</strong> because no valid Google Maps API Key was found.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {useGoogleMaps && isGoogleKeyValid ? <GoogleMapEditor /> : <LeafletMapEditor />}
        </div>
    );
};

export default AdminMapEditor;
