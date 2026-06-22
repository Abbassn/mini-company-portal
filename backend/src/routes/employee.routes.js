import express from "express";
import {
  getEmployees,
  createEmployee,
  getMyEmployeeProfile,
} from "../controllers/employee.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, authorizeRoles("ADMIN", "HR"), getEmployees);

router.post("/", authMiddleware, authorizeRoles("ADMIN", "HR"), createEmployee);

router.get("/me", authMiddleware, authorizeRoles("EMPLOYEE"), getMyEmployeeProfile);

export default router;