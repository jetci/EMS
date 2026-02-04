# 🧪 Manual Testing Guide: Logo Upload Sync Fix

## Summary of Changes
✅ Fixed: Logo upload not showing on other browsers/machines
- **Root Cause**: localStorage was blocking API data
- **Solution**: Fetch logo from API instead of localStorage

## Modified Files
1. `src/utils/settings.ts` - Added `fetchLogoFromAPI()`, removed logo from localStorage reads
2. `src/components/layout/TopHeader.tsx` - Fetch logo from API on mount + on settings change
3. `src/components/layout/Sidebar.tsx` - Fetch logo from API on mount + on settings change
4. `src/pages/AdminSystemSettingsPage.tsx` - Removed localStorage.setItem for logoUrl

---

## 🧑‍💻 Testing Procedure

### Prerequisites
- ✅ Frontend running: `npm run dev` on `localhost:5173`
- ✅ Backend running: `npm run dev` on `localhost:3001`
- Two browser windows open (or two different machines)

### Test Case 1: Logo Upload - Same Browser
**Objective**: Verify logo displays immediately after upload

**Steps**:
1. Open `http://localhost:5173` in Browser A
2. Login as Admin
3. Navigate to Settings > General > Organization Logo
4. Upload a test logo image (PNG/JPG)
5. Click "Save Settings"

**Expected Result**:
- ✅ Alert shows "บันทึกการตั้งค่าสำเร็จ!"
- ✅ Logo appears in TopHeader (top-left)
- ✅ Logo appears in Sidebar (left navigation)
- ✅ Logo persists after page refresh

---

### Test Case 2: Logo Sync - Different Browser
**Objective**: Verify logo syncs across different browser sessions WITHOUT manual refresh

**Setup**:
- Browser A: Already has admin logged in with logo uploaded (from Test Case 1)
- Browser B: Open new incognito/private window

**Steps**:
1. In **Browser A**: Upload a logo (if not already done)
2. In **Browser B**: Open `http://localhost:5173` 
3. Login with SAME admin account
4. Navigate to Dashboard or any page showing header
5. **WITHOUT refreshing**, observe TopHeader and Sidebar

**Expected Result**:
- ✅ Logo appears in Browser B's TopHeader
- ✅ Logo appears in Browser B's Sidebar
- ✅ Same logo as Browser A (no page refresh needed)
- ❌ Should NOT require page refresh to see logo

**Why this matters**: Before the fix, Browser B would show no logo until either:
- User manually refreshed the page
- Admin deleted and re-uploaded the logo

Now it should work immediately due to `fetchLogoFromAPI()` being called on component mount.

---

### Test Case 3: Logo Settings Change Event Propagation
**Objective**: Verify settings change event triggers logo fetch on ALL components

**Steps**:
1. In **Browser A**: Open Settings > General > Organization Logo
2. Upload a NEW logo (different from current one)
3. Click "Save Settings"
4. Observe Browser A TopHeader/Sidebar immediately show new logo
5. Check **Browser B** TopHeader/Sidebar

**Expected Result**:
- ✅ Browser A shows new logo immediately
- ✅ Browser B shows new logo immediately (if page is open)
- ✅ Both have identical logos
- ℹ️ If Browser B is not actively viewing, it will fetch on next navigation/page load

---

### Test Case 4: Logo Deletion Propagation
**Objective**: Verify logo deletion syncs across browsers

**Steps**:
1. In **Browser A**: Go to Settings > General > Organization Logo
2. Click "Remove Logo" button
3. Click "Save Settings"
4. Observe Browser A TopHeader/Sidebar
5. Check **Browser B** TopHeader/Sidebar

**Expected Result**:
- ✅ Browser A: Logo disappears, fallback to text initial appears
- ✅ Browser B: Logo disappears (reflects deletion)
- ✅ Both browsers show consistent state

---

### Test Case 5: Incognito/Private Window (Fresh Session)
**Objective**: Verify fresh session (no localStorage) gets logo from API

**Steps**:
1. Open incognito/private window
2. Go to `http://localhost:5173`
3. Login as any user (admin or non-admin)
4. Navigate to dashboard

**Expected Result**:
- ✅ Logo appears in TopHeader even though localStorage is empty
- ✅ Logo was fetched from API in `fetchLogoFromAPI()`
- ✅ No broken images or missing logo

**Why this matters**: This proves we're no longer dependent on localStorage for logo display.

---

### Test Case 6: Browser Refresh
**Objective**: Verify logo persists correctly after browser refresh

**Steps**:
1. Browser A with logo uploaded
2. Press F5 or Cmd+R to refresh
3. Wait for page to load completely

**Expected Result**:
- ✅ Logo appears on refresh
- ✅ No "undefined" text where logo should be
- ✅ Logo loads via API fetch, not from stale localStorage

---

### Test Case 7: Page Navigation
**Objective**: Verify logo appears on every page that uses TopHeader/Sidebar

**Steps**:
1. Login as admin with logo uploaded
2. Navigate between different pages:
   - Dashboard
   - User Management
   - Settings
   - Patient Management
   - Any other page

**Expected Result**:
- ✅ Logo visible on TopHeader of every page
- ✅ Logo visible in Sidebar on every page
- ✅ Consistent across all pages

---

## 🐛 Common Issues & Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Logo not showing after upload | API call failed silently | Check console for errors; ensure backend is running |
| Logo shows on Browser A but not B | API not called on B's component mount | Check if `useEffect` with `fetchLogoFromAPI()` executed in browser B |
| "undefined" text visible | Old localStorage data | Clear localStorage in DevTools; refresh page |
| CORS error | Backend CORS not configured | Ensure backend allows localhost:5173 |
| Logo appears then disappears | Race condition in async fetch | Check network tab timing of API call |

---

## 🔍 How to Verify the Fix is Working

**Open Browser DevTools (F12)** and:

### 1. Check Network Tab
- Upload logo in Admin Settings
- Look for `GET /api/admin/settings` calls
- Verify logo base64 data is in the response
- Verify other browsers also make this call on page load

### 2. Check Console Tab
- Search for: `Error fetching logo from API:`
- Should see no errors if working correctly
- May see console.error if fetchLogoFromAPI fails

### 3. Check Storage Tab
- Look at localStorage
- Verify `wecare_logoUrl` key is NOT present (or is being cleared)
- Other settings like `wecare_appName` should still be present

### 4. Check Application Behavior
```
Before Fix:
- localStorage.getItem('wecare_logoUrl') → ✅ (Machine A only)
- Other machine localStorage → ❌ (empty)
- Result: No logo on other machines ❌

After Fix:
- fetchLogoFromAPI() → ✅ (All machines)
- getAppSettings() ignores localStorage logoUrl → ✅
- Result: All machines get logo from API ✅
```

---

## ✅ Sign-Off Checklist

After completing all test cases, verify:

- [ ] Test 1: Logo displays immediately after upload (same browser)
- [ ] Test 2: Logo syncs WITHOUT refresh to different browser
- [ ] Test 3: Settings change event triggers logo update
- [ ] Test 4: Logo deletion propagates across browsers
- [ ] Test 5: Fresh session (incognito) gets logo from API
- [ ] Test 6: Logo persists after page refresh
- [ ] Test 7: Logo visible on all pages with TopHeader/Sidebar
- [ ] No "undefined" text visible anywhere
- [ ] No CORS errors in console
- [ ] No "Error fetching logo from API" messages

**Once all checks pass**: ✅ Fix is working correctly!

---

## 📊 Before & After Comparison

### Before Fix
```
Step 1: Admin uploads logo
├─ Saves to API ✅
└─ Saves to localStorage ✅

Step 2: Admin sees logo
├─ getAppSettings() reads localStorage ✅
└─ Logo displays ✅

Step 3: Other user opens app
├─ getAppSettings() reads localStorage (empty) ❌
├─ No logo from API fetch ❌
└─ Logo NOT displayed ❌

Step 4: Admin deletes + re-uploads
├─ Somehow triggers fresh state
└─ NOW everyone sees it ❌ (unreliable)
```

### After Fix
```
Step 1: Admin uploads logo
├─ Saves to API ✅
└─ CustomEvent dispatched ✅

Step 2: Admin sees logo
├─ TopHeader/Sidebar call fetchLogoFromAPI() ✅
├─ fetchLogoFromAPI() calls /admin/settings API ✅
└─ Logo displays from API ✅

Step 3: Other user opens app
├─ TopHeader/Sidebar useEffect runs on mount ✅
├─ fetchLogoFromAPI() called ✅
├─ Logo fetched from API ✅
└─ Logo displayed ✅ (instantly!)

Step 4: Admin changes logo
├─ CustomEvent dispatched ✅
├─ fetchLogoFromAPI() called in settingsChanged handler ✅
└─ Both browsers update ✅
```

---

## 🎯 Key Improvements
1. ✅ **Single Source of Truth**: API/Database (not distributed across localStorage)
2. ✅ **Cross-Browser Sync**: No page refresh needed
3. ✅ **Fresh Sessions**: Incognito/private windows work correctly
4. ✅ **Consistent State**: All machines show identical logo
5. ✅ **No More Hacks**: No need to delete + re-upload as workaround
