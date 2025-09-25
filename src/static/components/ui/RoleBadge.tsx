import React from 'react';
import { User } from '../../types';

interface RoleBadgeProps {
  role: User['role'];
}

const roleStyles: { [key in User['role']]: { text: string; classes: string } } = {
  admin: { text: 'Admin', classes: 'bg-purple-100 text-purple-800' },
  DEVELOPER: { text: 'Developer', classes: 'bg-gray-700 text-gray-100' },
  office: { text: 'Office', classes: 'bg-cyan-100 text-cyan-800' },
  community: { text: 'Community', classes: 'bg-green-100 text-green-800' },
  driver: { text: 'Driver', classes: 'bg-yellow-100 text-yellow-800' },
  OFFICER: { text: 'Officer', classes: 'bg-blue-100 text-blue-800' },
  EXECUTIVE: { text: 'Executive', classes: 'bg-indigo-100 text-indigo-800' },
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