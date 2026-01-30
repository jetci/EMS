import React from 'react';

interface BarChartProps {
    data: { label: string; value: number }[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    const yAxisSteps = 5;
    const stepValue = Math.ceil(maxValue / yAxisSteps / 10) * 10;
    const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => i * stepValue);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-grow flex items-end space-x-2 px-4">
                {data.map((item, index) => {
                    const barHeight = maxValue > 0 ? (item.value / (stepValue * yAxisSteps)) * 100 : 0;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center group">
                            <div
                                className="w-full bg-blue-400 hover:bg-blue-600 transition-colors rounded-t-md"
                                style={{ height: `${barHeight}%` }}
                                title={`${item.label}: ${item.value}`}
                            ></div>
                            <span className="text-xs text-gray-500 mt-1">{item.label}</span>
                        </div>
                    );
                })}
            </div>
            <div className="border-t border-gray-200 mt-2"></div>
        </div>
    );
};

export default BarChart;
