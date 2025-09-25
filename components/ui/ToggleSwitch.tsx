import React from 'react';

interface ToggleSwitchProps {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ name, checked, onChange }) => {
  return (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005A9C] ${
        checked ? 'bg-[#28A745]' : 'bg-gray-300'
        }`}
    >
        <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
            checked ? 'translate-x-6' : 'translate-x-1'
        }`}
        />
    </button>
  );
};

export default ToggleSwitch;