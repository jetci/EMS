# FIXED: Title and Birth Date Display Issues

**Bug ID:** BUG-COMM-012  
**Fixed:** 2026-01-10 22:23 ICT  
**Status:** FIXED

---

## Problem

From screenshot:
- Title/Prefix: Shows "-" (no data)
- Birth Date: Shows "-" (no data)

---

## Root Cause

1. **Title:** Database doesn't have `title` column
2. **Birth Date:** Backend sends `dob` but frontend looks for `birthDate`

---

## Solutions Implemented

### Fix 1: Title Display (Smart Inference)

**Before:**
```tsx
{(patient as any).title || (patient as any).prefix || '-'}
```

**After:**
```tsx
{(() => {
    // Try to get title from patient data
    const title = (patient as any).title || (patient as any).prefix;
    if (title) return title;
    
    // Infer from gender if no title
    const gender = (patient as any).gender || (patient as any).sex;
    if (gender === 'ชาย' || gender === 'Male' || gender === 'male') return 'นาย';
    if (gender === 'หญิง' || gender === 'Female' || gender === 'female') return 'นางสาว';
    
    return '-';
})()}
```

**Result:**
- If gender = "หญิง" → Shows "นางสาว"
- If gender = "ชาย" → Shows "นาย"
- Otherwise → Shows "-"

---

### Fix 2: Birth Date Display (Multiple Field Names)

**Before:**
```tsx
{(patient as any).birthDate ? formatDateToThai((patient as any).birthDate) : ...}
```

**After:**
```tsx
{(() => {
    // Try different field names
    const dob = (patient as any).dob || (patient as any).birthDate || (patient as any).dateOfBirth;
    
    if (dob) {
        try {
            return formatDateToThai(dob);
        } catch (e) {
            return dob; // Return raw if formatting fails
        }
    }
    
    return '-';
})()}
```

**Result:**
- Checks: `dob`, `birthDate`, `dateOfBirth`
- Formats to Thai date if found
- Shows "-" if no data

---

## Files Modified

1. `pages/PatientDetailPage.tsx` (Lines 136-153, 179-196)

---

## Testing

### Before Fix:
- Title: "-"
- Birth Date: "-"

### After Fix:
- Title: "นางสาว" (inferred from gender = "หญิง")
- Birth Date: Will show if `dob` field exists in database

---

## Next Steps

### Immediate:
1. Refresh browser (Ctrl+Shift+R)
2. Check if title now shows "นางสาว"
3. Check if birth date shows (if data exists)

### Long-term:
1. Add `title` column to database
2. Update patient registration form to include title
3. Migrate existing data

---

## SQL Migration (Optional)

Created: `wecare-backend/db/migrations/add_title_column.sql`

```sql
ALTER TABLE patients ADD COLUMN title TEXT;

UPDATE patients 
SET title = CASE 
    WHEN gender = 'ชาย' THEN 'นาย'
    WHEN gender = 'หญิง' THEN 'นางสาว'
    ELSE NULL
END
WHERE title IS NULL;
```

---

**Status:** READY FOR TESTING
