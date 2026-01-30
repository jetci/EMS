# API Endpoint Requirements

This document outlines the required API endpoints identified from the frontend code analysis.




## Public Endpoints

### Authentication

- **`POST /api/auth/login`**: Authenticate a user.
  - **Request Body**: `{ "email": "user@example.com", "password": "string" }`
  - **Response Body**: `{ "token": "string", "user": { "id": "string", "name": "string", "email": "string", "role": "string" } }`

- **`POST /api/auth/register`**: Register a new community user.
  - **Request Body**: `{ "name": "string", "email": "user@example.com", "password": "string" }`
  - **Response Body**: `{ "message": "Registration successful" }`

### News

- **`GET /api/news`**: Get a list of all published news articles.
  - **Query Params**: `?page=1&limit=10`
  - **Response Body**: `[{ "id": "string", "title": "string", "summary": "string", "coverImage": "string", "publishedAt": "datetime" }]`

- **`GET /api/news/:articleId`**: Get a single news article by its ID.
  - **Response Body**: `{ "id": "string", "title": "string", "content": "html_string", "coverImage": "string", "author": { "name": "string" }, "publishedAt": "datetime", "tags": ["string"] }`


_self-correction: I previously missed the dashboard data. I will add it now._

## Community Role Endpoints

### Dashboard

- **`GET /api/community/stats`**: Get dashboard statistics for the logged-in community user.
  - **Response Body**: `{ "patientsInCare": 12, "pendingRequests": 3, "completedThisMonth": 28 }`

- **`GET /api/community/rides/recent`**: Get a list of recent rides for the community user.
  - **Response Body**: `[ { "id": "string", "patientName": "string", "destination": "string", "appointmentTime": "datetime", "status": "string" } ]`



### Patient Management

- **`GET /api/community/patients`**: Get a list of patients for the logged-in community user.
  - **Query Params**: `?page=1&limit=10&search=สมชาย`
  - **Response Body**: `{ "patients": [ { "id": "string", "fullName": "string", "age": "number", "keyInfo": "string", "registeredDate": "datetime" } ], "totalPages": "number" }`

- **`GET /api/community/patients/:patientId`**: Get detailed information for a specific patient.
  - **Response Body**: `Full Patient Object (see types.ts)`

- **`POST /api/community/patients`**: Register a new patient.
  - **Request Body**: `Full Patient Object (see types.ts)`
  - **Response Body**: `{ "id": "string", "message": "Patient registered successfully" }`

- **`PUT /api/community/patients/:patientId`**: Update a patient's information.
  - **Request Body**: `Partial Patient Object`
  - **Response Body**: `{ "id": "string", "message": "Patient updated successfully" }`

- **`DELETE /api/community/patients/:patientId`**: Delete a patient.
  - **Response Body**: `{ "message": "Patient deleted successfully" }`



### Ride Management

- **`GET /api/community/rides`**: Get a list of rides for the logged-in community user.
  - **Query Params**: `?page=1&limit=10&search=สมชาย&status=Pending`
  - **Response Body**: `{ "rides": [ { "id": "string", "patientName": "string", "destination": "string", "appointmentTime": "datetime", "status": "string", "driverName": "string | null" } ], "totalPages": "number" }`

- **`GET /api/community/rides/:rideId`**: Get detailed information for a specific ride.
  - **Response Body**: `Full Ride Object (see types.ts)`

- **`POST /api/community/rides`**: Create a new ride request.
  - **Request Body**: `Full Ride Object (see types.ts)`
  - **Response Body**: `{ "id": "string", "message": "Ride request created successfully" }`

- **`DELETE /api/community/rides/:rideId`**: Cancel a ride request.
  - **Response Body**: `{ "message": "Ride cancelled successfully" }`

- **`POST /api/community/rides/:rideId/rating`**: Submit a rating for a completed ride.
  - **Request Body**: `{ "rating": 5, "tags": ["string"], "comment": "string" }`
  - **Response Body**: `{ "message": "Rating submitted successfully" }`



## Driver Role Endpoints

### Jobs & Routes

- **`GET /api/driver/jobs`**: Get all assigned jobs (rides) for the logged-in driver, not just for today.
  - **Response Body**: `[ Full Ride Object (see types.ts) ]`

- **`PATCH /api/driver/rides/:rideId/status`**: Update the status of a ride.
  - **Request Body**: `{ "status": "EN_ROUTE_TO_PICKUP" | "ARRIVED_AT_PICKUP" | "IN_PROGRESS" | "COMPLETED" }`
  - **Response Body**: `{ "message": "Status updated successfully" }`

- **`POST /api/driver/optimize-route`**: Get an optimized order of ride IDs for the driver's active jobs.
  - **Request Body**: `{ "rideIds": ["string"] }`
  - **Response Body**: `{ "optimizedOrder": ["string"] }`

### History

- **`GET /api/driver/history`**: Get the ride history for the logged-in driver.
  - **Query Params**: `?page=1&limit=10&period=this_week`
  - **Response Body**: `{ "rides": [ { "id": "string", "patientName": "string", "destination": "string", "appointmentTime": "datetime", "status": "string", "earnings": "number" } ], "totalPages": "number", "stats": { "totalRides": "number", "totalEarnings": "number", "acceptanceRate": "number" } }`



## Office / Admin Role Endpoints

### Dashboard & Core Operations

- **`GET /api/office/stats`**: Get dashboard statistics for the office view.
  - **Response Body**: `{ "newRequests": 5, "todayTotalRides": 15, "availableDrivers": 8, "totalDrivers": 12, "totalPatients": 42 }`

- **`GET /api/office/rides/urgent`**: Get a list of rides that are pending and require assignment.
  - **Response Body**: `[ Full Ride Object (see types.ts) ]`

- **`GET /api/office/rides/today-schedule`**: Get the list of all rides scheduled for the current day (assigned, in-progress, etc.).
  - **Response Body**: `[ Full Ride Object (see types.ts) ]`

- **`GET /api/office/drivers/live-status`**: Get the current status and location of all drivers.
  - **Response Body**: `[ { "id": "string", "fullName": "string", "status": "string", "currentLocation": { "lat": "number", "lng": "number" }, "currentRideId": "string | null" } ]`

- **`POST /api/office/rides/:rideId/assign`**: Assign a driver to a specific ride.
  - **Request Body**: `{ "driverId": "string" }`
  - **Response Body**: `{ "message": "Driver assigned successfully" }`

