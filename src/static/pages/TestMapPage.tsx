import React from 'react';
import SimpleMapTest from '../components/SimpleMapTest';

const TestMapPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Map Component Test Page</h1>
            <p className="text-gray-600 mb-6">
                This page is for testing the Google Maps component in isolation. It attempts to load the map using the API key from the application's environment variables. 
                Any errors related to the API key or map loading will be displayed below.
            </p>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <SimpleMapTest />
            </div>
        </div>
    );
};

export default TestMapPage;
