# EMS WeCare Test Suite

This directory contains PowerShell scripts for testing the EMS WeCare system APIs.

## Prerequisites
- Backend server running on `http://localhost:5000`
- PowerShell 5.1 or later

## Test Scripts

### Community Role
- `test-community-complete.ps1`: Comprehensive test for Community User workflow (Register, Login, Request Ride, Profile).

### Driver Role
- `test-driver-p0.ps1`: Basic Driver API test (Login, Profile, My Rides).
- `test-driver-flow.ps1`: Full Driver Workflow (Assign -> Accept -> Start -> Complete).

### Office Role
- `test-office-dashboard.ps1`: Office Dashboard API test.
- `test-office-management.ps1`: CRUD tests for Patients, Drivers, and Rides.
- `test-office-teams.ps1`: CRUD tests for Teams.
- `test-office-schedule.ps1`: Tests for Schedule and Vehicles.

### Admin Role
- `test-admin-users.ps1`: User Management CRUD and Reset Password.
- `test-admin-logs.ps1`: Audit Logs retrieval.

### Executive Role
- `test-executive-dashboard.ps1`: Executive Dashboard analytics.

## How to Run
Open PowerShell in this directory and run:
```powershell
.\test-community-complete.ps1
```
(Replace filename with the script you want to run)
