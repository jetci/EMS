/**
 * Example: How to add Loading States to Community pages
 * 
 * Instructions:
 * 1. Import LoadingSpinner
 * 2. Add loading state
 * 3. Show loading while fetching data
 * 4. Hide loading when data is ready
 */

// ============================================
// STEP 1: Import LoadingSpinner
// ============================================

import LoadingSpinner, { Skeleton, CardSkeleton, TableSkeleton } from '../components/ui/LoadingSpinner';

// ============================================
// STEP 2: Add loading state (already exists in most components)
// ============================================

const [isLoading, setIsLoading] = useState(true);
const [data, setData] = useState<any[]>([]);

// ============================================
// STEP 3: Show loading while fetching
// ============================================

const fetchData = async () => {
    setIsLoading(true);
    try {
        const response = await api.getData();
        setData(response.data);
    } catch (error) {
        console.error(error);
    } finally {
        setIsLoading(false);
    }
};

// ============================================
// STEP 4: Conditional rendering
// ============================================

// Example 1: Simple Loading Spinner
{
    isLoading ? (
        <LoadingSpinner size="md" message="กำลังโหลดข้อมูล..." />
    ) : (
        <div>
            {/* Your content here */}
        </div>
    )
}

// Example 2: Full Screen Loading
{
    isLoading && (
        <LoadingSpinner fullScreen message="กำลังประมวลผล..." />
    )
}

// Example 3: Overlay Loading (on top of content)
<div className="relative">
    {isLoading && <LoadingSpinner overlay message="กำลังโหลด..." />}
    <div className={isLoading ? 'opacity-50' : ''}>
        {/* Your content here */}
    </div>
</div>

// Example 4: Skeleton Loading (better UX)
{
    isLoading ? (
        <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
        </div>
    ) : (
        <div className="space-y-4">
            {data.map(item => (
                <Card key={item.id} data={item} />
            ))}
        </div>
    )
}

// Example 5: Table Skeleton
{
    isLoading ? (
        <TableSkeleton rows={5} columns={4} />
    ) : (
        <table>
            {/* Your table content */}
        </table>
    )
}

// ============================================
// Complete Example: CommunityDashboard with Loading States
// ============================================

import React, { useState, useEffect } from 'react';
import LoadingSpinner, { CardSkeleton } from '../components/ui/LoadingSpinner';
import { patientsAPI, ridesAPI } from '../services/api';

const CommunityDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [patients, setPatients] = useState<any[]>([]);
    const [rides, setRides] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [patientsResponse, ridesResponse] = await Promise.all([
                patientsAPI.getPatients({ page: 1, limit: 10 }),
                ridesAPI.getRides({ page: 1, limit: 5, status: 'PENDING' })
            ]);

            setPatients(patientsResponse.data);
            setRides(ridesResponse.data);
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setIsLoading(false);
        }
    };

    // Error State
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800">{error}</p>
                <button
                    onClick={fetchData}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    ลองใหม่อีกครั้ง
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">แดชบอร์ด</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoading ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-700">ผู้ป่วยทั้งหมด</h3>
                            <p className="text-4xl font-bold text-blue-600 mt-2">{patients.length}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-700">การเดินทางที่รอดำเนินการ</h3>
                            <p className="text-4xl font-bold text-orange-600 mt-2">{rides.length}</p>
                        </div>
                    </>
                )}
            </div>

            {/* Patient List */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">ผู้ป่วยล่าสุด</h2>

                {isLoading ? (
                    <div className="space-y-4">
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                ) : patients.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">ยังไม่มีข้อมูลผู้ป่วย</p>
                ) : (
                    <div className="space-y-4">
                        {patients.map((patient) => (
                            <div key={patient.id} className="border-b pb-4">
                                <p className="font-medium">{patient.fullName}</p>
                                <p className="text-sm text-gray-600">
                                    {patient.age} ปี | {patient.gender === 'MALE' ? 'ชาย' : 'หญิง'}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityDashboard;

// ============================================
// Loading State Best Practices
// ============================================

/**
 * 1. Always show loading state for async operations
 * 2. Use skeleton loaders for better UX (shows structure)
 * 3. Use full screen loading for critical operations
 * 4. Use overlay loading for partial updates
 * 5. Always handle error states
 * 6. Provide retry mechanism on errors
 * 7. Show meaningful loading messages
 * 8. Don't show loading for too short operations (<200ms)
 */

// ============================================
// Loading State Patterns
// ============================================

/**
 * Pattern 1: Initial Load
 * - Show skeleton loaders
 * - Maintain page structure
 * - Better perceived performance
 */

/**
 * Pattern 2: Form Submission
 * - Show full screen loading
 * - Prevent multiple submissions
 * - Clear success/error feedback
 */

/**
 * Pattern 3: Partial Update
 * - Show overlay loading
 * - Keep existing content visible
 * - Quick feedback
 */

/**
 * Pattern 4: Infinite Scroll
 * - Show small spinner at bottom
 * - Don't block existing content
 * - Smooth experience
 */

// ============================================
// Accessibility
// ============================================

/**
 * - Use role="status" for loading indicators
 * - Use aria-label for screen readers
 * - Use aria-live for dynamic updates
 * - Ensure keyboard navigation works during loading
 */
