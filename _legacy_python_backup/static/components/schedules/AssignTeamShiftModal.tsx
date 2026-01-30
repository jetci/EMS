import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { TeamShiftStatus, TeamScheduleEntry, Vehicle, VehicleStatus } from '../../types';
import XIcon from '../icons/XIcon';

interface AssignTeamShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (teamId: string, date: dayjs.Dayjs, entry: TeamScheduleEntry | null) => void;
    team: { id: string; name: string; };
    date: dayjs.Dayjs;
    allVehicles: Vehicle[];
    currentSchedule: Record<string, TeamScheduleEntry>;
}

const AssignTeamShiftModal: React.FC<AssignTeamShiftModalProps> = ({ isOpen, onClose, onSave, team, date, allVehicles, currentSchedule }) => {
    const [status, setStatus] = useState<TeamShiftStatus | ''>('');
    const [vehicleId, setVehicleId] = useState<string>('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const key = `${team.id}-${date.format('YYYY-MM-DD')}`;
            const existingEntry = currentSchedule[key];
            if (existingEntry) {
                setStatus(existingEntry.status);
                setVehicleId(existingEntry.vehicleId || '');
            } else {
                setStatus('');
                setVehicleId('');
            }
            setError('');
        }
    }, [isOpen, team, date, currentSchedule]);

    const availableVehicles = useMemo(() => {
        const dateStr = date.format('YYYY-MM-DD');
        const usedVehicleIds = new Set(
            Object.keys(currentSchedule)
                .filter(key => key.endsWith(dateStr) && !key.startsWith(team.id))
                .map(key => currentSchedule[key].vehicleId)
                .filter(id => !!id)
        );
        return allVehicles.filter(v => v.status !== VehicleStatus.MAINTENANCE && !usedVehicleIds.has(v.id));
    }, [date, currentSchedule, allVehicles, team.id]);

    const handleConfirm = () => {
        setError('');
        if (status === TeamShiftStatus.ON_DUTY && !vehicleId) {
            setError('กรุณาเลือกยานพาหนะสำหรับทีมที่เข้าเวร');
            return;
        }

        if (!status) {
            onSave(team.id, date, null); // Deleting the entry
        } else {
            const entry: TeamScheduleEntry = {
                status,
                vehicleId: status === TeamShiftStatus.ON_DUTY ? vehicleId : undefined,
            };
            onSave(team.id, date, entry);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">กำหนดเวร</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <p><span className="font-semibold">ทีม:</span> {team.name}</p>
                        <p><span className="font-semibold">วันที่:</span> {date.format('D MMMM BBBB')}</p>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">สถานะ</label>
                        <select id="status" value={status} onChange={(e) => setStatus(e.target.value as TeamShiftStatus | '')} className="mt-1 w-full">
                            <option value="">-- ไม่กำหนด --</option>
                            <option value={TeamShiftStatus.ON_DUTY}>เข้าเวร (24 ชม.)</option>
                            <option value={TeamShiftStatus.REST_DAY}>วันพัก</option>
                        </select>
                    </div>
                    {status === TeamShiftStatus.ON_DUTY && (
                        <div className="animate-fade-in-up">
                            <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">ยานพาหนะ</label>
                            <select id="vehicleId" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="mt-1 w-full" required>
                                <option value="" disabled>-- เลือกรถที่ว่าง --</option>
                                {availableVehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.licensePlate} ({v.model})</option>
                                ))}
                            </select>
                            {availableVehicles.length === 0 && <p className="text-xs text-red-600 mt-1">ไม่มีรถว่างในวันนี้</p>}
                        </div>
                    )}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
                <div className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100">ยกเลิก</button>
                    <button onClick={handleConfirm} className="px-4 py-2 text-sm font-medium text-white bg-[#005A9C] rounded-md hover:bg-blue-800">ยืนยัน</button>
                </div>
            </div>
        </div>
    );
};

export default AssignTeamShiftModal;