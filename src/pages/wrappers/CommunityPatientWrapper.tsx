/**
 * Community Patient Wrapper
 * Wrapper สำหรับ Community User
 * ใช้ UnifiedPatientManagementPage โดยไม่ต้องแก้ไขหน้าเดิม
 */

import React from 'react';
import UnifiedPatientManagementPage from '../unified/UnifiedPatientManagementPage';

const CommunityPatientWrapper: React.FC = () => {
    return <UnifiedPatientManagementPage />;
};

export default CommunityPatientWrapper;
