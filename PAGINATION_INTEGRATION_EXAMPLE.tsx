/**
 * Example: How to add Pagination to CommunityDashboard.tsx
 * 
 * Instructions:
 * 1. Add pagination state
 * 2. Update API calls to use pagination parameters
 * 3. Add Pagination component to UI
 * 4. Handle page changes
 */

// ============================================
// STEP 1: Add imports (add at the top)
// ============================================

import Pagination from '../components/ui/Pagination';

// ============================================
// STEP 2: Add pagination state (add after other useState)
// ============================================

const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
const [totalPages, setTotalPages] = useState(1);

// ============================================
// STEP 3: Update fetchData to use pagination
// ============================================

const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
        // Fetch patients with pagination
        const patientsResponse = await patientsAPI.getPatients({
            page: currentPage,
            limit: itemsPerPage
        });

        setPatientCount(patientsResponse.total);
        setRecentPatients(patientsResponse.data);
        setTotalPages(Math.ceil(patientsResponse.total / itemsPerPage));

        // Fetch rides with pagination
        const ridesResponse = await ridesAPI.getRides({
            page: currentPage,
            limit: itemsPerPage,
            status: 'PENDING'
        });

        setRideCount(ridesResponse.total);
        setPendingRides(ridesResponse.data);

    } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data.');
        console.error("Failed to fetch community dashboard data:", err);
    } finally {
        setIsLoading(false);
    }
};

// ============================================
// STEP 4: Add useEffect to refetch when page changes
// ============================================

useEffect(() => {
    fetchData();
}, [currentPage, itemsPerPage]); // Refetch when page or items per page changes

// ============================================
// STEP 5: Add page change handler
// ============================================

const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
};

// ============================================
// STEP 6: Add Pagination component to JSX (after patient list)
// ============================================

{/* Patient List */ }
<div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold mb-4">ผู้ป่วยล่าสุด</h2>

    {isLoading ? (
        <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
    ) : recentPatients.length === 0 ? (
        <p className="text-gray-500 text-center py-8">ยังไม่มีข้อมูลผู้ป่วย</p>
    ) : (
        <>
            <div className="space-y-4">
                {recentPatients.map((patient) => (
                    <div key={patient.id} className="border-b pb-4">
                        <p className="font-medium">{patient.fullName}</p>
                        <p className="text-sm text-gray-600">
                            {patient.age} ปี | {patient.gender === 'MALE' ? 'ชาย' : 'หญิง'}
                        </p>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-6"
            />
        </>
    )}
</div>

// ============================================
// COMPLETE EXAMPLE: Full component with pagination
// ============================================

import React, { useState, useEffect } from 'react';
import { patientsAPI, ridesAPI } from '../services/api';
import Pagination from '../components/ui/Pagination';

interface CommunityDashboardProps {
    setActiveView: (view: string, context?: any) => void;
}

const CommunityDashboard: React.FC<CommunityDashboardProps> = ({ setActiveView }) => {
    // State
    const [patientCount, setPatientCount] = useState(0);
    const [rideCount, setRideCount] = useState(0);
    const [pendingRides, setPendingRides] = useState<any[]>([]);
    const [recentPatients, setRecentPatients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch data when component mounts or pagination changes
    useEffect(() => {
        fetchData();
    }, [currentPage, itemsPerPage]);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch patients with pagination
            const patientsResponse = await patientsAPI.getPatients({
                page: currentPage,
                limit: itemsPerPage
            });

            setPatientCount(patientsResponse.total);
            setRecentPatients(patientsResponse.data);
            setTotalPages(Math.ceil(patientsResponse.total / itemsPerPage));

            // Fetch rides
            const ridesResponse = await ridesAPI.getRides({
                page: 1,
                limit: 5,
                status: 'PENDING'
            });

            setRideCount(ridesResponse.total);
            setPendingRides(ridesResponse.data);

        } catch (err: any) {
            setError(err.message || 'Failed to fetch dashboard data.');
            console.error("Failed to fetch community dashboard data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">แดชบอร์ด</h1>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-700">ผู้ป่วยทั้งหมด</h3>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{patientCount}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-700">การเดินทางที่รอดำเนินการ</h3>
                    <p className="text-4xl font-bold text-orange-600 mt-2">{rideCount}</p>
                </div>
            </div>

            {/* Patient List with Pagination */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">รายชื่อผู้ป่วย</h2>

                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : recentPatients.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">ยังไม่มีข้อมูลผู้ป่วย</p>
                ) : (
                    <>
                        <div className="space-y-4">
                            {recentPatients.map((patient) => (
                                <div
                                    key={patient.id}
                                    className="border-b pb-4 hover:bg-gray-50 p-4 rounded-lg transition-colors cursor-pointer"
                                    onClick={() => setActiveView('patientDetail', { patientId: patient.id })}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-lg">{patient.fullName}</p>
                                            <p className="text-sm text-gray-600">
                                                {patient.age} ปี | {patient.gender === 'MALE' ? 'ชาย' : 'หญิง'}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {patient.contactPhone}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(patient.registeredDate).toLocaleDateString('th-TH')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            className="mt-6"
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default CommunityDashboard;
