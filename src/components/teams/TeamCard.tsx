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
    canEdit?: boolean;
    canDelete?: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, driverName, driverProfileImageUrl, staffNames, onEdit, onDelete, canEdit = true, canDelete = true }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col transition-all hover:shadow-md hover:border-blue-300">
            <div className="p-4 border-b">
                <h3 className="text-lg font-bold text-gray-800">{team.name}</h3>
            </div>
            <div className="p-4 space-y-4 flex-grow text-sm">
                {/* Driver Section */}
                <div className="flex items-center gap-4">
                    <img 
                        src={driverProfileImageUrl || defaultProfileImage} 
                        alt={driverName} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                    />
                    <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5"><SteeringWheelIcon className="w-4 h-4 text-blue-600" /> คนขับ</p>
                        <p className="font-semibold text-gray-800 text-base">{driverName}</p>
                    </div>
                </div>

                 {/* Staff Section */}
                 <div className="flex items-start">
                    <div className="w-16 flex justify-center flex-shrink-0">
                        <UserIcon className="w-6 h-6 mr-3 text-green-600 mt-1" />
                    </div>
                    <div className="ml-4">
                        <p className="text-xs text-gray-500">เจ้าหน้าที่ ({staffNames.length})</p>
                        <ul className="list-disc list-inside space-y-0.5 mt-1">
                            {staffNames.map((name, index) => <li key={index} className="text-gray-700">{name}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="p-3 bg-gray-50 border-t flex justify-end items-center space-x-2">
                {canEdit && (
                    <button onClick={onEdit} className="p-2 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-700" title="แก้ไข">
                        <EditIcon className="w-5 h-5" />
                    </button>
                )}
                {canDelete && (
                    <button onClick={onDelete} className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-700" title="ลบ">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default TeamCard;
