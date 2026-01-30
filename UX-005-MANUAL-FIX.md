# UX-005 Manual Fix Guide

## File: `pages/OfficeManageRidesPage.tsx`

**Status:** 95% Complete - Manual edit needed (2 minutes)

---

## What's Already Done ✅

```typescript
// Line 31: searching state is already added
const [searching, setSearching] = useState(false);
```

---

## Manual Edits Needed (2 changes)

### 1. Add Import (Line ~21)

**Add this line after line 20:**

```typescript
import LoadingSpinner from '../components/LoadingSpinner';
```

**Full context:**
```typescript
import WheelchairIcon from '../components/icons/WheelchairIcon';
import LoadingSpinner from '../components/LoadingSpinner';  // ← ADD THIS

const ITEMS_PER_PAGE = 10;
```

---

### 2. Update Search Input (Lines ~157-160)

**Replace:**
```typescript
                    <div className="xl:col-span-2">
                        <label className="text-xs font-medium text-gray-600">ค้นหา</label>
                        <input type="text" placeholder="ชื่อผู้ป่วย หรือ Ride ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
```

**With:**
```typescript
                    <div className="xl:col-span-2">
                        <label className="text-xs font-medium text-gray-600">ค้นหา</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="text" 
                                placeholder="ชื่อผู้ป่วย หรือ Ride ID..." 
                                value={searchTerm} 
                                onChange={e => {
                                    setSearching(true);
                                    setSearchTerm(e.target.value);
                                    setTimeout(() => setSearching(false), 300);
                                }} 
                                className="flex-1"
                            />
                            {searching && <LoadingSpinner size="sm" />}
                        </div>
                    </div>
```

---

## How to Apply

### Option 1: Manual Edit (Recommended)
1. Open `pages/OfficeManageRidesPage.tsx`
2. Add import at line ~21
3. Update search input at lines ~157-160
4. Save file

### Option 2: Copy-Paste
1. Find the exact lines mentioned above
2. Copy the "With:" code
3. Replace the "Replace:" code
4. Save file

---

## Verification

After making changes, verify:

1. ✅ No TypeScript errors
2. ✅ Import resolves correctly
3. ✅ Search input shows loading spinner when typing
4. ✅ Loading spinner disappears after 300ms

---

## Why Manual Edit?

The file has CRLF line endings that cause issues with automated editing tools. Manual editing ensures clean, error-free changes.

---

## Time Required

⏱️ **2 minutes**

---

## After Completion

This will complete **UX-005: Search Loading Indicator** at **100%**!

All 4 files will have search loading indicators:
- ✅ ManagePatientsPage.tsx
- ✅ OfficeManagePatientsPage.tsx
- ✅ ManageRidesPage.tsx
- ✅ OfficeManageRidesPage.tsx (after manual fix)

---

**Status:** Ready for manual edit  
**Priority:** Low (feature is 95% functional)  
**Impact:** Minor UX improvement
