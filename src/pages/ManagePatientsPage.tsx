import React, { useState, useMemo, useEffect } from 'react';
import { Patient, CommunityView } from '../types';
import UserPlusIcon from '../components/icons/UserPlusIcon';
import SearchIcon from '../components/icons/SearchIcon';
import EyeIcon from '../components/icons/EyeIcon';
import TrashIcon from '../components/icons/TrashIcon';
import RidesIcon from '../components/icons/RidesIcon';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import UsersIcon from '../components/icons/UsersIcon';
import { formatDateToThai } from '../utils/dateUtils';
import { patientsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ITEMS_PER_PAGE = 5;

interface ManagePatientsPageProps {
  setActiveView: (view: CommunityView, context?: any) => void;
}

const ManagePatientsPage: React.FC<ManagePatientsPageProps> = ({ setActiveView }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await patientsAPI.getPatients();
      // ✅ Backward compatible: support both old (array) and new (object) formats
      const rawData = response as any;
      const patientsData = Array.isArray(rawData) ? rawData : (rawData.data || rawData.patients || []);
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    return patients.filter(p =>
      p.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; patientId: string; patientName: string } | null>(null);

  const handleDeleteClick = (patientId: string, patientName: string) => {
    setDeleteConfirmation({ isOpen: true, patientId, patientName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      setLoading(true);
      await patientsAPI.deletePatient(deleteConfirmation.patientId);
      await loadPatients();
      setDeleteConfirmation(null);
    } catch (err) {
      console.error('Failed to delete patient:', err);
      alert('เกิดข้อผิดพลาดในการลบข้อมูลผู้ป่วย กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">กำลังโหลดข้อมูลผู้ป่วย...</div>;
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-[60vh]">
        <UsersIcon className="w-24 h-24 text-gray-300" />
        <h2 className="mt-6 text-2xl font-semibold text-gray-700">ยังไม่มีผู้ป่วยในความดูแลของคุณ</h2>
        <p className="mt-2 text-gray-500">เริ่มต้นด้วยการเพิ่มข้อมูลผู้ป่วยคนแรกของคุณ</p>
        <button
          onClick={() => setActiveView('register_patient')}
          className="mt-6 flex items-center justify-center px-5 py-3 font-medium text-white bg-[var(--wecare-blue)] rounded-lg shadow-sm hover:bg-blue-800 transition-colors"
        >
          <UserPlusIcon className="w-5 h-5 mr-2" />
          ลงทะเบียนผู้ป่วยคนแรก
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Delete Confirmation Modal */}
      {deleteConfirmation?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in-up">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all scale-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">ยืนยันการลบข้อมูล</h3>
            <p className="text-gray-600 mb-6">
              คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลผู้ป่วย <span className="font-semibold text-gray-800">"{deleteConfirmation.patientName}"</span>?
              <br /><br />
              <span className="text-red-600 text-sm">⚠️ การกระทำนี้ไม่สามารถย้อนกลับได้</span>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">จัดการผู้ป่วย</h1>
          <p className="mt-1 text-[var(--text-secondary)]">ดู แก้ไข และจัดการข้อมูลผู้ป่วยในความดูแลของคุณ</p>
        </div>
        <button
          onClick={() => setActiveView('register_patient')}
          className="flex items-center justify-center px-5 py-2.5 font-semibold text-white bg-[var(--wecare-blue)] rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
        >
          <UserPlusIcon className="w-5 h-5 mr-2" />
          <span>ลงทะเบียนผู้ป่วยใหม่</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--border-color)]">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="w-5 h-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อ..."
              value={searchTerm}
              onChange={e => {
                setSearching(true);
                setSearchTerm(e.target.value);
                setTimeout(() => setSearching(false), 300);
              }}
              className="w-full md:w-1/3 pl-10"
            />
          </div>
          {searching && <LoadingSpinner size="sm" />}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-[var(--border-color)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-[var(--text-secondary)]">
            <thead className="text-xs text-[var(--text-primary)] uppercase bg-gray-50/75">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">ชื่อ-นามสกุล</th>
                <th scope="col" className="px-6 py-4 font-semibold">อายุ</th>
                <th scope="col" className="px-6 py-4 font-semibold">ข้อมูลสำคัญ</th>
                <th scope="col" className="px-6 py-4 font-semibold">วันที่ลงทะเบียน</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {paginatedPatients.map(patient => (
                <tr key={patient.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-[var(--text-primary)] whitespace-nowrap">{patient.fullName}</td>
                  <td className="px-6 py-4">{patient.age}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{patient.keyInfo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDateToThai(patient.registeredDate)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => setActiveView('patient_detail', { patientId: patient.id })} className="p-2 rounded-full hover:bg-blue-100 text-blue-600" title="ดูรายละเอียด"><EyeIcon className="w-5 h-5" /></button>
                        <button onClick={() => setActiveView('request_ride', { patientId: patient.id })} className="p-2 rounded-full hover:bg-green-100 text-green-600" title="ร้องขอการเดินทาง"><RidesIcon className="w-5 h-5" /></button>
                      </div>
                      <button onClick={() => handleDeleteClick(patient.id, patient.fullName)} className="p-2 rounded-full hover:bg-red-100 text-red-600" title="ลบ"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-[var(--text-secondary)]">
          หน้า {currentPage} จาก {totalPages}
        </span>
        <div className="inline-flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagePatientsPage;
