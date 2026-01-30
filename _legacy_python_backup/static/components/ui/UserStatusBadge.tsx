import React from 'react';
import { UserStatus } from '../../types';

interface UserStatusBadgeProps {
  status: UserStatus;
}

const statusStyles: { [key in UserStatus]: { text: string; classes: string } } = {
  'Active': { text: 'Active', classes: 'bg-green-100 text-green-800' },
  'Inactive': { text: 'Inactive', classes: 'bg-gray-200 text-gray-700' },
};

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status }) => {
  const style = statusStyles[status] || { text: 'Unknown', classes: 'bg-gray-100 text-gray-800' };
  
  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full inline-flex items-center gap-1.5 ${style.classes}`}>
       <span className={`h-1.5 w-1.5 rounded-full ${style.classes.replace(/text-\w+-\d+/,'').replace('bg','bg-opacity-50 bg')}`} style={{backgroundColor: 'currentColor'}}></span>
      {style.text}
    </span>
  );
};

export default UserStatusBadge;
