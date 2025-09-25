import React, { useState, useEffect, useMemo } from 'react';

interface ThaiTimePickerProps {
    name: string;
    value: string; // HH:mm
    onChange: (event: { target: { name: string; value: string } }) => void;
    required?: boolean;
    minTime?: string | null; // HH:mm
}

const ThaiTimePicker: React.FC<ThaiTimePickerProps> = ({ name, value, onChange, required, minTime }) => {
    const [hour, setHour] = useState('');
    const [minute, setMinute] = useState('');

    useEffect(() => {
        if (value && value.match(/^\d{2}:\d{2}$/)) {
            const [h, m] = value.split(':');
            setHour(h);
            setMinute(m);
        } else {
            setHour('');
            setMinute('');
        }
    }, [value]);

    const triggerChange = (h: string, m: string) => {
        if (h && m) {
            onChange({ target: { name, value: `${h}:${m}` } });
        } else {
            onChange({ target: { name, value: '' } });
        }
    };

    const { minHour, minMinute } = useMemo(() => {
        if (!minTime) return { minHour: -1, minMinute: -1 };
        const [h, m] = minTime.split(':').map(Number);
        return { minHour: h, minMinute: m };
    }, [minTime]);

    const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newHour = e.target.value;
        setHour(newHour);

        // If the new hour is the minimum hour and the current minute is in the past, reset minute
        if (minTime && parseInt(newHour, 10) === minHour && parseInt(minute, 10) < minMinute) {
            setMinute('');
            triggerChange(newHour, '');
        } else {
            triggerChange(newHour, minute);
        }
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMinute = e.target.value;
        setMinute(newMinute);
        triggerChange(hour, newMinute);
    };
    
    const hourOptions = useMemo(() => 
        Array.from({ length: 24 }, (_, i) => ({
            value: i.toString().padStart(2, '0'),
            disabled: i < minHour
        }))
    , [minHour]);

    const minuteOptions = useMemo(() => {
        const isMinHour = parseInt(hour, 10) === minHour;
        return Array.from({ length: 60 }, (_, i) => ({
            value: i.toString().padStart(2, '0'),
            disabled: isMinHour && i < minMinute
        }));
    }, [hour, minHour, minMinute]);

    return (
        <div className="flex items-center gap-2">
            <select value={hour} onChange={handleHourChange} required={required}>
                <option value="">-- ชั่วโมง --</option>
                {hourOptions.map(h => <option key={h.value} value={h.value} disabled={h.disabled}>{h.value}</option>)}
            </select>
            <span className="text-gray-700 font-bold">:</span>
            <select value={minute} onChange={handleMinuteChange} required={required}>
                <option value="">-- นาที --</option>
                {minuteOptions.map(m => <option key={m.value} value={m.value} disabled={m.disabled}>{m.value}</option>)}
            </select>
        </div>
    );
};

export default ThaiTimePicker;