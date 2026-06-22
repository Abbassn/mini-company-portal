import {
  registerCompanyService,
  loginService,
  getCurrentUserService,
} from "../services/auth.service.js";

import {
  validateRegisterCompany,
  validateLogin,
} from "../validators/auth.validator.js";

export async function registerCompany(req, res) {
  try {
    const errors = validateRegisterCompany(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors
      });
    }

    const result = await registerCompanyService(req.body);

    return res.status(201).json({
      message: "Company registered successfully",
      data: result
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
}

export async function login(req, res) {
  try {
    const errors = validateLogin(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    const result = await loginService(req.body);

    return res.status(200).json({
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
}

export async function getMe(req, res) {
  try {
    const user = await getCurrentUserService(req.user.userId);

    return res.status(200).json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
}