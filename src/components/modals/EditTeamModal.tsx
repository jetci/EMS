import React, { useState, useEffect } from 'react';
import { Team, User, Driver } from '../../types';
import XIcon from '../icons/XIcon';
import MultiSelectAutocomplete from '../ui/MultiSelectAutocomplete';

interface EditTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (team: Team) => void;
    team: Team | null;
    availableDrivers: Driver[];
    availableStaff: User[];
}

const emptyTeam: Omit<Team, 'id'> = {
    name: '',
    driverId: '',
    staffIds: [],
};

const EditTeamModal: React.FC<EditTeamModalProps> = ({ isOpen, onClose, onSave, team, availableDrivers, availableStaff }) => {
    // Separate state for form fields
    const [teamName, setTeamName] = useState('');
    const [driverId, setDriverId] = useState('');
    // State for the MultiSelect component, which works with names (strings)
    const [selectedStaffNames, setSelectedStaffNames] = useState<string[]>([]);

    const [error, setError] = useState('');
    const isEditing = !!team;

    const staffOptions = availableStaff.map(s => s.name).filter((name): name is string => !!name);

    useEffect(() => {
        if (isOpen) {
            if (team) { // Editing existing team
                setTeamName(team.name);
                setDriverId(team.driverId);
                const initialStaffNames = team.staffIds
                    .map(id => availableStaff.find(s => s.id === id)?.name)
                    .filter((name): name is string => !!name);
                setSelectedStaffNames(initialStaffNames);
            } else { // Creating a new team
                setTeamName(emptyTeam.name);
                setDriverId(emptyTeam.driverId);
                setSelectedStaffNames([]);
            }
            setError('');
        }
    }, [team, isOpen, availableStaff]);

    if (!isOpen) return null;

    const handleStaffChange = (selectedNames: string[]) => {
        if (selectedNames.length > 3) {
            setError('สามารถเลือกเจ้าหน้าที่ได้สูงสุด 3 คน');
            return;
        }
        setError('');
        setSelectedStaffNames(selectedNames);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedStaffNames.length === 0 || selectedStaffNames.length > 3) {
            setError('กรุณาเลือกเจ้าหน้าที่ 1-3 คน');
            return;
        }

        const staffIds = selectedStaffNames.map(name => {
            return availableStaff.find(s => s.name === name)?.id || '';
        }).filter(id => id);

        const finalTeamData: Team = {
            id: isEditing ? team.id : `TEAM-${Date.now()}`,
            name: teamName,
            driverId: driverId,
            staffIds,
        };

        onSave(finalTeamData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity md:p-6" role="dialog" aria-modal="true">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all scale-100">
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{isEditing ? 'แก้ไขทีม (Edit Team)' : 'สร้างทีมใหม่ (New Team)'}</h2>
                        <p className="text-sm text-gray-500 mt-1">จัดการสมาชิกในชุดปฏิบัติการฉุกเฉิน</p>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar">
                    <div className="p-8 space-y-8">
                        {/* Team Name Section */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">ชื่อทีม / รหัสชุดปฏิบัติการ</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-lg placeholder-gray-400"
                                    placeholder="ตัวอย่าง: ทีม A (กู้ชีพ 01)"
                                    required
                                />
                                <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Driver Selection */}
                            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                                <label htmlFor="driverId" className="block text-sm font-bold text-blue-800 mb-2 flex items-center">
                                    <span className="mr-2">🚑</span> พนักงานขับรถ (Driver)
                                </label>
                                <p className="text-xs text-blue-600/70 mb-3">ผู้รับผิดชอบยานพาหนะหลัก (บังคับ 1 คน)</p>
                                <select
                                    name="driverId"
                                    id="driverId"
                                    value={driverId}
                                    onChange={(e) => setDriverId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-700 cursor-pointer hover:border-blue-300"
                                    required
                                >
                                    <option value="" disabled>-- เลือกพนักงานขับรถ --</option>
                                    {availableDrivers.map(d => (
                                        <option key={d.id} value={d.id!}>{d.fullName} {d.status === 'AVAILABLE' ? '✅' : '⏳'}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Staff Selection */}
                            <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
                                <label htmlFor="staffIds" className="block text-sm font-bold text-emerald-800 mb-2 flex items-center">
                                    <span className="mr-2">👨‍⚕️</span> เจ้าหน้าที่ผู้ปฏิบัติงาน (Medics)
                                </label>
                                <p className="text-xs text-emerald-600/70 mb-3">เวชกรหรือพยาบาลประจำรถ (1-3 คน)</p>
                                <MultiSelectAutocomplete
                                    id="staffIds"
                                    options={staffOptions}
                                    selectedItems={selectedStaffNames}
                                    setSelectedItems={handleStaffChange}
                                    placeholder="พิมพ์ชื่อค้นหา..."
                                />
                                {error && (
                                    <div className="flex items-center mt-2 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-medium border border-red-100">
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center px-8 py-5 bg-gray-50 border-t border-gray-100 space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-800 transition-all shadow-sm">
                            ยกเลิก
                        </button>
                        <button type="submit" className="px-8 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center">
                            <span className="mr-2">💾</span> บันทึกข้อมูล
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTeamModal;
