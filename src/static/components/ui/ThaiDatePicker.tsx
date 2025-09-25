

import React, { useState, useEffect, useMemo } from 'react';

interface ThaiDatePickerProps {
    name: string;
    value: string; // YYYY-MM-DD
    onChange: (event: { target: { name: string; value: string } }) => void;
    max?: string; // YYYY-MM-DD
    min?: string; // YYYY-MM-DD
    required?: boolean;
}

const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const ThaiDatePicker: React.FC<ThaiDatePickerProps> = ({ name, value, onChange, max, min, required }) => {
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    useEffect(() => {
        if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [y, m, d] = value.split('-');
            setYear((parseInt(y, 10) + 543).toString());
            setMonth((parseInt(m, 10) - 1).toString());
            setDay(parseInt(d, 10).toString());
        } else {
            setDay('');
            setMonth('');
            setYear('');
        }
    }, [value]);

    const triggerChange = (d: string, m: string, y: string) => {
        if (d && m && y) {
            const gregorianYear = parseInt(y, 10) - 543;
            const monthIndex = parseInt(m, 10) + 1;
            const dayValue = parseInt(d, 10);
            const newDateString = `${gregorianYear.toString().padStart(4, '0')}-${monthIndex.toString().padStart(2, '0')}-${dayValue.toString().padStart(2, '0')}`;
            onChange({ target: { name, value: newDateString } });
        } else {
            onChange({ target: { name, value: '' } });
        }
    };
    
    const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDay = e.target.value;
        setDay(newDay);
        triggerChange(newDay, month, year);
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = e.target.value;
        setMonth(newMonth);
        // Reset day if it becomes invalid for the new month
        const newNumDays = daysInMonth(newMonth, year);
        const currentDay = parseInt(day, 10);
        if (currentDay > newNumDays) {
            setDay('');
            triggerChange('', newMonth, year);
        } else {
            triggerChange(day, newMonth, year);
        }
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = e.target.value;
        setYear(newYear);
        triggerChange(day, month, newYear);
    };
    
    const { maxDay, maxMonth, maxYear } = useMemo(() => {
        if (!max) return { maxDay: 31, maxMonth: 11, maxYear: new Date().getFullYear() + 543 };
        const [y, m, d] = max.split('-').map(Number);
        return { maxDay: d, maxMonth: m - 1, maxYear: y + 543 };
    }, [max]);

    const { minDay, minMonth, minYear } = useMemo(() => {
        if (!min) return { minDay: 1, minMonth: 0, minYear: new Date().getFullYear() + 543 - 100 };
        const [y, m, d] = min.split('-').map(Number);
        return { minDay: d, minMonth: m - 1, minYear: y + 543 };
    }, [min]);


    const yearOptions = useMemo(() => {
        const years = [];
        // Change loop to generate years in descending order (present to past)
        for (let y = maxYear; y >= minYear; y--) {
            years.push(y);
        }
        return years;
    }, [minYear, maxYear]);

    const monthOptions = useMemo(() => {
        const isMaxYear = parseInt(year, 10) === maxYear;
        const isMinYear = parseInt(year, 10) === minYear;
        return thaiMonths.map((m, i) => ({
            value: i,
            label: m,
            disabled: (isMaxYear && i > maxMonth) || (isMinYear && i < minMonth),
        }));
    }, [year, maxYear, maxMonth, minYear, minMonth]);
    
    const daysInMonth = (m: string, y: string): number => {
        if (m === '' || y === '') return 31;
        const gregorianYear = parseInt(y, 10) - 543;
        const monthIndex = parseInt(m, 10);
        return new Date(gregorianYear, monthIndex + 1, 0).getDate();
    };
    
    const dayOptions = useMemo(() => {
        const numDays = daysInMonth(month, year);
        const isMaxMonthAndYear = parseInt(year, 10) === maxYear && parseInt(month, 10) === maxMonth;
        const isMinMonthAndYear = parseInt(year, 10) === minYear && parseInt(month, 10) === minMonth;
        return Array.from({ length: numDays }, (_, i) => {
            const dayNum = i + 1;
            return {
                value: dayNum,
                disabled: (isMaxMonthAndYear && dayNum > maxDay) || (isMinMonthAndYear && dayNum < minDay),
            };
        });
    }, [month, year, maxYear, maxMonth, maxDay, minYear, minMonth, minDay]);
    
    // Effect to clear selections if they become invalid
    useEffect(() => {
        const selectedYear = parseInt(year, 10);
        const selectedMonth = parseInt(month, 10);
        const selectedDay = parseInt(day, 10);
        
        let shouldTriggerChange = false;
        let newDay = day;
        let newMonth = month;

        if (selectedYear < minYear || (selectedYear === minYear && selectedMonth < minMonth)) {
            newMonth = '';
            newDay = '';
            shouldTriggerChange = true;
        } else if (selectedYear === minYear && selectedMonth === minMonth && selectedDay < minDay) {
            newDay = '';
            shouldTriggerChange = true;
        }

        setMonth(newMonth);
        setDay(newDay);
        if (shouldTriggerChange) {
            triggerChange(newDay, newMonth, year);
        }

    }, [year, month, day, minYear, minMonth, minDay]);


    return (
        <div className="flex gap-2">
            <select value={day} onChange={handleDayChange} required={required}>
                <option value="">วัน</option>
                {dayOptions.map(d => <option key={d.value} value={d.value} disabled={d.disabled}>{d.value}</option>)}
            </select>
            <select value={month} onChange={handleMonthChange} required={required}>
                <option value="">เดือน</option>
                {monthOptions.map(m => <option key={m.value} value={m.value} disabled={m.disabled}>{m.label}</option>)}
            </select>
            <select value={year} onChange={handleYearChange} required={required}>
                <option value="">ปี (พ.ศ.)</option>
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
    );
};

export default ThaiDatePicker;