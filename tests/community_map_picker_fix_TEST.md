# Test: Replace admin map editor with community map picker (Community role)

## Objective
Verify that community users cannot access admin map editing controls on the patient registration page and can select location using the map picker; confirm that patient creation payload includes latitude/longitude.

## Preconditions
- Backend and frontend are running (dev mode).
- Test user with `community` role exists and you can log in.
- Browser console visible for API request inspection.

## Test Steps
1. Login as a community user.
2. Navigate to `ลงทะเบียนผู้ป่วยใหม่` (CommunityRegisterPatientPage).
3. Scroll to the "ปักหมุดตำแหน่งที่อยู่ปัจจุบัน" map area.
4. Verify the map UI shows a single draggable marker and map layers control, but NO drawing toolbar (no rectangle/polygon/polyline/marker draw toolbar buttons).
5. Click on the map (or drag the marker) to select a location. Observe the coordinate display (top-left) updates.
6. Click the copy coordinates button and confirm clipboard contains `lat, lng` with 6-decimal precision.
7. Fill required patient fields and submit registration.
8. On the backend or browser network tab, observe the POST request to `/api/patients` and confirm the JSON body includes `latitude` and `longitude` values matching the selected coordinates.
9. Confirm response is 201 and patient is created; verify `created_by` equals current community user's id (in response or subsequent GET /api/patients).

## Expected Results
- Map area uses `SimpleLeafletMapPicker` (no drawing EditControl visible).
- User is able to pick coordinates via click/drag; coordinates display updates live.
- Patient creation request includes `latitude` and `longitude` and returns 201.
- No requests are made to `/api/map-data` from this flow (community users should not be creating map shapes).

## PASS/FAIL Criteria
- PASS: All expected results observed.
- FAIL: Any admin map-edit UI visible to community users, patient request missing coordinates, or POST to `/api/map-data` during registration.

## Notes / Risks
- If `LeafletMapEditor` UI is still present, this is a critical security/UX issue; rollback the change and investigate how the component was re-introduced elsewhere.
- If users require persistent community-shared shapes, design a controlled endpoint with moderation and proper RBAC rather than exposing editor in community screens.

## Next Steps on Failure
- If FAIL, open an issue, attach screenshots, and revert to previous commit; implement stricter component separation (admin vs community bundles) and add runtime role-based UI gating.
