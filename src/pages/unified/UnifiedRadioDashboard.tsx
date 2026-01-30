/**
 * Unified Radio Dashboard
 * ใช้ RBAC เพื่อแยกสิทธิ์ตาม Role (radio และ radio_center)
 * 
 * ✅ Non-destructive: ไม่ลบหน้าเดิม (RadioDashboard.tsx, RadioCenterDashboard.tsx)
 * ✅ Incremental: ทดสอบให้ทำงานได้ 100% ก่อนเปลี่ยน routing
 * ✅ Rollback-ready: สามารถกลับไปใช้หน้าเดิมได้ทันที
 */

import React from 'react';
import { RadioView, RadioCenterView } from '../../../types';
import SharedRadioDashboard from '../../components/radio/SharedRadioDashboard';

interface UnifiedRadioDashboardProps {
    role: 'radio' | 'radio_center';
    setActiveView: (view: RadioView | RadioCenterView, context?: any) => void;
}

/**
 * Unified Radio Dashboard Component
 * 
 * แทนที่:
 * - RadioDashboard.tsx (role: radio)
 * - RadioCenterDashboard.tsx (role: radio_center)
 * 
 * ด้วยหน้าเดียวที่รองรับทั้ง 2 roles
 */
const UnifiedRadioDashboard: React.FC<UnifiedRadioDashboardProps> = ({ role, setActiveView }) => {
    // กำหนด title ตาม role
    const title = role === 'radio_center' 
        ? 'ศูนย์วิทยุกลาง (Radio Center)' 
        : 'ศูนย์วิทยุ (Radio)';
    
    return (
        <SharedRadioDashboard 
            role={role} 
            title={title} 
            setActiveView={setActiveView} 
        />
    );
};

export default UnifiedRadioDashboard;
