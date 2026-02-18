/**
 * PatientListTable Component
 * Shared table component for displaying patient list
 * Used by both Community and Officer roles
 */

import React from 'react';
import { Patient } from '../../types';

interface PatientListTableProps {
    patients: Patient[];
    onEdit: (patient: Patient) => void;
    onDelete: (patientId: string) => void;
    onViewDetails: (patientId: string) => void;
    canEdit?: boolean;
    canDelete?: boolean;
    isLoading?: boolean;
}

const PatientListTable: React.FC<PatientListTableProps> = ({
    patients,
    onEdit,
    onDelete,
    onViewDetails,
    canEdit = true,
    canDelete = true,
    isLoading = false
}) => {
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>กำลังโหลดข้อมูลผู้ป่วย...</p>
            </div>
        );
    }

    if (patients.length === 0) {
        return (
            <div className="empty-state">
                <p>ไม่พบข้อมูลผู้ป่วย</p>
                <p className="text-muted">กรุณาลงทะเบียนผู้ป่วยใหม่</p>
            </div>
        );
    }

    return (
        <div className="patient-list-table">
            <table className="table" aria-label="รายชื่อผู้ป่วย">
                <thead>
                    <tr>
                        <th>รหัสผู้ป่วย</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>เลขบัตรประชาชน</th>
                        <th>เบอร์โทร</th>
                        <th>อายุ</th>
                        <th>ที่อยู่</th>
                        <th>สถานะ</th>
                        <th>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map((patient) => (
                        <tr key={patient.id}>
                            <td>
                                <a
                                    href={`/patients/${patient.id}`}
                                    onClick={(e) => { e.preventDefault(); onViewDetails(patient.id); }}
                                    aria-label={`ดูรายละเอียดผู้ป่วย ${patient.fullName}`}
                                >
                                    {patient.id}
                                </a>
                            </td>
                            <td>
                                <div className="patient-name">
                                    {(() => {
                                        const rawUrl =
                                            (patient as any).profileImage ||
                                            (patient as any).profileImageUrl ||
                                            (patient as any).profile_image_url;
                                        if (!rawUrl) return null;

                                        if (typeof rawUrl === 'string' && (rawUrl.startsWith('http') || rawUrl.startsWith('data:'))) {
                                            return (
                                                <img
                                                    src={rawUrl}
                                                    alt={patient.fullName}
                                                    className="patient-avatar"
                                                />
                                            );
                                        }

                                        let base = '';

                                        try {
                                            if (typeof window !== 'undefined') {
                                                const apiBaseWindow = (window as any).__API_BASE__ as string | undefined;
                                                if (apiBaseWindow && /^https?:\/\//i.test(apiBaseWindow)) {
                                                    base = apiBaseWindow.replace(/\/api-proxy\/?$/i, '').replace(/\/api\/?$/i, '');
                                                }
                                            }
                                        } catch {}

                                        if (!base) {
                                            try {
                                                const envBase =
                                                    (import.meta as any).env?.VITE_API_URL ||
                                                    (import.meta as any).env?.VITE_API_BASE_URL ||
                                                    '';
                                                if (envBase && /^https?:\/\//i.test(envBase)) {
                                                    base = envBase.replace(/\/api-proxy\/?$/i, '').replace(/\/api\/?$/i, '');
                                                }
                                            } catch {}
                                        }

                                        if (!base && typeof window !== 'undefined') {
                                            const { protocol, hostname, origin } = window.location;
                                            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                                                base = `${protocol}//${hostname}:3002`;
                                            } else {
                                                base = origin;
                                            }
                                        }

                                        const url = String(rawUrl);
                                        const finalUrl = base ? `${base}${url.startsWith('/') ? '' : '/'}${url}` : url;

                                        return (
                                            <img
                                                src={finalUrl}
                                                alt={patient.fullName}
                                                className="patient-avatar"
                                            />
                                        );
                                    })()}
                                    <span>{patient.fullName}</span>
                                </div>
                            </td>
                            <td>{patient.nationalId}</td>
                            <td>{patient.contactPhone}</td>
                            <td>{patient.age || '-'}</td>
                            <td>
                                <div className="address-cell">
                                    {patient.registeredAddress?.village || '-'}
                                </div>
                            </td>
                            <td>
                                <span className={`status-badge ${patient.status?.toLowerCase()}`}>
                                    {patient.status || 'ACTIVE'}
                                </span>
                            </td>
                            <td>
                                <div className="action-buttons" role="group" aria-label={`การจัดการผู้ป่วย ${patient.fullName}`}>
                                    <div className="action-buttons-main">
                                        <button
                                            className="btn btn-sm btn-info"
                                            onClick={() => onViewDetails(patient.id)}
                                            title="ดูรายละเอียด"
                                            aria-label={`ดูรายละเอียดผู้ป่วย ${patient.fullName}`}
                                        >
                                            <i className="fas fa-eye"></i>
                                            ดูรายละเอียด
                                        </button>
                                        {canEdit && (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => onEdit(patient)}
                                                title="แก้ไข"
                                                aria-label={`แก้ไขผู้ป่วย ${patient.fullName}`}
                                            >
                                                <i className="fas fa-edit"></i>
                                                แก้ไข
                                            </button>
                                        )}
                                    </div>
                                    {canDelete && (
                                        <button
                                            className="btn btn-sm btn-danger action-delete"
                                            onClick={() => onDelete(patient.id)}
                                            title="ลบ"
                                            aria-label={`ลบผู้ป่วย ${patient.fullName}`}
                                        >
                                            <i className="fas fa-trash"></i>
                                            ลบ
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <style jsx>{`
        .patient-list-table {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th {
          background: #f8f9fa;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #dee2e6;
        }

        .table td {
          padding: 12px;
          border-bottom: 1px solid #dee2e6;
        }

        .patient-name {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .patient-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .address-cell {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge.active {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.inactive {
          background: #f8d7da;
          color: #721c24;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .action-buttons-main {
          display: flex;
          gap: 8px;
        }

        .action-delete {
          margin-left: auto;
        }

        .btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-sm {
          padding: 4px 8px;
          font-size: 14px;
        }

        .btn-info {
          background: #17a2b8;
          color: white;
        }

        .btn-info:hover {
          background: #138496;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .loading-container {
          text-align: center;
          padding: 40px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6c757d;
        }

        .text-muted {
          color: #6c757d;
          font-size: 14px;
          margin-top: 8px;
        }
      `}</style>
        </div>
    );
};

export default PatientListTable;
