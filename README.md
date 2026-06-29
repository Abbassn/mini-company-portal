# Mini Company Portal

A full-stack company employee and salary review portal built with React, Express, PostgreSQL, JWT authentication, role-based authorization, and company-level data isolation.

Mini Company Portal simulates a secured multi-company business system where ADMIN, HR, and EMPLOYEE users interact with employee records and salary review workflows through protected dashboards and backend-enforced permissions.

The project uses fictional data only. It is an independent public-safe implementation and does not contain real company data, production credentials, proprietary schemas, private client logic, or confidential business workflows.

---

## Project Overview

Mini Company Portal demonstrates a realistic full-stack business application flow:

```txt
User logs in
→ backend validates credentials
→ backend returns JWT and user data
→ React stores authentication state
→ Axios sends JWT in the Authorization header
→ Express verifies the token
→ backend checks role and company_id
→ PostgreSQL returns only allowed data
→ React displays role-specific pages and actions
```

The system is built around a clear separation of responsibilities.

The frontend handles:

* professional user interface
* protected React routes
* role-aware navigation
* forms and client-side validation
* loading, success, and error states
* Axios API integration
* JWT storage and request authorization headers

The backend handles:

* authentication
* authorization
* validation
* company-level data isolation
* secure database access
* role-based business rules

Frontend hiding improves user experience, but backend authorization remains the real security boundary.

---

## Main Features

### Authentication

* Company registration with first ADMIN user
* Login with email and password
* JWT-based authentication
* Current user profile endpoint
* Protected frontend routes
* Expired token handling on the frontend
* Axios Authorization header interceptor

### Role-Based Access

The system supports three roles:

| Role     | Capabilities                                                                         |
| -------- | ------------------------------------------------------------------------------------ |
| ADMIN    | Manage users, manage employees, create salary reviews, approve/reject salary reviews |
| HR       | Manage employees, create salary reviews, view company salary reviews                 |
| EMPLOYEE | View profile and own salary reviews                                                  |

Restricted actions are enforced by the backend even if a user manually calls the API.

### Company-Level Data Isolation

The system supports multiple companies.

Each user, employee, and salary review belongs to a specific company. ADMIN and HR users can only access data from their own company. EMPLOYEE users can only access their allowed personal data.

### Employee Management

* ADMIN can create HR and EMPLOYEE users
* ADMIN and HR can create employee profiles
* ADMIN and HR can update employee profile fields
* Employee details include salary-related calculations
* Base salary is not updated directly through employee profile updates

### Salary Review Workflow

Salary changes are controlled through a review process:

```txt
ADMIN or HR creates a salary review
→ review status is PENDING
→ ADMIN approves or rejects the review
→ approved review updates employee base salary
```

This keeps salary changes auditable and role-controlled.

### Frontend UI

The React frontend includes:

* branded login page
* responsive dashboard layout
* active navigation states
* role-specific dashboard cards
* employee management forms
* employee table
* employee details page
* salary review table
* status badges
* success and error alerts
* professional CSS styling without external UI frameworks

---

## Tech Stack

### Frontend

* React
* Vite
* React Router
* Axios
* JavaScript
* CSS

### Backend

* Node.js
* Express
* PostgreSQL
* JWT
* bcrypt
* dotenv
* CORS
* Swagger/OpenAPI
* Centralized error handling

### Database

* PostgreSQL
* Multi-company schema
* Company-scoped users, employees, and salary reviews

---

## Project Structure

```txt
mini-company-portal/
  backend/
    src/
    package.json
    README.md

  frontend/
    src/
    package.json
    README.md

  database/
  .gitignore
  README.md
```

---

## Backend Architecture

The backend follows a layered structure:

```txt
Route
→ Middleware
→ Validator
→ Controller
→ Service
→ Database
```

This keeps request routing, authentication, validation, business logic, and database access separated.

Main backend areas include:

* auth
* users
* employees
* salary reviews
* role middleware
* validation
* Swagger documentation
* centralized error handling

---

## Frontend Architecture

The frontend separates page logic, API communication, authentication helpers, and layout components.

```txt
frontend/src/
  api/
  auth/
  components/
  pages/
  App.jsx
  App.css
  main.jsx
```

Main frontend areas include:

* Axios API helpers
* JWT/user localStorage handling
* protected routes
* role-aware layout
* dashboard page
* employee management pages
* salary review workflow page
* profile page
* responsive CSS UI

---

## API Documentation

Swagger/OpenAPI documentation is available when the backend server is running:

```txt
http://localhost:3000/api-docs
```

---

## Core API Areas

### Auth

```txt
POST /api/auth/register-company
POST /api/auth/login
GET  /api/auth/me
```

### Users

```txt
POST /api/users
```

### Employees

```txt
GET   /api/employees
GET   /api/employees/:id
POST  /api/employees
PATCH /api/employees/:id
```

### Salary Reviews

```txt
GET   /api/salary-reviews
GET   /api/salary-reviews/me
POST  /api/salary-reviews
PATCH /api/salary-reviews/:id/approve
PATCH /api/salary-reviews/:id/reject
```

---

## Full Local Setup

This project contains a PostgreSQL database schema, an Express backend API, and a React frontend.

### Prerequisites

Make sure these are installed:

* Node.js
* npm
* PostgreSQL
* Git

---

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mini-company-portal
```

---

### 2. Create the PostgreSQL Database

Create a local PostgreSQL database.

Example:

```bash
createdb mini_company_portal
```

Or using `psql`:

```bash
psql -U postgres
CREATE DATABASE mini_company_portal;
\q
```

---

### 3. Run the Database Schema

From the project root:

```bash
psql -U postgres -d mini_company_portal -f database/schema.sql
```

This creates the required tables, relationships, constraints, and supporting database structure.

---

### 4. Configure the Backend Environment

Go to the backend folder:

```bash
cd backend
```

Create a `.env` file:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/mini_company_portal
JWT_SECRET=change_this_secret_for_local_dev
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
```

Important:

```txt
The database name in DATABASE_URL must match the database you created.
```

---

### 5. Install and Run the Backend

From the `backend` folder:

```bash
npm install
npm run dev
```

Backend runs on:

```txt
http://localhost:3000
```

Swagger API documentation runs on:

```txt
http://localhost:3000/api-docs
```

---

### 6. Install and Run the Frontend

Open a second terminal.

From the project root:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

The frontend API client communicates with:

```txt
http://localhost:3000/api
```

---

## First Company and ADMIN Setup

The React frontend does not create the first company ADMIN.

Use Swagger or Postman:

```http
POST http://localhost:3000/api/auth/register-company
```

Example body:

```json
{
  "companyName": "Demo Company",
  "fullName": "Admin User",
  "email": "admin@demo.com",
  "password": "123456"
}
```

This creates:

```txt
company
+
first ADMIN user
```

After that, login through the frontend:

```txt
http://localhost:5173/login
```

Use:

```txt
Email: admin@demo.com
Password: 123456
```

Once logged in, the ADMIN can create HR and EMPLOYEE users from the React frontend.

---

## Full Verification Flow

Use this flow to test the full system from zero.

### 1. Register Company and ADMIN

Use Postman or Swagger:

```txt
POST /api/auth/register-company
```

Create a new company and first ADMIN.

### 2. Login as ADMIN

Login from the React frontend.

Verify:

* dashboard loads
* ADMIN role is displayed
* profile page works
* Employees link is visible
* Salary Reviews link is visible

### 3. Create HR User

From the Employees page, create an HR user.

Example:

```txt
Full Name: Demo HR
Email: hr@demo.com
Password: 123456
Role: HR
```

### 4. Create EMPLOYEE User

Create an EMPLOYEE user.

Example:

```txt
Full Name: Demo Employee
Email: employee@demo.com
Password: 123456
Role: EMPLOYEE
```

After user creation, the employee profile form can be filled using the created user's ID.

### 5. Create Employee Profile

Create an employee profile linked to the EMPLOYEE user's `userId`.

Example:

```txt
User ID: <created employee user id>
Full Name: Demo Employee
Department: IT
Job Title: Backend Developer
Base Salary: 1000
Market Midpoint: 1200
Working Days: 22
Absent Days: 0
```

Verify the employee appears in the employee table.

### 6. Open Employee Details

Click the View action from the employee table.

Verify:

* basic info appears
* salary info appears
* salary calculation appears
* update form appears for ADMIN/HR

### 7. Update Employee Profile

Update fields such as:

```txt
Department
Job Title
Market Midpoint
Working Days
Absent Days
```

The update form does not send `baseSalary` or `userId`.

### 8. Create Salary Review

From the Salary Reviews page, create a salary review.

Example:

```txt
Employee: Demo Employee
Proposed Salary: 1300
Reason: Performance increase
```

Verify the review appears with status:

```txt
PENDING
```

### 9. Reject One Review

Reject a pending review as ADMIN.

Verify:

```txt
Status becomes REJECTED
Base salary does not change
```

### 10. Approve One Review

Approve another pending review as ADMIN.

Verify:

```txt
Status becomes APPROVED
Employee base salary updates to the proposed salary
```

### 11. Login as HR

Logout ADMIN and login as HR.

Verify:

* HR can view employees
* HR can create employee profiles
* HR can update employee profiles
* HR can create salary reviews
* HR cannot approve or reject salary reviews

### 12. Login as EMPLOYEE

Logout HR and login as EMPLOYEE.

Verify:

* Employees link is hidden
* employee cannot access company employee list
* employee can view profile
* employee can view only own salary reviews
* create/approve/reject actions are hidden and protected by backend

### 13. Restricted Access Checks

Manually test restricted actions.

Examples:

```txt
EMPLOYEE tries GET /api/employees
EMPLOYEE tries POST /api/salary-reviews
HR tries PATCH /api/salary-reviews/:id/approve
```

Expected result:

```txt
401 Unauthorized or 403 Forbidden depending on auth state and role
```

---

## Development Commands

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run lint
npm run build
npm run dev
```

---

## Security Model

The frontend is not the security boundary.

Frontend responsibilities:

* store JWT and user data after login
* attach JWT to API requests
* protect routes for user experience
* hide role-inappropriate buttons and links
* display validation and backend errors clearly

Backend responsibilities:

* verify JWT tokens
* enforce role permissions
* enforce company-level isolation
* validate request bodies
* block unauthorized access
* protect data even when endpoints are called manually

This separation keeps the application secure while still providing a clean role-aware user experience.

---

## Documentation

Detailed documentation is available in:

```txt
backend/README.md
frontend/README.md
```

Use the root README for full-project overview and local setup.

Use the backend README for backend architecture, API behavior, security rules, and database details.

Use the frontend README for React structure, routes, authentication flow, UI behavior, and API integration.

---

## Public-Safe Implementation

This repository is designed as a public-safe full-stack business system.

It avoids:

* real employee data
* real salary data
* real company records
* production credentials
* proprietary business logic
* confidential schemas
* private client workflows

All data used for testing and demonstration should be fictional.

---

## Status

The current project scope is complete:

* Backend API
* PostgreSQL integration
* JWT authentication
* Role-based authorization
* Company-level data isolation
* Swagger API documentation
* React frontend
* Protected routes
* Role-based UI
* Employee management
* Salary review workflow
* Professional responsive UI
* Backend README
* Frontend README
* Root project README

---

## Purpose

This project demonstrates practical full-stack engineering using a realistic business domain.

It shows how React, Express, PostgreSQL, JWT authentication, role-based authorization, API integration, form validation, loading/error states, and company-level data isolation work together in one complete application.
