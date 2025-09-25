import React, { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { ShiftStatus } from '../../types';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';
import ShiftStatusSelector from './ShiftStatusSelector';
import { mockDrivers } from '../../data/mockData';

const shiftStatusStyles: { [key in ShiftStatus]: string } = {
    [ShiftStatus.MORNING]: 'bg-yellow-200 text-yellow-800',
    [ShiftStatus.AFTERNOON]: 'bg-blue-200 text-blue-800',
    [ShiftStatus.NIGHT]: 'bg-indigo-200 text-indigo-800',
    [ShiftStatus.DAY_OFF]: 'bg-gray-200 text-gray-700',
    [ShiftStatus.ON_LEAVE]: 'bg-red-200 text-red-800',
};

const IndividualShiftCalendar: React.FC = () => {
    const [currentWeek, setCurrentWeek] = useState(dayjs().startOf('week'));
    const [schedule, setSchedule] = useState<Record<string, ShiftStatus>>({});
    const [popoverState, setPopoverState] = useState<{ key: string; visible: boolean; x: number; y: number } | null>(null);
    const tableRef = useRef<HTMLDivElement>(null);

    const handleCellClick = (driverId: string, date: dayjs.Dayjs, event: React.MouseEvent) => {
        const key = `${driverId}-${date.format('YYYY-MM-DD')}`;
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const tableRect = tableRef.current?.getBoundingClientRect();

        setPopoverState({
            key,
            visible: true,
            x: rect.left - (tableRect?.left || 0),
            y: rect.top - (tableRect?.top || 0) + rect.height,
        });
    };

    const handleStatusSelect = (status: ShiftStatus) => {
        if (popoverState) {
            setSchedule(prev => ({ ...prev, [popoverState.key]: status }));
        }
        setPopoverState(null);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverState && !(event.target as HTMLElement).closest('.schedule-cell, .popover-content')) {
                setPopoverState(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [popoverState]);

    const weekDays = Array.from({ length: 7 }, (_, i) => currentWeek.add(i, 'day'));
    const weekStart = currentWeek.format('D MMM');
    const weekEnd = currentWeek.add(6, 'day').format('D MMM YYYY');

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative" ref={tableRef}>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentWeek(currentWeek.subtract(1, 'week'))} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon /></button>
                <h3 className="font-bold text-lg">สัปดาห์: {weekStart} - {weekEnd}</h3>
                <button onClick={() => setCurrentWeek(currentWeek.add(1, 'week'))} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon /></button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-3 text-left font-semibold text-sm text-gray-600 border">คนขับ</th>
                            {weekDays.map(day => (
                                <th key={day.format('YYYY-MM-DD')} className="p-3 text-center font-semibold text-sm text-gray-600 border">
                                    {day.format('ddd')}<br/>{day.format('D')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {mockDrivers.map(driver => (
                            <tr key={driver.id}>
                                <td className="p-3 font-medium text-gray-800 border">{driver.fullName}</td>
                                {weekDays.map(day => {
                                    const key = `${driver.id}-${day.format('YYYY-MM-DD')}`;
                                    const status = schedule[key];
                                    return (
                                        <td
                                            key={key}
                                            onClick={(e) => handleCellClick(driver.id, day, e)}
                                            className="p-1 border text-center cursor-pointer hover:bg-gray-100 transition-colors schedule-cell h-16"
                                        >
                                            {status && (
                                                <div className={`text-xs font-bold rounded p-1 ${shiftStatusStyles[status]}`}>
                                                    {status}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {popoverState?.visible && (
                <ShiftStatusSelector
                    onSelect={handleStatusSelect}
                    onClose={() => setPopoverState(null)}
                    position={{ x: popoverState.x, y: popoverState.y }}
                />
            )}
        </div>
    );
};

export default IndividualShiftCalendar;