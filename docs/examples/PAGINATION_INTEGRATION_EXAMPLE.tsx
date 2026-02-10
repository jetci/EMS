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
        setRecentRides(ridesResponse.data);
    } catch (error: any) {
        setError(error.message || 'Failed to load data');
    } finally {
        setIsLoading(false);
    }
};

// ============================================
// STEP 4: Add useEffect to refetch when page changes
// ============================================

useEffect(() => {
    fetchData();
}, [currentPage, itemsPerPage]);

// ============================================
// STEP 5: Handle page change
// ============================================

const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ============================================
// STEP 6: Add Pagination component in JSX
// ============================================

return (
    <div className="space-y-6">
        {/* Your content here */}
        
        {/* Patients section */}
        <div>
            <h2>Recent Patients</h2>
            {/* List of patients */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>

        {/* Rides section */}
        <div>
            <h2>Pending Rides</h2>
            {/* List of rides */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    </div>
);

// ============================================
// OPTIONAL: Advanced pagination with items per page
// ============================================

const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
};

// In JSX:
return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <div>
                <label>Items per page:</label>
                <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    </div>
);
