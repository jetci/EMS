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
    
    const staffOptions = availableStaff.map(s => s.name);

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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'แก้ไขทีม' : 'สร้างทีมใหม่'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto">
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">ชื่อทีม</label>
                            <input type="text" name="name" id="name" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="mt-1" placeholder="เช่น ชุดเวร A" required />
                        </div>
                        <div>
                            <label htmlFor="driverId" className="block text-sm font-medium text-gray-700">คนขับ (1 คน)</label>
                            <select name="driverId" id="driverId" value={driverId} onChange={(e) => setDriverId(e.target.value)} className="mt-1" required>
                                <option value="" disabled>-- เลือกคนขับ --</option>
                                {availableDrivers.map(d => <option key={d.id} value={d.id!}>{d.fullName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="staffIds" className="block text-sm font-medium text-gray-700">เจ้าหน้าที่ (เลือกได้ 3 คน)</label>
                            <MultiSelectAutocomplete 
                                id="staffIds"
                                options={staffOptions}
                                selectedItems={selectedStaffNames}
                                setSelectedItems={handleStaffChange}
                                placeholder="เลือกเจ้าหน้าที่..."
                            />
                             {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100">ยกเลิก</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#005A9C] rounded-md hover:bg-blue-800">บันทึกทีม</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTeamModal;