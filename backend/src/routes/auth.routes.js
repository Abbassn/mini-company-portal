import express from "express";
import { registerCompany } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register-company", registerCompany);

export default router;