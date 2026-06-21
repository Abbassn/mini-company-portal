import express from "express";
import { registerCompany, login } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register-company", registerCompany);
router.post("/login", login);

router.get("/protected-test", authMiddleware, (req, res) => {
  return res.status(200).json({
    message: "You are authenticated",
    user: req.user,
  });
});
export default router;