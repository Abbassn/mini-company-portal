import express from "express";

import {
  getSalaryReviews,
  createSalaryReview,
  getMySalaryReviews,
  approveSalaryReview,
  rejectSalaryReview,
} from "../controllers/salaryReview.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/salary-reviews:
 *   get:
 *     summary: List salary reviews
 *     tags:
 *       - Salary Reviews
 *     security:
 *       - bearerAuth: []
 *     description: "ADMIN and HR only. Protected API that uses Authorization: Bearer <token>. The JWT payload contains userId, companyId, and role. Returned salary reviews are filtered by companyId from the authenticated user."
 *     responses:
 *       200:
 *         description: Salary reviews fetched successfully
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Forbidden role
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "HR"),
  getSalaryReviews
);

/**
 * @swagger
 * /api/salary-reviews:
 *   post:
 *     summary: Create a salary review
 *     tags:
 *       - Salary Reviews
 *     security:
 *       - bearerAuth: []
 *     description: "ADMIN and HR only. Protected API that uses Authorization: Bearer <token>. The JWT payload contains userId, companyId, and role. HR can create salary reviews but cannot approve/reject them. Salary changes should happen through salary review approval."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - proposedSalary
 *               - reason
 *             properties:
 *               employeeId:
 *                 type: integer
 *                 example: 1
 *               proposedSalary:
 *                 type: number
 *                 example: 1300
 *               reason:
 *                 type: string
 *                 example: Good performance
 *     responses:
 *       201:
 *         description: Salary review created successfully
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
router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "HR"),
  createSalaryReview
);

/**
 * @swagger
 * /api/salary-reviews/me:
 *   get:
 *     summary: Get my salary reviews
 *     tags:
 *       - Salary Reviews
 *     security:
 *       - bearerAuth: []
 *     description: "EMPLOYEE only. Protected API that uses Authorization: Bearer <token>. The JWT payload contains userId, companyId, and role. Employees can only access their own salary reviews, filtered by companyId from the authenticated user."
 *     responses:
 *       200:
 *         description: My salary reviews fetched successfully
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Forbidden role
 *       404:
 *         description: Resource not found in user's company
 *       500:
 *         description: Server error
 */
router.get(
  "/me",
  authMiddleware,
  authorizeRoles("EMPLOYEE"),
  getMySalaryReviews
);

/**
 * @swagger
 * /api/salary-reviews/{id}/approve:
 *   patch:
 *     summary: Approve a salary review
 *     tags:
 *       - Salary Reviews
 *     security:
 *       - bearerAuth: []
 *     description: "ADMIN only. Protected API that uses Authorization: Bearer <token>. The JWT payload contains userId, companyId, and role. ADMIN can approve salary reviews. HR can create salary reviews but cannot approve/reject them. Approval applies the salary change through the salary review flow and is scoped to companyId from the authenticated user."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Salary review ID
 *     responses:
 *       200:
 *         description: Salary review approved successfully
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
router.patch(
  "/:id/approve",
  authMiddleware,
  authorizeRoles("ADMIN"),
  approveSalaryReview
);

/**
 * @swagger
 * /api/salary-reviews/{id}/reject:
 *   patch:
 *     summary: Reject a salary review
 *     tags:
 *       - Salary Reviews
 *     security:
 *       - bearerAuth: []
 *     description: "ADMIN only. Protected API that uses Authorization: Bearer <token>. The JWT payload contains userId, companyId, and role. ADMIN can reject salary reviews. HR can create salary reviews but cannot approve/reject them. The review lookup is scoped to companyId from the authenticated user."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Salary review ID
 *     responses:
 *       200:
 *         description: Salary review rejected successfully
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
router.patch(
  "/:id/reject",
  authMiddleware,
  authorizeRoles("ADMIN"),
  rejectSalaryReview
);

export default router;
