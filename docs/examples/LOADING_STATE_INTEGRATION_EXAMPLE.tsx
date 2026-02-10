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

// Example 2: Skeleton screens (better UX)
{
    isLoading ? (
        <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
        </div>
    ) : (
        <div>
            {data.map(item => (
                <Card key={item.id}>
                    {/* Your content */}
                </Card>
            ))}
        </div>
    )
}

// Example 3: Table with skeleton
{
    isLoading ? (
        <TableSkeleton rows={10} columns={5} />
    ) : (
        <table>
            {/* Your table content */}
        </table>
    )
}

// Example 4: Combination with error state
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<any[]>([]);

const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await api.getData();
        setData(response.data);
    } catch (err: any) {
        setError(err.message || 'Failed to load data');
    } finally {
        setIsLoading(false);
    }
};

// Render with error handling
{
    isLoading ? (
        <LoadingSpinner size="md" message="กำลังโหลดข้อมูล..." />
    ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">เกิดข้อผิดพลาด</p>
            <p>{error}</p>
        </div>
    ) : (
        <div>
            {/* Your content here */}
        </div>
    )
}
