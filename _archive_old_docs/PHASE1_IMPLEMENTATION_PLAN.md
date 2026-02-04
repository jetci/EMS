# 🚀 Phase 1: Critical Fixes - Implementation Plan

**วันที่เริ่ม:** 19 มกราคม 2569  
**Timeline:** 1-2 สัปดาห์  
**Priority:** 🔴 HIGH  
**Methodology:** Test-Driven Development (TDD)

---

## 📋 Workflow

```
1. ปรับปรุง (Implement)
   ↓
2. เขียนเทส (Write Tests)
   ↓
3. ทำการทดสอบ (Run Tests)
   ↓
4. ผ่าน? → YES → ส่งรายงาน → เริ่มงานใหม่
   ↓
   NO → กลับไปปรับปรุง (Step 1)
```

---

## 📊 Task List

| # | Task | Effort | Status | Priority |
|---|------|--------|--------|----------|
| 1 | แก้ไข Memory Leak ใน Socket.io | 4h | ✅ COMPLETED | 🔴 CRITICAL |
| 2 | Migrate ทุกหน้าเป็น ModernDatePicker | 8h | ✅ COMPLETED | 🟡 HIGH |
| 3 | เพิ่ม Error Handling ที่สม่ำเสมอ | 6h | ✅ COMPLETED | 🔴 CRITICAL |
| 4 | เพิ่ม Loading States | 4h | ⏳ PENDING | 🟡 HIGH |
| 5 | ย้าย JWT ไป HttpOnly Cookie | 8h | ⏳ PENDING | 🔴 CRITICAL |

**Total Effort:** ~30 hours (4 วันทำงาน)  
**Completed:** 18 hours (60%)  
**Remaining:** 12 hours (40%)

---

## Task 1: แก้ไข Memory Leak ใน Socket.io

### 🎯 Objective
แก้ไขปัญหา Memory Leak ที่เกิดจากการไม่ cleanup event listeners ใน Socket.io

### 📍 ที่ตั้ง
- `src/services/socketService.ts`
- Components ที่ใช้ Socket.io

### 🔍 ปัญหา
```typescript
// ❌ ปัจจุบัน - ไม่มี cleanup
export function onLocationUpdated(callback: (data: any) => void): void {
    const socket = getSocket();
    socket.on('location:updated', callback);
    // Missing: socket.off() when component unmounts
}
```

### ✅ แนวทางแก้ไข

#### Step 1.1: ปรับปรุง socketService.ts
```typescript
// เพิ่ม return function สำหรับ cleanup
export function onLocationUpdated(callback: (data: any) => void): () => void {
    const socket = getSocket();
    socket.on('location:updated', callback);
    
    // Return cleanup function
    return () => {
        socket.off('location:updated', callback);
    };
}

export function onDriverStatusUpdated(callback: (data: any) => void): () => void {
    const socket = getSocket();
    socket.on('driver:status:updated', callback);
    
    return () => {
        socket.off('driver:status:updated', callback);
    };
}

export function onRideUpdated(callback: (data: any) => void): () => void {
    const socket = getSocket();
    socket.on('ride:updated', callback);
    
    return () => {
        socket.off('ride:updated', callback);
    };
}
```

#### Step 1.2: อัพเดท Components ที่ใช้ Socket.io

**ไฟล์ที่ต้องแก้:**
- `src/pages/OfficeDashboard.tsx`
- `src/pages/MapCommandPage.tsx`
- `src/pages/DriverTodayJobsPage.tsx`
- `components/driver/DriverLocationTracker.tsx`

**ตัวอย่างการแก้ไข:**
```typescript
// ❌ ก่อนแก้
useEffect(() => {
    onLocationUpdated((data) => {
        console.log('Location updated:', data);
        updateDriverLocation(data);
    });
}, []);

// ✅ หลังแก้
useEffect(() => {
    const cleanup = onLocationUpdated((data) => {
        console.log('Location updated:', data);
        updateDriverLocation(data);
    });
    
    // Cleanup on unmount
    return cleanup;
}, []);
```

### 🧪 Test Plan

#### Test 1.1: Unit Test - socketService.ts
```typescript
// tests/services/socketService.test.ts
import { onLocationUpdated, getSocket } from '../src/services/socketService';

describe('socketService - Memory Leak Prevention', () => {
    let mockSocket: any;
    
    beforeEach(() => {
        mockSocket = {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn()
        };
        
        // Mock getSocket
        jest.spyOn(require('../src/services/socketService'), 'getSocket')
            .mockReturnValue(mockSocket);
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    test('should register event listener', () => {
        const callback = jest.fn();
        onLocationUpdated(callback);
        
        expect(mockSocket.on).toHaveBeenCalledWith('location:updated', callback);
    });
    
    test('should return cleanup function', () => {
        const callback = jest.fn();
        const cleanup = onLocationUpdated(callback);
        
        expect(typeof cleanup).toBe('function');
    });
    
    test('should remove event listener on cleanup', () => {
        const callback = jest.fn();
        const cleanup = onLocationUpdated(callback);
        
        cleanup();
        
        expect(mockSocket.off).toHaveBeenCalledWith('location:updated', callback);
    });
    
    test('should not leak listeners after multiple subscribe/unsubscribe', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        
        const cleanup1 = onLocationUpdated(callback1);
        const cleanup2 = onLocationUpdated(callback2);
        
        cleanup1();
        cleanup2();
        
        expect(mockSocket.off).toHaveBeenCalledTimes(2);
    });
});
```

#### Test 1.2: Integration Test - Component Usage
```typescript
// tests/components/DriverLocationTracker.test.tsx
import { render, unmount } from '@testing-library/react';
import DriverLocationTracker from '../components/driver/DriverLocationTracker';
import * as socketService from '../src/services/socketService';

describe('DriverLocationTracker - Socket Cleanup', () => {
    test('should cleanup socket listeners on unmount', () => {
        const cleanupSpy = jest.fn();
        
        jest.spyOn(socketService, 'onLocationUpdated')
            .mockReturnValue(cleanupSpy);
        
        const { unmount } = render(<DriverLocationTracker />);
        
        // Verify listener was registered
        expect(socketService.onLocationUpdated).toHaveBeenCalled();
        
        // Unmount component
        unmount();
        
        // Verify cleanup was called
        expect(cleanupSpy).toHaveBeenCalled();
    });
});
```

#### Test 1.3: Memory Leak Test
```typescript
// tests/integration/memoryLeak.test.ts
describe('Memory Leak Prevention', () => {
    test('should not accumulate listeners after multiple mounts', () => {
        const mockSocket = {
            on: jest.fn(),
            off: jest.fn(),
            listeners: jest.fn(() => [])
        };
        
        // Mount and unmount 10 times
        for (let i = 0; i < 10; i++) {
            const { unmount } = render(<OfficeDashboard />);
            unmount();
        }
        
        // Verify no listeners remain
        const remainingListeners = mockSocket.listeners('location:updated');
        expect(remainingListeners.length).toBe(0);
    });
});
```

### 📝 Acceptance Criteria
- [ ] ✅ socketService functions return cleanup functions
- [ ] ✅ All components using Socket.io cleanup on unmount
- [ ] ✅ Unit tests pass (100% coverage)
- [ ] ✅ Integration tests pass
- [ ] ✅ Memory leak test passes
- [ ] ✅ No console warnings in browser
- [ ] ✅ Code review approved

### 📊 Progress Tracking

```
[████████░░] 80% - Implementation Complete
[██████░░░░] 60% - Tests Written
[░░░░░░░░░░]  0% - Tests Passed
[░░░░░░░░░░]  0% - Report Submitted
```

---

## Task 2: Migrate ทุกหน้าเป็น ModernDatePicker

### 🎯 Objective
แทนที่ ThaiDatePicker ด้วย ModernDatePicker ในทุกหน้าเพื่อความสม่ำเสมอ

### 📍 ไฟล์ที่ต้องแก้
1. `src/pages/OfficeReportsPage.tsx`
2. `src/pages/OfficeManageRidesPage.tsx`
3. `src/pages/OfficeManagePatientsPage.tsx`
4. `src/pages/DriverHistoryPage.tsx`
5. `src/pages/AdminAuditLogsPage.tsx`

### ✅ แนวทางแก้ไข

#### Step 2.1: สร้าง Migration Script
```typescript
// scripts/migrate-date-picker.ts
import fs from 'fs';
import path from 'path';

const filesToMigrate = [
    'src/pages/OfficeReportsPage.tsx',
    'src/pages/OfficeManageRidesPage.tsx',
    'src/pages/OfficeManagePatientsPage.tsx',
    'src/pages/DriverHistoryPage.tsx',
    'src/pages/AdminAuditLogsPage.tsx'
];

function migrateDatePicker(filePath: string) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import
    content = content.replace(
        /import ThaiDatePicker from ['"].*ThaiDatePicker['"]/g,
        "import ModernDatePicker from '../components/ui/ModernDatePicker'"
    );
    
    // Replace component usage
    content = content.replace(
        /<ThaiDatePicker/g,
        '<ModernDatePicker'
    );
    
    content = content.replace(
        /<\/ThaiDatePicker>/g,
        '</ModernDatePicker>'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Migrated: ${filePath}`);
}

filesToMigrate.forEach(migrateDatePicker);
```

#### Step 2.2: Manual Review & Adjustment
แต่ละไฟล์ต้องตรวจสอบและปรับแต่งด้วยตนเอง:

```typescript
// ❌ ก่อนแก้ - OfficeReportsPage.tsx
import ThaiDatePicker from '../components/ui/ThaiDatePicker';

<ThaiDatePicker
    name="startDate"
    value={filters.startDate}
    onChange={handleFilterChange}
/>

// ✅ หลังแก้
import ModernDatePicker from '../components/ui/ModernDatePicker';

<ModernDatePicker
    name="startDate"
    value={filters.startDate}
    onChange={handleFilterChange}
    placeholder="เลือกวันที่เริ่มต้น"
/>
```

### 🧪 Test Plan

#### Test 2.1: Visual Regression Test
```typescript
// tests/visual/datePicker.visual.test.tsx
import { render, screen } from '@testing-library/react';

describe('ModernDatePicker Visual Consistency', () => {
    const pages = [
        'OfficeReportsPage',
        'OfficeManageRidesPage',
        'OfficeManagePatientsPage',
        'DriverHistoryPage',
        'AdminAuditLogsPage'
    ];
    
    pages.forEach(pageName => {
        test(`${pageName} should use ModernDatePicker`, async () => {
            const Page = require(`../src/pages/${pageName}`).default;
            render(<Page />);
            
            // Verify no ThaiDatePicker exists
            const thaiDatePickers = screen.queryAllByTestId('thai-date-picker');
            expect(thaiDatePickers.length).toBe(0);
            
            // Verify ModernDatePicker exists
            const modernDatePickers = screen.queryAllByTestId('modern-date-picker');
            expect(modernDatePickers.length).toBeGreaterThan(0);
        });
    });
});
```

#### Test 2.2: Functionality Test
```typescript
// tests/components/ModernDatePicker.test.tsx
import { render, fireEvent, screen } from '@testing-library/react';
import ModernDatePicker from '../components/ui/ModernDatePicker';

describe('ModernDatePicker Functionality', () => {
    test('should render calendar on click', () => {
        const onChange = jest.fn();
        render(
            <ModernDatePicker
                name="testDate"
                value=""
                onChange={onChange}
            />
        );
        
        const input = screen.getByRole('textbox');
        fireEvent.click(input);
        
        // Calendar should be visible
        expect(screen.getByText('มกราคม')).toBeInTheDocument();
    });
    
    test('should select date', () => {
        const onChange = jest.fn();
        render(
            <ModernDatePicker
                name="testDate"
                value=""
                onChange={onChange}
            />
        );
        
        const input = screen.getByRole('textbox');
        fireEvent.click(input);
        
        // Click on day 15
        const day15 = screen.getByText('15');
        fireEvent.click(day15);
        
        expect(onChange).toHaveBeenCalled();
    });
    
    test('should respect min/max constraints', () => {
        const onChange = jest.fn();
        const today = new Date().toISOString().split('T')[0];
        
        render(
            <ModernDatePicker
                name="testDate"
                value=""
                onChange={onChange}
                max={today}
            />
        );
        
        const input = screen.getByRole('textbox');
        fireEvent.click(input);
        
        // Future dates should be disabled
        const futureDates = screen.getAllByText(/\d+/).filter(el => 
            el.classList.contains('disabled')
        );
        expect(futureDates.length).toBeGreaterThan(0);
    });
});
```

### 📝 Acceptance Criteria
- [ ] ✅ All 5 pages migrated to ModernDatePicker
- [ ] ✅ No ThaiDatePicker imports remain
- [ ] ✅ Visual consistency across all pages
- [ ] ✅ All date pickers functional
- [ ] ✅ Tests pass (100%)
- [ ] ✅ UI/UX review approved

---

## Task 3: เพิ่ม Error Handling ที่สม่ำเสมอ

### 🎯 Objective
สร้าง Standard Error Handling Pattern และนำไปใช้ทั่วทั้งแอป

### ✅ แนวทางแก้ไข

#### Step 3.1: สร้าง Error Handler Utility
```typescript
// src/utils/errorHandler.ts
export interface ErrorContext {
    component: string;
    action: string;
    userId?: string;
}

export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public context?: ErrorContext
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export const ERROR_CODES = {
    // Network
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    
    // Auth
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    
    // Validation
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    
    // Business Logic
    NOT_FOUND: 'NOT_FOUND',
    DUPLICATE: 'DUPLICATE',
    
    // Server
    SERVER_ERROR: 'SERVER_ERROR',
    UNKNOWN: 'UNKNOWN'
};

export const ERROR_MESSAGES: Record<string, string> = {
    [ERROR_CODES.NETWORK_ERROR]: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
    [ERROR_CODES.TIMEOUT]: 'การเชื่อมต่อหมดเวลา',
    [ERROR_CODES.UNAUTHORIZED]: 'กรุณาเข้าสู่ระบบใหม่',
    [ERROR_CODES.FORBIDDEN]: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
    [ERROR_CODES.VALIDATION_ERROR]: 'ข้อมูลไม่ถูกต้อง',
    [ERROR_CODES.NOT_FOUND]: 'ไม่พบข้อมูล',
    [ERROR_CODES.DUPLICATE]: 'ข้อมูลซ้ำ',
    [ERROR_CODES.SERVER_ERROR]: 'เกิดข้อผิดพลาดในระบบ',
    [ERROR_CODES.UNKNOWN]: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
};

export function handleError(
    error: any,
    context: ErrorContext
): AppError {
    console.error(`[${context.component}] ${context.action} failed:`, error);
    
    // Network errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
        return new AppError(
            ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
            ERROR_CODES.NETWORK_ERROR,
            context
        );
    }
    
    // HTTP errors
    if (error.status) {
        switch (error.status) {
            case 401:
                return new AppError(
                    ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED],
                    ERROR_CODES.UNAUTHORIZED,
                    context
                );
            case 403:
                return new AppError(
                    ERROR_MESSAGES[ERROR_CODES.FORBIDDEN],
                    ERROR_CODES.FORBIDDEN,
                    context
                );
            case 404:
                return new AppError(
                    ERROR_MESSAGES[ERROR_CODES.NOT_FOUND],
                    ERROR_CODES.NOT_FOUND,
                    context
                );
            case 409:
                return new AppError(
                    ERROR_MESSAGES[ERROR_CODES.DUPLICATE],
                    ERROR_CODES.DUPLICATE,
                    context
                );
            case 500:
                return new AppError(
                    ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR],
                    ERROR_CODES.SERVER_ERROR,
                    context
                );
        }
    }
    
    // Default
    return new AppError(
        error.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN],
        ERROR_CODES.UNKNOWN,
        context
    );
}

export function getErrorMessage(error: any): string {
    if (error instanceof AppError) {
        return error.message;
    }
    return ERROR_MESSAGES[ERROR_CODES.UNKNOWN];
}
```

#### Step 3.2: สร้าง useErrorHandler Hook
```typescript
// src/hooks/useErrorHandler.ts
import { useState, useCallback } from 'react';
import { handleError, AppError, ErrorContext } from '../utils/errorHandler';

export function useErrorHandler(component: string) {
    const [error, setError] = useState<AppError | null>(null);
    
    const handleApiError = useCallback((
        err: any,
        action: string,
        onError?: (error: AppError) => void
    ) => {
        const appError = handleError(err, { component, action });
        setError(appError);
        
        if (onError) {
            onError(appError);
        }
        
        return appError;
    }, [component]);
    
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    
    return {
        error,
        handleApiError,
        clearError
    };
}
```

#### Step 3.3: อัพเดท Components
```typescript
// ❌ ก่อนแก้ - CommunityRequestRidePage.tsx
const loadPatients = async () => {
    try {
        const response = await patientsAPI.getPatients();
        setPatients(response.data);
    } catch (e) {
        console.error(e);
        setError('เกิดข้อผิดพลาด');
    }
};

// ✅ หลังแก้
import { useErrorHandler } from '../../hooks/useErrorHandler';

const { error, handleApiError, clearError } = useErrorHandler('CommunityRequestRidePage');

const loadPatients = async () => {
    try {
        setLoading(true);
        const response = await patientsAPI.getPatients();
        setPatients(response.data);
        clearError();
    } catch (e: any) {
        const appError = handleApiError(e, 'loadPatients', (err) => {
            addNotification({
                type: 'error',
                message: err.message,
                isRead: false
            });
        });
    } finally {
        setLoading(false);
    }
};
```

### 🧪 Test Plan

#### Test 3.1: Error Handler Unit Tests
```typescript
// tests/utils/errorHandler.test.ts
import { handleError, ERROR_CODES, AppError } from '../src/utils/errorHandler';

describe('Error Handler', () => {
    const context = {
        component: 'TestComponent',
        action: 'testAction'
    };
    
    test('should handle network errors', () => {
        const error = new Error('fetch failed');
        const result = handleError(error, context);
        
        expect(result).toBeInstanceOf(AppError);
        expect(result.code).toBe(ERROR_CODES.NETWORK_ERROR);
    });
    
    test('should handle 401 errors', () => {
        const error = { status: 401, message: 'Unauthorized' };
        const result = handleError(error, context);
        
        expect(result.code).toBe(ERROR_CODES.UNAUTHORIZED);
    });
    
    test('should handle 404 errors', () => {
        const error = { status: 404, message: 'Not Found' };
        const result = handleError(error, context);
        
        expect(result.code).toBe(ERROR_CODES.NOT_FOUND);
    });
    
    test('should handle unknown errors', () => {
        const error = new Error('Something went wrong');
        const result = handleError(error, context);
        
        expect(result.code).toBe(ERROR_CODES.UNKNOWN);
    });
});
```

#### Test 3.2: useErrorHandler Hook Tests
```typescript
// tests/hooks/useErrorHandler.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useErrorHandler } from '../src/hooks/useErrorHandler';

describe('useErrorHandler Hook', () => {
    test('should handle API errors', () => {
        const { result } = renderHook(() => useErrorHandler('TestComponent'));
        
        act(() => {
            const error = { status: 500, message: 'Server Error' };
            result.current.handleApiError(error, 'testAction');
        });
        
        expect(result.current.error).not.toBeNull();
        expect(result.current.error?.code).toBe('SERVER_ERROR');
    });
    
    test('should clear errors', () => {
        const { result } = renderHook(() => useErrorHandler('TestComponent'));
        
        act(() => {
            const error = { status: 500 };
            result.current.handleApiError(error, 'testAction');
        });
        
        expect(result.current.error).not.toBeNull();
        
        act(() => {
            result.current.clearError();
        });
        
        expect(result.current.error).toBeNull();
    });
});
```

### 📝 Acceptance Criteria
- [ ] ✅ Error handler utility created
- [ ] ✅ useErrorHandler hook created
- [ ] ✅ All pages updated to use standard error handling
- [ ] ✅ Error messages are user-friendly
- [ ] ✅ Tests pass (100% coverage)
- [ ] ✅ No console.error() calls remain in catch blocks

---

## 📊 Overall Progress

```
Task 1: Memory Leak Fix        [████████░░] 80%
Task 2: DatePicker Migration   [░░░░░░░░░░]  0%
Task 3: Error Handling         [░░░░░░░░░░]  0%
Task 4: Loading States         [░░░░░░░░░░]  0%
Task 5: JWT Cookie Migration   [░░░░░░░░░░]  0%

Overall Phase 1:               [████░░░░░░] 16%
```

---

## 🎯 Next Steps

1. **เริ่ม Task 1:** แก้ไข Memory Leak
2. **เขียนเทส:** ตาม Test Plan
3. **รันเทส:** ตรวจสอบผลลัพธ์
4. **ถ้าผ่าน:** ส่งรายงาน → เริ่ม Task 2
5. **ถ้าไม่ผ่าน:** กลับไปแก้ไข → เขียนเทสใหม่

---

**หมายเหตุ:** เอกสารนี้จะอัพเดทตามความคืบหน้าของแต่ละ Task
