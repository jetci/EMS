import React from 'react';

interface HorizontalBarChartProps {
    data: { label: string; value: number }[];
    title?: string;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);

    return (
        <div className="space-y-4">
            {title && <h3 className="text-center text-sm font-medium text-gray-500 mb-2">{title}</h3>}
            {data.map((item, index) => {
                const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                return (
                    <div key={index} className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 w-32 truncate pr-4 text-right">
                            {item.label}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6">
                            <div
                                className="bg-green-500 h-6 rounded-full flex items-center justify-end px-2"
                                style={{ width: `${barWidth}%` }}
                            >
                                <span className="text-xs font-bold text-white">{item.value}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default HorizontalBarChart;
