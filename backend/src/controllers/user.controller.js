import { createUserService } from "../services/user.service.js";
import { validateCreateUser } from "../validators/user.validator.js";

export async function createUser(req, res) {
  try {
    const errors = validateCreateUser(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    const user = await createUserService(req.body, req.user);

    return res.status(201).json({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Create user error:", error);

    if (error.code === "23505") {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    return res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
}