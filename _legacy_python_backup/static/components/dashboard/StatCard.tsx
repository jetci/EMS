import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    variant?: 'default' | 'warning' | 'info' | 'success';
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, variant = 'default', onClick }) => {
    
    const variants = {
        default: { value: 'text-gray-800', iconBg: 'bg-gray-100', iconText: 'text-gray-600' },
        info: { value: 'text-[var(--wecare-blue)]', iconBg: 'bg-[var(--wecare-blue-light)]', iconText: 'text-[var(--wecare-blue)]' },
        warning: { value: 'text-red-600', iconBg: 'bg-red-100', iconText: 'text-red-600' },
        success: { value: 'text-green-600', iconBg: 'bg-green-100', iconText: 'text-green-600' },
    };

    const style = variants[variant] || variants.default;

    const content = (
        <div className="flex items-center w-full gap-5">
            <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center ${style.iconBg}`}>
                <Icon className={`w-8 h-8 ${style.iconText}`} />
            </div>
            <div className="text-left">
                <p className="text-sm text-[var(--text-secondary)] font-medium">{title}</p>
                <p className={`text-3xl font-bold ${style.value}`}>{value}</p>
            </div>
        </div>
    );
    
    if (onClick) {
        return (
            <button
                onClick={onClick}
                className="bg-[var(--bg-card)] p-6 rounded-lg shadow-sm flex items-center border border-[var(--border-color)] w-full text-left hover:border-[var(--wecare-blue)] hover:shadow-md transition-all duration-300"
            >
                {content}
            </button>
        );
    }
    
    return (
        <div className="bg-[var(--bg-card)] p-6 rounded-lg shadow-sm flex items-center border border-[var(--border-color)]">
            {content}
        </div>
    );
};

export default StatCard;