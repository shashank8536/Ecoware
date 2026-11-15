# EcoWare – Backend API Documentation

## 1. Introduction

EcoWare is a web-based garbage collection and management system designed to connect citizens, municipal authorities and waste collection staff.

The backend provides APIs for complaint management, staff task assignment, collection scheduling, household registration, community verification and administrative review.

This document describes the backend API structure, endpoints, authentication requirements and testing details.

## 2. Technologies Used

The backend is developed using the following technologies:

- Node.js – JavaScript runtime environment
- Express.js – Backend web framework
- MongoDB Atlas – Cloud database
- Mongoose – MongoDB object modelling
- JWT – Authentication and authorization
- Postman – API testing

## 3. Base URL

For local development:

`http://localhost:5000/api`

All API endpoints mentioned in this document are relative to this base URL.

## 4. Authentication and Authorization

EcoWare uses JWT-based authentication to protect backend API endpoints.

For protected APIs, users must provide a valid Bearer Token in the Authorization header.

**Postman configuration:**

1. Open the Authorization tab.
2. Select Bearer Token.
3. Enter the JWT received after login.
4. Send the request.

Current roles used in the authentication system:

- CITIZEN
- STAFF
- SUPERVISOR
- ADMIN

Access to API endpoints is controlled through authentication middleware and role-based authorization.

## 5. Complaint Management APIs

Base route: `/complaints`

| HTTP Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/complaints/` | Authenticated User | Register a new complaint |
| GET | `/complaints/my` | Authenticated User | View complaints submitted by the logged-in citizen |
| GET | `/complaints/` | ADMIN | View all complaints |
| PATCH | `/complaints/:id/review` | ADMIN | Review a complaint |
| PATCH | `/complaints/:id/status` | ADMIN | Update complaint status |

The complaint module allows citizens to report garbage-related problems. Administrators can access, review and manage submitted complaints.

## 6. Task Management APIs

Base route: `/tasks`

| HTTP Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/tasks/assign` | ADMIN | Assign a complaint to collection staff |
| PATCH | `/tasks/:id/link-schedule` | ADMIN | Link an existing task with a collection schedule |
| GET | `/tasks/my` | STAFF | View tasks assigned to the logged-in staff member |
| PATCH | `/tasks/:id/progress` | STAFF | Update task progress |

Task statuses:

- Assigned
- In Progress
- Completed

The task management module helps administrators distribute collection work and enables staff members to update their assigned task progress.

## 7. Collection Schedule APIs

Base route: `/schedules`

| HTTP Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/schedules/` | ADMIN | Create a collection schedule |
| GET | `/schedules/my-locality` | CITIZEN | View collection schedules for the citizen's locality |
| GET | `/schedules/` | ADMIN | View all collection schedules |
| PUT | `/schedules/:id` | ADMIN | Update an existing schedule |
| PATCH | `/schedules/:id/cancel` | ADMIN | Cancel a collection schedule |

The schedule module manages collection dates, timings, localities and assigned collection staff.

Citizens can view schedules associated with their locality, while administrators manage the collection schedules.

## 8. Household Management APIs

Base route: `/households`

| HTTP Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/households/` | ADMIN | Register a new household |
| POST | `/households/add-member` | ADMIN | Link an existing citizen to a household |
| PUT | `/households/:id` | ADMIN | Update household details |

The household management module maintains registered residential units and their associated citizen accounts.

It includes address validation and prevents duplicate active household membership.

## 9. Community Verification APIs

Base route: `/community-verification`

| HTTP Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/community-verification/submit` | CITIZEN | Submit a Yes/No collection confirmation |
| PUT | `/community-verification/threshold` | ADMIN | Update the locality-wise verification threshold |
| GET | `/community-verification/result/:scheduleId` | ADMIN, SUPERVISOR | Retrieve community verification results |

### Community Verification Process

Citizens can confirm whether scheduled garbage collection has been completed.

Available responses:

- Yes – Collection has been completed.
- No – Collection has not been completed.

The system calculates:

- Total eligible households
- Total responses received
- Yes confirmations
- No confirmations
- Non-responses
- Positive confirmation percentage

### Verification Rules

- Default positive confirmation threshold: 60%.
- Configurable threshold range: 55% to 60%.
- Each household can submit only one response per collection cycle.
- The verification window closes 12 hours after the collection staff completion update.
- Non-responses are not counted as negative confirmations.

Possible verification results:

- Community Verified
- Unverified
- Needs Review

## 10. Administrative Review APIs

Base route: `/verification-reviews`

| HTTP Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/verification-reviews/submit` | ADMIN | Submit an administrative verification decision |
| GET | `/verification-reviews/:scheduleId` | ADMIN | Retrieve an administrative review |

The administrative review module allows an administrator to examine collection evidence and record a final verification decision after the 12-hour community verification window closes.

The review contains:

- Collection schedule reference
- Reviewing administrator
- Verification decision
- Evidence review confirmation
- Review notes
- Review timestamp

Possible administrative decisions:

- Community Verified
- Unverified

## 11. Common HTTP Status Codes

| Status Code | Meaning |
|---|---|
| 200 | Request completed successfully |
| 201 | Resource created successfully |
| 400 | Invalid request or validation error |
| 401 | Authentication required |
| 403 | Access denied |
| 404 | Requested resource not found |
| 409 | Duplicate or conflicting request |
| 500 | Internal server error |

## 12. Database Models

The backend uses MongoDB with Mongoose schemas.

The main models developed for the backend modules are:

- Complaint
- Task
- Schedule
- Household
- HouseholdMember
- CommunityVerification
- VerificationSettings
- VerificationReview

The existing User model is used for authentication and references to citizens, staff and administrators.

## 13. API Testing

The backend APIs are tested using Postman.

Testing performed so far includes:

- Complaint registration and retrieval
- Staff task assignment
- Task progress update and completion
- Collection schedule creation
- Linking tasks with schedules
- Household registration
- Linking an existing citizen to a household
- Duplicate household membership prevention
- Community Yes response submission
- Duplicate community response prevention
- Community verification result calculation
- Administrative review deadline restriction
- Administrative review retrieval

Administrative review submission remains pending completion of the 12-hour verification window.

## 14. Security

The backend uses the following security mechanisms:

- JWT-based authentication
- Role-based authorization
- Protected API endpoints
- Password hashing through the existing authentication module
- Input validation
- Household membership validation
- Duplicate community response prevention

## 15. Running the Backend

Follow these steps to run the backend locally:

1. Open the project directory.
2. Navigate to the backend folder.
3. Install dependencies using:

`npm install`

4. Configure the required environment variables in the `.env` file.
5. Start the development server using:

`npm run dev`

The backend server runs on port 5000 in the current local development configuration.

## 16. Conclusion

The EcoWare backend provides the core functionality required for garbage complaint management, collection task assignment, schedule management, household registration, community verification and administrative review.

These APIs establish the foundation for integration with the EcoWare frontend and support communication between citizens, collection staff and municipal administrators.