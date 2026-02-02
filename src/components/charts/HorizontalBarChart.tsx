import React from 'react';

interface HorizontalBarChartProps {
    data: { label: string; value: number }[];
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ไม่มีข้อมูลการจำแนกประเภท</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {data.map((item, index) => {
                const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;

                return (
                    <div key={index} className="group cursor-default">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate max-w-[200px]">
                                {item.label}
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm font-black text-slate-800">{item.value.toLocaleString()}</span>
                                <span className="text-xs font-bold text-slate-400">({percentage}%)</span>
                            </div>
                        </div>
                        <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-emerald-500/20 group-hover:shadow-emerald-500/40"
                                style={{ width: `${barWidth}%` }}
                            ></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default HorizontalBarChart;
