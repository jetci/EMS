/**
 * Unified Radio Dashboard
 * ใช้ role เดียว (radio_center)
 * 
 * ✅ Non-destructive: ไม่ลบหน้าเดิม (RadioCenterDashboard.tsx)
 * ✅ Incremental: ทดสอบให้ทำงานได้ 100% ก่อนเปลี่ยน routing
 * ✅ Rollback-ready: สามารถกลับไปใช้หน้าเดิมได้ทันที
 */

import React from 'react';
import { RadioCenterView } from '../../../types';
import SharedRadioDashboard from '../../components/radio/SharedRadioDashboard';

interface UnifiedRadioDashboardProps {
    role: 'radio_center';
    setActiveView: (view: RadioCenterView, context?: any) => void;
}

/**
 * Unified Radio Dashboard Component
 * 
 * แทนที่:
 * - RadioCenterDashboard.tsx (role: radio_center)
 */
const UnifiedRadioDashboard: React.FC<UnifiedRadioDashboardProps> = ({ role, setActiveView }) => {
    const title = 'ศูนย์วิทยุกลาง (Radio Center)';
    
    return (
        <SharedRadioDashboard 
            role={role} 
            title={title} 
            setActiveView={setActiveView} 
        />
    );
};

export default UnifiedRadioDashboard;
