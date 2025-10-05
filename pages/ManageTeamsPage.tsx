import React, { useState, useMemo, useEffect } from 'react';
import { Team, User, Driver } from '../types';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import TeamCard from '../components/teams/TeamCard';
import EditTeamModal from '../components/modals/EditTeamModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Toast from '../components/Toast';
import { driversAPI, apiRequest } from '../src/services/api';
import { teamsAPI } from '../src/services/api';
import SearchIcon from '../components/icons/SearchIcon';

const ManageTeamsPage: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [staff, setStaff] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [teamsData, driversData, usersData] = await Promise.all([
                teamsAPI.getTeams(),
                driversAPI.getDrivers(),
                apiRequest('/users'),
            ]);
            setTeams(Array.isArray(teamsData) ? teamsData : (teamsData?.teams || []));
            setDrivers(Array.isArray(driversData) ? driversData : (driversData?.drivers || []));
            setStaff(Array.isArray(usersData) ? usersData : (usersData?.users || []));
        } catch (err: any) {
            console.error('Failed to load data:', err);
            setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    const userInfoMap = useMemo(() => {
        const map = new Map<string, { name: string; profileImageUrl?: string }>();
        const allUsers: (Driver | User)[] = [...drivers, ...staff];
        allUsers.forEach(user => {
            const name = 'fullName' in user ? user.fullName : user.name;
            map.set(user.id!, { name, profileImageUrl: user.profileImageUrl });
        });
        return map;
    }, [drivers, staff]);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleOpenCreateModal = () => {
        setSelectedTeam(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (team: Team) => {
        setSelectedTeam(team);
        setIsModalOpen(true);
    };
    
    const handleSaveTeam = async (teamData: Team) => {
        try {
            if (selectedTeam) {
                await teamsAPI.updateTeam(teamData.id, teamData);
                showToast(`✅ แก้ไขข้อมูลทีม "${teamData.name}" สำเร็จ`);
            } else {
                await teamsAPI.createTeam(teamData);
                showToast(`✅ สร้างทีม "${teamData.name}" สำเร็จ`);
            }
            await loadAllData();
            setIsModalOpen(false);
        } catch (err: any) {
            console.error('Failed to save team:', err);
            showToast('❌ ไม่สามารถบันทึกข้อมูลทีมได้');
        }
        setIsModalOpen(false);
    };

    const handleOpenDeleteConfirm = (team: Team) => {
        setTeamToDelete(team);
        setIsConfirmOpen(true);
    };

    const handleDeleteTeam = () => {
        if (teamToDelete) {
            setTeams(prev => prev.filter(t => t.id !== teamToDelete.id));
            showToast(`🗑️ ลบทีม "${teamToDelete.name}" เรียบร้อยแล้ว`);
        }
        setIsConfirmOpen(false);
        setTeamToDelete(null);
    };

    const filteredTeams = useMemo(() => {
        if (!searchTerm) return teams;
        return teams.filter(team => team.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [teams, searchTerm]);

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">จัดการชุดเวร (Team Management)</h1>
                <button 
                    onClick={handleOpenCreateModal}
                    className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-[#005A9C] rounded-lg shadow-sm hover:bg-blue-800 transition-colors"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    <span>สร้างทีมใหม่</span>
                </button>
            </div>

            {/* Toolbar */}
            <div className="mb-6">
                <div className="relative w-full md:w-1/3">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="w-5 h-5 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="ค้นหาด้วยชื่อทีม..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2"
                    />
                </div>
            </div>

            {/* Team List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map(team => {
                    const driverInfo = userInfoMap.get(team.driverId) || { name: 'N/A', profileImageUrl: '' };
                    const staffNames = team.staffIds.map(id => userInfoMap.get(id)?.name || 'N/A');

                    return (
                        <TeamCard 
                            key={team.id}
                            team={team}
                            driverName={driverInfo.name}
                            driverProfileImageUrl={driverInfo.profileImageUrl}
                            staffNames={staffNames}
                            onEdit={() => handleOpenEditModal(team)}
                            onDelete={() => handleOpenDeleteConfirm(team)}
                        />
                    );
                })}
            </div>

            {filteredTeams.length === 0 && (
                <div className="text-center py-10 px-4 col-span-full">
                    <h3 className="text-xl font-bold text-[#005A9C]">
                        {searchTerm ? 'ไม่พบทีมที่ตรงกับคำค้นหา' : 'ยังไม่มีทีมที่สร้างไว้'}
                    </h3>
                    <p className="text-gray-500 mt-2">
                         {searchTerm ? 'ลองใช้คำค้นหาอื่น' : 'คลิก "สร้างทีมใหม่" เพื่อเริ่มต้น'}
                    </p>
                </div>
            )}
            
            {/* Modals */}
            <EditTeamModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTeam}
                team={selectedTeam}
                availableDrivers={drivers}
                availableStaff={staff}
            />
            
            <ConfirmationModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDeleteTeam}
                title={`ยืนยันการลบทีม "${teamToDelete?.name}"`}
                message="คุณแน่ใจหรือไม่ว่าต้องการลบทีมนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
            />
            
            <Toast message={toastMessage} />
        </div>
    );
};

export default ManageTeamsPage;