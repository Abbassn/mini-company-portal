import express from "express";
import { createUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     description: "ADMIN only. Protected API that uses Authorization: Bearer <token>. The JWT payload contains userId, companyId, and role, and the new user is created in the authenticated admin's company."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - role
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: HR User
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hr@acme.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum:
 *                   - ADMIN
 *                   - HR
 *                   - EMPLOYEE
 *                 example: HR
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation failed or bad request
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Forbidden role
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, authorizeRoles("ADMIN"), createUser);

export default router;
