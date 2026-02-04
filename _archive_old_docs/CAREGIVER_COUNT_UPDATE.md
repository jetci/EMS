# Caregiver Count Input Update

## Overview
Updated the "Caregiver Count" input in the "Create Ride Request" form to default to an empty state with a placeholder, rather than pre-filling with `0`.

## Changes Made
- **File**: `d:\EMS\pages\CommunityRequestRidePage.tsx`
- **State**: Initialized `caregiverCount` as `''` (empty string) instead of `0`.
- **Input Logic**: Updated `handleChange` to allow empty strings and parse numbers correctly.
- **UI**: Added `placeholder="0"` to the input field.
- **Submission**: Ensured that an empty string is converted back to `0` when sending the payload to the API.

## Verification
- Open "Create Ride Request" page.
- The "Number of caregivers" field should be empty with a "0" placeholder.
- Typing a number works as expected.
- Submitting without typing anything sends `0` as the caregiver count.
