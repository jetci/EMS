# ✅ Frontend Pagination Components Created!

**วันที่:** 2026-01-03  
**เวลา:** 19:00 น.

---

## 📁 ไฟล์ที่สร้างแล้ว (5 ไฟล์)

### 1. Types & Utilities
✅ **`src/types/pagination.ts`** (75 lines)
- PaginationMeta interface
- PaginatedResponse<T> interface
- PaginationParams interface
- PaginationState interface
- Helper functions: createInitialPaginationState(), metaToState(), buildPaginationQuery()

### 2. Components
✅ **`src/components/Pagination.tsx`** (160 lines)
- Beautiful pagination UI
- Responsive design (mobile/desktop)
- Smart page number display (max 7 pages with ellipsis)
- Previous/Next buttons
- Info text (showing X to Y of Z items)
- Accessibility features (aria-labels)

✅ **`src/components/LoadingSpinner.tsx`** (60 lines)
- Customizable sizes (sm, md, lg, xl)
- Optional text
- Full screen mode
- Beautiful spinning animation

✅ **`src/components/EmptyState.tsx`** (70 lines)
- Custom icon support
- Title and message
- Optional action button
- Clean, centered design

### 3. Hooks
✅ **`src/hooks/usePagination.ts`** (60 lines)
- Custom pagination hook
- State management
- Page navigation (setPage, nextPage, prevPage)
- Auto scroll to top
- Reset functionality

---

## 🎯 ขั้นตอนถัดไป

### Step 1: อัพเดท API Service (ทำเอง)

แก้ไข `src/services/api.ts`:

```typescript
import { PaginatedResponse, PaginationParams, buildPaginationQuery } from '../types/pagination';
import { Patient, Ride } from '../types';

// ✅ Update getPatients
export const getPatients = async (
  params?: PaginationParams
): Promise<PaginatedResponse<Patient>> => {
  const query = buildPaginationQuery(params);
  const response = await apiClient.get(`/api/patients${query}`);
  return response.data;
};

// ✅ Update getRides
export const getRides = async (
  params?: PaginationParams
): Promise<PaginatedResponse<Ride>> => {
  const query = buildPaginationQuery(params);
  const response = await apiClient.get(`/api/rides${query}`);
  return response.data;
};
```

---

### Step 2: อัพเดท Pages (ตัวอย่าง)

#### Pattern สำหรับทุกหน้า:

```typescript
import { useState, useEffect } from 'react';
import { getPatients } from '../services/api';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const PatientListPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const { pagination, currentPage, setPage, updatePagination } = usePagination();

  useEffect(() => {
    fetchPatients();
  }, [currentPage]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getPatients({ page: currentPage, limit: 20 });
      setPatients(response.data);
      updatePagination(response.pagination);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="กำลังโหลดข้อมูลผู้ป่วย..." />;
  if (patients.length === 0) return <EmptyState title="ไม่พบผู้ป่วย" />;

  return (
    <div>
      {/* Patient List */}
      <div className="grid gap-4">
        {patients.map(patient => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        pagination={{
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          total: pagination.totalItems,
          totalPages: pagination.totalPages,
          hasNext: pagination.hasNext,
          hasPrev: pagination.hasPrev
        }}
        onPageChange={setPage}
      />
    </div>
  );
};
```

---

### Step 3: ไฟล์ที่ต้องอัพเดท (8 ไฟล์)

#### API Service (1 file)
- [ ] `src/services/api.ts` - เพิ่ม pagination params

#### Patient Pages (3 files)
- [ ] `src/pages/CommunityPatientListPage.tsx`
- [ ] `src/pages/OfficerPatientListPage.tsx`
- [ ] `src/pages/CommunityDashboard.tsx`

#### Ride Pages (3 files)
- [ ] `src/pages/CommunityRideListPage.tsx`
- [ ] `src/pages/DriverRideListPage.tsx`
- [ ] `src/pages/RadioCenterRideListPage.tsx`

#### Other Pages (optional)
- [ ] `src/pages/ManageRidesPage.tsx`
- [ ] `src/pages/DriverHistoryPage.tsx`

---

## 🧪 Testing Checklist

### API Integration
- [ ] Default load (page 1, limit 20)
- [ ] Navigate to page 2
- [ ] Navigate back to page 1
- [ ] Jump to last page
- [ ] Check network requests

### UI/UX
- [ ] Previous button disabled on page 1
- [ ] Next button disabled on last page
- [ ] Active page highlighted
- [ ] Info text shows correct range
- [ ] Smooth scroll to top

### Loading States
- [ ] Spinner shows during load
- [ ] Content appears after load
- [ ] No flickering

### Empty States
- [ ] Shows when no data
- [ ] Pagination hidden
- [ ] Message displayed

### Responsive
- [ ] Mobile (< 640px) - shows "Page X / Y"
- [ ] Tablet (640-1024px) - shows page numbers
- [ ] Desktop (> 1024px) - full pagination

---

## 💡 Usage Examples

### Basic Usage
```typescript
import Pagination from '../components/Pagination';

<Pagination
  pagination={paginationMeta}
  onPageChange={handlePageChange}
/>
```

### With Loading
```typescript
import LoadingSpinner from '../components/LoadingSpinner';

{loading && <LoadingSpinner text="กำลังโหลด..." />}
```

### With Empty State
```typescript
import EmptyState from '../components/EmptyState';

{data.length === 0 && (
  <EmptyState
    title="ไม่พบข้อมูล"
    message="ยังไม่มีรายการในระบบ"
    action={{
      label: "เพิ่มรายการใหม่",
      onClick: () => navigate('/create')
    }}
  />
)}
```

### With Custom Hook
```typescript
import { usePagination } from '../hooks/usePagination';

const { pagination, currentPage, setPage, updatePagination } = usePagination();

// Fetch data
const response = await getPatients({ page: currentPage });
updatePagination(response.pagination);

// Change page
setPage(2);
```

---

## 🎨 Component Features

### Pagination Component
- ✅ Responsive design
- ✅ Smart ellipsis (shows max 7 pages)
- ✅ Previous/Next buttons
- ✅ Info text
- ✅ Accessibility (ARIA labels)
- ✅ Tailwind CSS styling

### LoadingSpinner Component
- ✅ 4 sizes (sm, md, lg, xl)
- ✅ Optional text
- ✅ Full screen mode
- ✅ Smooth animation

### EmptyState Component
- ✅ Custom icon
- ✅ Title & message
- ✅ Optional action button
- ✅ Centered layout

### usePagination Hook
- ✅ State management
- ✅ Auto scroll to top
- ✅ Next/Prev helpers
- ✅ Reset functionality

---

## 🐛 Troubleshooting

### Issue: TypeScript errors
**Solution:** Make sure to import types
```typescript
import { PaginatedResponse } from '../types/pagination';
```

### Issue: Pagination not updating
**Solution:** Add currentPage to useEffect dependency
```typescript
useEffect(() => {
  fetchData();
}, [currentPage]); // ✅ Include currentPage
```

### Issue: Scroll not working
**Solution:** Check usePagination hook is used
```typescript
const { setPage } = usePagination(); // ✅ Auto scrolls
```

---

## ✅ Summary

**สถานะ:** ✅ Components Created (5/5)  
**ต้องทำต่อ:** อัพเดท API Service + Pages (8 files)  
**เวลาที่เหลือ:** ~2 ชั่วโมง

**ไฟล์ที่สร้างแล้ว:**
1. ✅ src/types/pagination.ts
2. ✅ src/components/Pagination.tsx
3. ✅ src/components/LoadingSpinner.tsx
4. ✅ src/components/EmptyState.tsx
5. ✅ src/hooks/usePagination.ts

**ไฟล์ที่ต้องแก้ไข:**
- ⏳ src/services/api.ts (1 file)
- ⏳ Patient pages (3 files)
- ⏳ Ride pages (3 files)

---

**Next Action:** อัพเดท `src/services/api.ts` และเริ่มแก้ไข pages ตามตัวอย่างข้างบน! 🚀
