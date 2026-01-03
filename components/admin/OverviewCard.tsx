import React from 'react';

interface OverviewCardProps {
    title: string;
    icon: string;
    stats: {
        label: string;
        value: number | string;
    }[];
    link?: {
        label: string;
        onClick: () => void;
    };
    color?: 'blue' | 'green' | 'orange' | 'purple';
}

const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
};

const OverviewCard: React.FC<OverviewCardProps> = ({
    title,
    icon,
    stats,
    link,
    color = 'blue'
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
                {stats.map((stat, index) => (
                    <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{stat.label}</span>
                        <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Link */}
            {link && (
                <button
                    onClick={link.onClick}
                    className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                    {link.label} →
                </button>
            )}
        </div>
    );
};

export default OverviewCard;
