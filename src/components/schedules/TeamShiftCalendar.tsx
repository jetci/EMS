import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { TeamShiftStatus, Team, TeamScheduleEntry } from '../../types';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';
import AssignTeamShiftModal from './AssignTeamShiftModal';
import { schedulesAPI } from '../../services/api';

// Configure dayjs
dayjs.extend(buddhistEra);
dayjs.locale('th');

interface TeamShiftCalendarProps {
    teams: Team[];
    vehicles: any[];
}

const teamShiftStatusStyles: { [key in TeamShiftStatus]: string } = {
    [TeamShiftStatus.ON_DUTY]: 'bg-green-200 text-green-800',
    [TeamShiftStatus.REST_DAY]: 'bg-gray-200 text-gray-700',
};

const teamShiftStatusLabels: { [key in TeamShiftStatus]: string } = {
    [TeamShiftStatus.ON_DUTY]: 'เข้าเวร',
    [TeamShiftStatus.REST_DAY]: 'พักผ่อน',
};

const TeamShiftCalendar: React.FC<TeamShiftCalendarProps> = ({ teams, vehicles }) => {
    const [currentMonth, setCurrentMonth] = useState(dayjs());
    const [schedule, setSchedule] = useState<Record<string, TeamScheduleEntry>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState<{ team: { id: string; name: string; }, date: dayjs.Dayjs; } | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch schedules when month changes
    React.useEffect(() => {
        const fetchSchedules = async () => {
            try {
                setLoading(true);
                const monthStr = currentMonth.format('YYYY-MM');
                const data = await schedulesAPI.getSchedules(monthStr);

                // Transform list to map for easier lookup
                const scheduleMap: Record<string, TeamScheduleEntry> = {};
                if (Array.isArray(data)) {
                    data.forEach((entry: any) => {
                        const key = `${entry.teamId}-${dayjs(entry.date).format('YYYY-MM-DD')}`;
                        scheduleMap[key] = {
                            id: entry.id,
                            teamId: entry.teamId,
                            vehicleId: entry.vehicleId,
                            date: entry.date,
                            shiftType: entry.shiftType,
                            status: entry.status as TeamShiftStatus
                        };
                    });
                }
                setSchedule(scheduleMap);
            } catch (error) {
                console.error('Failed to fetch schedules:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, [currentMonth]);

    const vehicleMap = useMemo(() => {
        return new Map(vehicles.map(v => [v.id, v]));
    }, [vehicles]);

    const handleCellClick = (team: { id: string, name: string }, date: dayjs.Dayjs) => {
        setSelectedCell({ team, date });
        setIsModalOpen(true);
    };

    const handleSaveShift = async (teamId: string, date: dayjs.Dayjs, entry: TeamScheduleEntry | null) => {
        const dateStr = date.format('YYYY-MM-DD');
        const key = `${teamId}-${dateStr}`;

        try {
            if (entry && entry.status) {
                // Save/Update
                await schedulesAPI.saveSchedule({
                    teamId,
                    date: dateStr,
                    status: entry.status,
                    vehicleId: entry.vehicleId,
                    shiftType: entry.shiftType
                });

                // Update local state smoothly
                setSchedule(prev => ({
                    ...prev,
                    [key]: {
                        ...entry,
                        teamId,
                        date: dateStr
                    }
                }));
            } else {
                // Delete/Clear
                await schedulesAPI.deleteSchedule(teamId, dateStr);

                setSchedule(prev => {
                    const newSchedule = { ...prev };
                    delete newSchedule[key];
                    return newSchedule;
                });
            }
        } catch (error) {
            console.error('Failed to save schedule:', error);
            alert('บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        }

        setIsModalOpen(false);
    };

    const firstDay = currentMonth.startOf('month');
    const daysInMonth = currentMonth.daysInMonth();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => firstDay.date(i + 1));

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon /></button>
                <h3 className="font-bold text-lg">{currentMonth.format('MMMM BBBB')}</h3>
                <button onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon /></button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-2 text-left font-semibold text-sm text-gray-600 border">ทีม</th>
                            {daysArray.map(day => (
                                <th key={day.format('YYYY-MM-DD')} className="p-2 text-center font-semibold text-sm text-gray-600 border w-20">
                                    <div className="text-xs">{day.locale('th').format('ddd')}</div>
                                    <div>{day.format('D')}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map(team => (
                            <tr key={team.id}>
                                <td className="p-2 font-medium text-gray-800 border">{team.name}</td>
                                {daysArray.map(day => {
                                    const key = `${team.id}-${day.format('YYYY-MM-DD')}`;
                                    const entry = schedule[key];
                                    const vehicle = entry?.vehicleId ? vehicleMap.get(entry.vehicleId) : null;
                                    return (
                                        <td
                                            key={key}
                                            onClick={() => handleCellClick(team, day)}
                                            className="p-1 border text-center cursor-pointer hover:bg-gray-100 transition-colors h-16 align-top"
                                        >
                                            {entry && (
                                                <div className={`text-xs font-bold rounded p-1 text-left ${teamShiftStatusStyles[entry.status]}`}>
                                                    <p>{teamShiftStatusLabels[entry.status] || entry.status}</p>
                                                    {vehicle && <p className="font-mono text-[10px] truncate">{vehicle.licensePlate}</p>}
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
            {isModalOpen && selectedCell && (
                <AssignTeamShiftModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveShift}
                    team={selectedCell.team}
                    date={selectedCell.date}
                    allVehicles={vehicles}
                    currentSchedule={schedule}
                />
            )}
        </div>
    );
};

export default TeamShiftCalendar;
