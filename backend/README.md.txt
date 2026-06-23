# Mini Company Portal Backend

Backend API for a multi-company employee portal with authentication, role-based authorization, company-level data isolation, employee management, salary calculations, and salary review workflows.

This repository is an independent public-safe implementation using fictional data. It does not include private client code, real company data, proprietary schemas, production secrets, or confidential business logic.

---

## Overview

The system supports a realistic company portal flow:

```txt
User logs in
→ backend validates credentials
→ backend returns a JWT
→ protected requests include Authorization: Bearer <token>
→ backend verifies the token
→ backend checks the user role
→ backend filters records by company_id
→ PostgreSQL returns only authorized data
```

The backend is structured around clear separation of concerns:

* Routes define API endpoints
* Controllers handle request and response flow
* Services contain business logic and database queries
* Middlewares enforce authentication and authorization
* Validators protect service logic from invalid input

---

## Core Capabilities

* Company registration with first ADMIN account
* JWT-based login
* Password hashing with bcrypt
* Role-based access control
* Company data isolation using `company_id`
* ADMIN, HR, and EMPLOYEE roles
* Employee login account management
* Employee profile creation and update
* Employee salary calculation summary
* Salary review request workflow
* Salary review approval and rejection
* Swagger/OpenAPI documentation
* PostgreSQL-backed persistence

---

## Tech Stack

* Node.js
* Express
* PostgreSQL
* JWT
* bcrypt
* dotenv
* cors
* swagger-jsdoc
* swagger-ui-express

---

## Architecture

```txt
src/
  config/
    db.js
    env.js
    swagger.js

  controllers/
    auth.controller.js
    user.controller.js
    employee.controller.js
    salaryReview.controller.js

  services/
    auth.service.js
    user.service.js
    employee.service.js
    salary.service.js
    salaryReview.service.js

  middlewares/
    auth.middleware.js
    role.middleware.js

  routes/
    auth.routes.js
    user.routes.js
    employee.routes.js
    salaryReview.routes.js

  validators/
    auth.validator.js
    user.validator.js
    employee.validator.js
    salaryReview.validator.js

  app.js
  server.js
```

### Routes

Routes define the public API surface and connect each endpoint to middleware and controller functions.

### Controllers

Controllers handle validation, service calls, and JSON responses.

### Services

Services contain business rules, PostgreSQL queries, salary calculations, approval flows, and company isolation checks.

### Middlewares

Middlewares verify JWT tokens and enforce role-based access.

### Validators

Validators check request body data before service logic runs.

---

## Authentication

Authentication is handled with JWT.

After a successful login, the backend returns a token containing:

```json
{
  "userId": 1,
  "companyId": 1,
  "role": "HR"
}
```

Protected requests must include:

```txt
Authorization: Bearer <token>
```

The backend verifies the token and attaches the authenticated user data to the request.

---

## Authorization

Authorization is role-based.

| Role     | Capabilities                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| ADMIN    | Create users, manage employees, view salary calculations, create salary reviews, approve/reject salary reviews |
| HR       | Manage employees, view salary calculations, create salary reviews, view salary reviews                         |
| EMPLOYEE | View own profile, own salary summary, and own salary review status                                             |

---

## Role Rules

### ADMIN

ADMIN users can:

* Create HR users
* Create EMPLOYEE users
* View employees in their own company
* Create employee profiles
* Update employee profile fields
* View salary calculations
* Create salary review requests
* Approve salary reviews
* Reject salary reviews

### HR

HR users can:

* View employees in their own company
* Create employee profiles linked to existing EMPLOYEE users
* Update employee profile fields
* View salary calculations
* Create salary review requests
* View salary reviews

HR users cannot:

* Create ADMIN users
* Create HR users
* Approve salary reviews
* Reject salary reviews

### EMPLOYEE

EMPLOYEE users can:

* Login
* View their own employee profile
* View their own salary summary
* View their own salary review status

EMPLOYEE users cannot:

* View all employees
* View other employee profiles
* Create employees
* Update employees
* Create salary reviews
* Approve or reject salary reviews

---

## Company Data Isolation

All company-owned data is filtered by `company_id`.

The backend does not trust company identifiers from client input.
It uses `companyId` from the authenticated JWT.

Example:

```sql
WHERE id = $1
AND company_id = $2
```

This prevents one company's users from accessing another company's employees, users, or salary reviews.

---

## User and Employee Relationship

The system separates login accounts from employee profiles.

### users table

The `users` table stores login/security data:

* Email
* Password hash
* Role
* Company ID

### employees table

The `employees` table stores employee profile and salary data:

* Department
* Job title
* Base salary
* Market midpoint
* Working days
* Absent days

### Relationship

Each employee profile must be linked to an existing EMPLOYEE user account.

```txt
employees.user_id → users.id
```

The employee creation flow is:

```txt
ADMIN creates EMPLOYEE user
→ HR or ADMIN creates employee profile using that user's userId
→ EMPLOYEE can login and access own profile
```

This prevents employee profiles from existing without login accounts.

---

## Salary Calculation

Employee responses include a salary calculation summary.

### Compa-Ratio

```txt
compaRatio = base_salary / market_midpoint * 100
```

### Daily Salary

```txt
dailySalary = base_salary / working_days
```

### Deduction

```txt
deduction = dailySalary * absent_days
```

### Final Salary

```txt
finalSalary = base_salary - deduction
```

---

## Salary Review Workflow

Salary changes follow an approval workflow.

```txt
ADMIN or HR creates a salary review
→ review status is PENDING
→ ADMIN approves or rejects the review
→ approved review updates employee base_salary
```

Employee `base_salary` cannot be updated directly from the employee update endpoint.
Salary changes are controlled through salary review approval.

---

## Database Schema

The database schema is located in:

```txt
database/schema.sql
```

### companies

Stores company records.

| Column     | Description         |
| ---------- | ------------------- |
| id         | Company identifier  |
| name       | Company name        |
| is_active  | Company active flag |
| created_at | Creation timestamp  |

### users

Stores login accounts.

| Column        | Description            |
| ------------- | ---------------------- |
| id            | User identifier        |
| company_id    | Related company        |
| full_name     | User full name         |
| email         | Login email            |
| password_hash | Hashed password        |
| role          | ADMIN, HR, or EMPLOYEE |
| is_active     | User active flag       |
| created_at    | Creation timestamp     |

### employees

Stores employee profile and salary fields.

| Column          | Description                            |
| --------------- | -------------------------------------- |
| id              | Employee identifier                    |
| company_id      | Related company                        |
| user_id         | Required linked EMPLOYEE login account |
| full_name       | Employee full name                     |
| department      | Department                             |
| job_title       | Job title                              |
| base_salary     | Current base salary                    |
| market_midpoint | Market midpoint                        |
| working_days    | Working days                           |
| absent_days     | Absence days                           |
| created_at      | Creation timestamp                     |

### salary_reviews

Stores salary review requests.

| Column          | Description                    |
| --------------- | ------------------------------ |
| id              | Salary review identifier       |
| company_id      | Related company                |
| employee_id     | Related employee               |
| created_by      | User who created the review    |
| old_salary      | Salary before review           |
| proposed_salary | Proposed salary                |
| reason          | Review reason                  |
| status          | PENDING, APPROVED, or REJECTED |
| created_at      | Creation timestamp             |

---

## API Documentation

Swagger UI is available at:

```txt
http://localhost:3000/api-docs
```

Swagger documents:

* Endpoint paths
* HTTP methods
* Request bodies
* Path parameters
* JWT authentication
* Role requirements
* Success responses
* Error responses

To test protected routes in Swagger:

1. Login using `/api/auth/login`
2. Copy the returned JWT token
3. Click `Authorize`
4. Paste the token
5. Execute protected requests

---

## API Overview

### Auth

| Method | Endpoint                     | Access        | Description                      |
| ------ | ---------------------------- | ------------- | -------------------------------- |
| POST   | `/api/auth/register-company` | Public        | Register company and first ADMIN |
| POST   | `/api/auth/login`            | Public        | Login and receive JWT            |
| GET    | `/api/auth/me`               | Authenticated | Get current authenticated user   |

### Users

| Method | Endpoint     | Access | Description                |
| ------ | ------------ | ------ | -------------------------- |
| POST   | `/api/users` | ADMIN  | Create HR or EMPLOYEE user |

### Employees

| Method | Endpoint             | Access    | Description                                                 |
| ------ | -------------------- | --------- | ----------------------------------------------------------- |
| GET    | `/api/employees`     | ADMIN, HR | List company employees                                      |
| POST   | `/api/employees`     | ADMIN, HR | Create employee profile linked to an existing EMPLOYEE user |
| GET    | `/api/employees/me`  | EMPLOYEE  | Get own employee profile                                    |
| GET    | `/api/employees/:id` | ADMIN, HR | Get employee by ID                                          |
| PATCH  | `/api/employees/:id` | ADMIN, HR | Update employee profile fields                              |

### Salary Reviews

| Method | Endpoint                          | Access    | Description                  |
| ------ | --------------------------------- | --------- | ---------------------------- |
| GET    | `/api/salary-reviews`             | ADMIN, HR | List company salary reviews  |
| POST   | `/api/salary-reviews`             | ADMIN, HR | Create salary review request |
| GET    | `/api/salary-reviews/me`          | EMPLOYEE  | Get own salary reviews       |
| PATCH  | `/api/salary-reviews/:id/approve` | ADMIN     | Approve salary review        |
| PATCH  | `/api/salary-reviews/:id/reject`  | ADMIN     | Reject salary review         |

---

## Employee Creation Flow

Employee profiles require an existing EMPLOYEE user account.

### Step 1 — ADMIN creates EMPLOYEE user

```http
POST /api/users
```

Example request:

```json
{
  "fullName": "Employee User",
  "email": "employee@company.com",
  "password": "123456",
  "role": "EMPLOYEE"
}
```

Example response includes the new user ID:

```json
{
  "message": "User created successfully",
  "data": {
    "id": 6,
    "company_id": 1,
    "full_name": "Employee User",
    "email": "employee@company.com",
    "role": "EMPLOYEE"
  }
}
```

### Step 2 — HR or ADMIN creates employee profile

```http
POST /api/employees
```

Example request:

```json
{
  "userId": 6,
  "fullName": "Employee User",
  "department": "IT",
  "jobTitle": "Developer",
  "baseSalary": 1000,
  "marketMidpoint": 1200,
  "workingDays": 22,
  "absentDays": 1
}
```

The request body uses camelCase field names.

Correct:

```json
{
  "userId": 6
}
```

Incorrect:

```json
{
  "user_id": 6
}
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/mini_company_portal
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:5173
```

---

## Installation

```bash
npm install
```

---

## Run Locally

```bash
npm run dev
```

Default local server:

```txt
http://localhost:3000
```

---

## Error Handling

The API uses consistent HTTP status codes.

### 400 Bad Request

Returned when request validation fails.

```json
{
  "message": "Validation failed",
  "errors": [
    "Email is required",
    "Password is required"
  ]
}
```

Employee creation example with wrong field name:

```json
{
  "message": "Validation failed",
  "errors": [
    "Use userId, not user_id",
    "Employee userId is required"
  ]
}
```

### 401 Unauthorized

Returned when authentication fails.

Common cases:

* Missing token
* Invalid token format
* Invalid token
* Expired token
* Invalid login credentials

```json
{
  "message": "Unauthorized: missing token"
}
```

### 403 Forbidden

Returned when the authenticated user does not have the required role.

```json
{
  "message": "Forbidden: you do not have permission"
}
```

### 404 Not Found

Returned when a resource does not exist within the authenticated user's company.

```json
{
  "message": "Employee not found in your company"
}
```

Employee creation example when the linked EMPLOYEE user does not exist in the authenticated user's company:

```json
{
  "message": "Employee user account not found in your company"
}
```

### 500 Server Error

Returned for unexpected server errors.

```json
{
  "message": "Server error"
}
```

---

## Validation Rules

### Auth

* Company name is required for company registration
* Full name is required
* Email is required
* Password is required
* Password must be at least 6 characters

### Users

* Full name is required
* Email is required
* Password is required
* Role is required
* ADMIN can create HR or EMPLOYEE users

### Employees

Employee creation requires:

* `userId` is required
* `userId` must be a positive integer
* `userId` must belong to an existing EMPLOYEE user in the authenticated user's company
* Request body must use `userId`, not `user_id`
* Full name is required
* Department is required
* Job title is required
* Base salary must be greater than 0
* Market midpoint must be greater than 0
* Working days must be greater than 0
* Absent days must be equal to or greater than 0

Employee update supports partial updates.

Restricted update fields:

* `baseSalary` cannot be updated directly
* `userId` cannot be changed from the update endpoint

### Salary Reviews

* Employee ID is required
* Proposed salary must be greater than 0
* Reason is required
* New reviews are created with PENDING status
* Only PENDING reviews can be approved or rejected

---

## Security Notes

* Passwords are hashed using bcrypt
* Protected APIs require JWT authentication
* Role authorization is enforced on protected routes
* Company-owned records are filtered by `company_id`
* `companyId` is taken from the authenticated token, not from request input
* Employee profiles must be linked to an existing EMPLOYEE user account in the same company
* Salary updates are controlled through an approval workflow
* Public repository data is fictional and does not expose private client information

---

## API Verification Flow

Recommended manual verification flow:

1. Register a company and first ADMIN
2. Login as ADMIN
3. Call `/api/auth/me`
4. Create HR user as ADMIN
5. Create EMPLOYEE user as ADMIN
6. Login as HR
7. Create employee profile using the EMPLOYEE user's `userId`
8. List employees as HR
9. Get employee by ID as HR
10. Update employee profile as HR
11. Confirm direct base salary update is rejected
12. Login as EMPLOYEE
13. Confirm EMPLOYEE can access only own profile
14. Create salary review as HR
15. Confirm HR cannot approve or reject salary review
16. Approve salary review as ADMIN
17. Confirm employee base salary updates after approval
18. Confirm cross-company access is blocked

---

## Local Development Notes

* `.env` is ignored by Git
* `node_modules` is ignored by Git
* Swagger docs are served from `/api-docs`
* PostgreSQL schema is stored in `database/schema.sql`

---

## Backend Status

The backend API is complete and prepared for frontend integration.
