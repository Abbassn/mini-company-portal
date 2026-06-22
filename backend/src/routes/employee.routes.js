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

router.get("/", authMiddleware, authorizeRoles("ADMIN", "HR"), getEmployees);

router.post("/", authMiddleware, authorizeRoles("ADMIN", "HR"), createEmployee);

router.get("/me", authMiddleware, authorizeRoles("EMPLOYEE"), getMyEmployeeProfile);

router.get("/:id", authMiddleware, authorizeRoles("ADMIN", "HR"), getEmployeeById);

router.patch("/:id", authMiddleware, authorizeRoles("ADMIN", "HR"), updateEmployeeById);

export default router;