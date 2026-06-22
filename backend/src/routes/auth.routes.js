import express from "express";
import { registerCompany, login, getMe } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register-company:
 *   post:
 *     summary: Register a company and its first admin user
 *     tags:
 *       - Auth
 *     description: Creates a company and the initial ADMIN account. The login token issued later contains userId, companyId, and role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: Acme Company
 *               fullName:
 *                 type: string
 *                 example: Admin User
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@acme.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Company registered successfully
 *       400:
 *         description: Validation failed or bad request
 *       500:
 *         description: Server error
 */
router.post("/register-company", registerCompany);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags:
 *       - Auth
 *     description: "Authenticates a user and returns a JWT. The JWT payload contains userId, companyId, and role. Protected APIs use Authorization: Bearer <token>."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@acme.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation failed or bad request
 *       401:
 *         description: Missing or invalid token
 *       500:
 *         description: Server error
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the authenticated user
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     description: "Protected API. Any authenticated user can call this endpoint with Authorization: Bearer <token>. The JWT payload contains userId, companyId, and role."
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Resource not found in user's company
 *       500:
 *         description: Server error
 */
router.get("/me", authMiddleware, getMe);

router.get("/admin-test", authMiddleware, authorizeRoles("ADMIN"), (req, res) => {
  return res.status(200).json({
    message: "Admin route works",
    user: req.user,
  });
});

router.get("/hr-only-test", authMiddleware, authorizeRoles("HR"), (req, res) => {
  return res.status(200).json({
    message: "HR route works",
    user: req.user,
  });
});

export default router;
