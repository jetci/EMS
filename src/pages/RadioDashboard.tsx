import React from 'react';
import { RadioView } from '../types';
import SharedRadioDashboard from '../components/radio/SharedRadioDashboard';

interface RadioDashboardProps {
    setActiveView: (view: RadioView, context?: any) => void;
}

/**
 * Radio Dashboard
 * Field radio operator interface for dispatch operations
 */
const RadioDashboard: React.FC<RadioDashboardProps> = ({ setActiveView }) => {
    return (
        <SharedRadioDashboard
            role="radio"
            title="ศูนย์วิทยุ (Radio)"
            setActiveView={setActiveView}
        />
    );
};

export default RadioDashboard;

