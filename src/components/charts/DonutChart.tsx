import React from 'react';

interface DonutChartProps {
    data: { label: string; value: number | string; color?: string }[];
}

const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
    const defaultColors = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const normalized = data.map((item, index) => {
        const numericValue = typeof item.value === 'number' ? item.value : Number(item.value) || 0;
        const color = item.color || defaultColors[index % defaultColors.length];
        return { ...item, value: numericValue, color };
    });

    const total = normalized.reduce((sum, item) => sum + item.value, 0);
    const radius = 70;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = -90; // Start from top

    if (total === 0 || normalized.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <div className="relative group">
                    <svg width="200" height="200" viewBox="0 0 200 200" className="transform transition-transform duration-700 group-hover:rotate-12">
                        <circle
                            cx="100" cy="100" r={radius}
                            fill="transparent"
                            stroke="#F1F5F9"
                            strokeWidth={strokeWidth}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-200">0</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">ไม่มีข้อมูล</span>
                    </div>
                </div>
            </div>
        );
    }

    const segments = normalized.map(item => {
        const percentage = (item.value / total) * 100;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;
        const rotate = `rotate(${accumulatedAngle} 100 100)`;
        const currentAngle = accumulatedAngle;
        accumulatedAngle += (percentage / 100) * 360;

        return {
            ...item,
            percentage: percentage.toFixed(1),
            strokeDashoffset,
            rotate,
            currentAngle
        };
    });

    return (
        <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="relative group">
                <svg width="220" height="220" viewBox="0 0 200 200" className="transform transition-all duration-1000 group-hover:scale-105">
                    {/* Background track with subtle glow */}
                    <circle
                        cx="100" cy="100" r={radius}
                        fill="transparent"
                        stroke="#F8FAFC"
                        strokeWidth={strokeWidth + 2}
                    />
                    <circle
                        cx="100" cy="100" r={radius}
                        fill="transparent"
                        stroke="#F1F5F9"
                        strokeWidth={strokeWidth}
                    />

                    {segments.map((segment, index) => (
                        <circle
                            key={index}
                            cx="100" cy="100" r={radius}
                            fill="transparent"
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={segment.strokeDashoffset}
                            transform={segment.rotate}
                            strokeLinecap={normalized.length === 1 ? 'butt' : 'round'}
                            className="transition-all duration-1000 ease-out"
                            style={{
                                filter: `drop-shadow(0 0 4px ${segment.color}33)`,
                                opacity: 0.9
                            }}
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{total}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 shadow-sm">ผู้ป่วย</span>
                </div>
            </div>

            <div className="flex flex-col gap-4 min-w-[180px]">
                {normalized.map((item, index) => (
                    <div key={index} className="flex items-center group/item cursor-pointer">
                        <div
                            className="w-10 h-1 rounded-full mr-4 transition-all duration-300 group-hover/item:w-14"
                            style={{ backgroundColor: item.color }}
                        ></div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-800">{item.value}</span>
                                <span className="text-xs font-bold text-slate-400">({((item.value / total) * 100).toFixed(0)}%)</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonutChart;
