import React from 'react';
import { User } from '../../types';

interface RoleBadgeProps {
  role: User['role'];
}

const roleStyles: { [key: string]: { text: string; classes: string } } = {
  admin: { text: 'ผู้ดูแลระบบ', classes: 'bg-purple-100 text-purple-800' },
  DEVELOPER: { text: 'ผู้พัฒนาระบบ', classes: 'bg-gray-700 text-gray-100' },
  OFFICER: { text: 'เจ้าหน้าที่', classes: 'bg-blue-100 text-blue-800' },
  driver: { text: 'พนักงานขับรถ', classes: 'bg-yellow-100 text-yellow-800' },
  community: { text: 'อาสาสมัคร', classes: 'bg-green-100 text-green-800' },
  radio_center: { text: 'ศูนย์สั่งการ', classes: 'bg-red-100 text-red-800' },
  EXECUTIVE: { text: 'ผู้บริหาร', classes: 'bg-indigo-100 text-indigo-800' },
  // Legacy/Fallback support
  office: { text: 'ธุรการ', classes: 'bg-cyan-100 text-cyan-800' },
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const style = roleStyles[role] || { text: 'Unknown', classes: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${style.classes}`}>
      {style.text}
    </span>
  );
};

export default RoleBadge;
