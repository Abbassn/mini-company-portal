import { registerCompanyService } from "../services/auth.service.js";
import { validateRegisterCompany } from "../validators/auth.validator.js";

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