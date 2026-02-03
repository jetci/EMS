import React, { useState, useEffect, useRef } from 'react';

interface ModernDatePickerProps {
    name: string;
    value: string; // YYYY-MM-DD
    onChange: (event: { target: { name: string; value: string } }) => void;
    max?: string; // YYYY-MM-DD
    min?: string; // YYYY-MM-DD
    required?: boolean;
    placeholder?: string;
}

const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const thaiMonthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const thaiDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const ModernDatePicker: React.FC<ModernDatePickerProps> = ({
    name,
    value,
    onChange,
    max,
    min,
    required,
    placeholder = 'เลือกวันที่'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [displayValue, setDisplayValue] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [position, setPosition] = useState<'bottom' | 'top'>('bottom');

    // Parse value to Date
    useEffect(() => {
        if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const date = new Date(value);
            setSelectedDate(date);
            setCurrentMonth(date.getMonth());
            setCurrentYear(date.getFullYear());

            // Format display value
            const day = date.getDate();
            const month = thaiMonthsShort[date.getMonth()];
            const year = date.getFullYear() + 543;
            setDisplayValue(`${day} ${month} ${year}`);
        } else {
            setDisplayValue('');
            setSelectedDate(null);
        }
    }, [value]);

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleToggle = () => {
        if (!isOpen) {
            // Check available space
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;

                // If space below is less than 400px and space above is larger, open upwards
                if (spaceBelow < 400 && spaceAbove > spaceBelow) {
                    setPosition('top');
                } else {
                    setPosition('bottom');
                }
            }
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(currentYear, currentMonth, day);

        // Check if date is within min/max range
        if (max) {
            const maxDate = new Date(max);
            if (newDate > maxDate) return;
        }
        if (min) {
            const minDate = new Date(min);
            minDate.setHours(0, 0, 0, 0);
            const checkDate = new Date(newDate);
            checkDate.setHours(0, 0, 0, 0);
            if (checkDate < minDate) return;
        }

        const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange({ target: { name, value: dateString } });
        setIsOpen(false);
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentYear(parseInt(e.target.value) - 543);
    };

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const isDateDisabled = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);

        if (max) {
            const maxDate = new Date(max);
            if (date > maxDate) return true;
        }
        if (min) {
            const minDate = new Date(min);
            minDate.setHours(0, 0, 0, 0);
            const checkDate = new Date(date);
            checkDate.setHours(0, 0, 0, 0);
            if (checkDate < minDate) return true;
        }

        return false;
    };

    const isDateSelected = (day: number) => {
        if (!selectedDate) return false;
        return (
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth &&
            selectedDate.getFullYear() === currentYear
        );
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() === currentMonth &&
            today.getFullYear() === currentYear
        );
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const disabled = isDateDisabled(day);
            const selected = isDateSelected(day);
            const today = isToday(day);

            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => !disabled && handleDateSelect(day)}
                    disabled={disabled}
                    className={`
                        h-10 w-full rounded-lg text-sm font-medium transition-all
                        ${disabled
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-blue-50 cursor-pointer'
                        }
                        ${selected
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : ''
                        }
                        ${today && !selected
                            ? 'border-2 border-blue-400'
                            : ''
                        }
                    `}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    // Generate year options (Dynamic range based on current selection and constraints)
    const now = new Date();
    const currentYearNow = now.getFullYear();
    const currentYearBE = currentYear + 543;

    const maxYearBE = max ? new Date(max).getFullYear() + 543 : Math.max(currentYear, currentYearNow + 20) + 543;
    const minYearBE = min ? new Date(min).getFullYear() + 543 : Math.min(currentYear, currentYearNow - 100) + 543;

    const yearOptions = [];
    for (let y = maxYearBE; y >= minYearBE; y--) {
        yearOptions.push(y);
    }

    return (
        <div ref={containerRef} className="relative">
            {/* Input Field */}
            <div
                onClick={handleToggle}
                className={`
                    mt-1 w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3.5 
                    text-gray-800 text-sm cursor-pointer hover:border-blue-400 
                    transition-colors flex items-center justify-between
                    ${isOpen ? 'border-blue-500 ring-2 ring-blue-200' : ''}
                `}
            >
                <span className={displayValue ? 'text-gray-800' : 'text-gray-400'}>
                    {displayValue || placeholder}
                </span>
                <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Calendar Dropdown */}
            {isOpen && (
                <div className={`absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 animate-scale-in left-0 ${position === 'top' ? 'bottom-full mb-2 origin-bottom-left' : 'top-full mt-2 origin-top-left'}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-base font-semibold text-gray-800">
                                {thaiMonths[currentMonth]}
                            </span>
                            <select
                                value={currentYearBE}
                                onChange={handleYearChange}
                                className="text-base font-semibold text-gray-800 bg-transparent border-none cursor-pointer hover:text-blue-600"
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {thaiDays.map(day => (
                            <div key={day} className="h-8 flex items-center justify-center text-xs font-semibold text-gray-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {renderCalendar()}
                    </div>

                    {/* Today Button */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                setCurrentMonth(today.getMonth());
                                setCurrentYear(today.getFullYear());
                                handleDateSelect(today.getDate());
                            }}
                            className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            วันนี้
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModernDatePicker;
