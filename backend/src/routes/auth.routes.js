import express from "express";
import { registerCompany, login, getMe } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/register-company", registerCompany);
router.post("/login", login);
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