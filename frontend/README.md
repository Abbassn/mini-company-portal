# Mini Company Portal Frontend

React frontend for a secured multi-company employee portal with JWT authentication, role-based navigation, employee management, salary review workflows, and professional dashboard-style UI.

This frontend integrates with the Mini Company Portal backend API and demonstrates a realistic business application flow: authenticated users access role-specific dashboards, ADMIN and HR users manage employee records, and salary review actions are controlled through backend authorization rules.

The project uses fictional data only. It is an independent public-safe implementation and does not include real company data, proprietary client logic, private schemas, production credentials, or confidential business workflows.

---

## Overview

Mini Company Portal is a business-style full-stack application designed around authenticated employee and salary management.

The frontend handles:

```txt
User login
→ JWT and user data storage
→ protected React routes
→ Axios requests with Authorization header
→ role-based navigation and page content
→ form validation and backend error display
→ employee and salary review workflows
```

The backend remains responsible for real security, including authentication, authorization, company isolation, ownership rules, and validation.

---

## Core Frontend Capabilities

* JWT login flow
* Protected routes
* Expired token detection
* Axios Authorization header interceptor
* Role-aware navigation
* ADMIN, HR, and EMPLOYEE dashboard views
* Current user profile page
* Employee list and employee details pages
* ADMIN-only user creation flow
* ADMIN/HR employee profile creation
* ADMIN/HR employee profile update
* Salary review list by role
* ADMIN/HR salary review creation
* ADMIN salary review approval and rejection
* EMPLOYEE own salary review view
* Loading, success, validation, and backend error states
* Responsive dashboard-style UI
* Clean CSS styling without external UI frameworks

---

## Tech Stack

* React
* Vite
* React Router
* Axios
* JavaScript
* CSS
* localStorage

No Redux, Tailwind, UI component framework, or external state management library is used.

---

## Frontend Architecture

```txt
src/
  api/
    axiosClient.js
    authApi.js
    employeesApi.js
    salaryReviewsApi.js
    usersApi.js

  auth/
    authStorage.js
    ProtectedRoute.jsx

  components/
    layout/
      AppLayout.jsx

  pages/
    LoginPage.jsx
    DashboardPage.jsx
    EmployeesPage.jsx
    EmployeeDetailsPage.jsx
    SalaryReviewsPage.jsx
    ProfilePage.jsx
    NotFoundPage.jsx

  App.jsx
  App.css
  index.css
  main.jsx
```

### `api/`

Contains dedicated API helper functions for backend communication.

The frontend does not call Axios directly from every component. API calls are centralized into files such as:

* `authApi.js`
* `employeesApi.js`
* `salaryReviewsApi.js`
* `usersApi.js`

### `auth/`

Contains authentication storage and route protection.

* `authStorage.js` manages token/user storage, logout clearing, and expired token checks.
* `ProtectedRoute.jsx` blocks unauthenticated access to protected pages.

### `components/layout/`

Contains the authenticated application shell, including the navbar and shared layout.

### `pages/`

Contains route-level page components for login, dashboard, employees, salary reviews, profile, and not-found handling.

---

## Authentication Flow

The login flow is handled through the backend API.

```txt
User enters email/password
→ React sends credentials to POST /api/auth/login
→ backend validates credentials
→ backend returns JWT and user object
→ React stores token and user in localStorage
→ user is redirected to the dashboard
```

Protected requests are sent through `axiosClient`, which automatically attaches the token:

```txt
Authorization: Bearer <token>
```

The frontend also checks token expiration before allowing protected route access.

---

## Protected Routes

The app uses React Router with a protected route wrapper.

Protected pages include:

```txt
/dashboard
/employees
/employees/:id
/salary-reviews
/profile
```

Unauthenticated users are redirected to:

```txt
/login
```

Frontend route protection improves user experience, while the backend remains the source of truth for real access control.

---

## Role-Based UI

The frontend adapts navigation, dashboard cards, forms, and actions based on the authenticated user's role.

| Role     | Frontend Capabilities                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| ADMIN    | Create users, create employee profiles, update employees, view salary reviews, approve/reject salary reviews |
| HR       | Create employee profiles, update employees, create salary reviews, view salary reviews                       |
| EMPLOYEE | View profile and own salary reviews                                                                          |

The UI hides actions that do not apply to the current role, but backend authorization remains mandatory for every protected API request.

---

## Routes

| Route             | Description                           | Access              |
| ----------------- | ------------------------------------- | ------------------- |
| `/login`          | Login page                            | Public              |
| `/dashboard`      | Role-based dashboard                  | Authenticated       |
| `/employees`      | Employee management and employee list | ADMIN, HR           |
| `/employees/:id`  | Employee details and update form      | ADMIN, HR           |
| `/salary-reviews` | Salary review workflow                | ADMIN, HR, EMPLOYEE |
| `/profile`        | Current user profile                  | Authenticated       |
| `*`               | Not found page                        | Public fallback     |

---

## API Integration

The frontend integrates with the backend through `axiosClient`.

Default API base URL:

```txt
http://localhost:3000/api
```

### Auth API

| Function         | Method | Endpoint      |
| ---------------- | ------ | ------------- |
| `loginUser`      | POST   | `/auth/login` |
| `getCurrentUser` | GET    | `/auth/me`    |

### Users API

| Function     | Method | Endpoint |
| ------------ | ------ | -------- |
| `createUser` | POST   | `/users` |

### Employees API

| Function          | Method | Endpoint         |
| ----------------- | ------ | ---------------- |
| `getEmployees`    | GET    | `/employees`     |
| `getEmployeeById` | GET    | `/employees/:id` |
| `createEmployee`  | POST   | `/employees`     |
| `updateEmployee`  | PATCH  | `/employees/:id` |

### Salary Reviews API

| Function              | Method | Endpoint                      |
| --------------------- | ------ | ----------------------------- |
| `getSalaryReviews`    | GET    | `/salary-reviews`             |
| `getMySalaryReviews`  | GET    | `/salary-reviews/me`          |
| `createSalaryReview`  | POST   | `/salary-reviews`             |
| `approveSalaryReview` | PATCH  | `/salary-reviews/:id/approve` |
| `rejectSalaryReview`  | PATCH  | `/salary-reviews/:id/reject`  |

---

## User and Employee Management Flow

The frontend follows the backend's separation between login accounts and employee profiles.

```txt
ADMIN creates a login user
→ ADMIN or HR creates an employee profile linked to that user's userId
→ employee profile appears in the employee list
→ ADMIN or HR can update employee profile fields
```

### Create User

`POST /api/users`

Request fields:

```json
{
  "fullName": "Employee User",
  "email": "employee@company.com",
  "password": "123456",
  "role": "EMPLOYEE"
}
```

The frontend supports creating HR and EMPLOYEE users from the authenticated ADMIN account.

### Create Employee Profile

`POST /api/employees`

Request fields:

```json
{
  "userId": 6,
  "fullName": "Employee User",
  "department": "IT",
  "jobTitle": "Developer",
  "baseSalary": 1000,
  "marketMidpoint": 1200,
  "workingDays": 22,
  "absentDays": 0
}
```

The frontend uses `userId`, not `user_id`, matching the backend validator.

### Update Employee Profile

`PATCH /api/employees/:id`

Request fields:

```json
{
  "fullName": "Employee User",
  "department": "Engineering",
  "jobTitle": "Backend Developer",
  "marketMidpoint": 1300,
  "workingDays": 22,
  "absentDays": 1
}
```

The update form does not send `baseSalary` or `userId`. Salary changes are handled through the salary review workflow.

---

## Salary Review Workflow

Salary changes are handled through a controlled review and approval process.

```txt
ADMIN or HR creates a salary review
→ review status is PENDING
→ ADMIN approves or rejects the review
→ approved review updates employee base salary
```

### Create Salary Review

`POST /api/salary-reviews`

Request fields:

```json
{
  "employeeId": 1,
  "proposedSalary": 1300,
  "reason": "Performance increase"
}
```

### Role Behavior

| Role     | Salary Review Behavior                                               |
| -------- | -------------------------------------------------------------------- |
| ADMIN    | View company reviews, create reviews, approve/reject pending reviews |
| HR       | View company reviews and create reviews                              |
| EMPLOYEE | View only own salary reviews                                         |

The frontend shows approve/reject actions only for ADMIN users and only when the review status is `PENDING`.

---

## Validation and Error Handling

The frontend includes client-side validation for forms such as:

* login
* user creation
* employee profile creation
* employee profile update
* salary review creation

Validation errors are displayed in the UI before requests are sent.

Backend validation and authorization errors are also displayed clearly, including:

* `400 Bad Request`
* `401 Unauthorized`
* `403 Forbidden`
* `404 Not Found`

This keeps the UI user-friendly while still relying on the backend for real validation and security enforcement.

---

## Security Model

The frontend does not act as the security boundary.

Frontend responsibilities:

* Store JWT and user data after login
* Attach token to API requests
* Protect routes for user experience
* Hide role-inappropriate UI actions
* Display backend errors clearly

Backend responsibilities:

* Verify JWT tokens
* Enforce role authorization
* Enforce company-level data isolation
* Validate request bodies
* Prevent unauthorized access even if API calls are made manually

This separation ensures that UI behavior improves usability while backend middleware and services protect the actual data.

---

## UI/UX

The frontend uses a professional dashboard-style layout built with plain CSS.

Implemented UI patterns include:

* Branded login page
* Responsive app shell
* Active navigation states
* Role-based dashboard cards
* Management forms inside cards
* Employee table
* Salary review table
* Status badges
* Success and error alerts
* Styled primary, secondary, and danger buttons
* Responsive form grids
* Scrollable tables for smaller screens

---

## Installation

Install dependencies from the `frontend` directory:

```bash
npm install
```

---

## Run Locally

Start the frontend development server:

```bash
npm run dev
```

Default local URL:

```txt
http://localhost:5173
```

The backend should be running at:

```txt
http://localhost:3000
```

The frontend API client currently points to:

```txt
http://localhost:3000/api
```

---

## Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Lint

Run ESLint:

```bash
npm run lint
```

---

## Recommended Full Verification Flow

1. Register a new company and first ADMIN through the backend API.
2. Login from the React frontend as ADMIN.
3. Verify dashboard, profile, navigation, and protected routes.
4. Create an HR user.
5. Create an EMPLOYEE user.
6. Create an employee profile linked to the EMPLOYEE user's `userId`.
7. Confirm the employee appears in the employee table.
8. Open employee details using the View action.
9. Update employee profile fields.
10. Create a salary review for the employee.
11. Reject one pending salary review.
12. Approve another pending salary review.
13. Confirm approved salary review updates employee base salary.
14. Logout ADMIN.
15. Login as HR and verify HR can create reviews but cannot approve/reject.
16. Login as EMPLOYEE and verify only own salary reviews are visible.
17. Manually test restricted routes/actions and confirm backend returns `403 Forbidden`.

---

## Public-Safe Project Notes

This frontend is part of an independent portfolio-safe implementation.

It uses fictional data and avoids:

* real company records
* real employee data
* private business rules
* production credentials
* proprietary schemas
* confidential client logic

The project is designed to demonstrate practical frontend integration with a secured backend API in a realistic business domain.

---

## Frontend Status

The React frontend is complete for the current project scope.

Implemented and verified:

* Authentication flow
* Protected routing
* Role-based UI
* Employee management
* Salary review workflow
* API integration through Axios
* Validation and backend error display
* Professional responsive UI
