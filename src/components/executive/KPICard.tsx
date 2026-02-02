import React from 'react';

interface KPICardProps {
    title: string;
    value: string | number;
    unit?: string;
    color: string;
    icon: React.ReactNode;
    trend?: {
        value: string;
        isUp: boolean;
    };
}

const KPICard: React.FC<KPICardProps> = ({ title, value, unit, color, icon, trend }) => {
    // Tailwind dynamic classes must be fully defined for the compiler
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-600 shadow-blue-200/50',
        emerald: 'bg-emerald-600 shadow-emerald-200/50',
        indigo: 'bg-indigo-600 shadow-indigo-200/50',
        rose: 'bg-rose-600 shadow-rose-200/50',
        orange: 'bg-orange-600 shadow-orange-200/50',
        amber: 'bg-amber-600 shadow-amber-200/50',
    };

    const colorClasses = colorMap[color] || colorMap.blue;

    return (
        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-xl border border-white hover:shadow-blue-900/5 transition-all duration-500 group flex flex-col justify-between min-h-[130px]">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl shadow-lg ${colorClasses} text-white group-hover:scale-110 transition-transform duration-500`}>
                    {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
                </div>
                {trend && (
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${trend.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend.isUp ? '↑' : '↓'} {trend.value}
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">{value}</h3>
                    {unit && <span className="text-sm font-bold text-slate-500">{unit}</span>}
                </div>
            </div>
        </div>
    );
};

export default KPICard;
