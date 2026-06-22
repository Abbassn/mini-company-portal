import express from "express";
import {
  getEmployees,
  getEmployeeById,
  updateEmployeeById,
  createEmployee,
  getMyEmployeeProfile,
} from "../controllers/employee.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: List employees
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     description: "ADMIN and HR only. Protected API that uses Authorization: Bearer <token>. The JWT payload contains userId, companyId, and role. Returned employees are filtered by companyId from the authenticated user."
 *     responses:
 *       200:
 *         description: Employees fetched successfully
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Forbidden role
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, authorizeRoles("ADMIN", "HR"), getEmployees);

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create an employee profile
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     description: "ADMIN and HR only. Protected API that uses Authorization: Bearer <token>. The JWT payload contains userId, companyId, and role, and the employee is created in the authenticated user's company."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - fullName
 *               - department
 *               - jobTitle
 *               - baseSalary
 *               - marketMidpoint
 *               - workingDays
 *               - absentDays
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 3
 *               fullName:
 *                 type: string
 *                 example: Employee User
 *               department:
 *                 type: string
 *                 example: IT
 *               jobTitle:
 *                 type: string
 *                 example: Developer
 *               baseSalary:
 *                 type: number
 *                 example: 1000
 *               marketMidpoint:
 *                 type: number
 *                 example: 1200
 *               workingDays:
 *                 type: integer
 *                 example: 22
 *               absentDays:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Validation failed or bad request
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Forbidden role
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, authorizeRoles("ADMIN", "HR"), createEmployee);

/**
 * @swagger
 * /api/employees/me:
 *   get:
 *     summary: Get my employee profile
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     description: "EMPLOYEE only. Protected API that uses Authorization: Bearer <token>. The JWT payload contains userId, companyId, and role. Employees can only access their own profile through this endpoint."
 *     responses:
 *       200:
 *         description: Employee profile fetched successfully
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Forbidden role
 *       404:
 *         description: Resource not found in user's company
 *       500:
 *         description: Server error
 */
router.get("/me", authMiddleware, authorizeRoles("EMPLOYEE"), getMyEmployeeProfile);

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get an employee by ID
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     description: "ADMIN and HR only. Protected API that uses Authorization: Bearer <token>. The JWT payload contains userId, companyId, and role. The employee is looked up within companyId from the authenticated user."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee fetched successfully
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Forbidden role
 *       404:
 *         description: Resource not found in user's company
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, authorizeRoles("ADMIN", "HR"), getEmployeeById);

/**
 * @swagger
 * /api/employees/{id}:
 *   patch:
 *     summary: Update an employee by ID
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     description: "ADMIN and HR only. Protected API that uses Authorization: Bearer <token>. The JWT payload contains userId, companyId, and role. The employee is updated only within companyId from the authenticated user. baseSalary cannot be updated directly through this endpoint; salary changes should happen through salary review approval."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department:
 *                 type: string
 *                 example: Finance
 *               jobTitle:
 *                 type: string
 *                 example: Finance Officer
 *               marketMidpoint:
 *                 type: number
 *                 example: 1300
 *               workingDays:
 *                 type: integer
 *                 example: 24
 *               absentDays:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       400:
 *         description: Validation failed or bad request
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Forbidden role
 *       404:
 *         description: Resource not found in user's company
 *       500:
 *         description: Server error
 */
router.patch("/:id", authMiddleware, authorizeRoles("ADMIN", "HR"), updateEmployeeById);

export default router;
