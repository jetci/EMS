import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';

interface RideEvent {
    id: string;
    rideId: string;
    eventType: string;
    timestamp: string;
    userId: string;
    userName: string;
    userRole: string;
    description: string;
    details?: any;
}

interface RideTimelineProps {
    rideId: string;
}

const eventTypeConfig: Record<string, { color: string; bgColor: string; icon: string }> = {
    'CREATED': { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '📝' },
    'ASSIGNED': { color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '👤' },
    'EN_ROUTE': { color: 'text-orange-600', bgColor: 'bg-orange-100', icon: '🚗' },
    'ARRIVED': { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '📍' },
    'IN_PROGRESS': { color: 'text-cyan-600', bgColor: 'bg-cyan-100', icon: '🏥' },
    'COMPLETED': { color: 'text-green-600', bgColor: 'bg-green-100', icon: '✅' },
    'CANCELLED': { color: 'text-red-600', bgColor: 'bg-red-100', icon: '❌' },
    'NOTE': { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '📋' },
    'LOCATION_UPDATE': { color: 'text-indigo-600', bgColor: 'bg-indigo-100', icon: '📌' },
};

const RideTimeline: React.FC<RideTimelineProps> = ({ rideId }) => {
    const [events, setEvents] = useState<RideEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (rideId && rideId !== 'RIDE-NaN' && rideId !== 'NaN') {
            fetchEvents();
        } else {
            setLoading(false);
            setEvents([]);
        }
    }, [rideId]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiRequest(`/ride-events/${rideId}`);
            // Sort by timestamp (oldest first for timeline display)
            const sorted = Array.isArray(data) ? data.sort((a: RideEvent, b: RideEvent) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            ) : [];
            setEvents(sorted);
        } catch (err: any) {
            console.error('Failed to fetch ride events:', err);
            setError('ไม่สามารถโหลดประวัติเหตุการณ์ได้');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-500 text-sm">กำลังโหลด...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-4 text-red-500 text-sm">
                {error}
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-4 text-gray-400 text-sm">
                ยังไม่มีประวัติเหตุการณ์
            </div>
        );
    }

    return (
        <div className="space-y-0">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">📜</span>
                ไทม์ไลน์เหตุการณ์
            </h4>

            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>

                {events.map((event, index) => {
                    const config = eventTypeConfig[event.eventType] || eventTypeConfig['NOTE'];
                    const isLast = index === events.length - 1;

                    return (
                        <div key={event.id} className={`relative flex items-start ${!isLast ? 'pb-4' : ''}`}>
                            {/* Timeline dot */}
                            <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${config.bgColor} text-lg`}>
                                {config.icon}
                            </div>

                            {/* Content */}
                            <div className="ml-4 flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${config.color}`}>
                                        {event.description}
                                    </p>
                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                        {formatTime(event.timestamp)}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {event.userName} • {formatDate(event.timestamp)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RideTimeline;
