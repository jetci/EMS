# Database Schema

This document outlines the database schema designed to support the EMS application.




## 1. Users & Authentication

### `users` table

Stores core information for all users across different roles.

| Column              | Data Type          | Constraints                                    | Description                                      |
|---------------------|--------------------|------------------------------------------------|--------------------------------------------------|
| `id`                | `UUID`             | Primary Key, Default: `gen_random_uuid()`      | Unique identifier for the user.                  |
| `name`              | `VARCHAR(255)`     | Not Null                                       | Full name of the user.                           |
| `email`             | `VARCHAR(255)`     | Not Null, Unique                               | User's email address, used for login.            |
| `password_hash`     | `VARCHAR(255)`     | Not Null                                       | Hashed password for authentication.              |
| `role`              | `VARCHAR(50)`      | Not Null                                       | User role (e.g., 'admin', 'office', 'driver').   |
| `phone`             | `VARCHAR(50)`      | Nullable                                       | User's contact phone number.                     |
| `profile_image_url` | `VARCHAR(255)`     | Nullable                                       | URL for the user's profile picture.              |
| `status`            | `VARCHAR(20)`      | Not Null, Default: `'Active'`                  | User account status ('Active', 'Inactive').      |
| `created_at`        | `TIMESTAMPTZ`      | Not Null, Default: `NOW()`                     | Timestamp of when the user was created.          |
| `updated_at`        | `TIMESTAMPTZ`      | Not Null, Default: `NOW()`                     | Timestamp of the last update.                    |

### `driver_profiles` table

Stores additional information specific to users with the 'driver' role.

| Column             | Data Type       | Constraints                               | Description                                      |
|--------------------|-----------------|-------------------------------------------|--------------------------------------------------|
| `user_id`          | `UUID`          | Primary Key, Foreign Key to `users(id)`   | Links to the corresponding user in the `users` table. |
| `license_plate`    | `VARCHAR(50)`   | Not Null                                  | Vehicle license plate.                           |
| `address`          | `TEXT`          | Nullable                                  | Driver's home address.                           |
| `vehicle_id`       | `UUID`          | Foreign Key to `vehicles(id)`             | The primary vehicle assigned to the driver.      |
| `avg_review_score` | `DECIMAL(3, 2)` | Not Null, Default: `5.00`                 | Driver's average rating from completed rides.    |
| `date_created`     | `TIMESTAMPTZ`   | Not Null, Default: `NOW()`                | Timestamp of when the driver profile was created.|



## 2. Patients & Rides

### `patients` table

Stores comprehensive information about patients under care.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | Primary Key, Default: `gen_random_uuid()` | Unique identifier for the patient. |
| `full_name` | `VARCHAR(255)` | Not Null | Patient's full name. |
| `profile_image_url` | `VARCHAR(255)` | Nullable | URL for the patient's profile picture. |
| `title` | `VARCHAR(50)` | Not Null | Patient's title (e.g., 'นาย', 'นาง'). |
| `gender` | `VARCHAR(50)` | Nullable | Patient's gender. |
| `national_id` | `VARCHAR(20)` | Nullable, Unique | Patient's national ID number. |
| `dob` | `DATE` | Nullable | Patient's date of birth. |
| `age` | `INT` | Nullable | Patient's age. |
| `patient_types` | `JSONB` | Nullable | Array of patient type tags (e.g., 'ผู้สูงอายุ'). |
| `blood_type` | `VARCHAR(10)` | Nullable | Patient's blood type. |
| `rh_factor` | `VARCHAR(10)` | Nullable | Patient's Rh factor. |
| `health_coverage` | `VARCHAR(100)` | Nullable | Health coverage information. |
| `chronic_diseases` | `JSONB` | Nullable | Array of chronic diseases. |
| `allergies` | `JSONB` | Nullable | Array of known allergies. |
| `contact_phone` | `VARCHAR(50)` | Not Null | Patient's primary contact number. |
| `id_card_address` | `JSONB` | Nullable | Address as per the ID card. |
| `current_address` | `JSONB` | Not Null | Current residential address. |
| `landmark` | `TEXT` | Nullable | Nearby landmark for the address. |
| `latitude` | `DECIMAL(9, 6)` | Nullable | GPS latitude. |
| `longitude` | `DECIMAL(9, 6)` | Nullable | GPS longitude. |
| `registered_date` | `TIMESTAMPTZ` | Not Null, Default: `NOW()` | Date of registration. |
| `registered_by_id` | `UUID` | Not Null, Foreign Key to `users(id)` | The community user who registered the patient. |
| `key_info` | `TEXT` | Nullable | A summary of key medical information. |
| `caregiver_name` | `VARCHAR(255)` | Nullable | Name of the primary caregiver. |
| `caregiver_phone` | `VARCHAR(50)` | Nullable | Phone number of the primary caregiver. |

### `rides` table

Stores information for each ride request.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | Primary Key, Default: `gen_random_uuid()` | Unique identifier for the ride. |
| `patient_id` | `UUID` | Not Null, Foreign Key to `patients(id)` | The patient for whom the ride is requested. |
| `requester_id` | `UUID` | Not Null, Foreign Key to `users(id)` | The user who requested the ride. |
| `pickup_location` | `TEXT` | Not Null | Text description of the pickup address. |
| `destination` | `VARCHAR(255)` | Not Null | Destination of the ride (e.g., hospital name). |
| `appointment_time` | `TIMESTAMPTZ` | Not Null | Scheduled appointment time at the destination. |
| `status` | `VARCHAR(50)` | Not Null, Default: `'PENDING'` | Current status of the ride. |
| `driver_id` | `UUID` | Nullable, Foreign Key to `users(id)` | The assigned driver for the ride. |
| `vehicle_id` | `UUID` | Nullable, Foreign Key to `vehicles(id)` | The assigned vehicle for the ride. |
| `special_needs` | `JSONB` | Nullable | Array of special requirements for the ride. |
| `caregiver_count` | `INT` | Not Null, Default: 0 | Number of caregivers accompanying the patient. |
| `rating` | `INT` | Nullable | Rating given by the user after completion (1-5). |
| `review_tags` | `JSONB` | Nullable | Array of tags from the post-ride review. |
| `review_comment` | `TEXT` | Nullable | User's comment from the post-ride review. |
| `created_at` | `TIMESTAMPTZ` | Not Null, Default: `NOW()` | Timestamp of when the ride was created. |
| `updated_at` | `TIMESTAMPTZ` | Not Null, Default: `NOW()` | Timestamp of the last update. |

