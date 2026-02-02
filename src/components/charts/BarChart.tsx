import React from 'react';

interface BarChartProps {
    data: { label: string; value: number }[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const maxValue = Math.max(...data.map(d => d.value), 0);
    const chartMax = maxValue === 0 ? 100 : Math.ceil(maxValue * 1.2 / 10) * 10;

    const yAxisSteps = 5;
    const yLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => Math.round((chartMax / yAxisSteps) * i));

    if (totalValue === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ไม่มีข้อมูลการวิ่ง</p>
                <p className="text-[9px] text-slate-300 mt-1 font-bold">ลองปรับช่วงเวลาการค้นหา</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col pt-4">
            <div className="flex-1 flex  relative">
                {/* Y-Axis Labels */}
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between items-end pr-4 w-12 border-r border-slate-100 pb-2">
                    {yLabels.reverse().map((label, i) => (
                        <span key={i} className="text-xs font-bold text-slate-400 tracking-tighter tabular-nums">
                            {label}
                        </span>
                    ))}
                </div>

                {/* Bars Area */}
                <div className="flex-1 flex items-end ml-12 pb-8 px-4 justify-around relative">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 ml-1 pb-10 flex flex-col justify-between pointer-events-none">
                        {Array.from({ length: yAxisSteps + 1 }).map((_, i) => (
                            <div key={i} className="w-full border-b border-slate-50 h-0"></div>
                        ))}
                    </div>

                    {data.map((item, index) => {
                        const barHeight = (item.value / chartMax) * 100;
                        return (
                            <div key={index} className="flex-1 flex flex-col items-center group relative h-full">
                                <div className="absolute inset-x-2 bottom-0 flex flex-col items-center">
                                    <div
                                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 transition-all duration-500 rounded-t-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:-translate-y-1 relative"
                                        style={{ height: `${Math.max(barHeight, 5)}%`, opacity: item.value === 0 ? 0.05 : 1 }}
                                    >
                                        {item.value > 0 && (
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                                                {item.value.toLocaleString()} เที่ยว
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full h-1 bg-slate-100 rounded-full mt-2 group-hover:bg-blue-100 transition-colors"></div>
                                </div>
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500 uppercase tracking-tight text-center w-full truncate">
                                    {item.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BarChart;
