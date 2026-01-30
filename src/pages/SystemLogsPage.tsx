import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

interface LogEntry {
    id: number;
    user_email: string;
    role: string;
    action: string;
    target_id: string;
    details: string;
    timestamp: string;
}

const SystemLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            // Don't set loading to true on refresh to avoid flickering
            const data = await apiRequest('/admin/system/logs?limit=50');
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000); // Auto refresh every 5s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">System Audit Logs</h1>
                    <p className="text-sm text-gray-500">Real-time monitoring of system activities</p>
                </div>
                <button
                    onClick={() => { setLoading(true); fetchLogs(); }}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                >
                    <span>🔄</span> Refresh
                </button>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {log.user_email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${log.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                log.role === 'DEVELOPER' ? 'bg-blue-100 text-blue-800' :
                                                    log.role === 'driver' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                            }`}>
                                            {log.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                        {log.action}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                                        {log.target_id || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={log.details}>
                                        {log.details ? (
                                            log.details.startsWith('{') ? (
                                                <code className="bg-gray-100 px-1 rounded text-xs">{log.details}</code>
                                            ) : log.details
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No logs found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {loading && <div className="p-2 text-center text-xs text-gray-400 bg-gray-50 border-t">Updating...</div>}
            </div>
        </div>
    );
};

export default SystemLogsPage;

