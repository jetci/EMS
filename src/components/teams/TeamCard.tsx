import React from 'react';
import { Team } from '../../types';
import EditIcon from '../icons/EditIcon';
import TrashIcon from '../icons/TrashIcon';
import UserIcon from '../icons/UserIcon';
import SteeringWheelIcon from '../icons/SteeringWheelIcon';
import { defaultProfileImage } from '../../assets/defaultProfile';

interface TeamCardProps {
    team: Team;
    driverName: string;
    driverProfileImageUrl?: string;
    staffNames: string[];
    onEdit: () => void;
    onDelete: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, driverName, driverProfileImageUrl, staffNames, onEdit, onDelete }) => {
    return (
        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity"></div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800 tracking-tight group-hover:text-blue-700 transition-colors">{team.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide">Active</span>
                </div>

                {/* Driver Section */}
                <div className="flex items-center gap-4 mb-6 bg-blue-50/50 p-3 rounded-lg border border-blue-50">
                    <div className="relative">
                        <img
                            src={driverProfileImageUrl || defaultProfileImage}
                            alt={driverName}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full shadow-sm" title="พนักงานขับรถ">
                            <SteeringWheelIcon className="w-3 h-3" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider mb-0.5">Driver</p>
                        <p className="font-bold text-gray-800 text-base">{driverName}</p>
                    </div>
                </div>

                {/* Staff Section */}
                <div>
                    <div className="flex items-center mb-2">
                        <UserIcon className="w-4 h-4 mr-2 text-emerald-600" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Medical Team ({staffNames.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {staffNames.length > 0 ? (
                            staffNames.map((name, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    {name}
                                </span>
                            ))
                        ) : (
                            <span className="text-sm text-gray-400 italic pl-1">- ไม่มีเจ้าหน้าที่ -</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-auto px-5 py-3 bg-gray-50/80 border-t border-gray-100 flex justify-end items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="p-2 rounded-lg text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all text-xs font-medium flex items-center gap-1">
                    <EditIcon className="w-4 h-4" />
                    <span>แก้ไข</span>
                </button>
                <button onClick={onDelete} className="p-2 rounded-lg text-gray-500 hover:bg-white hover:text-red-600 hover:shadow-sm transition-all text-xs font-medium flex items-center gap-1">
                    <TrashIcon className="w-4 h-4" />
                    <span>ลบ</span>
                </button>
            </div>
        </div>
    );
};

export default TeamCard;
