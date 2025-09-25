import React from 'react';

interface DonutChartProps {
    data: { label: string; value: number; color: string }[];
}

const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    const segments = data.map(item => {
        const percentage = (item.value / total) * 100;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;
        const rotate = `rotate(${accumulatedAngle} 100 100)`;
        accumulatedAngle += (percentage / 100) * 360;

        return {
            ...item,
            percentage: percentage.toFixed(1),
            strokeDashoffset,
            rotate,
        };
    });

    return (
        <div className="w-full h-full flex items-center justify-center gap-8">
            <div className="relative">
                <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle
                        cx="100" cy="100" r={radius}
                        fill="transparent"
                        stroke="#e5e7eb"
                        strokeWidth="20"
                    />
                    {segments.map((segment, index) => (
                        <circle
                            key={index}
                            cx="100" cy="100" r={radius}
                            fill="transparent"
                            stroke={segment.color}
                            strokeWidth="20"
                            strokeDasharray={circumference}
                            strokeDashoffset={segment.strokeDashoffset}
                            transform={segment.rotate}
                            strokeLinecap="butt"
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">{total}</span>
                    <span className="text-sm text-gray-500">ผู้ป่วย</span>
                </div>
            </div>
            <div className="space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                        <span className="text-sm text-gray-600">{item.label} ({item.value})</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonutChart;
