import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

interface DeveloperDashboardPageProps {
    setActiveView?: (view: any) => void;
}

const DeveloperDashboardPage: React.FC<DeveloperDashboardPageProps> = ({ setActiveView }) => {
    const [status, setStatus] = useState<string>('');
    const [health, setHealth] = useState<any>(null);

    useEffect(() => {
        checkHealth();
    }, []);

    const checkHealth = async () => {
        try {
            // Assuming we have a health check endpoint, or just ping root
            await apiRequest('/'); // Root usually returns "Backend is running"
            setHealth({ status: 'Online', latency: 'OK' });
        } catch (e) {
            setHealth({ status: 'Offline', error: e.message });
        }
    };

    const handleResetDB = async () => {
        if (!confirm('⚠️ DANGER: This will DELETE ALL DATA and reset the database to its initial state. Are you sure?')) return;
        try {
            setStatus('Resetting database...');
            await apiRequest('/admin/system/reset-db', { method: 'POST' });
            setStatus('✅ Database reset successfully. You may need to login again.');
            alert('Database reset complete. Please login again.');
            window.location.reload();
        } catch (error: any) {
            setStatus('❌ Error: ' + error.message);
        }
    };

    const handleSeedUsers = async () => {
        try {
            setStatus('Seeding users...');
            await apiRequest('/admin/system/seed-users', { method: 'POST' });
            setStatus('✅ Users seeded successfully.');
        } catch (error: any) {
            setStatus('❌ Error: ' + error.message);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Developer Console 🛠️</h1>
                    <p className="text-gray-600">Advanced system tools and diagnostics</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold ${health?.status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    System: {health?.status || 'Checking...'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Database Tools */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <span className="mr-2">🗄️</span> Database Management
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">Manage database state, reset data, and seed initial test data.</p>
                    <div className="space-y-3">
                        <button onClick={handleResetDB} className="w-full px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 flex items-center justify-center font-medium transition-colors">
                            ⚠️ Factory Reset Database
                        </button>
                        <button onClick={handleSeedUsers} className="w-full px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center justify-center font-medium transition-colors">
                            🌱 Re-seed Test Users
                        </button>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <span className="mr-2">🔗</span> Quick Links
                    </h2>
                    <div className="space-y-2">
                        <button
                            onClick={() => setActiveView && setActiveView('logs')}
                            className="w-full text-left block p-3 rounded-lg hover:bg-gray-50 text-blue-600 hover:underline"
                        >
                            View System Logs
                        </button>
                        <a href="/api/docs" target="_blank" className="block p-3 rounded-lg hover:bg-gray-50 text-blue-600 hover:underline">API Documentation</a>
                        <div className="border-t pt-2 mt-2">
                            <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Test Accounts</p>
                            <div className="text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded">
                                admin@wecare.ems / password123<br />
                                dev@wecare.ems / password123
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Log */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <span className="mr-2">📝</span> Console Output
                    </h2>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto">
                        {status ? (
                            <div>
                                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {status}
                            </div>
                        ) : (
                            <span className="text-gray-600">Ready...</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeveloperDashboardPage;

