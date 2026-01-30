import React from 'react';
import { RadioCenterView } from '../types';
import SharedRadioDashboard from '../components/radio/SharedRadioDashboard';

interface RadioCenterDashboardProps {
    setActiveView: (view: RadioCenterView, context?: any) => void;
}

/**
 * Radio Center Dashboard
 * Central radio dispatch center interface for coordinating operations
 */
const RadioCenterDashboard: React.FC<RadioCenterDashboardProps> = ({ setActiveView }) => {
    return (
        <SharedRadioDashboard
            role="radio_center"
            title="ศูนย์วิทยุกลาง (Radio Center)"
            setActiveView={setActiveView}
        />
    );
};

export default RadioCenterDashboard;

