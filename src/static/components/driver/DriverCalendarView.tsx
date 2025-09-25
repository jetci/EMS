import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { Ride, RideStatus } from '../../types';
import RideList from '../RideList';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';
import { isToday } from '../../utils/dateUtils';

interface DriverCalendarViewProps {
    allRides: Ride[];
    onUpdateStatus: (rideId: string, newStatus: RideStatus) => void;
}

const thaiWeekdays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const DriverCalendarView: React.FC<DriverCalendarViewProps> = ({ allRides, onUpdateStatus }) => {
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [selectedDate, setSelectedDate] = useState(dayjs().startOf('day'));

    const firstDayOfMonth = currentDate.startOf('month');
    const lastDayOfMonth = currentDate.endOf('month');
    const startDayOfWeek = firstDayOfMonth.day();

    const jobsByDate = useMemo(() => {
        const map = new Map<string, Ride[]>();
        allRides.forEach(ride => {
            const dateStr = dayjs(ride.appointmentTime).format('YYYY-MM-DD');
            if (!map.has(dateStr)) {
                map.set(dateStr, []);
            }
            map.get(dateStr)?.push(ride);
        });
        return map;
    }, [allRides]);

    const daysInMonth = useMemo(() => {
        const days = [];
        // Add padding for days from previous month
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }
        // Add days of the current month
        for (let i = 1; i <= lastDayOfMonth.date(); i++) {
            days.push(firstDayOfMonth.date(i));
        }
        return days;
    }, [currentDate]);

    const handlePrevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
    const handleNextMonth = () => setCurrentDate(currentDate.add(1, 'month'));
    const handleDayClick = (day: dayjs.Dayjs) => setSelectedDate(day.startOf('day'));

    const selectedDayRides = jobsByDate.get(selectedDate.format('YYYY-MM-DD')) || [];
    const isSelectedDateToday = isToday(selectedDate.toDate());
    
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-bold text-gray-800">
                    {currentDate.format('MMMM BBBB')}
                </h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100">
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
                {thaiWeekdays.map(day => (
                    <div key={day} className="text-xs font-semibold text-gray-500 py-2">{day}</div>
                ))}
                {daysInMonth.map((day, index) => (
                    <div key={index} className="py-1">
                        {day ? (
                            <button
                                onClick={() => handleDayClick(day)}
                                className={`w-10 h-10 rounded-full flex flex-col items-center justify-center transition-colors relative ${
                                    selectedDate.isSame(day, 'day') ? 'bg-[#005A9C] text-white' : 
                                    isToday(day.toDate()) ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                                }`}
                            >
                                <span className="text-sm">{day.format('D')}</span>
                                {jobsByDate.has(day.format('YYYY-MM-DD')) && (
                                    <div className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${selectedDate.isSame(day, 'day') ? 'bg-white' : 'bg-[#005A9C]'}`}></div>
                                )}
                            </button>
                        ) : <div />}
                    </div>
                ))}
            </div>

             {/* Selected Day's Jobs */}
            <div className="mt-6 border-t pt-4">
                <h3 className="font-bold text-lg mb-2">
                    งานสำหรับวันที่: {selectedDate.format('D MMMM BBBB')}
                </h3>
                <RideList
                    rides={selectedDayRides}
                    onUpdateStatus={onUpdateStatus}
                    isActionable={isSelectedDateToday}
                />
            </div>
        </div>
    );
};

export default DriverCalendarView;