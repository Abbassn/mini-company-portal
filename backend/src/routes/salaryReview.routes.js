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

router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "HR"),
  getSalaryReviews
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "HR"),
  createSalaryReview
);

router.get(
  "/me",
  authMiddleware,
  authorizeRoles("EMPLOYEE"),
  getMySalaryReviews
);

router.patch(
  "/:id/approve",
  authMiddleware,
  authorizeRoles("ADMIN"),
  approveSalaryReview
);

router.patch(
  "/:id/reject",
  authMiddleware,
  authorizeRoles("ADMIN"),
  rejectSalaryReview
);

export default router;