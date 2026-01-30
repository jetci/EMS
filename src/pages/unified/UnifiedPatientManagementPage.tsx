/**
 * Unified Patient Management Page
 * ใช้ RBAC เพื่อแยกสิทธิ์ตาม Role
 * รองรับทั้ง Community และ Officer
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { patientsAPI } from '../services/api';
import PatientListTable from '../components/patient/PatientListTable';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

interface UnifiedPatientManagementPageProps {
    // Optional: สามารถ override role ได้ (สำหรับ testing)
    overrideRole?: string;
}

const UnifiedPatientManagementPage: React.FC<UnifiedPatientManagementPageProps> = ({
    overrideRole
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const permissions = usePermissions('patient');

    // State
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [toast, setToast] = useState<{ message: string; show: boolean }>({
        message: '',
        show: false
    });

    // ✅ Role-based items per page
    const itemsPerPage = permissions.itemsPerPage || 10;

    // ✅ Load patients with role-based filtering
    const loadPatients = async () => {
        setIsLoading(true);
        try {
            // Get filter params based on role
            const filterParams = permissions.getFilterParams();

            const response = await patientsAPI.getAll(filterParams);
            setPatients(response.data || []);
        } catch (error) {
            console.error('Error loading patients:', error);
            showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ป่วย');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPatients();
    }, [user?.role]);

    // Toast helper
    const showToast = (message: string) => {
        setToast({ message, show: true });
        setTimeout(() => setToast({ message: '', show: false }), 3000);
    };

    // ✅ Search & Filter
    const filteredPatients = useMemo(() => {
        if (!searchTerm) return patients;

        return patients.filter(patient =>
            patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.nationalId?.includes(searchTerm) ||
            patient.contactPhone?.includes(searchTerm)
        );
    }, [patients, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
    const paginatedPatients = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPatients.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPatients, currentPage, itemsPerPage]);

    // ✅ Handlers with permission checks
    const handleEdit = (patient: Patient) => {
        // Check if user can edit this patient
        if (!permissions.canEdit(patient.created_by || '')) {
            showToast('คุณไม่มีสิทธิ์แก้ไขผู้ป่วยนี้');
            return;
        }

        // Navigate to edit page or open modal
        navigate(`/patients/${patient.id}/edit`);
    };

    const handleDelete = async (patientId: string) => {
        const patient = patients.find(p => p.id === patientId);
        if (!patient) return;

        // Check if user can delete this patient
        if (!permissions.canDelete(patient.created_by || '')) {
            showToast('คุณไม่มีสิทธิ์ลบผู้ป่วยนี้');
            return;
        }

        if (!confirm(`คุณต้องการลบผู้ป่วย ${patient.fullName} หรือไม่?`)) {
            return;
        }

        try {
            await patientsAPI.delete(patientId);
            showToast('ลบผู้ป่วยสำเร็จ');
            loadPatients();
        } catch (error) {
            console.error('Error deleting patient:', error);
            showToast('เกิดข้อผิดพลาดในการลบผู้ป่วย');
        }
    };

    const handleViewDetails = (patientId: string) => {
        navigate(`/patients/${patientId}`);
    };

    const handleCreatePatient = () => {
        navigate('/patients/register');
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="unified-patient-management">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>จัดการข้อมูลผู้ป่วย</h1>
                    <p className="subtitle">
                        {permissions.view === 'own'
                            ? 'ผู้ป่วยของคุณ'
                            : 'ผู้ป่วยทั้งหมดในระบบ'}
                    </p>
                </div>

                {/* Create Button - Role-based */}
                {permissions.create && (
                    <button
                        className="btn btn-primary"
                        onClick={handleCreatePatient}
                    >
                        <i className="fas fa-plus"></i>
                        ลงทะเบียนผู้ป่วยใหม่
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="search-section">
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="ค้นหาผู้ป่วย (ชื่อ, เลขบัตร, เบอร์โทร)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="stats-section">
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{filteredPatients.length}</div>
                        <div className="stat-label">ผู้ป่วยทั้งหมด</div>
                    </div>
                </div>
            </div>

            {/* Patient List Table */}
            <PatientListTable
                patients={paginatedPatients}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
                canEdit={permissions.edit !== 'none'}
                canDelete={permissions.delete !== 'none'}
                isLoading={isLoading}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="btn btn-secondary"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                    >
                        <i className="fas fa-chevron-left"></i>
                        ก่อนหน้า
                    </button>

                    <span className="page-info">
                        หน้า {currentPage} จาก {totalPages}
                    </span>

                    <button
                        className="btn btn-secondary"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        ถัดไป
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            )}

            {/* Toast */}
            {toast.show && <Toast message={toast.message} />}

            <style jsx>{`
        .unified-patient-management {
          padding: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .header-content h1 {
          margin: 0;
          font-size: 28px;
          color: #2c3e50;
        }

        .subtitle {
          margin: 5px 0 0 0;
          color: #7f8c8d;
          font-size: 14px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover {
          background: #2980b9;
        }

        .btn-secondary {
          background: #ecf0f1;
          color: #2c3e50;
        }

        .btn-secondary:hover {
          background: #bdc3c7;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .search-section {
          margin-bottom: 20px;
        }

        .search-box {
          position: relative;
          max-width: 500px;
        }

        .search-box i {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #95a5a6;
        }

        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 45px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .stats-section {
          margin-bottom: 20px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          max-width: 300px;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          background: #3498db;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #2c3e50;
        }

        .stat-label {
          font-size: 14px;
          color: #7f8c8d;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 30px;
        }

        .page-info {
          font-size: 14px;
          color: #7f8c8d;
        }
      `}</style>
        </div>
    );
};

export default UnifiedPatientManagementPage;
