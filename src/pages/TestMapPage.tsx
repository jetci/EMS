import React from 'react';
import AdminMapEditor from '../components/admin/AdminMapEditor';

const TestMapPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Map Management</h1>
                <p className="text-gray-600">
                    Manage system zones, points of interest, and routes.
                </p>
            </div>
            <AdminMapEditor />
        </div>
    );
};

export default TestMapPage;

