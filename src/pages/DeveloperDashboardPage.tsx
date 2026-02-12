import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

interface DeveloperDashboardPageProps {
    setActiveView?: (view: any) => void;
}

const DeveloperDashboardPage: React.FC<DeveloperDashboardPageProps> = ({ setActiveView }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [status, setStatus] = useState<string>('');
    const [health, setHealth] = useState<any>(null);

    // SQL Playground State
    const [sqlQuery, setSqlQuery] = useState('');
    const [sqlResult, setSqlResult] = useState<any>(null);

    // Socket Monitor State
    const [socketStats, setSocketStats] = useState<any>(null);

    // Config State
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        checkHealth();
    }, []);

    useEffect(() => {
        if (activeTab === 'monitor') fetchSocketStats();
        if (activeTab === 'config') fetchConfig();
    }, [activeTab]);

    const checkHealth = async () => {
        try {
            await apiRequest('/');
            setHealth({ status: 'Online', latency: 'OK' });
        } catch (e: any) {
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

    const handleExecuteSQL = async () => {
        try {
            setSqlResult(null);
            const res = await apiRequest('/developer/sql', {
                method: 'POST',
                body: JSON.stringify({ query: sqlQuery })
            });
            setSqlResult(res);
        } catch (error: any) {
            setSqlResult({ error: error.message });
        }
    };

    const fetchSocketStats = async () => {
        try {
            const stats = await apiRequest('/developer/socket-stats');
            setSocketStats(stats);
        } catch (error: any) {
            console.error('Failed to fetch socket stats', error);
        }
    };

    const fetchConfig = async () => {
        try {
            const conf = await apiRequest('/developer/env');
            setConfig(conf);
        } catch (error: any) {
            console.error('Failed to fetch config', error);
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

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
                {['overview', 'sql', 'monitor', 'config'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm transition-colors capitalize ${activeTab === tab
                            ? 'border-[var(--wecare-blue)] text-[var(--wecare-blue)]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab === 'sql' ? 'SQL Playground' : tab === 'monitor' ? 'Socket Monitor' : tab === 'config' ? 'System Config' : 'Overview'}
                    </button>
                ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <span className="mr-2">🗄️</span> Database Actions
                        </h2>
                        <div className="space-y-3">
                            <button onClick={handleResetDB} className="w-full px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 flex items-center justify-center font-medium transition-colors">
                                Factory Reset DB
                            </button>
                            <button onClick={handleSeedUsers} className="w-full px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center justify-center font-medium transition-colors">
                                Re-seed Users
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <span className="mr-2">🔗</span> Quick Links
                        </h2>
                        <div className="space-y-2">
                            <button onClick={() => setActiveView && setActiveView('logs')} className="w-full text-left block p-3 rounded-lg hover:bg-gray-50 text-blue-600 hover:underline">
                                View System Logs
                            </button>
                            <button onClick={() => setActiveView && setActiveView('design_system')} className="w-full text-left block p-3 rounded-lg hover:bg-gray-50 text-blue-600 hover:underline">
                                UX/UI Design System
                            </button>
                            <div className="border-t pt-2 mt-2">
                                <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Test Accounts</p>
                                <div className="text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded">
                                    admin@wecare.ems / password123
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <span className="mr-2">📝</span> Console Output
                        </h2>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto">
                            {status ? status : <span className="text-gray-600">Ready...</span>}
                        </div>
                    </div>
                </div>
            )}

            {/* Tab: SQL Playground */}
            {activeTab === 'sql' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold mb-4">Execute Raw SQL</h2>
                        <textarea
                            value={sqlQuery}
                            onChange={(e) => setSqlQuery(e.target.value)}
                            placeholder="SELECT * FROM users LIMIT 5;"
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleExecuteSQL}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Execute Query
                            </button>
                        </div>
                    </div>

                    {sqlResult && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                            <h3 className="text-md font-semibold mb-3">Result</h3>
                            {sqlResult.error ? (
                                <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                                    Error: {sqlResult.error}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-xs text-gray-500">
                                        Type: {sqlResult.type} | Count: {sqlResult.count || 0}
                                    </div>
                                    {sqlResult.results && sqlResult.results.length > 0 ? (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    {Object.keys(sqlResult.results[0]).map(key => (
                                                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            {key}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {sqlResult.results.map((row: any, i: number) => (
                                                    <tr key={i}>
                                                        {Object.values(row).map((val: any, j) => (
                                                            <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-gray-500 italic">No results returned or query was not a SELECT.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Socket Monitor */}
            {activeTab === 'monitor' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">Socket.IO Server Stats</h2>
                            <button onClick={fetchSocketStats} className="text-blue-600 hover:underline text-sm">Refresh Stats</button>
                        </div>
                        {socketStats ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-blue-500 text-sm font-medium">Total Clients</div>
                                    <div className="text-2xl font-bold text-blue-700">{socketStats.clientsCount}</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-green-500 text-sm font-medium">WebSocket Conn</div>
                                    <div className="text-2xl font-bold text-green-700">{socketStats.wsClients}</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg col-span-2">
                                    <div className="text-purple-500 text-sm font-medium">Active Rooms</div>
                                    <div className="text-sm font-mono text-purple-700 break-all mt-1">
                                        {socketStats.rooms.slice(0, 10).join(', ')}
                                        {socketStats.rooms.length > 10 && ` ...and ${socketStats.rooms.length - 10} more`}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">Loading stats...</p>
                        )}
                    </div>
                </div>
            )}

            {/* Tab: Config */}
            {activeTab === 'config' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold mb-4">Runtime Configuration</h2>
                    {config ? (
                        <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono overflow-auto">
                            {JSON.stringify(config, null, 2)}
                        </pre>
                    ) : (
                        <p className="text-gray-500">Loading config...</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default DeveloperDashboardPage;

