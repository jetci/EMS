/**
 * Office Patient Wrapper
 * Wrapper สำหรับ Officer/Radio Center
 * ใช้ UnifiedPatientManagementPage โดยไม่ต้องแก้ไขหน้าเดิม
 */

import React from 'react';
import UnifiedPatientManagementPage from '../unified/UnifiedPatientManagementPage';

const OfficePatientWrapper: React.FC = () => {
    return <UnifiedPatientManagementPage />;
};

export default OfficePatientWrapper;
